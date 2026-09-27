/**
 * MianTrace Signal Engine Audit
 * Runs 4 representative text samples through the analysis engine
 * and prints a full signal breakdown for calibration review.
 *
 * Run with: node scripts/audit.mjs
 */

import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Inline the analysis engine (avoids TypeScript compile step) ─────────────
// We'll use a simple re-implementation of the core logic for auditing

// ── Text utils ────────────────────────────────────────────────────────────────
function normalizeText(text) {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function splitIntoParagraphs(text) {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0)
}

function round(v, d = 2) { return Math.round(v * 10**d) / 10**d }
function clamp(v, min, max) { return Math.min(Math.max(v, min), max) }

// ── Tokenizer ─────────────────────────────────────────────────────────────────
const ABBREVIATIONS = new Set([
  'mr','mrs','ms','dr','prof','sr','jr','vs','etc','inc','ltd','corp',
  'dept','est','approx','fig','no','vol','jan','feb','mar','apr','jun',
  'jul','aug','sep','oct','nov','dec','st','ave','blvd','i.e','e.g',
])

function tokenizeSentences(text) {
  if (!text.trim()) return []
  let p = text
    .replace(/\b([A-Za-z]{1,5})\./g, (m, w) => ABBREVIATIONS.has(w.toLowerCase()) ? w + '\x00' : m)
    .replace(/(\d)\.(\d)/g, '$1\x01$2')
    .replace(/\.\.\./g, '\x02')
  const raw = p.split(/(?<=[.!?]["'\u201D\u2019]?\s+)(?=[A-Z\u00C0-\u017E])/)
  const result = []
  for (const chunk of raw) {
    for (const sub of chunk.split(/\n+/)) {
      const r = sub.replace(/\x00/g,'.').replace(/\x01/g,'.').replace(/\x02/g,'...').trim()
      if (r.length > 0) result.push(r)
    }
  }
  return result.filter(s => s.length > 0)
}

function tokenizeWords(text) {
  if (!text.trim()) return []
  return text.split(/\s+/)
    .map(t => t.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').toLowerCase())
    .filter(t => t.length > 0 && /[a-zA-Z0-9]/.test(t))
}

function extractNGrams(words, n) {
  if (words.length < n) return []
  const r = []
  for (let i = 0; i <= words.length - n; i++) r.push(words.slice(i,i+n).join(' '))
  return r
}

function countNGrams(words, n) {
  const counts = new Map()
  for (const ng of extractNGrams(words, n)) counts.set(ng, (counts.get(ng) ?? 0) + 1)
  for (const [k,v] of counts) if (v < 2) counts.delete(k)
  return counts
}

// ── Statistics ────────────────────────────────────────────────────────────────
function computeStatistics(rawText) {
  const text = normalizeText(rawText)
  if (!text) return null
  const sentenceList = tokenizeSentences(text)
  const wordList = tokenizeWords(text)
  const paragraphList = splitIntoParagraphs(text)

  const lengths = sentenceList.map(s => tokenizeWords(s).length)
  const avg = lengths.length ? round(lengths.reduce((a,b)=>a+b,0)/lengths.length, 1) : 0
  const min = lengths.length ? Math.min(...lengths) : 0
  const max = lengths.length ? Math.max(...lengths) : 0
  const variance = lengths.length ? lengths.reduce((s,l)=>s+Math.pow(l-avg,2),0)/lengths.length : 0
  const stdDev = round(Math.sqrt(variance), 2)
  const cv = avg > 0 ? round(stdDev/avg, 4) : 0

  const uniqueWords = new Set(wordList).size
  const vocabDiversity = wordList.length > 0 ? round(uniqueWords/wordList.length, 4) : 0

  const repeated = []
  for (const n of [4,3]) {
    for (const [phrase,count] of countNGrams(wordList, n)) repeated.push({phrase, count})
  }
  repeated.sort((a,b)=>b.count-a.count)

  return {
    words: wordList.length,
    characters: rawText.trim().length,
    sentences: sentenceList.length,
    paragraphs: paragraphList.length,
    avgSentenceLength: avg,
    minSentenceLength: min,
    maxSentenceLength: max,
    vocabularyDiversity: vocabDiversity,
    sentenceList,
    wordList,
    sentenceLengths: lengths,
    sentenceStdDev: stdDev,
    sentenceLengthCV: cv,
    repeatedPhrases: repeated.slice(0, 20),
  }
}

// ── Signal engine (mirrors signals.ts) ───────────────────────────────────────
function scoreToLevel(s) { return s >= 0.66 ? 'high' : s >= 0.33 ? 'medium' : 'low' }

const TRANSITIONS = ['furthermore','moreover','additionally','consequently','nevertheless',
  'nonetheless','in conclusion','in summary','to summarize','in addition',
  'it is important to note','it is worth noting','it should be noted',
  'as a result','therefore','thus','hence','subsequently','accordingly',
  'in other words','that being said','having said that','with that in mind',
  'to begin with','first and foremost','last but not least',
  'on the other hand','in contrast','in comparison',
  'it is essential','it is crucial','it is vital',
  'plays a crucial role','plays an important role','plays a key role']

const GENERIC = ["in today's world","in the modern world","in today's society",
  'in recent years','in recent times','it is no secret','it goes without saying',
  'at the end of the day','the bottom line is','when it comes to','in terms of',
  'with regards to','in regard to','a wide range of','a wide variety of',
  'a number of','a variety of','various aspects','many aspects','several aspects',
  'in order to','so as to','needless to say','of course','as we all know',
  'it is clear that','it is evident that','it is obvious that',
  'one of the most','one of the best','one of the key',
  'it is important','it is essential','it is necessary',
  'in the context of','in this context','in this regard',
  'serves as a','acts as a','delve into','dive into','shed light on','unpack',
  'game changer','game-changer','paradigm shift','cutting edge','cutting-edge',
  'state of the art','leverage','synergy','holistic approach']

function runSignals(stats) {
  const results = []

  // 1. Sentence uniformity — requires ≥6 sentences, recalibrated CV threshold
  if (stats.sentences >= 6) {
    const cv = stats.sentenceLengthCV
    const score = clamp(1 - cv/0.55, 0, 1)
    results.push({ id:'sentence-uniformity', score: round(score,3), level: scoreToLevel(score), detail: `CV=${round(cv,3)}` })
  } else {
    results.push({ id:'sentence-uniformity', score:0, level:'low', detail:`<6 sentences (${stats.sentences})` })
  }

  // 2. Vocabulary patterns — fixed length-adjusted floor
  if (stats.words >= 20) {
    const ttr = stats.vocabularyDiversity
    const lengthNorm = Math.min(stats.words/300, 1)
    const humanFloor = 0.70 - (lengthNorm * 0.28)
    const deficit = humanFloor - ttr
    const score = clamp(deficit/0.15, 0, 1)
    results.push({ id:'vocabulary-patterns', score: round(score,3), level: scoreToLevel(score), detail: `TTR=${round(ttr,3)} floor=${round(humanFloor,3)} deficit=${round(deficit,3)}` })
  } else {
    results.push({ id:'vocabulary-patterns', score:0, level:'low', detail:'<20 words' })
  }

  // 3. Phrase repetition
  if (stats.words >= 30) {
    const total = stats.repeatedPhrases.length
    const high = stats.repeatedPhrases.filter(p=>p.count>=3).length
    const score = clamp(total/10*0.7 + high/5*0.3, 0, 1)
    results.push({ id:'phrase-repetition', score: round(score,3), level: scoreToLevel(score), detail: `${total} repeated phrases, ${high} with count≥3` })
  } else {
    results.push({ id:'phrase-repetition', score:0, level:'low', detail:'<30 words' })
  }

  // 4. Structural predictability
  if (stats.paragraphs >= 2 && stats.sentenceLengths.length >= 2) {
    const mean = stats.avgSentenceLength
    const near = stats.sentenceLengths.filter(l => l >= mean*0.8 && l <= mean*1.2).length
    const ratio = near / stats.sentenceLengths.length
    const score = clamp((ratio - 0.3)/0.5, 0, 1)
    results.push({ id:'structural-predictability', score: round(score,3), level: scoreToLevel(score), detail: `${round(ratio*100,1)}% sentences near mean` })
  } else {
    results.push({ id:'structural-predictability', score:0, level:'low', detail:'<2 paragraphs' })
  }

  // 5. Transition patterns
  if (stats.words >= 20) {
    const fullText = stats.sentenceList.join(' ').toLowerCase()
    let matches = 0
    for (const t of TRANSITIONS) if (fullText.includes(t)) matches++
    const density = matches / Math.max(stats.paragraphs, 1)
    const score = clamp(density/3, 0, 1)
    results.push({ id:'transition-patterns', score: round(score,3), level: scoreToLevel(score), detail: `${matches} transitions, density=${round(density,2)}` })
  } else {
    results.push({ id:'transition-patterns', score:0, level:'low', detail:'<20 words' })
  }

  // 6. Generic phrasing — recalibrated threshold: 4 per 100w = high
  if (stats.words >= 20) {
    const fullText = stats.sentenceList.join(' ').toLowerCase()
    let matches = 0
    for (const p of GENERIC) if (fullText.includes(p)) matches++
    const density = (matches/stats.words)*100
    const score = clamp(density/4, 0, 1)
    results.push({ id:'generic-phrasing', score: round(score,3), level: scoreToLevel(score), detail: `${matches} generic phrases, density=${round(density,2)}/100w` })
  } else {
    results.push({ id:'generic-phrasing', score:0, level:'low', detail:'<20 words' })
  }

  // 7. Sentence openings
  if (stats.sentenceList.length >= 4) {
    const openings = stats.sentenceList.map(s => tokenizeWords(s)[0] ?? '').filter(w=>w)
    const freq = new Map()
    for (const w of openings) freq.set(w, (freq.get(w)??0)+1)
    const IGNORE = new Set(['the','a','an','i','we','you','he','she','it','they'])
    let maxR = 0, maxW = ''
    for (const [w,c] of freq) if (!IGNORE.has(w) && c > maxR) { maxR=c; maxW=w }
    const uniqueO = new Set(openings).size
    const divR = uniqueO/openings.length
    const repR = maxR/openings.length
    const score = clamp((repR-0.15)/0.35 + (1-divR)*0.3, 0, 1)
    results.push({ id:'sentence-openings', score: round(score,3), level: scoreToLevel(score), detail: `top="${maxW}" (${maxR}×), diversity=${round(divR,2)}` })
  } else {
    results.push({ id:'sentence-openings', score:0, level:'low', detail:'<4 sentences' })
  }

  // 8. Paragraph consistency
  if (stats.paragraphs >= 3) {
    const cv = stats.sentenceLengthCV
    const short = stats.sentenceLengths.filter(l=>l<=5).length
    const shortR = short/Math.max(stats.sentenceLengths.length,1)
    const uniformity = clamp(1-cv/0.5, 0, 1)
    const formality = clamp(1-shortR/0.2, 0, 1)
    const score = clamp(uniformity*0.6 + formality*0.4, 0, 1)
    results.push({ id:'paragraph-consistency', score: round(score,3), level: scoreToLevel(score), detail: `uniformity=${round(uniformity,2)} formality=${round(formality,2)}` })
  } else {
    results.push({ id:'paragraph-consistency', score:0, level:'low', detail:'<3 paragraphs' })
  }

  return results
}

// ── Weighted score ────────────────────────────────────────────────────────────
const WEIGHTS = {
  'sentence-uniformity':1.0,   // reduced — over-fires on short text
  'vocabulary-patterns':1.5,
  'phrase-repetition':1.1,
  'structural-predictability':0.9,
  'transition-patterns':1.6,   // increased — very reliable AI signal
  'generic-phrasing':1.6,      // increased — very reliable AI signal
  'sentence-openings':0.9,
  'paragraph-consistency':0.8,
}

function computeScore(signals) {
  let ws=0, tw=0
  for (const s of signals) {
    if (s.score===0) continue
    const w = WEIGHTS[s.id] ?? 1
    ws += s.score*w; tw += w
  }
  return tw===0 ? 0 : round(clamp(ws/tw*100,0,100),0)
}

// ── Test samples ──────────────────────────────────────────────────────────────
const SAMPLES = {
  'SHORT HUMAN (news lede)': `The fire started just before midnight. Three families lost everything. Investigators say the cause is still unknown. Nobody was hurt, but the damage to the building is extensive. Residents are being housed at a nearby school.`,

  'LONG HUMAN (personal essay excerpt)': `I never expected the summer I spent working at my uncle's garage to teach me anything about writing. It taught me about patience, mostly, and about the specific kind of satisfaction that comes from finishing something tangible — holding a fixed part in your hand and knowing it works now.

My uncle doesn't talk much. He hands you a wrench and watches. If you do it wrong, he takes it back and does it himself, slowly, so you can see. It took me three weeks to understand that this was kindness.

There's a sentence in my notebook from that summer: "Everything broken has a reason it broke." I wrote it after a carburetor disaster that cost us most of a Tuesday. I still don't know if it's true. But I've started more articles with that line than I can count, and I've finished most of them.

The garage smelled of oil and burned coffee. The radio played country stations. My uncle sang along quietly, always a half-beat behind. I learned to work in that rhythm — a little delayed, a little imprecise, but always moving forward.

Writing, I've come to believe, is not so different. You find the rhythm that's yours, not the one you were taught. You accept that some things will take most of a Tuesday. And you keep the notebook.`,

  'AI-GENERATED (GPT-style blog post)': `In today's world, artificial intelligence is playing an increasingly crucial role in transforming how we approach content creation. It is important to note that AI writing tools have become a wide variety of solutions that serve as a paradigm shift in the industry.

Furthermore, it is essential to understand that these tools leverage cutting-edge technology to provide users with a wide range of capabilities. In addition, the holistic approach taken by AI developers ensures that these solutions are state of the art.

Moreover, when it comes to content generation, AI tools have demonstrated remarkable capabilities. It is evident that they can produce content at scale, addressing various aspects of writing that were previously time-consuming. Additionally, the synergy between human oversight and AI assistance creates a game-changer in the field.

In conclusion, it is no secret that AI writing tools are reshaping the landscape of content creation. As a result, organizations of all sizes are beginning to adopt these technologies in order to remain competitive. That being said, it is crucial that we consider the ethical implications of such widespread AI adoption, as this will play a key role in determining the long-term impact of these tools.`,

  'MIXED/EDITED (human draft with AI polish)': `Machine learning is changing how developers think about testing. Not because it replaces testing, but because it shifts what's worth testing.

For years, the standard advice was to write unit tests for every function. In theory this makes sense. In practice, you end up with hundreds of tests that break every time you refactor, and suddenly the tests are the thing you're maintaining, not the product.

In today's development landscape, it is important to note that AI-assisted tools can help identify which tests actually catch bugs. This represents a wide variety of improvements to the traditional testing approach. Furthermore, teams that leverage these tools tend to ship faster.

The honest answer is that most codebases don't need more tests. They need better ones. Write a test when you discover a bug. Write a test for behavior that genuinely matters to users. Let the easy stuff fail loudly in production — that's what logs are for.

The goal isn't coverage. The goal is confidence. Those are different things, and conflating them is the source of most testing philosophy debates.`,
}

// ── Run audit ─────────────────────────────────────────────────────────────────
const LEVEL_COLOR = { high:'\x1b[31m', medium:'\x1b[33m', low:'\x1b[32m' }
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'

console.log(`\n${BOLD}═══════════════════════════════════════════════════${RESET}`)
console.log(`${BOLD}  MianTrace Signal Engine Audit${RESET}`)
console.log(`${BOLD}═══════════════════════════════════════════════════${RESET}\n`)

const summary = []

for (const [label, text] of Object.entries(SAMPLES)) {
  const stats = computeStatistics(text)
  if (!stats) continue

  const signals = runSignals(stats)
  const score = computeScore(signals)

  console.log(`${BOLD}┌─ ${label}${RESET}`)
  console.log(`${DIM}│  ${stats.words}w · ${stats.sentences}s · ${stats.paragraphs}p · TTR=${round(stats.vocabularyDiversity*100,1)}% · CV=${stats.sentenceLengthCV}${RESET}`)
  console.log(`│  ${BOLD}AI-Likelihood: ${score}%${RESET}`)
  console.log('│')

  for (const s of signals) {
    const col = LEVEL_COLOR[s.level] ?? ''
    const bar = '█'.repeat(Math.round(s.score*10)).padEnd(10,'░')
    console.log(`│  ${col}${s.level.toUpperCase().padEnd(6)}${RESET} ${bar} ${String(s.score).padStart(5)}  ${DIM}${s.id}${RESET}`)
    console.log(`│         ${DIM}${s.detail}${RESET}`)
  }

  console.log('│')
  summary.push({ label, score, words: stats.words })
  console.log('')
}

console.log(`${BOLD}═══════════════════════════════════════════════════${RESET}`)
console.log(`${BOLD}  Summary${RESET}`)
console.log(`${BOLD}═══════════════════════════════════════════════════${RESET}`)
for (const { label, score, words } of summary) {
  const expected = label.includes('AI') ? '↑ high' : label.includes('HUMAN') ? '↓ low' : '~ mixed'
  const col = score >= 60 ? '\x1b[31m' : score >= 35 ? '\x1b[33m' : '\x1b[32m'
  console.log(`  ${col}${String(score).padStart(3)}%${RESET}  ${label.padEnd(40)} ${DIM}(${words}w, expect: ${expected})${RESET}`)
}
console.log()
