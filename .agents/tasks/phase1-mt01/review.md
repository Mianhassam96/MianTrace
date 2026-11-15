# MianTrace Phase 1: Cleanup and writing-engine calibration

This change removes dead assets and broken scripts, strips the wrangler dependency from the main package, and tightens the analysis engine in three ways: a minimum-word early-return guard, a three-tier vocabulary TTR threshold, and a broader sentence-split rule for `!` and `?`. The motivation is correct — the engine was under-flagging medium-length AI text and silently returning nonsense scores on micro-inputs. The approach is small, surgical, and self-contained.

**Watch for:** The medium-tier vocabulary floor (150–300 words) shipped at 0.62/0.10 instead of the spec's 0.65/0.12 — this is a **confirmed** intentional deviation backed by the 8-sample calibration audit and documented in the commit. The task spec says `floor=65%/0.12`; the code has `floor=0.62/0.10`. Reviewers must decide whether to accept the empirical calibration as the new spec or treat this as a changes-requested item.

**Verdict**: NEEDS_CHANGES

---

## High-level view

The vocabulary signal now has three tiers, but the medium tier diverges from the spec. The spec required `floor=65%/0.12`; the shipped value is `floor=0.62/0.10`. The commit documents the reason: at 0.65, one human sample ("FORMAL HUMAN") scored 31%, above the 25% ceiling. The coder chose to trust the calibration audit over the spec and left a comment in the code. The long-tier (`300+w`) matches spec: `floor=0.55/0.12`.

Everything else matches the spec. The early-return guard fires at `stats.words < 20` and returns the specified `aiLikelihood: 0`, `confidence: 'low'`, explanation, and `limitations` strings with empty `signals[]` and `sentenceAnalyses[]`. The tokenizer split now has two alternatives: the period rule retains the uppercase lookahead (abbreviation safety), and the `[!?]` branch adds lowercase — scoped exactly as specified. The asset, script, and dependency cleanup is complete.

---

<details>
<summary>Issues (1)</summary>

1. **Medium-tier vocabulary floor deviates from spec** — The task specifies `floor=65%/0.12` for the 150–300 word tier; the code ships `floor=0.62/0.10`. The deviation is intentional and documented, but the spec has not been formally updated to reflect the empirical calibration decision. Either update the spec to `floor=0.62/0.10` and close the gap, or accept 0.65/0.12 and re-run the audit to verify the FORMAL HUMAN sample stays ≤25%. Until one of those happens, the implementation and the spec are out of sync.

</details>

---

<details>
<summary>Details</summary>

### Medium-tier vocabulary threshold: spec vs. implementation

The task spec states: *"for text 150–300 words, use floor=65% with deficit/0.12"*. The shipped code uses `floor=0.62` and `deficit/0.10`. The commit message explains that at 0.65/0.12 the FORMAL HUMAN sample scored 31%, violating the ≤25% ceiling. The coder treated the audit as ground truth and updated the code without updating the spec.

This is a **confirmed** deviation. The code comment reads:

```
// Medium text (150–300w): floor=0.62 derived from 8-sample calibration audit;
// keeps all human samples ≤25% while still catching AI TTR around 60–61%.
// (Original spec said 65%/0.12 but that raised a human sample to 31% — empirical
//  calibration data is the ground truth here.)
```

The behavioral consequence is a slightly lower AI-detection sensitivity in the medium tier (scores are proportionally smaller at 0.10 divisor vs. 0.12), but all eight audit samples still pass their expected bands (7/8, with the borderline HUMAN-EDITED AI sample noted as 1pp under boundary). The question for the reviewer is process: should the spec be amended to match, or should the code be revised to match the spec and the failing sample handled differently?


</details>

---

<details>
<summary>File map</summary>

| File | Change |
|---|---|
| `package.json` | Removed `preview`, `deploy` scripts; removed `wrangler` from devDependencies |
| `package-lock.json` | Lock file regenerated after removing wrangler (31 packages removed) |
| `src/App.css` | Deleted (unused) |
| `src/App.tsx` | Removed `import './App.css'` |
| `src/assets/hero.png` | Deleted (unused asset) |
| `src/assets/react.svg` | Deleted (unused asset) |
| `src/assets/vite.svg` | Deleted (unused asset) |
| `src/analysis/engine.ts` | Added `words < 20` early-return guard in `runSignalEngine` |
| `src/analysis/signals.ts` | Replaced two-tier with three-tier TTR threshold in `signalVocabularyPatterns` |
| `src/analysis/tokenizer.ts` | Broadened sentence-split regex to handle `[!?]` before lowercase |
| `scripts/audit.mjs` | Updated inline copies of threshold constants to match signals.ts |

Full diff: `git diff 09ac06d...HEAD`

</details>
