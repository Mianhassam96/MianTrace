/**
 * MethodologyPage
 * Full explanation of how MianTrace works — signals, scoring, confidence,
 * limitations, and privacy. Roadmap Phase 6.
 */

interface SectionProps {
  id: string
  title: string
  children: React.ReactNode
}

function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mb-14">
      <h2
        id={`${id}-heading`}
        className="text-xl font-bold text-slate-900 dark:text-white mb-5 pb-3 border-b border-slate-100 dark:border-slate-800"
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function SignalCard({
  number,
  name,
  what,
  why,
  limitation,
}: {
  number: string
  name: string
  what: string
  why: string
  limitation: string
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 text-xs font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
          {number}
        </span>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{name}</h3>
      </div>
      <div className="flex flex-col gap-2 pl-10">
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <span className="font-medium text-slate-700 dark:text-slate-300">What it measures: </span>
          {what}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <span className="font-medium text-slate-700 dark:text-slate-300">Why it matters: </span>
          {why}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-600 leading-relaxed italic">
          Limitation: {limitation}
        </p>
      </div>
    </div>
  )
}

const SIGNALS = [
  {
    number: '01',
    name: 'Transition Patterns',
    what: 'Frequency of formulaic connective phrases such as "Furthermore", "In conclusion", "It is important to note", "Moreover", and similar constructions.',
    why: 'AI models consistently use these transitions at much higher rates than human writers. They appear in AI output because the models were trained on text that uses formal academic connectors heavily.',
    limitation: 'Some human writing — particularly academic or formal documents — also uses these transitions. The signal is weighted by density relative to paragraph count.',
  },
  {
    number: '02',
    name: 'Generic Phrasing',
    what: 'Presence of broad, filler phrases that add length without adding specific meaning — such as "in today\'s world", "a wide range of", "plays a crucial role", "cutting-edge", "paradigm shift".',
    why: 'AI models default to vague, widely applicable language. These phrases are statistically overrepresented in AI-generated text compared to human writing on the same topics.',
    limitation: 'Certain writing genres — marketing, business communication — also rely heavily on these phrases. Context matters.',
  },
  {
    number: '03',
    name: 'Sentence Uniformity',
    what: 'How similar sentence lengths are throughout the text. Measured using the coefficient of variation (CV = standard deviation / mean) across all sentence word counts.',
    why: 'AI-generated text tends to produce sentences that cluster tightly around a similar length, creating a mechanical rhythm. Human writing typically varies more naturally.',
    limitation: 'Requires at least 6 sentences. Short texts naturally have more uniform lengths. News and instructional writing may also score high.',
  },
  {
    number: '04',
    name: 'Structural Predictability',
    what: 'What proportion of sentences fall within ±20% of the average sentence length — a measure of how mechanically consistent the structural rhythm is.',
    why: 'When sentence lengths cluster tightly around a mean, the text has a predictable, template-like structure. AI writing tends to maintain this uniformity across paragraphs.',
    limitation: 'Requires at least 2 paragraphs. Formal documents with deliberate structure may score higher than casual AI content.',
  },
  {
    number: '05',
    name: 'Sentence Opening Patterns',
    what: 'How often sentences begin with the same word or type of word — excluding very common words like "the", "a", "I".',
    why: 'AI writing frequently starts sentences with the same subject or connector word, producing noticeable repetition that human writers typically avoid.',
    limitation: 'Requires at least 4 sentences. Some consistent sentence openings (e.g. a list of instructions) are intentional and appropriate.',
  },
  {
    number: '06',
    name: 'Vocabulary Variation',
    what: 'Vocabulary diversity measured using the type-token ratio (unique words / total words), calibrated differently for short text (< 150 words) and longer text.',
    why: 'AI writing gravitates toward common, neutral vocabulary. Very low vocabulary diversity — especially in shorter texts — can indicate formulaic output.',
    limitation: 'TTR naturally decreases as text length grows. This signal is most reliable on shorter texts. Long texts have naturally lower TTR regardless of authorship.',
  },
  {
    number: '07',
    name: 'Phrase Repetition',
    what: 'Frequency of repeated 3- and 4-word phrases throughout the text.',
    why: 'AI writing sometimes reuses multi-word patterns across sentences and paragraphs. High repetition of specific phrases can indicate templated construction.',
    limitation: 'Human writing — especially persuasive or explanatory content — also repeats key phrases deliberately. This signal has a low weight in the scoring model because it can anti-discriminate.',
  },
  {
    number: '08',
    name: 'Paragraph Consistency',
    what: 'Whether paragraphs follow a very uniform structural pattern, using sentence-length CV as a proxy. Requires at least 4 paragraphs.',
    why: 'AI models tend to produce paragraphs of similar structure: topic sentence, evidence, conclusion. Human writing varies paragraph form more naturally.',
    limitation: 'This is a weak signal with reduced weight. Academic and structured professional writing also follows consistent paragraph patterns.',
  },
]

