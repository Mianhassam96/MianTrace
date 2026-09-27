const STEPS = [
  {
    number: '01',
    title: 'Input your content',
    description: 'Paste text directly or enter a URL. MianTrace fetches and extracts the main content from webpages automatically.',
  },
  {
    number: '02',
    title: 'Signal analysis',
    description: 'Eight writing signals are measured — sentence structure, vocabulary diversity, phrase repetition, phrasing patterns and more.',
  },
  {
    number: '03',
    title: 'Weighted scoring',
    description: 'Signals are weighted and combined into an AI-likelihood estimate with a confidence level based on text length and signal agreement.',
  },
  {
    number: '04',
    title: 'Explained results',
    description: 'Every signal is explained, not just scored. MianTrace also provides improvement suggestions — not just a verdict.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-12 px-5 border-t border-slate-100 dark:border-slate-800"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2
            id="how-it-works-heading"
            className="text-2xl font-bold text-slate-900 dark:text-white mb-2"
          >
            How It Works
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            A transparent, signal-based approach. No black boxes, no false certainty.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(step => (
            <div key={step.number} className="flex flex-col gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {step.number}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-10 flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <svg viewBox="0 0 18 18" fill="currentColor" className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" aria-hidden="true">
            <path d="M9 1a8 8 0 100 16A8 8 0 009 1zm.75 11.5h-1.5v-5h1.5v5zm0-6.5h-1.5V4.5h1.5V6z"/>
          </svg>
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-0.5">About AI likelihood estimates</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
              MianTrace identifies writing patterns that may be associated with AI-assisted content.
              Results are probabilistic estimates, not proof of authorship. Some human writing styles
              may score high; some AI content may score low.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
