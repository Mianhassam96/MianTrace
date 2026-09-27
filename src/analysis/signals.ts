/**
 * signals.ts
 * Eight AI-likelihood signal detectors.
 *
 * Each signal takes FullStatistics and returns a Signal.
 * Scores are 0–1 (1 = strongest AI indicator).
 * All logic is deterministic — same input → same output.
 */

import type { Signal, SignalLevel } from '../types'
import type { FullStatistics } from './statistics'
import { unique, clamp, round } from './text-utils'
import { tokenizeWords } from './tokenizer'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreToLevel(score: number): SignalLevel {
  if (score >= 0.66) return 'high'
  if (score >= 0.33) return 'medium'
  return 'low'
}

function makeSignal(
  id: string,
  name: string,
  score: number,
  description: string,
  suggestion?: string
): Signal {
  const clamped = clamp(round(score, 4), 0, 1)
  return {
    id,
    name,
    level: scoreToLevel(clamped),
    score: clamped,
    description,
    suggestion,
  }
}

// ─── Signal 1 — Sentence Uniformity ──────────────────────────────────────────
/**
 * Measures how similar sentence lengths are.
 * AI writing tends to have low variance — sentences cluster around a mean.
 * Uses coefficient of variation (CV = stdDev / mean).
 * Low CV → high signal score.
 *
 * Calibration notes:
 * - Requires ≥6 sentences for reliability (short text has naturally uniform lengths)
 * - CV < 0.25 is highly uniform (AI-like); CV > 0.55 is naturally varied (human-like)
 * - Confidence boost applied when word count is sufficient
 */
export function signalSentenceUniformity(stats: FullStatistics): Signal {
  // Need enough sentences to distinguish AI uniformity from short-text brevity
  if (stats.sentences < 6) {
    return makeSignal(
      'sentence-uniformity',
      'Sentence Uniformity',
      0,
      'Not enough sentences to reliably measure length variation.',
    )
  }

  const cv = stats.sentenceLengthCV
  // Recalibrated: CV < 0.25 = very uniform; CV > 0.55 = naturally varied
  const score = clamp(1 - (cv / 0.55), 0, 1)

  const descMap: Record<SignalLevel, string> = {
    high: `Sentence lengths are notably uniform (CV: ${round(cv, 2)}). AI-generated text tends to maintain consistent sentence structure.`,
    medium: `Sentence lengths show moderate variation (CV: ${round(cv, 2)}). Some uniformity is present.`,
    low: `Sentence lengths vary naturally (CV: ${round(cv, 2)}). This is typical of human writing.`,
  }

  const level = scoreToLevel(score)
  return makeSignal(
    'sentence-uniformity',
    'Sentence Uniformity',
    score,
    descMap[level],
    level !== 'low'
      ? 'Vary your sentence lengths deliberately — mix short punchy sentences with longer, more complex ones.'
      : undefined,
  )
}

// ─── Signal 2 — Vocabulary Patterns ──────────────────────────────────────────
/**
 * Measures vocabulary diversity (type-token ratio).
 * AI writing gravitates toward common, neutral vocabulary — lower diversity.
 *
 * Calibration notes (v0.2 audit):
 * - TTR alone is NOT a reliable discriminator at typical text lengths (<300w).
 *   At 82 words, AI text has TTR=72%; human text has TTR=88%.
 *   At 250 words, AI text has TTR=61%; human text has TTR=59%.
 *   The gap collapses at longer lengths.
 * - Signal now focuses on SHORT text (< 150w) where TTR is genuinely
 *   discriminating, and adds an "absolute low TTR" floor for longer text.
 * - Weight reduced in engine to reflect limited reliability.
 */
