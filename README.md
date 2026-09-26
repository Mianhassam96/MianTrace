# MianTrace

**Understand the signals behind your content.**

MianTrace analyzes text and webpages for AI-like writing patterns, content signals, and provides explainable insights — without making unfounded claims.

---

## Features

- **Text Analysis** — Paste any content and get an AI-likelihood estimate with signal breakdown
- **Website Analysis** — Enter a URL to fetch and analyze webpage content
- **Signal Engine** — 8 writing signals including sentence uniformity, vocabulary diversity, phrase repetition, and more
- **Explainable Results** — Every signal is explained, not just scored
- **Improvement Suggestions** — Actionable recommendations for each detected signal
- **Sentence-Level Analysis** — See which sentences contributed to the result
- **Dark / Light Mode** — Full theme support
- **Responsive** — Works on mobile and desktop

---

## How It Works

```
Content (text or URL)
        ↓
Content Statistics Engine
        ↓
AI-Likelihood Signal Engine (8 signals)
        ↓
Weighted Scoring Model
        ↓
AI-Likelihood + Confidence + Explanation
```

MianTrace does **not** claim to prove AI authorship. It identifies writing patterns statistically associated with AI-generated or formulaic content and provides a probabilistic estimate.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Linting | Oxlint |
| Deployment | GitHub Pages |
| URL Analyzer | Cloudflare Workers |

---

## Architecture

```
src/
├── components/       # UI components
├── analysis/         # Core analysis engine
│   ├── statistics.ts # Content statistics
│   ├── tokenizer.ts  # Text tokenization
│   ├── signals.ts    # Signal detection
│   └── text-utils.ts # Utilities
├── types/            # Shared TypeScript types
└── hooks/            # React hooks
```

---

## Local Development

```bash
git clone https://github.com/Mianhassam96/MianTrace.git
cd MianTrace
npm install
npm run dev
```

Open `http://localhost:5173/MianTrace/`

---

## Deployment

Deployed automatically via GitHub Actions to GitHub Pages:

```
https://mianhassam96.github.io/MianTrace/
```

Push to `main` triggers the deployment workflow.

---

## Limitations

- MianTrace cannot **prove** whether content was written by a human or AI
- Results are probabilistic estimates based on writing patterns
- Very short texts (< 100 words) produce low-confidence results
- Results may vary for non-English content
- Some human writing styles may score high; some AI content may score low

---

## Security

- No user content is stored or transmitted to third-party servers
- URL analyzer (Cloudflare Worker) enforces SSRF protection, input validation, response limits, and redirect validation
- No API keys or secrets in the frontend

---

## Roadmap

- [x] Phase 1 — Foundation
- [ ] Phase 2 — UI
- [ ] Phase 3 — Statistics Engine
- [ ] Phase 4 — Signal Engine
- [ ] Phase 5 — Scoring Model
- [ ] Phase 6 — Results UI
- [ ] Phase 7 — Sentence Analysis
- [ ] Phase 8 — Improvement Suggestions
- [ ] Phase 9–10 — Website Analyzer + Cloudflare Worker
- [ ] Phase 11–12 — Website Results
- [ ] Phase 13–18 — Polish, SEO, Deployment, QA

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built by [Mianhassam96](https://github.com/Mianhassam96)*
