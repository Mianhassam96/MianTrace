/**
 * MianTrace Signal Engine Calibration Audit v2
 *
 * 8 deliberately varied samples covering:
 *   - Short AI text          (should score HIGH)
 *   - Long AI text           (should score HIGH)
 *   - Short human text       (should score LOW)
 *   - Long human article     (should score LOW)
 *   - Formal human writing   (should score LOW-MEDIUM — formal ≠ AI)
 *   - Casual human writing   (should score LOW)
 *   - Human-edited AI text   (should score LOW-MEDIUM)
 *   - Mixed (AI paragraphs interspersed with human) (should score MEDIUM)
 *
 * For each sample we report:
 *   - Every signal: raw score, level, detail
 *   - Final weighted score
 *   - Confidence factors
 *   - Verdict vs expectation
 *
 * Run: node scripts/audit.mjs
 */

// ─── Inline engine (mirrors signals.ts + engine.ts) ──────────────────────────

function round(v, d = 2) { return Math.round(v * 10**d) / 10**d }
function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi) }

const ABBREV = new Set(['mr','mrs','ms','dr','prof','sr','jr','vs','etc','inc',
  'ltd','corp','dept','est','fig','no','vol','jan','feb','mar','apr','jun',
  'jul','aug','sep','oct','nov','dec','st','ave','blvd','i.e','e.g'])

