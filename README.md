# MianTrace

**Understand the signals behind your content.**

[![Deploy to GitHub Pages](https://github.com/Mianhassam96/MianTrace/actions/workflows/deploy.yml/badge.svg)](https://github.com/Mianhassam96/MianTrace/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Live:** [mianhassam96.github.io/MianTrace](https://mianhassam96.github.io/MianTrace/)

MianTrace analyzes text and webpages for AI-like writing patterns and provides explainable, probabilistic insights — without making unfounded claims about authorship.

---

## Features

- **Text Analysis** — Paste any content and get an AI-likelihood estimate with signal breakdown
- **Website Analysis** — Enter a URL to fetch and analyze webpage content (via Cloudflare Worker)
- **8-Signal Engine** — Sentence uniformity, vocabulary variation, phrase repetition, structural predictability, transition patterns, generic phrasing, sentence opening patterns, paragraph consistency
- **Explainable Results** — Every signal is explained with context, not just scored
- **Sentence-Level Analysis** — Color-coded per-sentence breakdown with expandable contribution details
- **Improvement Suggestions** — Numbered, actionable advice for each detected signal with before/after examples
- **Dark / Light Mode** — Persisted to localStorage
- **Responsive** — Works on 320px mobile through 1920px desktop
- **No data stored** — All analysis runs in the browser; no content is sent to a server

---

## How It Works

```
Input (text or URL)
        ↓
Content Statistics Engine
  words · characters · sentences · paragraphs
  avg sentence length · vocabulary diversity
  repeated phrases · sentence length CV
        ↓
8-Signal AI-Likelihood Engine
  sentence uniformity · vocabulary patterns
  phrase repetition · structural predictability
  transition patterns · generic phrasing
  sentence openings · paragraph consistency
        ↓
Weighted Scoring + Confidence
        ↓
AI-Likelihood % + High/Moderate/Low confidence
        ↓
Explanation + Sentence Analysis + Improvements
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Linting | Oxlint |
| Deployment | GitHub Pages via GitHub Actions |
| URL Analyzer | Cloudflare Workers |

---

## Architecture

```
src/
├── analysis/
│   ├── text-utils.ts        # String normalization helpers
│   ├── tokenizer.ts         # Sentence + word tokenization
│   ├── statistics.ts        # Deterministic content statistics
│   ├── signals.ts           # 8 signal detectors
│   ├── sentence-analysis.ts # Per-sentence signal scoring
│   ├── improvements.ts      # Per-signal improvement advice
│   ├── engine.ts            # Weighted scoring + confidence
│   └── index.ts             # Public barrel export
├── api/
│   └── worker-client.ts     # Typed Cloudflare Worker fetch wrapper
├── components/              # All UI components
├── hooks/
│   └── useDarkMode.ts       # Class-based dark mode + localStorage
└── types/
    └── index.ts             # Shared TypeScript types

worker/
├── index.ts                 # Cloudflare Worker (SSRF protection + extraction)
└── wrangler.toml            # Worker deployment config
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

To enable website analysis locally, deploy the Cloudflare Worker and set:

```bash
# .env.local
VITE_WORKER_URL=https://miantrace-worker.your-account.workers.dev
```

---

## Cloudflare Worker Deployment

```bash
cd worker
npm install
npx wrangler login
npx wrangler deploy
```

After deploying, add `VITE_WORKER_URL` as a GitHub Actions secret:
**Settings → Secrets and variables → Actions → New repository secret**

---

## Deployment

Automatically deployed to GitHub Pages on every push to `main`:

```
git push → GitHub Actions → npm ci → npm run build → deploy dist/
```

Live URL: `https://mianhassam96.github.io/MianTrace/`

---

## Limitations

- MianTrace **cannot prove** whether content was written by a human or AI
- Results are probabilistic estimates based on writing pattern analysis
- Very short texts (< 100 words) produce low-confidence results
- Results may vary for non-English content
- Some human writing styles may score high; some AI content may score low
- Website analysis requires the Cloudflare Worker to be deployed

---

## Security

- No user content is stored or transmitted to third-party servers (text mode)
- Website URLs are fetched via Cloudflare Worker with:
  - SSRF protection (blocks localhost, RFC1918, link-local, CGNAT, internal hostnames)
  - HTTPS-only enforcement
  - 2MB response size limit
  - 10-second timeout
  - Redirect re-validation
  - HTML content-type enforcement
- No API keys or secrets in the frontend bundle

---

## Roadmap

- [x] Phase 1 — Foundation (Vite + React + TypeScript + Tailwind)
- [x] Phase 2 — UI (Header, Hero, Analyzer, Dark mode, Footer)
- [x] Phase 3 — Statistics Engine
- [x] Phase 4 — Signal Engine (8 signals)
- [x] Phase 5+6 — Scoring Model + Results UI
- [x] Phase 7 — Sentence-Level Analysis
- [x] Phase 8 — Content Improvement Suggestions
- [x] Phase 9-12 — Website Analyzer + Cloudflare Worker
- [x] Phase 13-18 — Polish, SEO, Quality
- [ ] Phase 19 — Cloudflare Worker deployment
- [ ] Phase 20 — Production QA
- [ ] Phase 21 — MVP Launch 🚀

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built by [Mianhassam96](https://github.com/Mianhassam96)*
