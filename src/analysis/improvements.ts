/**
 * improvements.ts
 * Maps each signal to detailed, actionable improvement advice.
 *
 * The advice follows the Detect → Explain → Improve model:
 * - What was detected
 * - Why it matters
 * - Specific actions to take
 */

import type { Signal } from '../types'

export interface ImprovementAdvice {
  signalId: string
  signalName: string
  /** Short headline for the improvement card */
  headline: string
  /** One sentence explaining what was detected and why it matters */
  context: string
  /** Concrete, specific steps the writer can take */
  actions: string[]
  /** A before/after example where helpful */
  example?: { before: string; after: string }
}

// ─── Improvement definitions per signal ──────────────────────────────────────

const IMPROVEMENTS: Record<string, Omit<ImprovementAdvice, 'signalId' | 'signalName'>> = {
  'sentence-uniformity': {
    headline: 'Vary your sentence lengths',
    context: 'Your sentences are unusually similar in length, creating a monotonous rhythm that is common in AI-generated text.',
    actions: [
      'After every 2–3 medium-length sentences, add a short, punchy one. Or a fragment.',
      'Occasionally write a longer, more complex sentence that builds through multiple clauses before arriving at its point.',
      'Read your text aloud — if it sounds metronomic, break the pattern deliberately.',
      'Use a mix of simple, compound, and complex sentence structures.',
    ],
    example: {
      before: 'The system processes data efficiently. It handles large volumes well. The output is accurate and reliable.',
      after: 'The system processes data efficiently — even at scale. Accuracy? Consistently high. And when volumes spike, it holds.',
    },
  },

  'vocabulary-patterns': {
    headline: 'Expand and diversify your vocabulary',
    context: 'The text relies on a limited set of words, which is characteristic of AI models that favour common, neutral vocabulary.',
    actions: [
      'Replace vague nouns with specific ones: "thing" → the actual name of what it is.',
      'Use domain-specific terminology where appropriate — it signals expertise.',
      'Vary verbs: instead of repeating "is" and "are", use more precise action verbs.',
      'Introduce synonyms, but only when they carry the same meaning — never just for variety\'s sake.',
      'Add concrete details: numbers, names, places, and dates make writing more specific.',
    ],
    example: {
      before: 'This approach has many benefits. It is good for performance and helps with reliability.',
      after: 'This approach cuts latency by ~40ms and eliminates the race condition that caused intermittent failures.',
    },
  },

  'phrase-repetition': {
    headline: 'Eliminate repeated multi-word phrases',
    context: 'Several 3–4 word phrases appear multiple times, a pattern common in AI writing that generates content by completing familiar sequences.',
    actions: [
      'Search for the repeated phrases identified in the signal breakdown and rewrite at least half of them.',
      'Restructure sentences so the same idea is expressed with different syntax.',
      'Where a phrase is repeated because the concept is central, consider defining it once clearly and then using a shorter reference.',
      'Check paragraph openings especially — AI text often starts paragraphs with the same phrases.',
    ],
  },

  'structural-predictability': {
    headline: 'Break the structural rhythm',
    context: 'Your sentences cluster tightly around the same length, creating a predictable, mechanical cadence.',
    actions: [
      'Intentionally place a very short sentence (3–5 words) every few paragraphs.',
      'Try starting one paragraph with a question, another with a quote, another mid-action.',
      'Use a bulleted list or numbered steps for one section instead of continuous prose.',
      'Vary paragraph length: mix one-sentence paragraphs with longer analytical ones.',
    ],
    example: {
      before: 'The framework offers a structured approach to problem-solving. It provides clear guidelines for implementation. Teams can follow the steps sequentially.',
      after: 'The framework offers a structured approach to problem-solving — clear steps, sensible defaults. Teams love it. The hard part is knowing when to deviate.',
    },
  },

  'transition-patterns': {
    headline: 'Replace formulaic transitions',
    context: 'The text uses transitions like "Furthermore", "In conclusion", and "Moreover" — these are heavily overrepresented in AI-generated content.',
    actions: [
      'Delete the transition word and see if the paragraph still flows — often it does.',
      'Replace connector words with structural relationships: instead of "Furthermore, X is true", show why X follows logically from what came before.',
      '"In conclusion" → just write the conclusion. The section heading or context makes it clear.',
      'Use more conversational connectors: "And yet—", "Here\'s the thing:", "Which brings us to…"',
      'Let paragraph order carry the logic rather than announcing it with a transition.',
    ],
    example: {
      before: 'Furthermore, it is important to note that performance improved significantly. Moreover, the team was satisfied with the results.',
      after: 'Performance jumped by 30%. The team noticed immediately.',
    },
  },

  'generic-phrasing': {
    headline: 'Replace vague language with specific detail',
    context: 'Several broad, filler phrases were detected — language that adds length without adding meaning, which is commonly associated with AI-assisted or formulaic writing.',
    actions: [
      'For every "in today\'s world" or "in recent years", ask: which world? which years? Replace with the actual context.',
      '"A wide range of" → list the actual things, or give a number.',
      '"It is important to note that…" → just state the note directly.',
      '"Plays a crucial role" → describe what the role actually is and what happens without it.',
      'Replace "leverage" with what you\'re actually doing: use, apply, build on, exploit.',
      'Add a specific example, data point, or personal observation after any broad claim.',
    ],
    example: {
      before: 'In today\'s world, it is crucial to leverage a wide range of tools to achieve optimal results.',
      after: 'In 2024, most teams use at least three observability tools — logs, metrics, and traces — and the ones that don\'t are usually the ones debugging at 2am.',
    },
  },

  'sentence-openings': {
    headline: 'Vary how you start your sentences',
    context: 'Multiple sentences begin with the same word or structure, a pattern that makes writing feel templated and repetitive.',
    actions: [
      'Audit your sentence openings — highlight every sentence that starts the same way and rewrite at least half.',
      'Try starting with a time/place: "By mid-2023…", "At the core of this…"',
      'Start with a subordinate clause: "When performance matters…", "Because the data is noisy…"',
      'Occasionally open with the object rather than the subject: "The result was unexpected." → "Unexpected: the result."',
      'Use a question to open a paragraph: "Why does this matter?"',
    ],
  },

  'paragraph-consistency': {
    headline: 'Vary your paragraph structure',
    context: 'Paragraphs follow an overly consistent pattern — likely topic sentence, evidence, conclusion — which is the default structure AI models produce.',
    actions: [
      'Not every paragraph needs a formal topic sentence. Let some paragraphs begin in the middle of a thought.',
      'Use a single-sentence paragraph for emphasis occasionally.',
      'Vary information density: some paragraphs can be entirely concrete (examples, data), others entirely analytical.',
      'Consider opening a section with a question or a surprising claim rather than a statement.',
      'Let one paragraph be deliberately conversational or informal to break the register.',
    ],
  },
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate improvement advice for all signals at medium or high level.
 * Returns an array sorted: high signals first, then medium.
 */
export function getImprovements(signals: Signal[]): ImprovementAdvice[] {
  return signals
    .filter(s => s.level === 'high' || s.level === 'medium')
    .filter(s => s.score > 0)
    .sort((a, b) => {
      if (a.level === b.level) return b.score - a.score
      return a.level === 'high' ? -1 : 1
    })
    .map(signal => {
      const advice = IMPROVEMENTS[signal.id]
      if (!advice) return null
      return {
        signalId: signal.id,
        signalName: signal.name,
        ...advice,
      }
    })
    .filter((x): x is ImprovementAdvice => x !== null)
}
