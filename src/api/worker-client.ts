/**
 * worker-client.ts
 * Typed fetch wrapper for the MianTrace Cloudflare Worker.
 * All error messages are human-readable — no technical codes exposed to UI.
 */

import { getUserError, errorFromException } from './errors'

const WORKER_URL = (import.meta.env.VITE_WORKER_URL as string | undefined)
  ?? 'https://miantrace.mianhassam96.workers.dev'

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
  | { ok: false; headline: string; detail: string; retryable: boolean }

function fail(code: string): WorkerResult {
  const { headline, detail, retryable } = getUserError(code)
  return { ok: false, headline, detail, retryable }
}

/**
 * Fetch and extract content from a URL via the Cloudflare Worker.
 * Returns a typed result — never throws, never exposes technical strings.
 */
export async function fetchWebsiteContent(url: string): Promise<WorkerResult> {
  if (!WORKER_URL) return fail('WORKER_NOT_CONFIGURED')

  // Client-side URL validation
  let parsed: URL
  try {
    parsed = new URL(url)
    if (parsed.protocol !== 'https:') return fail('INVALID_URL')
  } catch {
    return fail('INVALID_URL')
  }

  const workerUrl = `${WORKER_URL}?url=${encodeURIComponent(parsed.toString())}`

  let response: Response
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    response = await fetch(workerUrl, { signal: controller.signal })
    clearTimeout(timeout)
  } catch (err: unknown) {
    return { ok: false, ...errorFromException(err) }
  }

  let json: WorkerSuccessResponse | WorkerErrorResponse
  try {
    json = await response.json()
  } catch {
    return fail('PARSE_ERROR')
  }

  if (!response.ok || 'error' in json) {
    const code = (json as WorkerErrorResponse).code ?? 'UNKNOWN'
    return fail(code)
  }

  return { ok: true, data: json as WorkerSuccessResponse }
}
