/**
 * specificityAnalysis.ts
 * Measures specificity vs vagueness in the text.
 * Weight: 10
 *
 * GENERIC_PHRASES is not exported from signals.ts, so it is re-declared here.
 */

import type { VisibilityDimension } from '../../types'
import type { FullStatistics } from '../statistics'

// Same list as in signals.ts (GENERIC_PHRASES) — cannot import because it is not exported
const GENERIC_PHRASES: readonly string[] = [
  "in today's world", "in the modern world", "in today's society",
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

// Concrete action verbs that signal specificity
const CONCRETE_VERBS: readonly string[] = [
  'achieves', 'demonstrates', 'reduces', 'increases', 'enables',
  'provides', 'generates', 'produces', 'measures', 'tracks',
]

export function analyzeSpecificity(
  stats: FullStatistics,
  text: string,
  _headings?: string[]
): VisibilityDimension {
  const weight = 10

  if (stats.words < 20) {
    return {
      id: 'specificity',
      name: 'Specificity & Concreteness',
      score: 50,
      weight,
      level: 'medium',
      findings: ['Not enough text to measure specificity.'],
      recommendation: 'Use specific numbers, proper nouns, and concrete verbs to improve specificity.',
    }
  }

  const lower = text.toLowerCase()

  // Vague: count GENERIC_PHRASES matches
  let vagueCount = 0
  for (const phrase of GENERIC_PHRASES) {
    if (lower.includes(phrase)) vagueCount++
  }

  // Specific: numbers
  const numberCount = (text.match(/\b\d+\b/g) ?? []).length

  // Specific: proper nouns (capitalized mid-sentence)
  const sentenceStartWords = new Set(
    stats.sentenceList
      .map(s => {
        const m = s.match(/^\s*([A-Za-z]+)/)
        return m ? m[1].toLowerCase() : ''
      })
      .filter(w => w.length > 0)
  )
  const properNounMatches = text.match(/\b[A-Z][a-z]{1,}\b/g) ?? []
  const properNounCount = properNounMatches.filter(w => !sentenceStartWords.has(w.toLowerCase())).length

  // Specific: technical terms (words 7+ chars)
  const technicalTermCount = stats.wordList.filter(w => w.length >= 7).length

  // Specific: concrete action verbs
  let concreteVerbCount = 0
  for (const verb of CONCRETE_VERBS) {
    if (lower.includes(verb)) concreteVerbCount++
  }

  const specificCount = numberCount + properNounCount + Math.round(technicalTermCount * 0.1) + concreteVerbCount * 2

  let score: number
  if (specificCount + vagueCount === 0) {
    score = 50
  } else {
    score = Math.round((specificCount / (specificCount + vagueCount)) * 100)
  }
  score = Math.min(100, score)

  const level: VisibilityDimension['level'] = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'

  const findings: string[] = []
  findings.push(`Specificity score: ${specificCount} specific signals vs ${vagueCount} vague phrase${vagueCount !== 1 ? 's' : ''}.`)
  if (numberCount > 0 || properNounCount > 0) {
    findings.push(`Found ${numberCount} number${numberCount !== 1 ? 's' : ''} and ${properNounCount} proper noun${properNounCount !== 1 ? 's' : ''} used mid-sentence.`)
  }
  if (concreteVerbCount > 0) {
    findings.push(`${concreteVerbCount} concrete action verb${concreteVerbCount > 1 ? 's' : ''} detected (e.g., achieves, demonstrates, reduces).`)
  }

  const recommendation =
    score < 70
      ? 'Replace vague phrases with numbers, named entities, and concrete action verbs to increase specificity.'
      : undefined

  return { id: 'specificity', name: 'Specificity & Concreteness', score, weight, level, findings, recommendation }
}
