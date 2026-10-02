# MianTrace

**Understand the signals behind your content.**

[![Deploy to GitHub Pages](https://github.com/Mianhassam96/MianTrace/actions/workflows/deploy.yml/badge.svg)](https://github.com/Mianhassam96/MianTrace/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Live:** [mianhassam96.github.io/MianTrace](https://mianhassam96.github.io/MianTrace/)

MianTrace analyzes text and webpages for writing patterns statistically associated with AI-generated content. It provides transparent, explainable results — without making false claims about authorship.

---

## What MianTrace is

A writing pattern analyzer. Not an "AI detector."

MianTrace measures 8 writing signals and produces a probabilistic AI-likelihood estimate. Every signal is explained. Every result includes an honest limitations disclaimer. Text analysis runs entirely in your browser — no data is transmitted.

---

## Features

| Feature | Detail |
|---|---|
| Text analysis | Paste content, get AI-likelihood + 8 signal breakdown |
| Website analysis | Enter a URL, extract and analyze main content |
| 8 writing signals | Transition patterns, generic phrasing, sentence uniformity, structural predictability, sentence openings, vocabulary variation, phrase repetition, paragraph consistency |
| Sentence analysis | Per-sentence color-coded breakdown with expandable contribution reasons |
| Improvement suggestions | Numbered, actionable advice per detected signal with before/after examples |
| Reports | Copy plain-text report, Download PDF, Share |
| Methodology page | Full transparency: signal weights, calibration deltas, limitations, privacy |
| FAQ | 8 honest questions including "can this prove AI authorship?" (answer: no) |
| Dark mode | Class-based, persisted to localStorage |
| Responsive | 320px mobile through 1920px desktop |
| No signup | Free, no account, no tracking |
| Privacy | Text analysis: browser-only. Website analysis: URL sent to Cloudflare Worker |

---

## How It Works

```
Input (text or URL)
        ↓
8 signal detectors (deterministic, rule-based)
        ↓
Weighted scoring model
        ↓
AI-likelihood % + confidence level
        ↓
Explained results + sentence analysis + improvement suggestions
```

MianTrace does **not** use a machine learning model or trained classifier. All analysis is deterministic — same input always produces the same result. See the [Methodology page](https://mianhassam96.github.io/MianTrace/#methodology) for full signal documentation.

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
│   ├── text-utils.ts        # String normalization
│   ├── tokenizer.ts         # Sentence + word tokenization
│   ├── statistics.ts        # Deterministic content statistics
│   ├── signals.ts           # 8 signal detectors
│   ├── sentence-analysis.ts # Per-sentence signal scoring
│   ├── improvements.ts      # Per-signal improvement advice
│   ├── report.ts            # Plain-text report generator
│   ├── engine.ts            # Weighted scoring + confidence
│   └── index.ts             # Barrel export
├── api/
│   ├── worker-client.ts     # Cloudflare Worker fetch wrapper
│   └── errors.ts            # Error code → user-readable message map
├── components/              # All UI components
├── hooks/
│   ├── useDarkMode.ts       # Class-based dark mode + localStorage
│   └── useHashRoute.ts      # Hash-based routing (no router library)
└── types/
    └── index.ts             # Shared TypeScript types

worker/
└── index.ts                 # Cloudflare Worker (SSRF protection + HTML extraction)

docs/
└── QA_CHECKLIST.md          # Full QA checklist for releases
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

For website analysis, create `.env.local`:
```
VITE_WORKER_URL=https://miantrace.mianhassam96.workers.dev
```

---

## Worker Deployment

```bash
cd worker
npm install
npx wrangler login
npx wrangler deploy
```

After deploying, add `VITE_WORKER_URL` as a GitHub Actions secret:  
**Settings → Secrets and variables → Actions → New repository secret**

---

## Signal Weights (v0.2 calibration)

| Signal | Weight | Reliability |
|---|---|---|
| Transition Patterns | 1.7 | Δ+1.00 (perfect discriminator) |
| Generic Phrasing | 1.7 | Δ+1.00 (perfect discriminator) |
| Sentence Uniformity | 1.1 | Δ+0.69 (excellent) |
| Sentence Openings | 1.0 | Δ+0.43 (good) |
| Structural Predictability | 1.0 | Δ+0.28 (good) |
| Vocabulary Variation | 0.8 | Δ+0.09 (weak, reliable for short text) |
| Paragraph Consistency | 0.6 | Δ+0.14 (weak) |
| Phrase Repetition | 0.4 | Δ−0.06 (anti-discriminates, reduced weight) |

Calibrated using an 8-sample audit dataset. See [Methodology](https://mianhassam96.github.io/MianTrace/#methodology) for detail.

---

## Limitations

- MianTrace **cannot prove** whether content was written by a human or AI
- Short texts (< 100 words) produce low-confidence results
- Some human writing styles may score high; some AI content may score low
- Calibrated primarily on English text
- Website extraction does not work on JS-rendered, login-required, or crawler-blocked pages

---

## Security (Worker)

- SSRF protection: RFC1918, loopback, link-local, CGNAT, IMDS hostnames blocked
- HTTPS-only enforcement
- 2MB response size limit
- 10-second timeout
- Redirect destination re-validated
- HTML content-type enforcement
- URL length limit: 2048 characters
- `Cache-Control: no-store` on all responses
- No raw server error messages exposed in responses
- CORS locked to production origin

---

## QA

See [docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md) for the full release checklist.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built by [Mianhassam96](https://github.com/Mianhassam96)*
