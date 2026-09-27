/**
 * worker-client.ts
 * Typed fetch wrapper for the MianTrace Cloudflare Worker.
 * Handles errors, timeouts, and response parsing.
 */

// Worker URL — set via env variable at build time, falls back to placeholder
const WORKER_URL = import.meta.env.VITE_WORKER_URL as string | undefined

export interface WorkerSuccessResponse {
  url: string
  title: string
  description: string
  content: string
  wordCount: number
  headings: string[]
  paragraphCount: number
}

export interface WorkerErrorResponse {
  error: string
  code: string
}

export type WorkerResult =
  | { ok: true; data: WorkerSuccessResponse }
  | { ok: false; error: string; code: string }

/**
 * Fetch and extract content from a URL via the Cloudflare Worker.
 * Returns a typed result — never throws.
 */
export async function fetchWebsiteContent(url: string): Promise<WorkerResult> {
  if (!WORKER_URL) {
    return {
      ok: false,
      error: 'Website analysis is not yet configured. The worker URL is missing. Please deploy the Cloudflare Worker and set VITE_WORKER_URL.',
      code: 'WORKER_NOT_CONFIGURED',
    }
  }

  // Validate the URL client-side before sending
  let parsed: URL
  try {
    parsed = new URL(url)
    if (parsed.protocol !== 'https:') {
      return { ok: false, error: 'Only HTTPS URLs are supported.', code: 'INVALID_URL' }
    }
  } catch {
    return { ok: false, error: 'Invalid URL format.', code: 'INVALID_URL' }
  }

  const workerUrl = `${WORKER_URL}?url=${encodeURIComponent(parsed.toString())}`

  let response: Response
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    response = await fetch(workerUrl, { signal: controller.signal })
    clearTimeout(timeout)
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    return {
      ok: false,
      error: isTimeout
        ? 'The request timed out. Try again or use a different URL.'
        : 'Could not reach the analysis service. Check your connection and try again.',
      code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
    }
  }

  let json: WorkerSuccessResponse | WorkerErrorResponse
  try {
    json = await response.json()
  } catch {
    return { ok: false, error: 'Received an invalid response from the analysis service.', code: 'PARSE_ERROR' }
  }

  if (!response.ok || 'error' in json) {
    const err = json as WorkerErrorResponse
    return { ok: false, error: err.error ?? 'An unknown error occurred.', code: err.code ?? 'UNKNOWN' }
  }

  return { ok: true, data: json as WorkerSuccessResponse }
}
