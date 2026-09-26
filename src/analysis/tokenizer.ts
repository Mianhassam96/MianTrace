/**
 * tokenizer.ts
 * Splits text into sentences and words.
 * All functions are pure and deterministic.
 */

import { stripWordPunctuation, toLower } from './text-utils'

// ─── Sentence tokenization ────────────────────────────────────────────────────

/**
 * Common abbreviations that should NOT trigger a sentence boundary.
 * Lowercase, without trailing dot.
 */
const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'vs', 'etc', 'inc',
  'ltd', 'corp', 'dept', 'est', 'approx', 'fig', 'no', 'vol', 'jan',
  'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  'st', 'ave', 'blvd', 'i.e', 'e.g', 'p.s', 'a.m', 'p.m', 'u.s', 'u.k',
])

/**
 * Tokenize text into sentences.
 * Handles abbreviations, decimal numbers, ellipses, and quoted endings.
 * Returns non-empty trimmed sentences only.
 */
export function tokenizeSentences(text: string): string[] {
  if (!text.trim()) return []

  // Step 1: Protect abbreviations by replacing their dots temporarily
  let protected_ = text.replace(/\b([A-Za-z]{1,5})\./g, (match, word) => {
    if (ABBREVIATIONS.has(word.toLowerCase())) {
      return word + '\x00' // null char as placeholder
    }
    return match
  })

  // Step 2: Protect decimal numbers (e.g. 3.14)
  protected_ = protected_.replace(/(\d)\.(\d)/g, '$1\x01$2')

  // Step 3: Protect ellipses
  protected_ = protected_.replace(/\.\.\./g, '\x02')

  // Step 4: Split on sentence-ending punctuation followed by whitespace + capital or end
  const raw = protected_.split(/(?<=[.!?]["'\u201D\u2019]?\s+)(?=[A-Z\u00C0-\u017E])/)

  // Step 5: Also handle end-of-string
  const sentences: string[] = []
  for (const chunk of raw) {
    // Split further on newline-separated sentences (when no capital follows)
    const subChunks = chunk.split(/\n+/)
    for (const sub of subChunks) {
      const restored = sub
        .replace(/\x00/g, '.')
        .replace(/\x01/g, '.')
        .replace(/\x02/g, '...')
        .trim()
      if (restored.length > 0) {
        sentences.push(restored)
      }
    }
  }

  return sentences.filter(s => s.length > 0)
}

// ─── Word tokenization ────────────────────────────────────────────────────────

/**
 * Tokenize text into words.
 * Returns lowercase words with punctuation stripped from edges.
 * Filters out empty strings and pure-punctuation tokens.
 */
export function tokenizeWords(text: string): string[] {
  if (!text.trim()) return []

  return text
    .split(/\s+/)
    .map(token => stripWordPunctuation(token))
    .map(token => toLower(token))
    .filter(token => token.length > 0 && /[a-zA-Z0-9]/.test(token))
}

/**
 * Tokenize into raw words (preserving case, no punctuation strip).
 * Useful for display purposes.
 */
export function tokenizeWordsRaw(text: string): string[] {
  if (!text.trim()) return []
  return text.split(/\s+/).filter(w => w.length > 0)
}

// ─── N-gram extraction ────────────────────────────────────────────────────────

/**
 * Extract n-grams (sequences of n words) from a word list.
 * Used for phrase repetition analysis.
 */
export function extractNGrams(words: string[], n: number): string[] {
  if (words.length < n) return []
  const ngrams: string[] = []
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '))
  }
  return ngrams
}

/**
 * Count how many times each n-gram appears.
 * Returns a map of ngram → count, filtered to those appearing > 1 time.
 */
export function countNGrams(words: string[], n: number): Map<string, number> {
  const ngrams = extractNGrams(words, n)
  const counts = new Map<string, number>()
  for (const ng of ngrams) {
    counts.set(ng, (counts.get(ng) ?? 0) + 1)
  }
  // Keep only repeated ones
  for (const [key, val] of counts) {
    if (val < 2) counts.delete(key)
  }
  return counts
}
