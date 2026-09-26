export function Hero() {
  return (
    <section className="pt-12 pb-8 text-center px-4">
      <div className="max-w-2xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-medium px-3 py-1 rounded-full mb-5 border border-indigo-100 dark:border-indigo-900">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" aria-hidden="true" />
          Content Intelligence
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight mb-4">
          Understand the signals
          <br />
          <span className="text-indigo-600 dark:text-indigo-400">behind your content.</span>
        </h1>

        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl mx-auto">
          Analyze text and webpages for AI-like writing patterns and content insights.
          No black box — every signal is explained.
        </p>
      </div>
    </section>
  )
}