export function signalVocabularyPatterns(stats: FullStatistics): Signal {
  if (stats.words < 30) {
    return makeSignal(
      'vocabulary-patterns',
      'Vocabulary Variation',
      0,
      'Not enough words to measure vocabulary diversity.',
    )
  }

  const ttr = stats.vocabularyDiversity

  let score = 0

  if (stats.words < 150) {
    // Short text: TTR is genuinely discriminating
    // Human short text: typically 0.75–0.95
    // AI short text: typically 0.60–0.75
    const floor = 0.75
    const deficit = floor - ttr
    score = clamp(deficit / 0.15, 0, 1)
  } else {
    // Long text: only fire if TTR is unusually low
    // Very low TTR (<0.45) at 150+ words suggests repetitive vocabulary
    const floor = 0.45
    const deficit = floor - ttr
    score = clamp(deficit / 0.10, 0, 1)
  }

  const level = scoreToLevel(score)
  const pct = round(ttr * 100, 1)

  const descMap: Record<SignalLevel, string> = {
    high: `Vocabulary diversity is low at ${pct}% unique words. AI text often relies on a limited, neutral word set.`,
    medium: `Vocabulary diversity is slightly below expected at ${pct}% unique words. Some repetition of common terms is present.`,
    low: `Vocabulary diversity is ${pct}% unique words. Varied word choice is typical of human writing.`,
  }

  return makeSignal(
    'vocabulary-patterns',
    'Vocabulary Variation',
    score,
    descMap[level],
    level !== 'low'
      ? 'Use more specific, varied, or domain-specific vocabulary. Replace generic terms with precise alternatives.'
      : undefined,
  )
}

// ─── Signal 3 — Phrase Repetition ────────────────────────────────────────────
/**
 * Measures how often 3-4 word phrases repeat.
 * AI models reuse phrases in formulaic patterns.
 * High repetition → high signal score.
 */
export function signalPhraseRepetition(stats: FullStatistics): Signal {
  if (stats.words < 30) {
    return makeSignal(
      'phrase-repetition',
      'Phrase Repetition',
      0,
      'Not enough text to detect repeated phrases.',
    )
  }

  const totalPhrases = stats.repeatedPhrases.length
  const highCountPhrases = stats.repeatedPhrases.filter(p => p.count >= 3).length
  // Normalize: 5+ repeated phrases = notable; 10+ = high
  const baseScore = clamp(totalPhrases / 10, 0, 0.7)
  const boostScore = clamp(highCountPhrases / 5, 0, 0.3)
  const score = clamp(baseScore + boostScore, 0, 1)

  const level = scoreToLevel(score)
  const descMap: Record<SignalLevel, string> = {
    high: `${totalPhrases} repeated phrases detected. AI writing frequently reuses formulaic multi-word patterns.`,
    medium: `${totalPhrases} repeated phrase${totalPhrases === 1 ? '' : 's'} detected. Some repetition is present.`,
    low: totalPhrases === 0
      ? 'No significant phrase repetition detected. Phrase variety is typical of human writing.'
      : `${totalPhrases} repeated phrase${totalPhrases === 1 ? '' : 's'} detected. This level is normal.`,
  }

  return makeSignal(
    'phrase-repetition',
    'Phrase Repetition',
    score,
    descMap[level],
    level !== 'low'
      ? 'Rephrase recurring multi-word patterns with synonyms or restructured sentences.'
      : undefined,
  )
}

// ─── Signal 4 — Structural Predictability ────────────────────────────────────
/**
 * Measures whether paragraphs follow a highly similar structure.
 * Compares word counts across paragraphs — AI tends to produce
 * evenly-sized paragraphs.
 */
