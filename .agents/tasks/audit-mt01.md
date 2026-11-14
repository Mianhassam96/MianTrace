# MT-01 Existing Architecture Audit
**Date:** 2026-10-02  
**Repo:** `f:\Web dev\Github and Git\Upload\MianTrace`  
**Commit at audit:** `d1c6eec`

---

## 1. File Inventory

### Stack
- React 19.2, TypeScript 6.0, Vite 8.3, Tailwind CSS v4
- Cloudflare Workers (wrangler 4.141)
- No router library — custom `useHashRoute` hook
- No state management library — React useState/useMemo only
- Linting: oxlint

### src/analysis/ (writing engine)
| File | Purpose |
|---|---|
| `text-utils.ts` | String normalization, HTML stripping, paragraph splitting, round/clamp helpers |
| `tokenizer.ts` | Sentence tokenizer (abbreviation-aware), word tokenizer, n-gram extraction |
| `statistics.ts` | `computeStatistics(text)` → `FullStatistics` (words, chars, sentences, paragraphs, TTR, CV, repeated phrases) |
| `signals.ts` | 8 signal detectors returning `Signal {id, name, level, score, description, suggestion}` |
| `sentence-analysis.ts` | `analyzeSentences(stats)` → `SentenceAnalysis[]` per-sentence scoring |
| `improvements.ts` | `getImprovements(signals)` → `ImprovementAdvice[]` per high/medium signal |
| `report.ts` | `generateReport(result)` → plain-text report string |
| `engine.ts` | `runSignalEngine(stats)` → `AnalysisResult` (orchestrates all above) |
| `index.ts` | Barrel export of all analysis modules |

### src/api/
| File | Purpose |
|---|---|
| `worker-client.ts` | `fetchWebsiteContent(url)` → typed `WorkerResult` |
| `errors.ts` | 20 error codes → `{headline, detail, retryable}` |

### src/hooks/
| File | Purpose |
|---|---|
| `useDarkMode.ts` | Class-based dark mode, localStorage persistence, light default |
| `useHashRoute.ts` | `[route, setRoute]` — routes: `analyzer`, `methodology`, `faq` |

### src/components/ (22 components)
**Input/Analyzer:** `AnalyzerTabs`, `TextInput`, `UrlInput`, `AnalyzeButton`, `AnalysisProgress`, `StatsBar`  
**Results:** `ScoreCard`, `ExplanationPanel`, `SignalsPanel`, `SignalCard`, `SentenceAnalysisPanel`, `ImprovementsPanel`, `ResultsPanel`, `WebsiteResultsHeader`  
**Reports:** `CopyReportButton`, `DownloadPDFButton`, `ShareReportButton`, `PrintableReport`  
**Pages:** `MethodologyPage`, `FAQPage`, `HowItWorks`, `Hero`  
**Shell:** `Header`, `Footer`

### worker/
| File | Purpose |
|---|---|
| `index.ts` | SSRF protection, URL fetch, HTML extraction, hardened security headers |
| `wrangler.toml` | Worker name `miantrace-worker`, compatibility date `2024-09-23` |

---

## 2. AnalysisResult Interface (current)

```typescript
interface AnalysisResult {
  aiLikelihood: number;           // 0–100
  confidence: ConfidenceLevel;    // 'low' | 'moderate' | 'high'
  statistics: ContentStatistics;  // words, chars, sentences, paragraphs, avgLen, min, max, TTR
  signals: Signal[];              // 8 signals
  explanation: string;
  limitations: string;
  sentenceAnalyses: SentenceAnalysis[];
  sourceMode?: 'text' | 'website';
  websiteData?: { url, title, description, headings, paragraphCount, wordCount };
}
```

**Key observation:** `AnalysisResult` is a flat object returned by `runSignalEngine()`. It is consumed by `ResultsPanel`, `ScoreCard`, `ExplanationPanel`, `SignalsPanel`, `SentenceAnalysisPanel`, `ImprovementsPanel`, `PrintableReport`, `CopyReportButton`, `generateReport()`.

---

## 3. Data Flow (writing engine)

```
App.tsx handleAnalyze()
  → computeStatistics(text)      → FullStatistics
  → runSignalEngine(stats)       → AnalysisResult
      → ALL_SIGNAL_DETECTORS     → Signal[]
      → computeAiLikelihood()    → number
      → computeConfidence()      → ConfidenceLevel
      → buildExplanation()       → string
      → buildLimitations()       → string
      → analyzeSentences(stats)  → SentenceAnalysis[]
  → setResult(analysisResult)
  → setStatus('success')
  → ResultsPanel renders result
```

---

## 4. Worker Extraction — What It Returns

```typescript
{
  url: string;           // final URL after redirects
  title: string;         // <title> or og:title
  description: string;   // meta description or og:description
  content: string;       // extracted text, max 10,000 chars
  wordCount: number;
  headings: string[];    // h1–h6, max 20, max 200 chars each
  paragraphCount: number;
}
```

**Gap for visibility engine:** The worker returns `headings[]` but not the heading hierarchy (h1 vs h2 vs h3). It does not return: meta keywords, structured data/schema.org, internal link count, image alt text, or page load metadata. These would be needed for a full visibility readiness analysis.

---

## 5. Issues Identified

### Bugs / Gaps
1. **`package.json` preview/deploy scripts** — `npm run preview` runs `wrangler dev` which is the Worker dev server, not the Vite preview. These scripts are likely broken.
2. **`hero.png` and `vite.svg` / `react.svg`** in `src/assets/` — Vite scaffold leftover assets, not used anywhere. Can be deleted.
3. **`App.css`** — exists but only contains a comment. Can be deleted; `index.css` handles all styles.
4. **`wrangler` in `devDependencies` of main `package.json`** — this caused the accidental `wrangler.jsonc` generation in the project root previously. The Worker should be managed entirely from `worker/` with its own `package.json`.

