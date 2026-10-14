# BudgetLoom — Quality Assurance & Automated Test Results (`TEST_RESULTS.md`)

**Test Execution Date:** 2026-10-14  
**Environment:** Linux VM Sandbox (Node.js `v18.20.4`, Python `3.11.2`, Headless Chromium + Selenium, `pypdf`, `pypdfium2`)

---

## 1. Executed Verification Commands & Pass/Fail Summary

| Suite / Command | Scope | Result | Details |
|---|---|---|---|
| `node scripts/generate-printables.mjs` | Deterministic generation of all 20 printable PDF workbooks | **PASS** | Generated 20 PDFs (99 total pages) in `public/printables/*.pdf` |
| `python3 scripts/render_and_verify_printables.py` | Page count verification, challenge sum math, and PNG preview rendering | **PASS** | Verified all 20 PDF page counts, verified 30-day ($100, $300, $500) & 52-week ($1,378, $1,000) exact sums, rendered 40 PNG previews |
| `NODE_PATH=/usr/share/nodejs node --test tests/budgetloom.test.mjs` | Full TS/TSX compilation, 15-calculator math, SSL/DB config, security/auth, logger PII redaction, and internal link crawler | **PASS (10/10)** | 10 subtests passed, 0 failed |
| `python3 scripts/visual_qa_screenshots.py` | Multi-viewport Headless Chromium visual & responsive overflow QA (`360px`, `390px`, `768px`, `1024px`, `1440px`) | **PASS (5/5)** | Verified `scrollWidth <= clientWidth` across all 5 viewports and saved screenshots |

---

## 2. Detailed Breakdown of Automated Test Suites (`tests/budgetloom.test.mjs`)

1. **Suite 1 — Full Repository TypeScript & JSX Compilation (`PASS`):**
   - Parsed and compiled every `.ts` and `.tsx` file across `lib/`, `app/`, and `components/` using `@babel/core` (`@babel/preset-typescript` + `@babel/preset-react`). Caught and fixed an unescaped backtick inside `lib/posts.ts` and verified 100% clean compilation.
2. **Suite 2 — Cent-Accurate Currency Conversion & Boundary Handling (`PASS`):**
   - Verified `toCents('0.10') + toCents('0.20') === 30` (`$0.30` exact), negative input clamping (`toCents('-500') === 0`), `NaN` handling, and `$10,000,000` upper-bound clamping.
3. **Suite 3 — Monthly & Zero-Based Budget Calculator (`PASS`):**
   - Verified `calculateMonthlyBudget` planned vs. actual totals, `isZeroBasedBalanced` when `Remaining === $0.00`, and `Needs / Wants / Savings` percentage shares.
4. **Suite 4 — 50/30/20 & Custom Percentage Split Calculator (`PASS`):**
   - Verified exact-cent reconciliation on fractional incomes (`$3,333.33` split 50/30/20 sums back to `333,333` cents) and rejection of percentage splits not summing to `100%`.
5. **Suite 5 — Biweekly 26-Paycheck & 3-Paycheck Month Calculator (`PASS`):**
   - Verified 26-paycheck annual income, 50% per-paycheck bill reserves, and third-paycheck net surplus calculation.
6. **Suite 6 — Savings Goal, Sinking Fund & Emergency Fund Calculators (`PASS`):**
   - Verified simple monthly deposits, compound APY monthly deposits, multi-fund sinking fund aggregation, and 1/3/6-month emergency fund timelines.
7. **Suite 7 — Debt Snowball vs. Debt Avalanche & Non-Amortizing Scenarios (`PASS`):**
   - Verified that `avalanche` prioritizes highest APR first and minimizes total interest paid compared to `snowball` (which prioritizes smallest balance first).
   - Verified that non-amortizing payment scenarios (where total monthly payment is less than or equal to first-month interest accrual) are detected and flagged (`valid: false, nonAmortizing: true`).
8. **Suite 8 — 30-Day Challenge, Subscription Audit, Grocery & Household Split (`PASS`):**
   - Verified 30-day schedules sum to exact target cents (`$100`, `$300`, `$500`, `$750.25`), subscription audit annualization, and proportional vs. 50/50 partner bill splitting.
9. **Suite 9 — Structured Logger & PII Redaction (`PASS`):**
   - Verified `redactString` and `sanitizeMeta` scrub embedded PostgreSQL credentials (`postgres://user:pass@host` → `postgres://[REDACTED]@host`), email addresses, passwords, tokens, and income values.
10. **Suite 10 — Complete Content, Printables, Topic Clusters & Internal Link Crawler (`PASS`):**
    - Verified all 43 published posts, 13 topic hubs, 15 calculators, and 20 printable PDFs + 40 PNG previews exist and all internal Markdown and cross-resource links resolve without a single 404.


### Archive review corrections (October 14, 2026)

The original test runner assumed system-wide Babel at `/usr/share/nodejs`, which is
not portable to GitHub Actions. The runner now uses the declared `typescript`
devDependency and works from a clean `npm ci` environment. A separate structural
regression check verifies that migrations use a transactional advisory lock and
skip previously applied versions.

**Verification scope:** In a restricted execution environment, the patched test
runner passed using a globally installed TypeScript compiler exposed via
`NODE_PATH`. Full `npm ci`, Next.js typecheck and production build remain
unverified here because npm dependency downloads were not available.
