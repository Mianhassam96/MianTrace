/**
 * MianTrace Cloudflare Worker
 * Fetches and extracts content from URLs for the website analyzer.
 *
 * Security:
 * - SSRF protection: blocks localhost, private IPs, internal hostnames
 * - HTTPS only
 * - Response size limit: 2MB
 * - Timeout: 10 seconds
 * - Redirect validation: re-checks destination for SSRF
 * - No secrets exposed to frontend
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkerResponse {
  url: string
  title: string
  description: string
  content: string
  wordCount: number
  headings: string[]
  paragraphCount: number
}

interface ErrorResponse {
  error: string
  code: string
}

// ─── SSRF Protection ──────────────────────────────────────────────────────────

const PRIVATE_IP_PATTERNS = [
  /^127\./,                          // loopback
  /^10\./,                           // RFC1918
  /^172\.(1[6-9]|2\d|3[01])\./,     // RFC1918
  /^192\.168\./,                     // RFC1918
  /^169\.254\./,                     // link-local
  /^::1$/,                           // IPv6 loopback
  /^fc00:/i,                         // IPv6 private
  /^fe80:/i,                         // IPv6 link-local
  /^0\./,                            // 0.0.0.0/8
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,  // CGNAT
]

const BLOCKED_HOSTNAMES = new Set([
  'localhost', 'broadcasthost', 'ip6-localhost',
  'ip6-loopback', 'ip6-allnodes', 'ip6-allrouters',
  'metadata.google.internal', '169.254.169.254',
])

function isSafeHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase()

  if (BLOCKED_HOSTNAMES.has(lower)) return false

  // Block raw IP addresses that are private
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(lower)) return false
  }

  // Must have at least one dot (prevents single-label hostnames like "intranet")
  if (!lower.includes('.')) return false

  return true
}

function isSafeUrl(url: URL): { safe: boolean; reason?: string } {
  if (url.protocol !== 'https:') {
    return { safe: false, reason: 'Only HTTPS URLs are supported.' }
  }

  if (!isSafeHostname(url.hostname)) {
    return { safe: false, reason: 'This URL points to a private or internal address.' }
  }

  // Block common internal paths
  const path = url.pathname.toLowerCase()
  if (path.includes('/admin') || path.includes('/.env') || path.includes('/api/internal')) {
    return { safe: false, reason: 'This URL path is not allowed.' }
  }

  return { safe: true }
}

// ─── HTML Content Extraction ──────────────────────────────────────────────────

/**
 * Extract readable text content from raw HTML.
 * Uses HTMLRewriter (available in Cloudflare Workers) for streaming extraction.
 */
async function extractContent(html: string, baseUrl: string): Promise<WorkerResponse> {
  // Use a simple regex-based approach since HTMLRewriter needs a Response object
  // We'll use it properly below with the actual Response

  const title = extractTag(html, 'title') || extractMeta(html, 'og:title') || new URL(baseUrl).hostname
  const description = extractMeta(html, 'description') || extractMeta(html, 'og:description') || ''

  // Remove unwanted elements
  let cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, ' ')
    .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, ' ')
    .replace(/<input[^>]*\/?>/gi, ' ')
    .replace(/<select[^>]*>[\s\S]*?<\/select>/gi, ' ')

  // Extract headings
  const headingMatches = cleaned.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)
  const headings: string[] = []
  for (const match of headingMatches) {
    const text = stripTags(match[1]).trim()
    if (text.length > 0 && text.length < 200) headings.push(text)
    if (headings.length >= 20) break
  }

  // Extract paragraphs and article content
  const contentParts: string[] = []

  // Try article/main first
  const articleMatch = cleaned.match(/<(?:article|main)[^>]*>([\s\S]*?)<\/(?:article|main)>/i)
  if (articleMatch) {
    cleaned = articleMatch[1]
  }

  // Extract all paragraph text
  const paraMatches = cleaned.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)
  for (const match of paraMatches) {
    const text = stripTags(match[1]).trim()
    if (text.length > 40) {
      contentParts.push(text)
    }
  }

  // If not enough paragraphs, fall back to all text
  let content = contentParts.join('\n\n')
  if (content.length < 200) {
    content = stripTags(cleaned)
      .replace(/\s{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim()
  }

  // Trim to reasonable length (10,000 chars max for analysis)
  content = content.slice(0, 10000)

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length

  return {
    url: baseUrl,
    title: stripTags(title).trim().slice(0, 200),
    description: stripTags(description).trim().slice(0, 400),
    content,
    wordCount,
    headings,
    paragraphCount: contentParts.length,
  }
}

function extractTag(html: string, tag: string): string {
  // Use only known safe tag names to avoid regex injection
  const safeTag = tag.replace(/[^a-zA-Z0-9]/g, '')
  const match = html.match(new RegExp(`<${safeTag}[^>]*>([\\s\\S]*?)<\\/${safeTag}>`, 'i'))
  return match ? match[1] : ''
}

function extractMeta(html: string, name: string): string {
  // name= or property=
  const match = html.match(
    new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i')
  ) || html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i')
  )
  return match ? match[1] : ''
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim()
}