### Architecture gaps
5. **Route system is very simple** — `useHashRoute` only handles 3 routes. Adding an Improvement Lab or separate analysis page will need extending but is straightforward.
6. **`AnalysisResult` is a single flat object** — adding a second engine score means either: (a) adding `visibilityScore` etc. fields to `AnalysisResult`, or (b) creating a new `CombinedResult` wrapper type. Option (b) is cleaner and avoids breaking all existing consumers.
7. **`ResultsPanel` renders all result sections directly** — it imports 7 sub-components. Adding visibility results means either extending `ResultsPanel` or creating a separate `VisibilityResultsPanel` and a `CombinedResultsPanel` router.

### Not issues
- No TypeScript errors (tsc --noEmit passes clean)
- No build warnings (last clean build: 55 modules, 0 errors)
- Signal calibration is documented and evidence-based
- Error handling is thorough — 20 mapped codes, no technical strings exposed
- Worker security is hardened (SSRF, CORS, security headers)

---

## 6. Recommended Integration Plan for Visibility Engine

### New type structure
```typescript
// Keep existing AnalysisResult unchanged (backward compatible)

interface VisibilityDimension {
  id: string;
  name: string;
  score: number;        // 0–100
  weight: number;       // as per roadmap weights
  level: 'low' | 'medium' | 'high';
  findings: string[];   // evidence items
  recommendation?: string;
}

interface VisibilityResult {
  overallScore: number;         // 0–100 weighted
  dimensions: VisibilityDimension[];
  targetTopic?: string;         // user-supplied focus topic
  explanation: string;
  limitations: string;
}

interface CombinedResult {
  writing: AnalysisResult;        // existing, unchanged
  visibility: VisibilityResult;   // new
  sourceMode: 'text' | 'website';
  websiteData?: { ... };          // move here from AnalysisResult
  analyzedAt: string;             // ISO timestamp
}
```

### New analysis modules (additive, no existing files changed)
```
src/analysis/visibility/
  answerability.ts       — direct answer detection (Q&A patterns, definition sentences)
  topicCoverage.ts       — keyword density, topic sentence detection
  entityCoverage.ts      — proper noun, concept, number extraction
  evidenceAnalysis.ts    — citation patterns, specificity markers, hedging
  structureAnalysis.ts   — heading hierarchy, list usage, paragraph balance
  specificityAnalysis.ts — concrete vs vague language ratio
  freshnessAnalysis.ts   — date signals, temporal language
  visibilityEngine.ts    — orchestrator, weighted scoring
  visibilityScoring.ts   — dimension aggregation

src/analysis/shared/
  (text-utils.ts and tokenizer.ts can be shared as-is — they already handle normalization)
```

### Worker upgrade needed
The visibility engine needs richer extraction. The worker should additionally return:
- `headingHierarchy: { level: number; text: string }[]` — not just flat `headings[]`
- `metaKeywords?: string` — if present
- `hasStructuredData: boolean` — whether JSON-LD/schema.org present
- `imageCount: number` — rough content richness signal

This is additive — existing `WorkerSuccessResponse` fields stay, new ones are added optional.

### UI changes needed
- `useHashRoute` — add `'improve'` route for Improvement Lab
- `App.tsx` — extend `handleAnalyze` to run both engines, store `CombinedResult`
- New components: `VisibilityScoreCard`, `VisibilityDimensionsPanel`, `CombinedResultsPanel`
- `PrintableReport` and `generateReport` — extend to include visibility section
- `Header` — add `Analyze` as explicit nav item (currently the logo does this)

---

## 7. What to Preserve Unchanged

| Item | Reason |
|---|---|
| All 8 writing signals | Calibrated, working, evidence-based |
| `FullStatistics` / `computeStatistics()` | Reusable by visibility engine too |
| `tokenizer.ts` / `text-utils.ts` | Foundation for both engines |
| `errors.ts` | Complete, clean |
| Worker security hardening | Already done |
| All existing UI components | Additive only — no removal |
| `useHashRoute` / `useDarkMode` | Extend, don't replace |

---

## 8. Phase 1 Backlog (improve existing writing engine)

Before building the visibility engine, these small improvements are warranted:

1. **Delete unused assets** — `hero.png`, `vite.svg`, `react.svg`, `App.css`
2. **Fix `package.json` scripts** — remove broken `preview` and `deploy` scripts that call wrangler
3. **Move `wrangler` out of main `devDependencies`** — it belongs only in `worker/package.json`
4. **Improve sentence tokenizer** — currently misses sentences ending with `?` or `!` in some cases before a lowercase word
5. **Vocabulary signal** — currently fires only on short text (<150w); medium-length AI text (150–300w) scores 0 on this signal. Consider removing it from the weighted average when it cannot fire, rather than counting it as 0.
6. **Confidence model** — text under 50 words produces `low` confidence but still runs all 8 signals. Consider returning a minimal result with an explicit "insufficient text" state rather than a scored result.

---

## Summary

The existing codebase is clean, well-structured, and production-ready for the writing engine. No major refactoring is needed before adding the visibility engine. The integration path is **additive**: new types, new analysis modules, new UI components — all sitting alongside existing code without breaking it.

The biggest design decision is the `CombinedResult` wrapper type, which keeps `AnalysisResult` unchanged and avoids touching 7+ existing components. That decision should be made before writing any Phase 2 code.
