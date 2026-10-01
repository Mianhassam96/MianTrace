/**
 * errors.ts
 * Maps internal error codes to human-readable messages.
 * No technical strings (CORS, 502, fetch, worker) are ever shown to users.
 */

export interface UserError {
  /** Short headline shown in bold */
  headline: string
  /** Supporting detail — one sentence, plain English */
  detail: string
  /** Whether a retry makes sense */
  retryable: boolean
}

const ERROR_MAP: Record<string, UserError> = {
  // Client-side validation
  INVALID_URL: {
    headline: 'Invalid URL',
    detail: 'Enter a valid HTTPS web address — for example, https://example.com/article',
    retryable: false,
  },
  URL_TOO_LONG: {
    headline: 'URL is too long',
    detail: 'The URL exceeds the maximum allowed length. Try a shorter or more direct link.',
    retryable: false,
  },

  // Network
  TIMEOUT: {
    headline: 'The website took too long to respond',
    detail: 'The server did not respond in time. It may be slow or temporarily unavailable.',
    retryable: true,
  },
  NETWORK_ERROR: {
    headline: 'Could not connect',
    detail: 'MianTrace could not reach the website. Check your connection and try again.',
    retryable: true,
  },

  // Worker / server errors
  WORKER_NOT_CONFIGURED: {
    headline: 'Website analysis is unavailable',
    detail: 'The website analysis service is not currently configured. Text analysis is still available.',
    retryable: false,
  },
  FETCH_FAILED: {
    headline: 'Could not retrieve the website',
    detail: 'The website may be blocking automated requests, temporarily unavailable, or requiring a login.',
    retryable: true,
  },
  HTTP_ERROR: {
    headline: 'The website returned an error',
    detail: 'The server responded with an error. The page may have moved or no longer exist.',
    retryable: false,
  },
  UNSAFE_URL: {
    headline: 'This URL is not allowed',
    detail: 'MianTrace only analyzes publicly accessible websites. Private or internal addresses are not supported.',
    retryable: false,
  },
  UNSAFE_REDIRECT: {
    headline: 'Unsafe redirect detected',
    detail: 'The website redirected to an address that MianTrace cannot access for security reasons.',
    retryable: false,
  },
  UNSUPPORTED_CONTENT_TYPE: {
    headline: 'This URL does not point to a webpage',
    detail: 'MianTrace can only analyze HTML pages. This URL appears to link to a file, image, or other resource.',
    retryable: false,
  },
  RESPONSE_TOO_LARGE: {
    headline: 'Page is too large to analyze',
    detail: 'The page exceeds the 2MB content limit. Try a more specific URL that points to a single article or post.',
    retryable: false,
  },
  INSUFFICIENT_CONTENT: {
    headline: 'Not enough readable content found',
    detail: 'MianTrace could not extract enough text from this page. It may require JavaScript, a login, or block content extraction.',
    retryable: false,
  },
  READ_FAILED: {
    headline: 'Could not read the page content',
    detail: 'The page was retrieved but its content could not be read. Try a different URL.',
    retryable: true,
  },
  MISSING_URL: {
    headline: 'No URL provided',
    detail: 'Enter a website URL to analyze.',
    retryable: false,
  },
  METHOD_NOT_ALLOWED: {
    headline: 'Request not allowed',
    detail: 'Something went wrong with the request. Please try again.',
    retryable: true,
  },
  PARSE_ERROR: {
    headline: 'Unexpected response',
    detail: 'MianTrace received an unexpected response from the analysis service. Please try again.',
    retryable: true,
  },

  // Analysis engine errors (text mode)
  ANALYSIS_FAILED: {
    headline: 'Analysis failed',
    detail: 'Something went wrong while analyzing the content. Please try again.',
    retryable: true,
  },
}

const FALLBACK: UserError = {
  headline: 'Something went wrong',
  detail: 'An unexpected error occurred. Please try again.',
  retryable: true,
}

/**
 * Get a human-readable error from a code string.
 * Always returns a safe, user-facing message — never a technical string.
 */
export function getUserError(code: string): UserError {
  return ERROR_MAP[code] ?? FALLBACK
}

/**
 * Convert any thrown error into a UserError.
 * Strips technical details, codes, and stack traces.
 */
export function errorFromException(err: unknown): UserError {
  if (err instanceof Error) {
    // Check if the message itself is already a mapped code
    const byCode = ERROR_MAP[err.message]
    if (byCode) return byCode

    // Check for timeout
    if (err.name === 'AbortError') return ERROR_MAP['TIMEOUT']!

    // Network errors
    if (err.message.toLowerCase().includes('fetch') ||
        err.message.toLowerCase().includes('network') ||
        err.message.toLowerCase().includes('failed to fetch')) {
      return ERROR_MAP['NETWORK_ERROR']!
    }
  }

  return FALLBACK
}