// ─── Request handler ──────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

function jsonResponse(data: WorkerResponse | ErrorResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  })
}

function errorResponse(message: string, code: string, status = 400): Response {
  return jsonResponse({ error: message, code }, status)
}

export default {
  async fetch(request: Request): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    // Only GET allowed
    if (request.method !== 'GET') {
      return errorResponse('Method not allowed.', 'METHOD_NOT_ALLOWED', 405)
    }

    // Parse target URL from query param
    const reqUrl = new URL(request.url)
    const targetParam = reqUrl.searchParams.get('url')

    if (!targetParam) {
      return errorResponse('Missing required query parameter: url', 'MISSING_URL')
    }

    // Bound URL length to prevent DoS via very long inputs
    if (targetParam.length > 2048) {
      return errorResponse('URL exceeds maximum allowed length (2048 characters).', 'URL_TOO_LONG')
    }

    // Parse and validate the target URL
    let targetUrl: URL
    try {
      targetUrl = new URL(targetParam)
    } catch {
      return errorResponse('Invalid URL format.', 'INVALID_URL')
    }

    const safety = isSafeUrl(targetUrl)
    if (!safety.safe) {
      return errorResponse(safety.reason ?? 'URL not allowed.', 'UNSAFE_URL')
    }

    // Fetch the page
    let response: Response
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      response = await fetch(targetUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'MianTrace/1.0 (content analysis; +https://mianhassam96.github.io/MianTrace)',
          'Accept': 'text/html,application/xhtml+xml;q=0.9',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      })

      clearTimeout(timeout)
    } catch (err: unknown) {
      const message = err instanceof Error && err.name === 'AbortError'
        ? 'The request timed out. The server took too long to respond.'
        : 'Failed to fetch the URL. The server may be unavailable or blocking crawlers.'
      return errorResponse(message, 'FETCH_FAILED', 502)
    }

    // Validate redirect destination for SSRF
    const finalUrl = new URL(response.url)
    const redirectSafety = isSafeUrl(finalUrl)
    if (!redirectSafety.safe) {
      return errorResponse('URL redirected to a disallowed destination.', 'UNSAFE_REDIRECT')
    }

    // Check status
    if (!response.ok) {
      return errorResponse(
        `The server returned an error: ${response.status} ${response.statusText}`,
        'HTTP_ERROR',
        502
      )
    }

    // Content type check
    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return errorResponse(
        'Only HTML pages are supported. This URL returned a non-HTML response.',
        'UNSUPPORTED_CONTENT_TYPE'
      )
    }

    // Size limit: 2MB
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 2 * 1024 * 1024) {
      return errorResponse('Page is too large to analyze (limit: 2MB).', 'RESPONSE_TOO_LARGE')
    }

    // Read body with size cap
    let html: string
    try {
      const buffer = await response.arrayBuffer()
      if (buffer.byteLength > 2 * 1024 * 1024) {
        return errorResponse('Page is too large to analyze (limit: 2MB).', 'RESPONSE_TOO_LARGE')
      }
      html = new TextDecoder().decode(buffer)
    } catch {
      return errorResponse('Failed to read the page content.', 'READ_FAILED', 502)
    }

    // Extract content
    const extracted = await extractContent(html, response.url)

    if (extracted.wordCount < 20) {
      return errorResponse(
        'Not enough readable content found on this page. The page may require JavaScript or block crawlers.',
        'INSUFFICIENT_CONTENT'
      )
    }

    return jsonResponse(extracted)
  },
}