export function MethodologyPage() {
  return (
    <article className="max-w-3xl mx-auto px-5 py-10 sm:py-14">
      {/* Page header */}
      <header className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
          Methodology
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
          How MianTrace works
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
          MianTrace analyzes writing patterns that are statistically associated with AI-generated text.
          This page explains the signals, the scoring model, and the honest limitations of this approach.
        </p>
      </header>

      {/* Overview */}
      <Section id="overview" title="Overview">
        <div className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            MianTrace does not use a machine learning model or a trained classifier. It uses a set of
            deterministic, rule-based writing pattern detectors — called <strong className="text-slate-700 dark:text-slate-300">signals</strong> — 
            that measure properties of text known to differ between typical AI-generated and human-written content.
          </p>
          <p>
            Each signal produces a score from 0 to 1. These scores are combined into a single
            weighted AI-likelihood estimate expressed as a percentage. A confidence level is calculated
            separately based on text length, the number of usable signals, and how much the signals agree.
          </p>
          <p>
            The result is always an <strong className="text-slate-700 dark:text-slate-300">estimate</strong>, 
            not a verdict. MianTrace cannot determine authorship.
          </p>

          {/* Flow diagram */}
          <div className="mt-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-xs font-medium flex-wrap">
              {['Input text or URL', '8 signal detectors', 'Weighted scoring', 'AI-likelihood + confidence', 'Explained results'].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-2 sm:gap-3">
                  <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300">
                    {step}
                  </span>
                  {i < arr.length - 1 && (
                    <span className="text-slate-300 dark:text-slate-600 text-base">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* The 8 signals */}
      <Section id="signals" title="The 8 writing signals">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Each signal measures a specific writing property. Some are strong discriminators between AI 
          and human writing; others are weaker and carry less weight in the final score. All are 
          disclosed here with their known limitations.
        </p>
        <div className="flex flex-col gap-4">
          {SIGNALS.map(s => (
            <SignalCard key={s.number} {...s}/>
          ))}
        </div>
      </Section>

      {/* Scoring model */}
      <Section id="scoring" title="Scoring model">
        <div className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            Each signal that fires (score &gt; 0) contributes to the final score via a weighted average.
            Signals with stronger discriminating power between AI and human writing carry more weight.
          </p>

          {/* Weight table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Signal</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Weight</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden sm:table-cell">Reliability (Δ AI vs Human)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {[
                  ['Transition Patterns',       '1.7', '+1.00 — perfect discriminator'],
                  ['Generic Phrasing',          '1.7', '+1.00 — perfect discriminator'],
                  ['Sentence Uniformity',       '1.1', '+0.69 — excellent'],
                  ['Sentence Openings',         '1.0', '+0.43 — good'],
                  ['Structural Predictability', '1.0', '+0.28 — good'],
                  ['Vocabulary Variation',      '0.8', '+0.09 — weak (reliable only for short text)'],
                  ['Paragraph Consistency',     '0.6', '+0.14 — weak'],
                  ['Phrase Repetition',         '0.4', '−0.06 — anti-discriminates (reduced weight)'],
                ].map(([name, weight, delta]) => (
                  <tr key={name}>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{name}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 tabular-nums">{weight}</td>
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-600 hidden sm:table-cell">{delta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Weights were calibrated using an 8-sample audit dataset covering short AI text, long AI text,
            short human text, long human writing, formal academic writing, casual writing, human-edited AI,
            and mixed content. The delta values show the average score difference between AI and human samples.
          </p>
        </div>
      </Section>

      {/* Confidence */}
      <Section id="confidence" title="Confidence levels">
        <div className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            Confidence is calculated independently from the AI-likelihood score. It reflects how
            reliable the estimate is likely to be — not how confident MianTrace is that the content
            is AI-generated.
          </p>
          <div className="flex flex-col gap-3">
            {[
              {
                level: 'High confidence',
                color: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900',
                desc: 'Text is long enough for all signals to fire, signals agree with each other, and the analysis is stable. Results are more likely to be representative.',
              },
              {
                level: 'Moderate confidence',
                color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
                desc: 'Text length or signal agreement is sufficient for a reasonable estimate, but some uncertainty remains. Treat results as indicative.',
              },
              {
                level: 'Low confidence',
                color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
                desc: 'Text is short, few signals fired, or signals disagree significantly. The estimate is a rough approximation only.',
              },
            ].map(({ level, color, desc }) => (
              <div key={level} className={`rounded-lg border px-4 py-3 ${color}`}>
                <p className="font-semibold text-sm mb-1">{level}</p>
                <p className="text-xs leading-relaxed opacity-90">{desc}</p>
              </div>
            ))}
          </div>
          <p>
            Confidence is calculated from three factors: text length (longer = more reliable),
            the number of signals that were able to fire, and signal agreement (how similar the
            signal scores are to each other).
          </p>
        </div>
      </Section>

      {/* Limitations */}
      <Section id="limitations" title="Limitations">
        <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-5">
            <p className="font-semibold text-amber-800 dark:text-amber-300 mb-2 text-sm">
              MianTrace cannot prove authorship
            </p>
            <p className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
              MianTrace provides a probabilistic analysis based on writing patterns. It cannot determine 
              whether content was written by a human or generated by AI. Results should be used as one 
              signal among many — not as a definitive verdict.
            </p>
          </div>
          {[
            'Some human writing styles score high. Formal academic writing, highly structured technical documentation, and marketing copy often exhibit the same patterns MianTrace associates with AI.',
            'Some AI content scores low. AI models that have been fine-tuned for natural conversational style, or AI content that has been edited by a human, may score below the threshold.',
            'Short texts are less reliable. Fewer than 100 words produces low-confidence results. Fewer than 50 words may produce misleading results.',
            'The signals are language-specific. MianTrace was designed and calibrated on English text. Results for other languages should be treated with extra caution.',
            'The signals are static. As AI writing models evolve and become less formulaic, the discriminating power of some signals will decrease. MianTrace will need periodic recalibration.',
            'Website extraction is imperfect. For website analysis, the quality of the result depends on the quality of content extraction. Sites that require JavaScript, logins, or block crawlers will produce poor or no results.',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0 mt-2"/>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Privacy */}
      <Section id="privacy" title="Privacy">
        <div className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                mode: 'Text analysis',
                icon: '✍️',
                behavior: 'Text you paste is processed entirely in your browser. It is never sent to any server. MianTrace does not see, log, or store the text you analyze.',
                highlight: true,
              },
              {
                mode: 'Website analysis',
                icon: '🌐',
                behavior: 'The URL you submit is sent to a Cloudflare Worker, which fetches the webpage on your behalf and returns the extracted text. The Worker does not log or store the URL or page content. However, the request is processed outside your browser.',
                highlight: false,
              },
            ].map(({ mode, icon, behavior, highlight }) => (
              <div
                key={mode}
                className={`rounded-xl border p-4 ${
                  highlight
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/40'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
              >
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-sm">
                  {icon} {mode}
                </p>
                <p className={`text-xs leading-relaxed ${highlight ? 'text-green-700 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {behavior}
                </p>
              </div>
            ))}
          </div>
          <p>
            MianTrace does not use cookies, does not require an account, and does not include any
            third-party tracking scripts. Theme preference is stored in your browser's localStorage only.
          </p>
        </div>
      </Section>

      {/* Back to analyzer */}
      <div className="mt-4 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
        <a
          href="#analyzer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 4.75v3.5l2.5 1.5-.75 1.25-3-1.75V5.75h1.25z"/>
          </svg>
          Try the analyzer
        </a>
      </div>
    </article>
  )
}