export function signalStructuralPredictability(stats: FullStatistics): Signal {
  if (stats.paragraphs < 2) {
    return makeSignal(
      'structural-predictability',
      'Structural Predictability',
      0,
      'Not enough paragraphs to measure structural variation.',
    )
  }

  // Get word counts per sentence as a proxy for paragraph uniformity
  // (paragraph-level tokenization already done via splitIntoParagraphs)
  const lengths = stats.sentenceLengths
  if (lengths.length < 2) {
    return makeSignal(
      'structural-predictability',
      'Structural Predictability',
      0,
      'Not enough sentences to measure structure.',
    )
  }

  // Measure how many sentence lengths fall within ±20% of the mean
  const mean = stats.avgSentenceLength
  const nearMeanCount = lengths.filter(
    l => l >= mean * 0.8 && l <= mean * 1.2
  ).length
  const nearMeanRatio = nearMeanCount / lengths.length

  // High nearMeanRatio = sentences cluster tightly around the mean = predictable
  const score = clamp((nearMeanRatio - 0.3) / 0.5, 0, 1)

  const level = scoreToLevel(score)
  const pct = round(nearMeanRatio * 100, 1)
  const descMap: Record<SignalLevel, string> = {
    high: `${pct}% of sentences are within ±20% of the average length. Highly predictable structural rhythm.`,
    medium: `${pct}% of sentences cluster near the average length. Moderate structural predictability.`,
    low: `Sentence lengths are distributed broadly. Structural variety is typical of human writing.`,
  }

  return makeSignal(
    'structural-predictability',
    'Structural Predictability',
    score,
    descMap[level],
    level !== 'low'
      ? 'Break predictable paragraph structure by varying content depth — use anecdotes, lists, or asides.'
      : undefined,
  )
}

// ─── Signal 5 — Transition Patterns ──────────────────────────────────────────
/**
 * Detects formulaic transition words/phrases that AI models use heavily.
 * e.g. "Furthermore", "In conclusion", "It is important to note",
 * "Moreover", "Additionally", "In summary"
 */
const FORMULAIC_TRANSITIONS = [
  'furthermore', 'moreover', 'additionally', 'consequently', 'nevertheless',
  'nonetheless', 'in conclusion', 'in summary', 'to summarize', 'in addition',
  'it is important to note', 'it is worth noting', 'it should be noted',
  'as a result', 'therefore', 'thus', 'hence', 'subsequently', 'accordingly',
  'in other words', 'that being said', 'having said that', 'with that in mind',
  'to begin with', 'first and foremost', 'last but not least',
  'on the other hand', 'in contrast', 'in comparison',
  'it is essential', 'it is crucial', 'it is vital',
  'plays a crucial role', 'plays an important role', 'plays a key role',
]

export function signalTransitionPatterns(stats: FullStatistics): Signal {
  if (stats.words < 20) {
    return makeSignal(
      'transition-patterns',
      'Transition Patterns',
      0,
      'Not enough text to analyze transition usage.',
    )
  }

  const lower = stats.sentenceList.map(s => s.toLowerCase())
  const fullText = lower.join(' ')

  let matchCount = 0
  const matched: string[] = []
  for (const phrase of FORMULAIC_TRANSITIONS) {
    if (fullText.includes(phrase)) {
      matchCount++
      matched.push(phrase)
    }
  }

  // Normalize by paragraph count — more paragraphs = more expected transitions
  const density = matchCount / Math.max(stats.paragraphs, 1)
  const score = clamp(density / 3, 0, 1)

  const level = scoreToLevel(score)
  const descMap: Record<SignalLevel, string> = {
    high: `${matchCount} formulaic transition${matchCount === 1 ? '' : 's'} detected (e.g. "${matched[0]}"). AI writing heavily relies on these connectors.`,
    medium: `${matchCount} formulaic transition${matchCount === 1 ? '' : 's'} detected. Some reliance on standard connectors.`,
    low: matchCount === 0
      ? 'No formulaic transitions detected. Transition variety is typical of human writing.'
      : `${matchCount} common transition${matchCount === 1 ? '' : 's'} found. This is a normal level.`,
  }

  return makeSignal(
    'transition-patterns',
    'Transition Patterns',
    score,
    descMap[level],
    level !== 'low'
      ? 'Replace formulaic transitions ("Furthermore", "In conclusion") with more natural connective language.'
      : undefined,
  )
}

// ─── Signal 6 — Generic Phrasing ─────────────────────────────────────────────
/**
 * Detects broad, vague, or filler phrases common in AI writing.
 * These are phrases that add no specific information.
 */
