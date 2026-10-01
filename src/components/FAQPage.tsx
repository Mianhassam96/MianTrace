/**
 * FAQPage
 * Honest answers to common questions about MianTrace.
 */

import { useState } from 'react'

interface FAQItem {
  q: string
  a: React.ReactNode
}

const FAQS: FAQItem[] = [
  {
    q: 'Can MianTrace prove that content was written by AI?',
    a: (
      <>
        <p>No. MianTrace cannot prove AI authorship — and it does not claim to.</p>
        <p>
          MianTrace measures writing patterns that are statistically associated with AI-generated text.
          It produces a probabilistic estimate, not a verdict. A high score means the writing
          shares characteristics with AI-generated text. It does not mean the content was definitely
          produced by AI.
        </p>
      </>
    ),
  },
  {
    q: 'What does the percentage score mean?',
    a: (
      <>
        <p>
          The score represents how strongly the writing patterns in the analyzed content match
          patterns that MianTrace associates with AI-generated text.
        </p>
        <p>
          A score of 72% means: based on the 8 writing signals, this content's pattern profile
          is closer to AI-generated writing than to human writing. It does not mean
          there is a 72% probability the content was AI-generated — that would require a very
          different kind of model.
        </p>
        <p>Always read the confidence level alongside the score.</p>
      </>
    ),
  },
  {
    q: 'How much text should I provide for a reliable result?',
    a: (
      <>
        <p>More text produces more reliable results. As a rough guide:</p>
        <ul>
          <li><strong>Under 50 words</strong> — very low confidence, treat result as unreliable</li>
          <li><strong>50–150 words</strong> — low confidence, indicative only</li>
          <li><strong>150–300 words</strong> — moderate confidence</li>
          <li><strong>300+ words</strong> — higher confidence, more signals can fire</li>
        </ul>
        <p>
          Some signals require a minimum text length to activate — for example, sentence uniformity
          needs at least 6 sentences, and paragraph consistency needs at least 4 paragraphs.
        </p>
      </>
    ),
  },
  {
    q: 'Can I analyze a website?',
    a: (
      <>
        <p>
          Yes. Switch to the Website tab and enter a valid HTTPS URL. MianTrace will fetch
          the page via a Cloudflare Worker and extract the main readable content — ignoring
          navigation, footers, scripts, and other non-content elements.
        </p>
        <p>
          Website analysis works best on article and blog pages with clear main content.
          It may not work well on:
        </p>
        <ul>
          <li>Pages that require JavaScript to render content</li>
          <li>Pages behind a login or paywall</li>
          <li>Sites that block automated requests</li>
          <li>Very large pages (over 2MB)</li>
        </ul>
      </>
    ),
  },
  {
    q: 'Does MianTrace store my text?',
    a: (
      <>
        <p>
          <strong>Text analysis: no.</strong> Text you paste is processed entirely in your browser.
          It is never sent to any server. MianTrace does not see or store what you analyze.
        </p>
        <p>
          <strong>Website analysis: the URL is sent to a Cloudflare Worker</strong> to fetch the
          webpage. The Worker does not log or store URLs or page content. However, the URL leaves
          your browser, unlike text analysis.
        </p>
        <p>
          MianTrace does not use cookies or third-party tracking. Theme preference is stored locally
          in your browser only.
        </p>
      </>
    ),
  },
  {
    q: 'Why did my writing score high even though I wrote it myself?',
    a: (
      <>
        <p>
          MianTrace measures writing patterns, not authorship. Some human writing styles
          share characteristics with AI-generated text — particularly:
        </p>
        <ul>
          <li>Formal academic or business writing with consistent paragraph structure</li>
          <li>Writing that uses standard transition phrases</li>
          <li>Short texts with few varied sentence structures</li>
          <li>Content edited to follow specific style guides</li>
        </ul>
        <p>
          A high score does not mean you wrote with AI. It means your writing shares
          some surface patterns with text that AI models commonly produce.
        </p>
      </>
    ),
  },
  {
    q: 'Why did AI-generated content score low?',
    a: (
      <>
        <p>
          MianTrace's signals are most effective against a particular style of AI writing —
          verbose, formulaic, transition-heavy text. Some AI content scores low because:
        </p>
        <ul>
          <li>It was written in a casual, conversational style</li>
          <li>It was edited by a human after generation</li>
          <li>The model used produced naturally varied sentence structures</li>
          <li>The content is short — fewer signals are available</li>
        </ul>
        <p>
          No writing pattern detector is reliable across all AI writing styles. MianTrace
          is transparent about this limitation.
        </p>
      </>
    ),
  },
  {
    q: 'How is MianTrace different from other AI detectors?',
    a: (
      <>
        <p>
          Three things distinguish MianTrace:
        </p>
        <ul>
          <li>
            <strong>Transparency.</strong> Every signal is disclosed, explained, and weighted
            publicly. There are no black-box models.
          </li>
          <li>
            <strong>Honesty.</strong> MianTrace never claims to prove AI authorship. It provides
            pattern-based estimates with explicit limitations.
          </li>
          <li>
            <strong>Privacy.</strong> Text analysis runs entirely in your browser.
            Nothing you paste is ever transmitted.
          </li>
        </ul>
        <p>
          MianTrace is not positioned as an authoritative AI detector. It is positioned as a
          writing analysis tool that surfaces patterns and helps you understand your content better.
        </p>
      </>
    ),
  },
]

function FAQItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {item.q}
        </span>
        <svg
          viewBox="0 0 14 14"
          fill="currentColor"
          className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="M2 4.5l5 5 5-5H2z"/>
        </svg>
      </button>

      {open && (
        <div className="pb-5 -mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex flex-col gap-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:before:content-['·'] [&_li]:before:text-slate-300 [&_li]:before:dark:text-slate-600 [&_li]:before:flex-shrink-0 [&_strong]:font-semibold [&_strong]:text-slate-700 [&_strong]:dark:text-slate-300">
          {item.a}
        </div>
      )}
    </div>
  )
}

export function FAQPage() {
  return (
    <article className="max-w-3xl mx-auto px-5 py-10 sm:py-14">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
          FAQ
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
          Frequently asked questions
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
          Honest answers about what MianTrace can and cannot do.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 px-5 sm:px-7">
        {FAQS.map(item => (
          <FAQItem key={item.q} item={item}/>
        ))}
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="#analyzer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          Try the analyzer
        </a>
        <a
          href="#methodology"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
        >
          Read the methodology
        </a>
      </div>
    </article>
  )
}
