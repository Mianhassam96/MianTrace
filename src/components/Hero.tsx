export function Hero() {
  return (
    <section className="pt-10 pb-6 text-center px-5">
      <div className="max-w-2xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-5 border border-blue-100 dark:border-blue-900/60 tracking-wide uppercase">
          <span className="text-blue-500" aria-hidden="true">✦</span>
          Content Intelligence
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight mb-3 text-balance">
          Understand the signals
          <br />
          <span className="text-blue-600 dark:text-blue-400">behind your content.</span>
        </h1>

        <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Analyze text and webpages for AI-like writing patterns, content signals,
          and explainable insights.
        </p>
      </div>
    </section>
  )
}
