/**
 * sentence-analysis.ts
 * Scores each sentence individually against the same signal patterns
 * used by the main engine, producing a per-sentence AI-likelihood estimate.
 *
 * Important: We never say "this sentence was written by AI."
 * We say "this sentence shows patterns that contributed to the estimate."
 */

import type { SentenceAnalysis, SentenceContribution, SignalLevel } from '../types'
import type { FullStatistics } from './statistics'
import { tokenizeWords } from './tokenizer'
import { clamp, round } from './text-utils'

// ─── Formulaic phrase sets (mirrors signals.ts) ───────────────────────────────

const FORMULAIC_TRANSITIONS = new Set([
  'furthermore', 'moreover', 'additionally', 'consequently', 'nevertheless',
  'nonetheless', 'in conclusion', 'in summary', 'to summarize', 'in addition',
  'it is important to note', 'it is worth noting', 'it should be noted',
  'as a result', 'therefore', 'thus', 'hence', 'subsequently', 'accordingly',
  'in other words', 'that being said', 'having said that', 'with that in mind',
  'to begin with', 'first and foremost', 'last but not least',
  'on the other hand', 'in contrast', 'in comparison',
  'it is essential', 'it is crucial', 'it is vital',
  'plays a crucial role', 'plays an important role', 'plays a key role',
])

const GENERIC_PHRASES = new Set([
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
])

// ─── Per-sentence scorer ──────────────────────────────────────────────────────

function scoreToLevel(score: number): SignalLevel {
  if (score >= 0.55) return 'high'
  if (score >= 0.25) return 'medium'
  return 'low'
}

function analyzeSentence(
  sentence: string,
  index: number,
  stats: FullStatistics
): SentenceAnalysis {
  const lower = sentence.toLowerCase()
  const words = tokenizeWords(sentence)
  const wordCount = words.length
  const contributions: SentenceContribution[] = []
  let score = 0

  // ── Check 1: sentence length uniformity ─────────────────────────────────
  if (wordCount > 0 && stats.avgSentenceLength > 0) {
    const deviation = Math.abs(wordCount - stats.avgSentenceLength) / stats.avgSentenceLength
    if (deviation < 0.15 && stats.sentenceLengthCV < 0.3) {
      score += 0.2
      contributions.push({
        reason: 'Sentence length is close to the document average — typical of uniform AI output',
        signalId: 'sentence-uniformity',
      })
    }
  }

  // ── Check 2: formulaic transitions ──────────────────────────────────────
  for (const phrase of FORMULAIC_TRANSITIONS) {
    if (lower.includes(phrase)) {
      score += 0.3
      contributions.push({
        reason: `Contains formulaic transition: "${phrase}"`,
        signalId: 'transition-patterns',
      })
      break // one transition is enough to flag
    }
  }

  // ── Check 3: generic phrasing ────────────────────────────────────────────
  let genericCount = 0
  for (const phrase of GENERIC_PHRASES) {
    if (lower.includes(phrase)) {
      genericCount++
      if (genericCount === 1) {
        contributions.push({
          reason: `Contains generic phrase: "${phrase}"`,
          signalId: 'generic-phrasing',
        })
      }
    }
  }
  if (genericCount > 0) score += clamp(genericCount * 0.2, 0, 0.4)

  // ── Check 4: repeated phrase match ──────────────────────────────────────
  if (stats.repeatedPhrases.length > 0) {
    const matched = stats.repeatedPhrases.filter(({ phrase }) => lower.includes(phrase))
    if (matched.length > 0) {
      score += clamp(matched.length * 0.15, 0, 0.3)
      contributions.push({
        reason: `Contains repeated phrase${matched.length > 1 ? 's' : ''}: "${matched[0].phrase}"${matched.length > 1 ? ` and ${matched.length - 1} more` : ''}`,
        signalId: 'phrase-repetition',
      })
    }
  }

  // ── Check 5: sentence opening repetition ────────────────────────────────
  if (words.length > 0 && stats.sentenceList.length >= 4) {
    const firstWord = words[0]
    const IGNORE = new Set(['the', 'a', 'an', 'i', 'we', 'you', 'he', 'she', 'it', 'they'])
    if (!IGNORE.has(firstWord)) {
      const sameOpenings = stats.sentenceList.filter(s =>
        tokenizeWords(s)[0] === firstWord
      ).length
      const openingRatio = sameOpenings / stats.sentenceList.length
      if (openingRatio >= 0.25 && sameOpenings >= 2) {
        score += 0.15
        contributions.push({
          reason: `Starts with "${firstWord}" — shared by ${sameOpenings} sentences in this text`,
          signalId: 'sentence-openings',
        })
      }
    }
  }

  // ── Check 6: predictable sentence structure (very long or exactly average) ─
  if (wordCount >= 20 && stats.avgSentenceLength >= 18) {
    const deviation = Math.abs(wordCount - stats.avgSentenceLength)
    if (deviation <= 2) {
      score += 0.1
      contributions.push({
        reason: 'Sentence length matches the average almost exactly — contributes to structural predictability',
        signalId: 'structural-predictability',
      })
    }
  }

  const finalScore = round(clamp(score, 0, 1), 4)

  return {
    text: sentence,
    score: finalScore,
    level: scoreToLevel(finalScore),
    index,
    contributions,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Analyze each sentence in the document individually.
 * Returns one SentenceAnalysis per sentence.
 */
export function analyzeSentences(stats: FullStatistics): SentenceAnalysis[] {
  return stats.sentenceList.map((sentence, index) =>
    analyzeSentence(sentence, index, stats)
  )
}