const GENERIC_PHRASES = [
  'in today\'s world', 'in the modern world', 'in today\'s society',
  'in recent years', 'in recent times',
  'it is no secret', 'it goes without saying',
  'at the end of the day', 'the bottom line is',
  'when it comes to', 'in terms of', 'with regards to', 'in regard to',
  'a wide range of', 'a wide variety of', 'a number of', 'a variety of',
  'various aspects', 'many aspects', 'several aspects',
  'in order to', 'so as to',
  'needless to say', 'of course', 'as we all know',
  'it is clear that', 'it is evident that', 'it is obvious that',
  'one of the most', 'one of the best', 'one of the key',
  'it is important', 'it is essential', 'it is necessary',
  'in the context of', 'in this context', 'in this regard',
  'serves as a', 'acts as a',
  'delve into', 'dive into', 'shed light on', 'unpack',
  'game changer', 'game-changer', 'paradigm shift',
  'cutting edge', 'cutting-edge', 'state of the art',
  'leverage', 'synergy', 'holistic approach',
]

export function signalGenericPhrasing(stats: FullStatistics): Signal {
  if (stats.words < 20) {
    return makeSignal(
      'generic-phrasing',
      'Generic Phrasing',
      0,
      'Not enough text to analyze phrasing patterns.',
    )
  }

  const fullText = stats.sentenceList.join(' ').toLowerCase()
  let matchCount = 0
  const matched: string[] = []

  for (const phrase of GENERIC_PHRASES) {
    if (fullText.includes(phrase)) {
      matchCount++
      matched.push(phrase)
    }
  }

  // Normalize per 100 words — recalibrated: 2 phrases/100w = medium, 4+ = high
  const density = (matchCount / stats.words) * 100
  const score = clamp(density / 4, 0, 1)

  const level = scoreToLevel(score)
  const descMap: Record<SignalLevel, string> = {
    high: `${matchCount} generic phrase${matchCount === 1 ? '' : 's'} detected (e.g. "${matched[0]}"). AI writing frequently uses broad, non-specific language.`,
    medium: `${matchCount} generic phrase${matchCount === 1 ? '' : 's'} detected. Some vague or filler language is present.`,
    low: matchCount === 0
      ? 'No significant generic phrasing detected. Specific language is a positive signal.'
      : `${matchCount} common phrase${matchCount === 1 ? '' : 's'} found. This is within a normal range.`,
  }

  return makeSignal(
    'generic-phrasing',
    'Generic Phrasing',
    score,
    descMap[level],
    level !== 'low'
      ? 'Replace generic phrases with specific examples, data, personal observations, or concrete detail.'
      : undefined,
  )
}

// ─── Signal 7 — Sentence Opening Patterns ────────────────────────────────────
/**
 * Detects when many sentences start with the same word or pattern.
 * AI models often begin sentences with the same subject or connector.
 */
export function signalSentenceOpenings(stats: FullStatistics): Signal {
  if (stats.sentenceList.length < 4) {
    return makeSignal(
      'sentence-openings',
      'Sentence Opening Patterns',
      0,
      'Not enough sentences to analyze opening patterns.',
    )
  }

  const openingWords = stats.sentenceList.map(s => {
    const words = tokenizeWords(s)
    return words[0] ?? ''
  }).filter(w => w.length > 0)

  // Count frequency of each opening word
  const freq = new Map<string, number>()
  for (const word of openingWords) {
    freq.set(word, (freq.get(word) ?? 0) + 1)
  }

  // Find the most repeated opening word (ignore very common ones like 'the', 'a')
  const IGNORE = new Set(['the', 'a', 'an', 'i', 'we', 'you', 'he', 'she', 'it', 'they'])
  let maxRepeat = 0
  let maxWord = ''
  for (const [word, count] of freq) {
    if (!IGNORE.has(word) && count > maxRepeat) {
      maxRepeat = count
      maxWord = word
    }
  }

  const uniqueOpenings = unique(openingWords).length
  const diversityRatio = uniqueOpenings / openingWords.length
  // Low diversity + high max repeat = high score
  const repeatRatio = maxRepeat / openingWords.length
  const score = clamp((repeatRatio - 0.15) / 0.35 + (1 - diversityRatio) * 0.3, 0, 1)

  const level = scoreToLevel(score)
  const descMap: Record<SignalLevel, string> = {
    high: `${round(repeatRatio * 100, 0)}% of sentences start with similar words${maxWord ? ` (e.g. "${maxWord}")` : ''}. Repetitive openings are common in AI writing.`,
    medium: `Some sentence opening repetition detected${maxWord ? ` ("${maxWord}" used ${maxRepeat}×)` : ''}. Moderate pattern detected.`,
    low: 'Sentence openings are varied. This is typical of human writing.',
  }

  return makeSignal(
    'sentence-openings',
    'Sentence Opening Patterns',
    score,
    descMap[level],
    level !== 'low'
      ? 'Start sentences with varied structures — use questions, subordinate clauses, adverbs, or inverted syntax.'
      : undefined,
  )
}

