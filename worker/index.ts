/**
 * MianTrace Cloudflare Worker
 * Fetches and extracts content from URLs for the website analyzer.
 *
 * Security hardening (v0.2+):
 * - SSRF protection: blocks localhost, private IPs, internal hostnames
 * - HTTPS only
 * - Response size limit: 2MB
 * - Timeout: 10 seconds
 * - Redirect re-validation against SSRF rules
 * - URL length limit: 2048 chars
 * - extractMeta: name parameter sanitized before regex use
 * - HTTP_ERROR: status text NOT leaked to response
 * - Cache-Control: no-store on all responses
 * - No secrets in worker code
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
  /^127\./,                                        // loopback
  /^10\./,                                         // RFC1918
  /^172\.(1[6-9]|2\d|3[01])\./,                   // RFC1918
  /^192\.168\./,                                   // RFC1918
  /^169\.254\./,                                   // link-local / AWS metadata
  /^::1$/,                                         // IPv6 loopback
  /^fc00:/i,                                       // IPv6 unique local
  /^fe80:/i,                                       // IPv6 link-local
  /^0\./,                                          // 0.0.0.0/8
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,     // CGNAT RFC6598
  /^198\.51\.100\./,                               // TEST-NET-2 RFC5737
  /^203\.0\.113\./,                                // TEST-NET-3 RFC5737
  /^240\./,                                        // reserved RFC1112
]

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'broadcasthost',
  'ip6-localhost',
  'ip6-loopback',
  'ip6-allnodes',
  'ip6-allrouters',
  'metadata.google.internal',
  '169.254.169.254',         // AWS/GCP IMDS
  'metadata.azure.internal', // Azure IMDS
])

function isSafeHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase()

  if (BLOCKED_HOSTNAMES.has(lower)) return false

  // Block raw IP addresses that map to private ranges
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(lower)) return false
  }

  // Must have at least one dot — prevents single-label hostnames like "intranet"
  if (!lower.includes('.')) return false

  // Block numeric-only labels that could be raw IPs in unusual notation
  // e.g. http://0x7f000001/ or http://2130706433/
  if (/^[\d.]+$/.test(lower) || /^0x[0-9a-f]+$/i.test(lower)) return false

  return true
}

function isSafeUrl(url: URL): { safe: boolean; code?: string } {
  if (url.protocol !== 'https:') {
    return { safe: false, code: 'INVALID_URL' }
  }

  if (!isSafeHostname(url.hostname)) {
    return { safe: false, code: 'UNSAFE_URL' }
  }

  return { safe: true }
}

// ─── HTML Content Extraction ──────────────────────────────────────────────────

async function extractContent(html: string, baseUrl: string): Promise<WorkerResponse> {
  const title       = extractTag(html, 'title')
                   || extractMeta(html, 'og:title')
                   || new URL(baseUrl).hostname
  const description = extractMeta(html, 'description')
                   || extractMeta(html, 'og:description')
                   || ''

  // Remove noise elements
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

  // Prefer article/main content
  const articleMatch = cleaned.match(/<(?:article|main)[^>]*>([\s\S]*?)<\/(?:article|main)>/i)
  if (articleMatch) cleaned = articleMatch[1]

  // Extract paragraphs
  const contentParts: string[] = []
  const paraMatches = cleaned.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)
  for (const match of paraMatches) {
    const text = stripTags(match[1]).trim()
    if (text.length > 40) contentParts.push(text)
  }

  // Fallback to full text if not enough paragraphs
  let content = contentParts.join('\n\n')
  if (content.length < 200) {
    content = stripTags(cleaned)
      .replace(/\s{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim()
  }

  // Hard cap at 10,000 chars for analysis
  content = content.slice(0, 10000)

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length

  return {
    url: baseUrl,
    title:       stripTags(title).trim().slice(0, 200),
    description: stripTags(description).trim().slice(0, 400),
    content,
    wordCount,
    headings,
    paragraphCount: contentParts.length,
  }
}

function extractTag(html: string, tag: string): string {
  // Sanitize tag name — allow only alphanumeric characters
  const safeTag = tag.replace(/[^a-zA-Z0-9]/g, '')
  if (!safeTag) return ''
  const match = html.match(new RegExp(`<${safeTag}[^>]*>([\\s\\S]*?)<\\/${safeTag}>`, 'i'))
  return match ? match[1] : ''
}

function extractMeta(html: string, name: string): string {
  // Sanitize the meta name — allow only alphanumeric, colon, hyphen, underscore
  // This prevents the caller-supplied name from being used as a regex injection vector
  const safeName = name.replace(/[^a-zA-Z0-9:_-]/g, '')
  if (!safeName) return ''

  const match =
    html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${safeName}["'][^>]+content=["']([^"']{0,500})["']`, 'i')) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']{0,500})["'][^>]+(?:name|property)=["']${safeName}["']`, 'i'))

  return match ? match[1] : ''
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g,  ' ')
    .replace(/&amp;/g,   '&')
    .replace(/&lt;/g,    '<')
    .replace(/&gt;/g,    '>')
    .replace(/&quot;/g,  '"')
    .replace(/&#39;/g,   "'")
    .replace(/\s+/g,     ' ')
    .trim()
}

// ─── Response helpers ─────────────────────────────────────────────────────────

// Lock CORS to the production origin.
// Change to '*' only for local development.
const ALLOWED_ORIGIN = 'https://mianhassam96.github.io'

function corsHeaders(requestOrigin: string | null): Record<string, string> {
  // Allow the production origin and localhost for development
  const allowed =
    requestOrigin === ALLOWED_ORIGIN ||
    requestOrigin?.startsWith('http://localhost') ||
    requestOrigin?.startsWith('http://127.0.0.1')
      ? requestOrigin
      : ALLOWED_ORIGIN

  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age':       '86400',
    'Vary':                         'Origin',
  }
}

const SECURITY_HEADERS: Record<string, string> = {
  'Cache-Control':           'no-store',
  'X-Content-Type-Options':  'nosniff',
  'X-Frame-Options':         'DENY',
  'Referrer-Policy':         'no-referrer',
}

function jsonResponse(
  data: WorkerResponse | ErrorResponse,
  status: number,
  origin: string | null,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
      ...SECURITY_HEADERS,
    },
  })
}

function errorResponse(code: string, status: number, origin: string | null): Response {
  // Never include raw server error messages — use only our own descriptions
  const MESSAGES: Record<string, string> = {
    METHOD_NOT_ALLOWED:      'Method not allowed.',
    MISSING_URL:             'Missing required parameter: url.',
    URL_TOO_LONG:            'URL exceeds maximum allowed length.',
    INVALID_URL:             'Invalid or unsupported URL.',
    UNSAFE_URL:              'URL not allowed.',
    UNSAFE_REDIRECT:         'Redirect target not allowed.',
    FETCH_FAILED:            'Could not retrieve the page.',
    HTTP_ERROR:              'The target server returned an error.',  // no statusText leak
    UNSUPPORTED_CONTENT_TYPE:'Only HTML pages are supported.',
    RESPONSE_TOO_LARGE:      'Page exceeds the 2MB size limit.',
    READ_FAILED:             'Could not read the page content.',
    INSUFFICIENT_CONTENT:    'Not enough readable content found.',
  }
  const message = MESSAGES[code] ?? 'An error occurred.'
  return jsonResponse({ error: message, code }, status, origin)
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request): Promise<Response> {
    const origin = request.headers.get('origin')

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: { ...corsHeaders(origin), ...SECURITY_HEADERS },
      })
    }

    // Only GET allowed
    if (request.method !== 'GET') {
      return errorResponse('METHOD_NOT_ALLOWED', 405, origin)
    }

    // Parse target URL from ?url= query param
    const reqUrl     = new URL(request.url)
    const targetParam = reqUrl.searchParams.get('url')

    if (!targetParam) {
      return errorResponse('MISSING_URL', 400, origin)
    }

    // Hard URL length limit (DoS protection)
    if (targetParam.length > 2048) {
      return errorResponse('URL_TOO_LONG', 400, origin)
    }

    // Parse and validate
    let targetUrl: URL
    try {
      targetUrl = new URL(targetParam)
    } catch {
      return errorResponse('INVALID_URL', 400, origin)
    }

    const safety = isSafeUrl(targetUrl)
    if (!safety.safe) {
      return errorResponse(safety.code ?? 'UNSAFE_URL', 400, origin)
    }

    // Fetch the target page
    let response: Response
    try {
      const controller = new AbortController()
      // Cloudflare Workers don't support Node's setTimeout — use a promise race
      const fetchPromise = fetch(targetUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent':      'MianTrace/1.0 (+https://mianhassam96.github.io/MianTrace)',
          'Accept':          'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      })

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => { controller.abort(); reject(new Error('timeout')) }, 10000)
      )

      response = await Promise.race([fetchPromise, timeoutPromise])
    } catch (err: unknown) {
      const isTimeout = err instanceof Error &&
        (err.name === 'AbortError' || err.message === 'timeout')
      return errorResponse(isTimeout ? 'FETCH_FAILED' : 'FETCH_FAILED', 502, origin)
    }

    // Re-validate redirect destination
    const finalUrl      = new URL(response.url)
    const redirectSafety = isSafeUrl(finalUrl)
    if (!redirectSafety.safe) {
      return errorResponse('UNSAFE_REDIRECT', 400, origin)
    }

    // HTTP error from target — do NOT leak statusText
    if (!response.ok) {
      return errorResponse('HTTP_ERROR', 502, origin)
    }

    // Content-type must be HTML
    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return errorResponse('UNSUPPORTED_CONTENT_TYPE', 400, origin)
    }

    // Size guard via Content-Length header
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 2 * 1024 * 1024) {
      return errorResponse('RESPONSE_TOO_LARGE', 400, origin)
    }

    // Read body with hard size cap
    let html: string
    try {
      const buffer = await response.arrayBuffer()
      if (buffer.byteLength > 2 * 1024 * 1024) {
        return errorResponse('RESPONSE_TOO_LARGE', 400, origin)
      }
      html = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
    } catch {
      return errorResponse('READ_FAILED', 502, origin)
    }

    // Extract readable content
    const extracted = await extractContent(html, response.url)

    if (extracted.wordCount < 20) {
      return errorResponse('INSUFFICIENT_CONTENT', 422, origin)
    }

    return jsonResponse(extracted, 200, origin)
  },
}
