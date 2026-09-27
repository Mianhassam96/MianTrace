/**
 * engine.ts
 * Runs all 8 signal detectors over FullStatistics and produces
 * a weighted AI-likelihood score with confidence.
 *
 * Design principles:
 * - Never claims proof of AI authorship
 * - Confidence degrades with short or low-signal text
 * - Same input → same output (deterministic)
 */

import type { AnalysisResult, ConfidenceLevel, Signal } from '../types'
import type { FullStatistics } from './statistics'
import { ALL_SIGNAL_DETECTORS } from './signals'
import { analyzeSentences } from './sentence-analysis'
import { clamp, round } from './text-utils'

// ─── Signal weights ───────────────────────────────────────────────────────────
// Calibrated from audit v2 (8 samples):
// - Transitions + generic phrasing: perfect discriminators (Δ=+1.0) — highest weight
// - Sentence uniformity: excellent (Δ=+0.69) — keep weight
// - Structural predictability: good (Δ=+0.28)
// - Sentence openings: good (Δ=+0.43)
// - Vocabulary: weak but valid for short text (Δ=+0.09) — reduced weight
// - Phrase repetition: anti-discriminates (fires MORE on human Δ=-0.06) — heavily reduced
// - Paragraph consistency: weak (Δ=+0.14) — reduced
const SIGNAL_WEIGHTS: Record<string, number> = {
  'sentence-uniformity':        1.1,
  'vocabulary-patterns':        0.8,  // weak — reduced
  'phrase-repetition':          0.4,  // anti-discriminates — heavily reduced
  'structural-predictability':  1.0,
  'transition-patterns':        1.7,  // perfect discriminator
  'generic-phrasing':           1.7,  // perfect discriminator
  'sentence-openings':          1.0,
  'paragraph-consistency':      0.6,  // weak — reduced
}

// ─── Confidence calculator ────────────────────────────────────────────────────
/**
 * Confidence depends on:
 * 1. Text length — very short text can't support reliable signals
 * 2. Number of usable signals (score > 0)
 * 3. Signal agreement — if signals point in the same direction, confidence rises
 */
function computeConfidence(
  signals: Signal[],
  wordCount: number
): ConfidenceLevel {
  // Length factor: 0 at <50 words, 1.0 at 300+ words
  const lengthFactor = clamp((wordCount - 50) / 250, 0, 1)

  // Usable signals: those with score > 0
  const usable = signals.filter(s => s.score > 0)
  const signalFactor = clamp(usable.length / 6, 0, 1)

  // Agreement: std dev of signal scores — low stdDev = signals agree
  const scores = usable.map(s => s.score)
  if (scores.length === 0) return 'low'
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)
  // Low stdDev (< 0.15) = high agreement; high stdDev (> 0.35) = low agreement
  const agreementFactor = clamp(1 - stdDev / 0.35, 0, 1)

  const combined = lengthFactor * 0.4 + signalFactor * 0.35 + agreementFactor * 0.25

  if (combined >= 0.65) return 'high'
  if (combined >= 0.35) return 'moderate'
  return 'low'
}

// ─── Score calculator ─────────────────────────────────────────────────────────
/**
 * Weighted average of signal scores → 0–100 AI-likelihood percentage.
 */
function computeAiLikelihood(signals: Signal[]): number {
  let weightedSum = 0
  let totalWeight = 0

  for (const signal of signals) {
    if (signal.score === 0) continue // skip non-computable signals
    const weight = SIGNAL_WEIGHTS[signal.id] ?? 1.0
    weightedSum += signal.score * weight
    totalWeight += weight
  }

  if (totalWeight === 0) return 0
  const raw = weightedSum / totalWeight
  return round(clamp(raw * 100, 0, 100), 0)
}

// ─── Explanation generator ────────────────────────────────────────────────────
function buildExplanation(
  signals: Signal[],
  likelihood: number,
  confidence: ConfidenceLevel
): string {
  const highSignals = signals.filter(s => s.level === 'high')
  const mediumSignals = signals.filter(s => s.level === 'medium')

  if (likelihood < 25) {
    return 'MianTrace detected few writing patterns associated with AI-generated content. The text shows natural variation in structure, vocabulary, and phrasing.'
  }

  if (likelihood < 50) {
    const names = [...highSignals, ...mediumSignals].slice(0, 2).map(s => s.name)
    return `MianTrace detected some patterns associated with AI-assisted writing${names.length ? ` — particularly ${names.join(' and ')}` : ''}. The overall profile is mixed, with both human-like and formulaic characteristics.`
  }

  if (likelihood < 75) {
    const names = highSignals.slice(0, 3).map(s => s.name)
    return `MianTrace detected several writing patterns commonly associated with AI-generated or highly formulaic content${names.length ? `, including ${names.join(', ')}` : ''}. ${confidence === 'low' ? 'However, confidence is limited due to text length.' : 'Multiple signals point in the same direction.'}`
  }

  const names = highSignals.slice(0, 3).map(s => s.name)
  return `MianTrace detected strong AI-likelihood signals across multiple dimensions${names.length ? ` — including ${names.join(', ')}` : ''}. The writing profile shows several characteristics that are statistically associated with AI-generated or highly formulaic text.`
}

// ─── Limitations text ─────────────────────────────────────────────────────────
function buildLimitations(wordCount: number, confidence: ConfidenceLevel): string {
  const parts: string[] = [
    'MianTrace provides a probabilistic analysis based on writing patterns. It cannot prove whether content was written by a human or generated by AI.',
  ]

  if (wordCount < 100) {
    parts.push('Short text (under 100 words) significantly limits analysis reliability.')
  } else if (wordCount < 200) {
    parts.push('Moderate text length — results are indicative but not conclusive.')
  }

  if (confidence === 'low') {
    parts.push('Confidence is low — treat this result as a rough estimate only.')
  }

  parts.push('Some human writing styles may score high; some AI content may score low.')

  return parts.join(' ')
}

// ─── Main engine ──────────────────────────────────────────────────────────────
/**
 * Run the full signal engine on pre-computed statistics.
 * Returns a complete AnalysisResult ready for the UI.
 */
export function runSignalEngine(stats: FullStatistics): AnalysisResult {
  // Run all 8 signal detectors
  const signals = ALL_SIGNAL_DETECTORS.map(detector => detector(stats))

  // Score and confidence
  const aiLikelihood = computeAiLikelihood(signals)
  const confidence = computeConfidence(signals, stats.words)

  // Narrative outputs
  const explanation = buildExplanation(signals, aiLikelihood, confidence)
  const limitations = buildLimitations(stats.words, confidence)

  return {
    aiLikelihood,
    confidence,
    statistics: {
      words: stats.words,
      characters: stats.characters,
      sentences: stats.sentences,
      paragraphs: stats.paragraphs,
      avgSentenceLength: stats.avgSentenceLength,
      minSentenceLength: stats.minSentenceLength,
      maxSentenceLength: stats.maxSentenceLength,
      vocabularyDiversity: stats.vocabularyDiversity,
    },
    signals,
    explanation,
    limitations,
    sentenceAnalyses: analyzeSentences(stats),
  }
}
