# Phase 2 AI Visibility Readiness engine

This change adds a second analysis dimension to MianTrace: an "AI Visibility Readiness" score that runs alongside the existing writing-quality engine. Seven deterministic analyzers each produce a `VisibilityDimension`; a thin orchestrator applies a weighted composite and returns a `VisibilityResult`. `App.tsx` now stores a `CombinedResult` whose `.writing` field feeds the unchanged `ResultsPanel` and `PrintableReport`, while the new `.visibility` field feeds `VisibilityResultsPanel`. No existing analysis module, type, signal, or component was modified.

**Watch for:** One confirmed scoring bug in `entityCoverage.ts` — `namedConceptCount` (a strict subset of `properNounCount`) is added again to `totalEntities`, inflating entity density for any text with long proper nouns. `answerability.ts` joins `sentenceList` with a space then splits on `\n`, which guarantees zero question-pattern or list-pattern matches for text-tab input (the sentence tokenizer strips newlines). `specificityAnalysis.ts` declares `weight = 10` but the spec and engine comment say 10 and sum to 100, so the weight is correct — however the comment in `visibilityEngine.ts` says "15" for specificity in the weight list annotation, which is inconsistent with the code.

**Verdict**: NEEDS_CHANGES

---

## High-level view

The `CombinedResult` wrapper threads `writing` to `ResultsPanel` and `PrintableReport`, and `visibility` to `VisibilityResultsPanel`, cleanly. The original `AnalysisResult`, `Signal`, and all existing analysis modules are untouched; `ConfidenceLevel` is reused for the visibility confidence field without touching `types/index.ts` beyond an append.

The weighted composite formula `sum(score * weight / 100)` with weights summing to 100 is correct. The seven weight constants (20, 20, 15, 15, 15, 10, 5) are confirmed in each analyzer file; their sum is 100. The engine comment has a copy-paste error — it lists specificity as weight 15 instead of 10 — but the runtime values are correct.

`entityCoverage.ts` double-counts: `namedConceptCount` is derived from `properNouns.filter(w => w.length >= 6)`, then both `properNounCount` and `namedConceptCount` are added into `totalEntities`. Every long proper noun inflates the density figure by 2×, biasing the score upward for any text containing multi-character proper nouns.

`answerability.ts` rebuilds the full text as `sentences.join(' ')` and then splits it on `\n` for question and list detection. Because `sentenceList` is built from `normalizeText` which collapses whitespace, the joined string never contains newlines. For text-tab input (the dominant path), `questionCount` and `listLineCount` are always 0. Only the `definitionCount` branch contributes to the score, capping the maximum achievable `rawScore` at `0.45` (45/100), making the top two patterns unreachable in practice.

`CombinedResult` duplicates `sourceMode` and `websiteData` fields that already exist on the nested `AnalysisResult` (`writing.sourceMode`, `writing.websiteData`). There is nothing consuming the top-level copies after the restructure (`result.sourceMode` appears nowhere in the worktree), so these fields add dead weight to the type and state object. The inconsistency will silently diverge if either copy is updated independently.

---

<details>
<summary>Issues (4)</summary>

1. **Entity density double-count** — `namedConceptCount` is a subset of `properNounCount` and both are summed into `totalEntities`, inflating entity density for any proper noun longer than 5 characters. Remove `namedConceptCount` from `totalEntities`, or replace `properNounCount` with `namedConceptCount` in the sum to target only "significant" named entities.

2. **Answerability newline-split on joined sentences** — `sentences.join(' ')` produces a string with no newlines, so splitting on `\n` yields a single element, making `questionCount` and `listLineCount` always 0 for text-tab input. Split the original `rawText` on newlines instead, or pass `rawText` through the second parameter (currently ignored as `_text`) for question/list detection.

3. **Engine comment weight annotation is wrong** — The comment `// weights: 20+20+15+15+15+10+5 = 100` in `visibilityEngine.ts` has 15 in the specificity position, but `specificityAnalysis.ts` declares `weight = 10`. The runtime is correct; the comment should read `20+20+15+15+15+10+5` with structureAnalysis at 15 and specificityAnalysis at 10, matching the analyzer call order.

4. **Dead top-level fields on CombinedResult** — `CombinedResult.sourceMode` and `CombinedResult.websiteData` are never read after the diff; both values are already accessible via `result.writing.sourceMode` and `result.writing.websiteData`. Removing them eliminates the risk of the two copies silently diverging in a future change.

</details>

---

<details>
<summary>Details</summary>

### Entity density double-count in entityCoverage

