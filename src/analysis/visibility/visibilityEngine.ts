/**
 * visibilityEngine.ts
 * Orchestrates all 7 visibility analyzers and produces a VisibilityResult.
 */

import type { FullStatistics } from '../statistics'
import type { VisibilityResult } from '../../types'
import { analyzeAnswerability } from './answerability'
import { analyzeTopicCoverage } from './topicCoverage'
import { analyzeEntityCoverage } from './entityCoverage'
import { analyzeEvidence } from './evidenceAnalysis'
import { analyzeStructure } from './structureAnalysis'
import { analyzeSpecificity } from './specificityAnalysis'
import { analyzeFreshness } from './freshnessAnalysis'

export function runVisibilityEngine(
  stats: FullStatistics,
  rawText: string,
  headings?: string[]
): VisibilityResult {
  const dimensions = [
    analyzeAnswerability(stats, rawText, headings),
    analyzeTopicCoverage(stats, rawText, headings),
    analyzeEntityCoverage(stats, rawText, headings),
    analyzeEvidence(stats, rawText, headings),
    analyzeStructure(stats, rawText, headings),
    analyzeSpecificity(stats, rawText, headings),
    analyzeFreshness(stats, rawText, headings),
  ]

  // Weighted composite: sum(score * weight / 100)
  // weights: 20+20+15+15+15+10+5 = 100
  const overallScore = Math.round(
    dimensions.reduce((sum, d) => sum + (d.score * d.weight) / 100, 0)
  )

  // Confidence based on word count
  const confidence: VisibilityResult['confidence'] =
    stats.words < 50 ? 'low' : stats.words < 150 ? 'moderate' : 'high'

  // Explanation: 1–2 sentences about top and bottom dimension
  const sorted = [...dimensions].sort((a, b) => b.score - a.score)
  const top = sorted[0]
  const bottom = sorted[sorted.length - 1]
  const explanation =
    `The strongest visibility signal is ${top.name} (score: ${top.score}/100). ` +
    `The area with most room for improvement is ${bottom.name} (score: ${bottom.score}/100).`

  const limitations =
    'Visibility readiness scoring is based on structural and lexical signals only. ' +
    'It does not assess factual accuracy, domain authority, or real-world search engine rankings.'

  return {
    overallScore,
    confidence,
    dimensions,
    explanation,
    limitations,
  }
}
