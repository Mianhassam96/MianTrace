# MianTrace QA Checklist

Run this checklist before every significant release.
Mark each item ✅ Pass, ❌ Fail, or ⚠️ Partial.

---

## 1. Core Analysis — Text Mode

| # | Test | Expected | Result |
|---|------|----------|--------|
| 1.1 | Empty textarea — click Analyze | Button disabled, no analysis triggered | |
| 1.2 | 5 words — click Analyze | Button disabled (< 10 words) | |
| 1.3 | 10 words — click Analyze | Analysis runs, low confidence | |
| 1.4 | ~200 word human essay | Score < 30%, moderate confidence | |
| 1.5 | ~200 word AI-style text (formulaic transitions + generic phrases) | Score > 55%, moderate confidence | |
| 1.6 | 10,000 character paste | Counter shows limit, text truncated at 10,000 | |
| 1.7 | Clear button appears after typing | Click clears textarea, counter resets to 0 | |
| 1.8 | Live stats bar | Appears after first word, updates as typing | |
| 1.9 | All 8 signal cards visible after analysis | Expandable, description + suggestion shown | |
| 1.10 | Sentence analysis panel | Expandable sentences, correct color coding | |
| 1.11 | Improvement suggestions | Appear for high/medium signals, numbered steps | |
| 1.12 | Editing text after result | Results clear, analyzer returns to ready state | |

---

## 2. Core Analysis — Website Mode

| # | Test | Expected | Result |
|---|------|----------|--------|
| 2.1 | Empty URL field | Button disabled | |
| 2.2 | HTTP URL (not HTTPS) | Button disabled, validation message shown | |
| 2.3 | Valid HTTPS URL | Green checkmark, button enabled | |
| 2.4 | `https://example.com` | Analysis runs, website header shows title | |
| 2.5 | Invalid domain | Human-readable error, retry offered if applicable | |
| 2.6 | Localhost URL | Rejected with "URL not allowed" message | |
| 2.7 | URL that returns 404 | Error: "The website returned an error" | |
| 2.8 | URL to a PDF/image | Error: "This URL does not point to a webpage" | |
| 2.9 | Progress steps visible | 5-step progress shown while fetching | |
| 2.10 | Website header in results | Shows URL, title, word count, headings | |
| 2.11 | Same analysis engine as text | 8 signals, sentence analysis, improvements shown | |

---

## 3. Report Features

| # | Test | Expected | Result |
|---|------|----------|--------|
| 3.1 | Copy Report button | Copies formatted plain-text report, shows "Copied!" | |
| 3.2 | Copy Report — website analysis | Includes Source URL and page title | |
| 3.3 | Download PDF button | Opens print dialog with only report visible | |
| 3.4 | PDF — score ring renders | Color ring visible in print preview | |
| 3.5 | PDF — text is selectable | Can select/copy text in saved PDF | |
| 3.6 | PDF — light background | Report always uses white background regardless of theme | |
| 3.7 | Share button — desktop | Copies MianTrace link, shows "Link copied!" | |
| 3.8 | Share button — mobile | Opens native share sheet | |
| 3.9 | "Analyze new content" button | Resets to analyzer, scrolls to top | |

---

## 4. Navigation

| # | Test | Expected | Result |
|---|------|----------|--------|
| 4.1 | Logo click | Returns to Analyzer page | |
| 4.2 | Analyzer nav link | Shows analyzer, active state highlighted | |
| 4.3 | Methodology nav link | Shows methodology page, active state highlighted | |
| 4.4 | FAQ nav link | Shows FAQ page, active state highlighted | |
| 4.5 | Footer Analyzer link | Navigates to analyzer | |
| 4.6 | Footer Methodology link | Navigates to methodology | |
| 4.7 | Footer FAQ link | Navigates to FAQ | |
| 4.8 | Browser back button | Returns to previous page correctly | |
| 4.9 | Direct URL `#methodology` | Methodology page loads directly | |
| 4.10 | Direct URL `#faq` | FAQ page loads directly | |

---

## 5. Methodology Page

| # | Test | Expected | Result |
|---|------|----------|--------|
| 5.1 | All 8 signals listed | Each has what/why/limitation | |
| 5.2 | Weight table visible | 8 rows, delta values shown | |
| 5.3 | Confidence levels explained | High/moderate/low with descriptions | |
| 5.4 | Limitations section | Amber warning box + 6 limitation points | |
| 5.5 | Privacy section | Text (browser-only) vs Website (Worker) clearly explained | |
| 5.6 | "Try the analyzer" button | Navigates to analyzer | |

---

## 6. FAQ Page

| # | Test | Expected | Result |
|---|------|----------|--------|
| 6.1 | All 8 questions listed | Expandable, content visible on click | |
| 6.2 | No false certainty language | No "proves AI authorship" claims anywhere | |
| 6.3 | "Try the analyzer" button | Navigates to analyzer | |
| 6.4 | "Read the methodology" button | Navigates to methodology | |

