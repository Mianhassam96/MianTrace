/**
 * text-utils.ts
 * Low-level string helpers used across the analysis engine.
 * All functions are pure and deterministic.
 */

/** Remove HTML tags from a string */
export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Normalize whitespace — collapse multiple spaces/tabs/newlines to single space */
export function normalizeWhitespace(text: string): string {
  return text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

/** Normalize Unicode punctuation to ASCII equivalents */
export function normalizePunctuation(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // smart double quotes
    .replace(/\u2026/g, '...')       // ellipsis
    .replace(/[\u2013\u2014]/g, '-') // en/em dash
}

/** Full text normalization pipeline */
export function normalizeText(text: string): string {
  return normalizeWhitespace(normalizePunctuation(stripHtml(text)))
}

/** Convert text to lowercase for comparison purposes */
export function toLower(text: string): string {
  return text.toLowerCase()
}

/**
 * Remove punctuation from a word for vocabulary analysis.
 * Keeps internal hyphens and apostrophes (e.g. "don't", "well-being").
 */
export function stripWordPunctuation(word: string): string {
  return word.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')
}

/** Check if a string is empty or only whitespace */
export function isBlank(text: string): boolean {
  return text.trim().length === 0
}

/** Count occurrences of a substring in a string */
export function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0
  let count = 0
  let pos = 0
  while ((pos = haystack.indexOf(needle, pos)) !== -1) {
    count++
    pos += needle.length
  }
  return count
}

/** Split text into paragraphs (separated by one or more blank lines) */
export function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
}

/** Get unique items from an array */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Round to N decimal places */
export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}