function tokenizeSentences(text) {
  if (!text.trim()) return []
  let p = text
    .replace(/\b([A-Za-z]{1,5})\./g, (m,w) => ABBREV.has(w.toLowerCase()) ? w+'\x00' : m)
    .replace(/(\d)\.(\d)/g, '$1\x01$2')
    .replace(/\.\.\./g, '\x02')
  const raw = p.split(/(?<=[.!?]["'\u201D\u2019]?\s+)(?=[A-Z\u00C0-\u017E])/)
  const out = []
  for (const chunk of raw)
    for (const sub of chunk.split(/\n+/)) {
      const r = sub.replace(/\x00/g,'.').replace(/\x01/g,'.').replace(/\x02/g,'...').trim()
      if (r.length > 0) out.push(r)
    }
  return out.filter(s => s.length > 0)
}

function tokenizeWords(text) {
  return text.split(/\s+/)
    .map(t => t.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g,'').toLowerCase())
    .filter(t => t.length > 0 && /[a-zA-Z0-9]/.test(t))
}

function computeStats(raw) {
  const text = raw.replace(/<[^>]*>/g,' ').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim()
  const sentences = tokenizeSentences(text)
  const words = tokenizeWords(text)
  const paragraphs = text.split(/\n\s*\n/).map(p=>p.trim()).filter(p=>p.length>0)

  const lengths = sentences.map(s => tokenizeWords(s).length)
  const avg = lengths.length ? round(lengths.reduce((a,b)=>a+b,0)/lengths.length,1) : 0
  const variance = lengths.length ? lengths.reduce((s,l)=>s+Math.pow(l-avg,2),0)/lengths.length : 0
  const stdDev = round(Math.sqrt(variance),2)
  const cv = avg > 0 ? round(stdDev/avg,4) : 0

  const unique = new Set(words).size
  const ttr = words.length > 0 ? round(unique/words.length,4) : 0

  // n-gram repetition
  const repeated = []
  for (const n of [4,3]) {
    const counts = new Map()
    for (let i=0; i<=words.length-n; i++) {
      const ng = words.slice(i,i+n).join(' ')
      counts.set(ng,(counts.get(ng)??0)+1)
    }
    for (const [ph,ct] of counts) if (ct>=2) repeated.push({phrase:ph,count:ct})
  }
  repeated.sort((a,b)=>b.count-a.count)

  return {
    words: words.length, chars: raw.trim().length,
    sentences: sentences.length, paragraphs: paragraphs.length,
    avgLen: avg, minLen: lengths.length ? Math.min(...lengths) : 0,
    maxLen: lengths.length ? Math.max(...lengths) : 0,
    stdDev, cv, ttr,
    sentenceList: sentences, wordList: words,
    sentenceLengths: lengths, repeatedPhrases: repeated.slice(0,20),
  }
}

// ─── Signal implementations ───────────────────────────────────────────────────

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

function runSignals(s) {
  const fullText = s.sentenceList.join(' ').toLowerCase()
  const out = {}

  // 1. Sentence uniformity — min 6 sentences, CV threshold 0.55
  if (s.sentences >= 6) {
    const score = clamp(1 - s.cv/0.55, 0, 1)
    out['uniformity'] = { score: round(score,3), detail: `CV=${s.cv} (need <0.55 to fire)` }
  } else {
    out['uniformity'] = { score: 0, detail: `only ${s.sentences} sentences (need ≥6)` }
  }

  // 2. Vocabulary — split by text length (v0.2 calibration)
  if (s.words >= 30) {
    let score = 0, detail = ''
    if (s.words < 150) {
      const deficit = 0.75 - s.ttr
      score = clamp(deficit/0.15, 0, 1)
      detail = `TTR=${round(s.ttr*100,1)}% (short floor=75%, deficit=${round(deficit*100,1)}pp)`
    } else {
      const deficit = 0.45 - s.ttr
      score = clamp(deficit/0.10, 0, 1)
      detail = `TTR=${round(s.ttr*100,1)}% (long floor=45%, deficit=${round(deficit*100,1)}pp)`
    }
    out['vocabulary'] = { score: round(score,3), detail }
  } else {
    out['vocabulary'] = { score: 0, detail: `<30 words` }
  }

  // 3. Phrase repetition
  if (s.words >= 30) {
    const total = s.repeatedPhrases.length
    const high = s.repeatedPhrases.filter(p=>p.count>=3).length
    const score = clamp(total/10*0.7 + high/5*0.3, 0, 1)
    out['repetition'] = { score: round(score,3), detail: `${total} repeated phrases, ${high} appear ≥3×` }
  } else {
    out['repetition'] = { score: 0, detail: `<30 words` }
  }

  // 4. Structural predictability
  if (s.paragraphs >= 2 && s.sentenceLengths.length >= 2) {
    const near = s.sentenceLengths.filter(l=>l>=s.avgLen*0.8&&l<=s.avgLen*1.2).length
    const ratio = near/s.sentenceLengths.length
    const score = clamp((ratio-0.3)/0.5, 0, 1)
    out['structure'] = { score: round(score,3), detail: `${round(ratio*100,1)}% sentences within ±20% of mean` }
  } else {
    out['structure'] = { score: 0, detail: `<2 paragraphs` }
  }

  // 5. Transition patterns
  if (s.words >= 20) {
    let matches = 0; const found = []
    for (const t of TRANSITIONS) if (fullText.includes(t)) { matches++; found.push(t) }
    const density = matches / Math.max(s.paragraphs,1)
    const score = clamp(density/3, 0, 1)
    out['transitions'] = { score: round(score,3), detail: `${matches} transitions across ${s.paragraphs} paragraphs (density=${round(density,2)})`, matched: found.slice(0,3) }
  } else {
    out['transitions'] = { score: 0, detail: `<20 words` }
  }

  // 6. Generic phrasing — threshold 4/100w
  if (s.words >= 20) {
    let matches = 0; const found = []
    for (const p of GENERIC) if (fullText.includes(p)) { matches++; found.push(p) }
    const density = (matches/s.words)*100
    const score = clamp(density/4, 0, 1)
    out['generic'] = { score: round(score,3), detail: `${matches} phrases, ${round(density,2)}/100w`, matched: found.slice(0,3) }
  } else {
    out['generic'] = { score: 0, detail: `<20 words` }
  }

  // 7. Sentence openings
  if (s.sentences >= 4) {
    const openings = s.sentenceList.map(sent=>tokenizeWords(sent)[0]??'').filter(w=>w)
    const freq = new Map()
    for (const w of openings) freq.set(w,(freq.get(w)??0)+1)
    const IGNORE = new Set(['the','a','an','i','we','you','he','she','it','they'])
    let maxR=0, maxW=''
    for (const [w,c] of freq) if (!IGNORE.has(w)&&c>maxR) { maxR=c; maxW=w }
    const divR = new Set(openings).size/openings.length
    const repR = maxR/openings.length
    const score = clamp((repR-0.15)/0.35+(1-divR)*0.3, 0, 1)
    out['openings'] = { score: round(score,3), detail: `top="${maxW}"(${maxR}×), diversity=${round(divR,2)}` }
  } else {
    out['openings'] = { score: 0, detail: `<4 sentences` }
  }

  // 8. Paragraph consistency — requires ≥4 paragraphs, pure CV
  if (s.paragraphs >= 4) {
    const score = clamp(1 - s.cv/0.45, 0, 1)
    out['paraConsist'] = { score: round(score,3), detail: `CV=${s.cv} (needs ≥4 paragraphs)` }
  } else {
    out['paraConsist'] = { score: 0, detail: `only ${s.paragraphs} paragraphs (need ≥4)` }
  }

  return out
}

const WEIGHTS = {
  uniformity:1.0, vocabulary:1.5, repetition:1.1,
  structure:0.9, transitions:1.6, generic:1.6,
  openings:0.9, paraConsist:0.8
}

function computeScore(signals) {
  let ws=0, tw=0
  for (const [id,s] of Object.entries(signals)) {
    if (s.score===0) continue
    const w = WEIGHTS[id]??1
    ws+=s.score*w; tw+=w
  }
  return tw===0 ? 0 : round(clamp(ws/tw*100,0,100),0)
}

function computeConfidence(signals, words) {
  const lengthFactor = clamp((words-50)/250,0,1)
  const usable = Object.values(signals).filter(s=>s.score>0)
  const signalFactor = clamp(usable.length/6,0,1)
  const scores = usable.map(s=>s.score)
  if (!scores.length) return 'low'
  const mean = scores.reduce((a,b)=>a+b,0)/scores.length
  const variance = scores.reduce((s,v)=>s+Math.pow(v-mean,2),0)/scores.length
  const stdDev = Math.sqrt(variance)
  const agreementFactor = clamp(1-stdDev/0.35,0,1)
  const combined = lengthFactor*0.4+signalFactor*0.35+agreementFactor*0.25
  return combined>=0.65?'high':combined>=0.35?'moderate':'low'
}

// ─── 8 test samples ───────────────────────────────────────────────────────────

const SAMPLES = [

  { label:'SHORT AI', expect:'HIGH', text:`
In today's world, artificial intelligence plays a crucial role in transforming business operations. It is important to note that organizations leveraging AI technologies gain a wide range of competitive advantages. Furthermore, AI serves as a game changer in terms of productivity and efficiency.
It is essential to understand that these cutting-edge solutions provide holistic approaches to problem-solving. Moreover, when it comes to implementation, it is crucial that teams work collaboratively. In conclusion, AI adoption is no longer optional — it is a necessity.` },

  { label:'LONG AI', expect:'HIGH', text:`
In today's rapidly evolving world, artificial intelligence has emerged as one of the most transformative technologies of our time. It is important to note that organizations across various sectors are increasingly leveraging AI to gain a wide range of competitive advantages. Furthermore, the holistic approach taken by AI developers ensures that these cutting-edge solutions address various aspects of business operations.

Moreover, when it comes to content generation, AI tools have demonstrated remarkable capabilities. Additionally, it is essential to understand that these tools can produce content at scale, addressing multiple aspects of writing that were previously time-consuming. In this context, the synergy between human oversight and AI assistance creates a paradigm shift in the field.

In conclusion, it is no secret that AI writing tools are reshaping the landscape of content creation. As a result, organizations of all sizes are beginning to adopt these technologies in order to remain competitive. That being said, it is crucial that we consider the ethical implications of such widespread AI adoption. It is evident that this will play a key role in determining the long-term impact of these tools on the way we communicate.

Furthermore, it is worth noting that the state of the art in natural language processing continues to advance rapidly. Consequently, the capabilities of AI writing tools will only improve over time. In other words, businesses that fail to adapt will find themselves at a significant disadvantage. To summarize, embracing AI is not merely an option — it is a strategic imperative that serves as a foundation for future growth.` },

  { label:'SHORT HUMAN', expect:'LOW', text:`
The fire started just before midnight. Three families lost everything. Investigators say the cause is still unknown — a faulty wire, maybe, or something worse. Nobody was hurt. The building is a total loss. Residents are being housed at a nearby school.` },

  { label:'LONG HUMAN ARTICLE', expect:'LOW', text:`
I never expected the summer I spent at my uncle's garage to teach me anything about writing. It taught me about patience, and about the kind of satisfaction that comes from fixing something you can hold in your hand.

My uncle doesn't talk much. He hands you a wrench and watches. If you do it wrong, he takes it back and does it himself, slowly. It took me three weeks to understand that was kindness.

There's a sentence in my notebook from that summer: "Everything broken has a reason it broke." I wrote it after a carburetor disaster that cost us most of a Tuesday. I don't know if it's true. But I've started more articles with that line than I can count.

The garage smelled of oil and burned coffee. The radio played country stations. My uncle sang along, always a half-beat behind. I learned to work in that rhythm — a little delayed, a little imprecise, but always moving forward.

Writing is not so different. You find the rhythm that's yours, not the one you were taught. You accept that some things will take most of a Tuesday. And you keep the notebook.

He died the following spring. I've been back to the garage twice since — once to help sort his tools, once just to stand in the smell of the place. Both times I took notes. I don't know what I'll do with them. I don't always know what the notes are for until much later.` },

  { label:'FORMAL HUMAN', expect:'LOW-MEDIUM', text:`
The relationship between syntactic complexity and reading comprehension has been extensively studied in the cognitive science literature. Results from experimental studies consistently demonstrate that readers process sentences with embedded relative clauses more slowly than those with main-clause structures of equivalent length. This effect is particularly pronounced in populations with limited working memory capacity.

The present study seeks to extend these findings to naturalistic reading contexts. Participants were recruited from undergraduate psychology courses and assigned to one of three conditions based on text complexity. Reading times were recorded at the sentence level using a self-paced reading paradigm.

The results indicate a significant main effect of syntactic complexity on reading time, consistent with predictions derived from the Dependency Locality Theory. However, the interaction between complexity and prior knowledge was not significant, suggesting that domain familiarity may not moderate the processing demands associated with complex syntax in the way that earlier accounts proposed.

These findings have implications for the design of educational materials, particularly in fields where complex syntactic structures are unavoidable. Simplifying sentence structure without sacrificing precision remains a significant challenge for technical communicators.` },

  { label:'CASUAL HUMAN', expect:'LOW', text:`
ok so i tried the new pasta place on Henderson and honestly? underwhelmed. like the menu looked great online but when you actually get there it's just kind of small and weirdly loud and the portions are not what i expected for $18.

the carbonara was fine. not amazing. my friend got the gnocchi and she said it tasted like it came from a bag which honestly tracks given how fast it came out.

service was nice though. our server was genuinely sweet, refilled water without being asked, didn't hover. i'd go back just for her honestly.

probably a 3/5. worth trying once if you live nearby but i wouldn't drive across town for it. the focaccia bread they give you for free at the start is genuinely good though so maybe just get that and leave` },

  { label:'HUMAN-EDITED AI', expect:'LOW-MEDIUM', text:`
Machine learning is changing how developers think about testing. The shift isn't dramatic — it doesn't replace testing — but it changes what's worth testing.

For years the standard advice was to write unit tests for every function. In theory this makes sense. In practice, you end up with hundreds of tests that break every time you refactor, and suddenly the tests are the thing you're maintaining.

In today's development landscape, AI-assisted tools can help identify which tests actually catch bugs. Teams that use these tools tend to ship faster, though the evidence is still mixed. It is important to note that the tooling is changing rapidly.

The honest answer is that most codebases don't need more tests — they need better ones. Write a test when you discover a bug. Write a test for behavior that genuinely matters to users. Let the easy stuff fail loudly in production.

The goal isn't coverage. The goal is confidence.` },

  { label:'MIXED (AI paragraphs + human)', expect:'MEDIUM', text:`
Every writer has a process, even if they can't describe it. Mine involves a lot of staring at the wrong sentence for too long, then deleting it and writing something worse, then coming back the next day and seeing that the first one was actually fine.

In today's content landscape, it is important to note that AI writing tools provide a wide range of capabilities that can significantly enhance productivity. Furthermore, these cutting-edge solutions serve as a paradigm shift in how writers approach the creative process. It is essential to leverage these tools in order to remain competitive.

But the actual act of writing still happens sentence by sentence, same as it always did. Nobody has automated the moment where you realize the argument doesn't hold together. Nobody has automated the rewrite that takes four hours and moves one paragraph from the end to the beginning.

Moreover, when it comes to content generation at scale, AI tools have demonstrated remarkable capabilities in terms of producing structured, coherent text across various aspects of a given topic. As a result, many organizations are adopting these holistic approaches to content creation.

Whether that's a good thing is a different question — one I genuinely don't know how to answer. I just know that my best work comes from the sentences I almost deleted.` },

]

// ─── Run audit ────────────────────────────────────────────────────────────────

const R = '\x1b[0m', BOLD='\x1b[1m', DIM='\x1b[2m'
const RED='\x1b[31m', YLW='\x1b[33m', GRN='\x1b[32m', CYN='\x1b[36m'

function levelColor(score) {
  return score >= 0.66 ? RED : score >= 0.33 ? YLW : GRN
}
function bar(score) { return '█'.repeat(Math.round(score*10)).padEnd(10,'░') }

console.log(`\n${BOLD}═══════════════════════════════════════════════════════${R}`)
console.log(`${BOLD}  MianTrace Calibration Audit v2 — 8 samples${R}`)
console.log(`${BOLD}═══════════════════════════════════════════════════════${R}\n`)

const summary = []

for (const sample of SAMPLES) {
  const text = sample.text.trim()
  const s = computeStats(text)
  const signals = runSignals(s)
  const score = computeScore(signals)
  const confidence = computeConfidence(signals, s.words)
  const firingCount = Object.values(signals).filter(sig=>sig.score>0).length

  console.log(`${BOLD}┌─ ${sample.label}${R}  ${DIM}(expect: ${sample.expect})${R}`)
  console.log(`${DIM}│  ${s.words}w · ${s.sentences}s · ${s.paragraphs}p · TTR=${round(s.ttr*100,1)}% · CV=${s.cv}${R}`)
  console.log(`│  Score: ${BOLD}${score}%${R}  Confidence: ${CYN}${confidence}${R}  Signals firing: ${firingCount}/8`)
  console.log('│')

  const SIG_NAMES = {
    uniformity:'Sentence Uniformity', vocabulary:'Vocabulary',
    repetition:'Phrase Repetition', structure:'Structural Predictability',
    transitions:'Transition Patterns', generic:'Generic Phrasing',
    openings:'Sentence Openings', paraConsist:'Paragraph Consistency'
  }

  for (const [id, sig] of Object.entries(signals)) {
    const col = levelColor(sig.score)
    const lvl = sig.score>=0.66?'HIGH':sig.score>=0.33?'MED':'low'
    console.log(`│  ${col}${lvl.padEnd(4)}${R} ${bar(sig.score)} ${String(sig.score).padStart(5)}  ${DIM}${SIG_NAMES[id]}${R}`)
    console.log(`│         ${DIM}${sig.detail}${sig.matched && sig.matched.length > 0 ? ' → ' + sig.matched.map(m => '"'+m+'"').join(', ') : ''}${R}`)
  }

  const verdict = score >= 60 ? '🔴 HIGH'
    : score >= 35 ? '🟡 MEDIUM'
    : score >= 20 ? '🟢 LOW-MEDIUM'
    : '🟢 LOW'

  const pass = (sample.expect === 'HIGH' && score >= 55) ||
               (sample.expect === 'LOW' && score <= 25) ||
               (sample.expect === 'LOW-MEDIUM' && score >= 15 && score <= 45) ||
               (sample.expect === 'MEDIUM' && score >= 25 && score <= 60)

  console.log(`│`)
  console.log(`│  Verdict: ${verdict}  ${pass ? GRN+'✓ PASS'+R : RED+'✗ MISS'+R}`)
  console.log('')

  summary.push({ ...sample, score, confidence, firingCount, pass })
}

// ─── Summary table ────────────────────────────────────────────────────────────
console.log(`${BOLD}═══════════════════════════════════════════════════════${R}`)
console.log(`${BOLD}  Summary${R}`)
console.log(`${BOLD}═══════════════════════════════════════════════════════${R}`)
console.log(`${'Label'.padEnd(22)} ${'Score'.padEnd(7)} ${'Expect'.padEnd(12)} ${'Conf'.padEnd(10)} ${'Signals'.padEnd(9)} ${'Verdict'}`)
console.log('─'.repeat(70))

let passes = 0
for (const r of summary) {
  const col = r.score>=60?RED:r.score>=35?YLW:GRN
  const status = r.pass ? GRN+'✓'+R : RED+'✗'+R
  if (r.pass) passes++
  console.log(`${r.label.padEnd(22)} ${col}${String(r.score+'%').padEnd(7)}${R} ${r.expect.padEnd(12)} ${r.confidence.padEnd(10)} ${String(r.firingCount+'/8').padEnd(9)} ${status}`)
}

console.log('─'.repeat(70))
console.log(`\nResult: ${passes}/${summary.length} samples within expected range\n`)

// ─── Signal coverage analysis ─────────────────────────────────────────────────
console.log(`${BOLD}Signal Coverage Analysis${R}`)
console.log('─'.repeat(70))
console.log(`${'Signal'.padEnd(26)} ${'AI avg'.padEnd(10)} ${'Human avg'.padEnd(12)} ${'Discriminates?'}`)
console.log('─'.repeat(70))

const aiSamples = summary.filter(s=>s.expect==='HIGH')
const humanSamples = summary.filter(s=>s.expect==='LOW')

const SIG_KEYS = ['uniformity','vocabulary','repetition','structure','transitions','generic','openings','paraConsist']
const SIG_LABELS = ['Sentence Uniformity','Vocabulary','Phrase Repetition','Structural Pred.','Transition Patterns','Generic Phrasing','Sentence Openings','Para Consistency']

// Re-run to get per-signal scores
const sampleSignals = summary.map(r => {
  const s = computeStats(r.text.trim())
  return { label: r.label, expect: r.expect, signals: runSignals(s) }
})

for (let i=0; i<SIG_KEYS.length; i++) {
  const key = SIG_KEYS[i]
  const aiScores = sampleSignals.filter(s=>s.expect==='HIGH').map(s=>s.signals[key].score)
  const humanScores = sampleSignals.filter(s=>s.expect==='LOW').map(s=>s.signals[key].score)
  const aiAvg = round(aiScores.reduce((a,b)=>a+b,0)/Math.max(aiScores.length,1),3)
  const humanAvg = round(humanScores.reduce((a,b)=>a+b,0)/Math.max(humanScores.length,1),3)
  const diff = round(aiAvg - humanAvg, 3)
  const discriminates = diff > 0.15 ? GRN+'YES  (Δ=+'+diff+')'+R : diff > 0.05 ? YLW+'WEAK (Δ=+'+diff+')'+R : RED+'NO   (Δ='+diff+')'+R
  console.log(`${SIG_LABELS[i].padEnd(26)} ${String(aiAvg).padEnd(10)} ${String(humanAvg).padEnd(12)} ${discriminates}`)
}

console.log()
