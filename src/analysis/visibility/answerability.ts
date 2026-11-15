/**
 * answerability.ts
 * Detects direct-answer patterns that make content AI-visible.
 * Weight: 20
 */

import type { VisibilityDimension } from '../../types'
import type { FullStatistics } from '../statistics'

export function analyzeAnswerability(
  stats: FullStatistics,
  _text: string,
  _headings?: string[]
): VisibilityDimension {
  const weight = 20

  if (stats.words < 20) {
    return {
      id: 'answerability',
      name: 'Direct Answerability',
      score: 0,
      weight,
      level: 'low',
      findings: ['Not enough text to evaluate direct-answer patterns.'],
      recommendation: 'Add more content with clear definitions or answers to common questions.',
    }
  }

  const sentences = stats.sentenceList
  // Use the raw text for line-based patterns (sentenceList.join has no newlines)
  const lines = _text.split(/\n/)

  // 1. Definition sentences: "X is ...", "X refers to ..."
  const definitionPattern = /\b\w[\w\s]{0,30}\b(?:is|are|refers to|means|defined as)\b/i
  const definitionCount = sentences.filter(s => definitionPattern.test(s)).length

  // 2. Question-answer patterns: lines starting with What/How/Why/When/Where
  const questionPattern = /^\s*(?:What|How|Why|When|Where)\b/
  const questionCount = lines.filter(l => questionPattern.test(l)).length

  // 3. Numbered or bulleted lists indicating enumerated answers
  const listPattern = /^\s*(?:\d+[.)]\s+|[-*•]\s+)/
  const listLineCount = lines.filter(l => listPattern.test(l)).length
  const hasList = listLineCount >= 2

  // Scoring: each factor contributes
  const definitionScore = Math.min(definitionCount / 3, 1)
  const questionScore = Math.min(questionCount / 2, 1)
  const listScore = hasList ? Math.min(listLineCount / 4, 1) : 0

  const rawScore = (definitionScore * 0.45 + questionScore * 0.3 + listScore * 0.25)
  const score = Math.round(Math.min(rawScore * 100, 100))
  const level: VisibilityDimension['level'] = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'

  const findings: string[] = []
  if (definitionCount > 0) {
    findings.push(`Found ${definitionCount} definition-style sentence${definitionCount > 1 ? 's' : ''} (e.g., "X is …" patterns).`)
  }
  if (questionCount > 0) {
    findings.push(`Found ${questionCount} question-phrased heading or line${questionCount > 1 ? 's' : ''} starting with What/How/Why/When/Where.`)
  }
  if (hasList) {
    findings.push(`Found ${listLineCount} numbered or bulleted list lines providing enumerated answers.`)
  }
  if (findings.length === 0) {
    findings.push('No clear definition sentences, question patterns, or structured lists detected.')
  }

  const recommendation =
    score < 70
      ? 'Add direct definition sentences ("X is…"), Q&A-formatted headings, or numbered lists to improve AI extractability.'
      : undefined

  return { id: 'answerability', name: 'Direct Answerability', score, weight, level, findings, recommendation }
}