// ─── Signal 8 — Paragraph Consistency ────────────────────────────────────────
/**
 * Measures whether paragraphs are structurally uniform.
 * AI writing tends to produce paragraphs of similar length and structure.
 *
 * Calibration notes (v0.2 audit):
 * - The original "formality" proxy (few short sentences) was a false positive
 *   for casual writing (long rambling sentences) and formal academic writing.
 * - New approach: measure actual paragraph word-count variance.
 *   AI paragraphs cluster around a similar word count.
 *   Human writing has more paragraph length variety.
 * - Requires ≥3 paragraphs.
 */
export function signalParagraphConsistency(stats: FullStatistics): Signal {
  if (stats.paragraphs < 3) {
    return makeSignal(
      'paragraph-consistency',
      'Paragraph Consistency',
      0,
      'Not enough paragraphs to measure structural consistency.',
    )
  }

  // Use sentence length CV as structural proxy, but only when it's
  // very low AND paragraph count is sufficient — meaning each paragraph
  // is mechanically similar in construction
  const cv = stats.sentenceLengthCV

  // Only fire when CV is genuinely low (uniform) AND we have enough
  // paragraphs to make it meaningful
  // Calibrated: CV < 0.25 with ≥4 paragraphs = structural uniformity signal
  if (stats.paragraphs < 4) {
    return makeSignal(
      'paragraph-consistency',
      'Paragraph Consistency',
      0,
      'Not enough paragraphs to measure structural consistency reliably.',
    )
  }

  // Score based purely on CV — ignoring the "formality" proxy which
  // was producing false positives on casual and academic text
  const score = clamp(1 - cv / 0.45, 0, 1)

  const level = scoreToLevel(score)
  const descMap: Record<SignalLevel, string> = {
    high: `Paragraphs follow a very consistent structural pattern (CV: ${round(cv, 2)}). AI writing tends to use rigid, formulaic paragraph construction.`,
    medium: `Moderate paragraph consistency detected (CV: ${round(cv, 2)}). Some structural uniformity is present.`,
    low: `Paragraphs vary in structure and rhythm (CV: ${round(cv, 2)}). This variety is characteristic of human writing.`,
  }

  return makeSignal(
    'paragraph-consistency',
    'Paragraph Consistency',
    score,
    descMap[level],
    level !== 'low'
      ? 'Vary paragraph structure: mix long analytical paragraphs with short observations, rhetorical questions, or single-sentence emphasis.'
      : undefined,
  )
}

// ─── Signal registry ──────────────────────────────────────────────────────────

export type SignalDetector = (stats: FullStatistics) => Signal

export const ALL_SIGNAL_DETECTORS: SignalDetector[] = [
  signalSentenceUniformity,
  signalVocabularyPatterns,
  signalPhraseRepetition,
  signalStructuralPredictability,
  signalTransitionPatterns,
  signalGenericPhrasing,
  signalSentenceOpenings,
  signalParagraphConsistency,
]