`namedConceptCount` is computed as `properNouns.filter(w => w.length >= 6).length` — it is a strict subset of `properNounCount`. Both are then summed: `totalEntities = properNounCount + numberCount + dateCount + namedConceptCount`. For a text like "Microsoft announced TensorFlow", `properNounCount` is 2 and `namedConceptCount` is 2 (both words are 6+ chars), so `totalEntities` counts 4 from two tokens. The density and score are inflated proportionally. The comment `// (already captured in properNouns with length filter)` acknowledges the overlap but the sum doesn't reflect it. **Confirmed** — the inflation is exactly `properNouns.filter(w => w.length >= 6).length` above the correct count.

### Answerability question/list detection always returns zero for text input

`answerability.ts` ignores the `_text` parameter entirely and rebuilds a string from `stats.sentenceList.join(' ')`. The sentence tokenizer normalizes whitespace before splitting, so the joined string is a flat single-line string. When this is split on `/\n/`, the result is an array of exactly one element. Both the question-pattern filter and the list-pattern filter operate on this `lines` array, so `questionCount` and `listLineCount` are both 0 for all text-tab input. The `rawScore` ceiling is `Math.round(0.45 * 100) = 45` for text that contains definition sentences at saturation, never reaching the 70-point "high" threshold purely through the definition branch. The fix is to split `rawText` (the ignored second parameter) on newlines for question and list detection. **Confirmed** — `sentences.join(' ')` contains no `\n` characters by construction.

### Weight comment mismatch in visibilityEngine

The comment in `visibilityEngine.ts` reads `// weights: 20+20+15+15+15+10+5 = 100`. The analyzers are called in order: answerability (20), topicCoverage (20), entityCoverage (15), evidenceAnalysis (15), structureAnalysis (15), specificityAnalysis (10), freshnessAnalysis (5). The correct representation for the call order is `20+20+15+15+15+10+5`, which sums correctly, but the specificity entry in that annotation should read 10, not 15 (structureAnalysis is listed at position 5 and specificityAnalysis at position 6). The runtime calculation derives weights from `d.weight` dynamically, so the formula is correct; the comment misleads future maintainers. **Confirmed** — `specificityAnalysis.ts` has `const weight = 10`.

### CombinedResult redundant top-level fields

`CombinedResult` has `sourceMode: 'text' | 'website'` and an optional `websiteData` block. `AnalysisResult` (the type of `CombinedResult.writing`) already carries both as optional fields populated identically in `App.tsx`. After the diff, no file reads `result.sourceMode` or `result.websiteData` from the `CombinedResult` level; both access paths go through `result.writing`. The duplication was likely carried over from the original flat `AnalysisResult` shape before the nesting. **Confirmed** — `grep result\.sourceMode` returns no matches in the worktree.

### Type safety and shape conformance

Every analyzer returns an object with all six required `VisibilityDimension` fields in both the early-exit and normal paths. `VisibilityResult` omits `targetTopic` (typed `string | undefined`), which is valid. No new npm dependencies are introduced.

</details>

---

<details>
<summary>File map</summary>

| File | What changed |
|---|---|
| `src/types/index.ts` | Appended `VisibilityDimension`, `VisibilityResult`, `CombinedResult` interfaces; no existing types touched |
| `src/App.tsx` | State type changed from `AnalysisResult` to `CombinedResult`; both analysis engines called; `ResultsPanel` and `PrintableReport` receive `result.writing` |
| `src/analysis/visibility/visibilityEngine.ts` | New — orchestrates 7 analyzers, computes weighted composite, returns `VisibilityResult` |
| `src/analysis/visibility/answerability.ts` | New — detects definition sentences, Q&A lines, list patterns; weight 20 |
| `src/analysis/visibility/topicCoverage.ts` | New — vocabulary diversity, heading variety, stemmed unique roots; weight 20 |
| `src/analysis/visibility/entityCoverage.ts` | New — proper noun, number, date, named-concept density; weight 15 |
| `src/analysis/visibility/evidenceAnalysis.ts` | New — statistics, citations, named sources, example markers, hedge penalty; weight 15 |
| `src/analysis/visibility/structureAnalysis.ts` | New — paragraphs, list lines, sentence-length CV, heading ratio; weight 15 |
| `src/analysis/visibility/specificityAnalysis.ts` | New — generic-phrase count vs specific signal count; weight 10 |
| `src/analysis/visibility/freshnessAnalysis.ts` | New — year references, freshness adverbs; weight 5 |
| `src/components/visibility/VisibilityResultsPanel.tsx` | New — panel shell with explanation, score card, limitations footer |
| `src/components/visibility/VisibilityScoreCard.tsx` | New — overall score display, per-dimension collapsible rows with score bars |

Full diff: `git -C "f:\Web dev\Github and Git\Upload\MianTrace\.worktrees\phase2-visibility" diff main...HEAD`

</details>