---

## 7. Responsive — Mobile (320–430px)

| # | Test | Expected | Result |
|---|------|----------|--------|
| 7.1 | Header — 320px | Logo + theme toggle visible, nav links hidden | |
| 7.2 | Analyzer card — 375px | Full width, textarea usable | |
| 7.3 | Stats bar — 375px | 3-column grid, no overflow | |
| 7.4 | Results — 375px | Score ring centered, stats grid 2-column | |
| 7.5 | Signal cards — 375px | Expandable, text doesn't overflow | |
| 7.6 | Action buttons — 375px | Stack vertically, full width each | |
| 7.7 | Methodology page — 375px | Weight table scrolls horizontally | |
| 7.8 | FAQ page — 375px | Questions wrap, answers readable | |

---

## 8. Responsive — Desktop (1280–1920px)

| # | Test | Expected | Result |
|---|------|----------|--------|
| 8.1 | Max content width respected | No content stretches beyond max-w | |
| 8.2 | Action buttons — desktop | Side by side in a row | |
| 8.3 | Methodology page — desktop | Two-column privacy grid visible | |
| 8.4 | HowItWorks — desktop | 4-column grid | |

---

## 9. Theme

| # | Test | Expected | Result |
|---|------|----------|--------|
| 9.1 | First visit | Light mode by default | |
| 9.2 | Toggle dark mode | Switches to dark, persists on refresh | |
| 9.3 | Toggle back to light | Switches, persists on refresh | |
| 9.4 | Dark mode — analyzer card | White → slate-900 bg, correct borders | |
| 9.5 | Dark mode — results | All cards use slate palette | |
| 9.6 | Dark mode — signal levels | Red/amber/green colors visible | |
| 9.7 | Dark mode — methodology | All sections readable | |
| 9.8 | PDF in dark mode | Report always white regardless of theme | |
| 9.9 | No purple anywhere | Blue-600 is the only accent color | |

---

## 10. Accessibility

| # | Test | Expected | Result |
|---|------|----------|--------|
| 10.1 | Score card aria-label | Screen reader reads "AI-likelihood estimate: X percent. Label. Confidence." | |
| 10.2 | Tab navigation | All interactive elements reachable by keyboard | |
| 10.3 | Analyze button focus | Visible focus ring (blue) | |
| 10.4 | Error state | role="alert", announced by screen reader | |
| 10.5 | Loading progress | aria-live="polite", steps announced | |
| 10.6 | Signal cards | aria-expanded toggles correctly | |
| 10.7 | Nav links | aria-current="page" on active route | |
| 10.8 | Dark/light toggle | aria-label describes current state | |

---

## 11. Error States

| # | Test | Expected | Result |
|---|------|----------|--------|
| 11.1 | No CORS/502/fetch errors visible | Only human-readable messages | |
| 11.2 | Retryable errors show "Try again" | Non-retryable errors do not | |
| 11.3 | Worker unavailable | "Website analysis is unavailable" | |
| 11.4 | Network offline — text analysis | Works normally (no network needed) | |
| 11.5 | Network offline — website analysis | Clear error, no crash | |

---

## 12. Performance

| # | Test | Expected | Result |
|---|------|----------|--------|
| 12.1 | Initial page load | Fast, no layout shift | |
| 12.2 | Text analysis speed | Results appear within ~200ms | |
| 12.3 | No console errors | Browser console clean on fresh load | |
| 12.4 | No console errors after analysis | Browser console clean after full flow | |
| 12.5 | Bundle size acceptable | JS < 400KB gzip, CSS < 15KB gzip | |

---

## 13. Security (Worker)

| # | Test | Expected | Result |
|---|------|----------|--------|
| 13.1 | `http://localhost` | Rejected: "URL not allowed" | |
| 13.2 | `https://192.168.1.1` | Rejected: "URL not allowed" | |
| 13.3 | `https://169.254.169.254` | Rejected: "URL not allowed" | |
| 13.4 | `https://metadata.google.internal` | Rejected: "URL not allowed" | |
| 13.5 | URL > 2048 chars | Rejected: "URL exceeds maximum allowed length" | |
| 13.6 | Non-HTTPS URL | Rejected client-side before reaching worker | |
| 13.7 | HTTP response headers | Cache-Control: no-store, X-Content-Type-Options: nosniff | |
| 13.8 | Worker error messages | No raw status text, no stack traces in response | |

---

## Sign-off

| Item | Status |
|------|--------|
| All critical tests pass (sections 1–4) | |
| No console errors on any route | |
| No false certainty language anywhere | |
| PDF produces selectable text | |
| Dark mode consistent throughout | |
| Responsive at 375px and 1280px | |

**QA completed by:** _______________  
**Date:** _______________  
**Build/commit:** _______________
