/**
 * statistics.ts
 * Computes all deterministic content statistics from input text.
 * Same input always produces identical output.
 */

import type { ContentStatistics } from '../types'
import { normalizeText, splitIntoParagraphs, unique, round } from './text-utils'
import { tokenizeSentences, tokenizeWords, countNGrams } from './tokenizer'

// ─── Extended statistics type ─────────────────────────────────────────────────

export interface FullStatistics extends ContentStatistics {
  /** Raw sentence strings */
  sentenceList: string[]
  /** Lowercase word tokens */
  wordList: string[]
  /** Word count per sentence */
  sentenceLengths: number[]
  /** Population standard deviation of sentence lengths */
  sentenceStdDev: number
  /** Coefficient of variation (stdDev / avg) — low = uniform = AI signal */
  sentenceLengthCV: number
  /** Top repeated 3/4-gram phrases */
  repeatedPhrases: { phrase: string; count: number }[]
}

// ─── Individual calculators ───────────────────────────────────────────────────

/** Count characters (excluding leading/trailing whitespace) */
export function countCharacters(text: string): number {
  return text.trim().length
}

/**
 * Compute sentence length statistics.
 * Each sentence length = number of words in it.
 */
export function computeSentenceLengths(sentences: string[]): {
  lengths: number[]
  avg: number
  min: number
  max: number
  stdDev: number
} {
  if (sentences.length === 0) {
    return { lengths: [], avg: 0, min: 0, max: 0, stdDev: 0 }
  }

  const lengths = sentences.map(s => tokenizeWords(s).length)
  const avg = round(lengths.reduce((a, b) => a + b, 0) / lengths.length, 1)
  const min = Math.min(...lengths)
  const max = Math.max(...lengths)

  // Population standard deviation
  const variance =
    lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length
  const stdDev = round(Math.sqrt(variance), 2)

  return { lengths, avg, min, max, stdDev }
}

/**
 * Vocabulary diversity = unique words / total words (type-token ratio).
 * Returns a value between 0 and 1. Higher = more diverse vocabulary.
 */
export function computeVocabularyDiversity(words: string[]): number {
  if (words.length === 0) return 0
  return round(unique(words).length / words.length, 4)
}

/**
 * Find repeated phrases (3-grams and 4-grams appearing more than once).
 * Returns array of { phrase, count } sorted by count descending.
 */
export function findRepeatedPhrases(
  words: string[]
): { phrase: string; count: number }[] {
  const results: { phrase: string; count: number }[] = []

  for (const n of [4, 3]) {
    const counts = countNGrams(words, n)
    for (const [phrase, count] of counts) {
      results.push({ phrase, count })
    }
  }

  return results.sort((a, b) => b.count - a.count).slice(0, 20)
}

/**
 * Coefficient of variation for sentence lengths.
 * CV = stdDev / mean — measures relative variability.
 * Low CV = uniform lengths (AI signal).
 */
export function computeSentenceLengthCV(avg: number, stdDev: number): number {
  if (avg === 0) return 0
  return round(stdDev / avg, 4)
}

// ─── Empty result ─────────────────────────────────────────────────────────────

function emptyStatistics(): FullStatistics {
  return {
    words: 0,
    characters: 0,
    sentences: 0,
    paragraphs: 0,
    avgSentenceLength: 0,
    minSentenceLength: 0,
    maxSentenceLength: 0,
    vocabularyDiversity: 0,
    sentenceList: [],
    wordList: [],
    sentenceLengths: [],
    sentenceStdDev: 0,
    sentenceLengthCV: 0,
    repeatedPhrases: [],
  }
}

// ─── Main statistics calculator ───────────────────────────────────────────────

/**
 * Compute all content statistics for a given text.
 * Deterministic: same input → same output, always.
 */
export function computeStatistics(rawText: string): FullStatistics {
  const text = normalizeText(rawText)
  if (!text) return emptyStatistics()

  const sentenceList = tokenizeSentences(text)
  const wordList = tokenizeWords(text)
  const paragraphList = splitIntoParagraphs(text)

  const { lengths, avg, min, max, stdDev } = computeSentenceLengths(sentenceList)
  const vocabularyDiversity = computeVocabularyDiversity(wordList)
  const sentenceLengthCV = computeSentenceLengthCV(avg, stdDev)
  const repeatedPhrases = findRepeatedPhrases(wordList)

  return {
    // ContentStatistics
    words: wordList.length,
    characters: countCharacters(rawText),
    sentences: sentenceList.length,
    paragraphs: paragraphList.length,
    avgSentenceLength: avg,
    minSentenceLength: min,
    maxSentenceLength: max,
    vocabularyDiversity,
    // Extended
    sentenceList,
    wordList,
    sentenceLengths: lengths,
    sentenceStdDev: stdDev,
    sentenceLengthCV,
    repeatedPhrases,
  }
}
