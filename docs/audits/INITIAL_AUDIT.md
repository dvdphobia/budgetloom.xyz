# BudgetLoom — Initial Repository & Production Audit (`INITIAL_AUDIT.md`)

**Audit Date:** 2026-10-14  
**Repository:** `https://github.com/dvdphobia/budgetloom.xyz`  
**Audited Baseline Commit:** `1d9d37c10713d6ddc37753809fd808d8954271e8` (`master` following PR #3 merge and subsequent PostgreSQL SSL commit)  
**Production Domain:** `https://budgetloom.xyz`  
**Recovery Reference Tag:** `recovery-baseline-1d9d37c`  
**Implementation Branch:** `feat/budgetloom-complete-rebuild`

---

## 1. Executive Summary of Production Failure & Repository State

Following the merge of PR #3 (`feat/budgetloom-growth-foundation-20261012`) and the subsequent PostgreSQL SSL adjustment into `master`, the repository contains a combination of critical runtime defects (P0), broken authentication/admin flows (P0/P1), stale binary PDF assets in version control (P1), build/lint configuration incompatibilities (P1), and incomplete architecture/content/tool features (P2/P3).

Most critically, **all database-backed public routes** (`/`, `/blog`, `/blog/[slug]`, `/blog/[slug]/opengraph-image`, and `/sitemap.xml`) are vulnerable to complete HTTP 500 outages in production whenever `POSTGRES_URL` (or an equivalent database URL environment variable) is present, while static routes that do not call `getVisiblePosts()` (such as `/about`) continue to render. Specifically:

1. **Unmigrated `posts.archived` Column (`42703` `undefined_column`) & Unhandled Database Exceptions (`lib/content.ts`):** PR #3 updated `getVisiblePosts()` and `getVisiblePost(slug)` to `SELECT ..., archived, updated_at FROM posts`, but only caught PostgreSQL error `42P01` (`undefined_table`) and re-threw all other errors (`throw error`). On an existing database created before PR #3 where `posts` lacks the `archived` column (or when the database connection times out, fails TLS negotiation, or is temporarily unreachable), `lib/content.ts` throws an unhandled exception that crashes `/`, `/blog`, `/blog/[slug]`, and `/sitemap.xml` with HTTP 500.
2. **PostgreSQL SSL Parameter Clobbering & Missing Pool Error Handler (`lib/db.ts`):** `lib/db.ts` mutates `sslmode` on the `connectionString` URL and passes both `connectionString` and `ssl: { rejectUnauthorized: true }` to `new Pool(...)`. In `node-postgres` (`pg` v8.22.0), `pg-connection-string` parses `connectionString` and overwrites the `Pool` config's `ssl` object whenever `sslmode` or `ssl` query parameters are present in the URL. Furthermore, `pool` is not attached to `globalThis` across serverless warm invocations and registers **no `pool.on('error', ...)` listener**, causing idle client disconnects (common on serverless Neon/Vercel Postgres scale-to-zero) to emit an unhandled `'error'` event and crash the Node.js runtime.
3. **Broken Admin Session Check Redirect Loop (`app/admin/dashboard/layout.tsx` & `app/api/admin/auth/route.ts`):** After a user logs in at `/admin/login`, `DashboardLayout` checks authentication by sending `POST /api/admin/auth` with an empty JSON body `{}`. However, `POST /api/admin/auth` validates `typeof username === 'string' && typeof password === 'string'` and always returns `401 Unauthorized` for `{}`—immediately redirecting every authenticated administrator back to `/admin/login`.

---

## 2. Prioritized Defect Register (P0 → P3)

### F-01 [P0] — Unhandled PostgreSQL `42703` (`undefined_column`) and Connection Errors Crash Public Pages & Sitemap
- **Severity:** P0 (Production Availability / Data Integrity)
- **Exact Affected Files:**
  - `lib/content.ts` (lines 42–81)
  - `app/page.tsx` (line 18)
  - `app/blog/page.tsx` (line 26)
  - `app/blog/[slug]/page.tsx` (lines 25, 118, 121)
  - `app/blog/[slug]/opengraph-image.tsx` (line 9)
  - `app/sitemap.ts` (line 8)
- **Root Cause & Evidence:**
  - Prior to PR #3, `initDB()` created `posts` with columns `(id, slug, title, description, date, category, read_time, content, published, created_at, updated_at)`.
  - PR #3 added `archived` to the `SELECT` queries in `getVisiblePosts()` and `getVisiblePost(slug)`:
    `SELECT slug, title, description, date, category, read_time, content, published, archived, updated_at FROM posts`
  - `lib/content.ts` only checks `tableNotYetCreated(error)` (`error.code === '42P01'`) and executes `throw error` for every other database error.
  - Unless an authenticated admin manually triggers `POST /api/admin/init` after deploy, an existing production database does not have `posts.archived`, raising PostgreSQL error `42703` (`column "archived" does not exist`). Similarly, any transient connection or SSL failure throws an unhandled exception.
- **Reproduction Steps:**
  1. Connect the app to a PostgreSQL database initialized with the pre-PR #3 `posts` table (without `archived`) or a database experiencing a connection/SSL error.
  2. Request `GET /`, `GET /blog`, `GET /blog/how-to-make-a-monthly-budget`, or `GET /sitemap.xml`.
  3. Observe an unhandled server exception (HTTP 500), while `GET /about` (which does not call `getVisiblePosts()`) returns HTTP 200.
- **User Impact:** Complete failure of the homepage, blog index, all individual blog guides, dynamic Open Graph images, and XML sitemap.
- **Security Impact:** Unhandled exceptions risk exposing stack traces or error digests in serverless logs.
- **SEO Impact:** Critical (`GET /sitemap.xml` and all canonical article URLs return 5xx to Googlebot and Bingbot, risking de-indexing).
- **Proposed Correction:**
  1. Implement an automatic, idempotent schema migration runner (`ensureSchema()`) in `lib/db.ts` that safely adds missing columns (`archived`, `status`, `topic_cluster`, `seo_title`, `excerpt`, `author`, `reviewer`, `featured_image`, `featured_image_alt`, `sources`, `related_slugs`, `related_tools`, `related_printables`, `canonical_url`, `scheduled_for`, etc.) before querying or automatically falls back to a legacy column projection if `42703` occurs on a read-only replica.
  2. In `lib/content.ts`, log database errors via structured logging (`lib/logger.ts`) and gracefully fall back to `staticPosts` when the database is unreachable or unmigrated, while still honoring explicit `published = false` or `archived = true` overrides whenever the database is reachable.
- **Verification Method:** Unit and integration tests simulating (a) unconfigured DB, (b) `42P01` missing table, (c) `42703` missing `archived` column, (d) connection timeout, and (e) published/draft/archived row overrides.

---

### F-02 [P0] — PostgreSQL SSL Configuration Conflict, `pg-connection-string` Warning, and Unhandled Pool `error` Event
- **Severity:** P0 (Production Availability / Security)
- **Exact Affected Files:**
  - `lib/db.ts` (lines 5–52)
- **Root Cause & Evidence:**
  - `pg-connection-string` (bundled with `pg` v8.22.0) emits:
    `SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.`
  - `lib/db.ts` attempts to rewrite `sslmode` to `verify-full` on `new URL(connectionString)` and passes both `connectionString: url.toString()` and `ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined` to `new Pool(...)`.
  - In `node-postgres`, `ConnectionParameters` parses `connectionString` via `pg-connection-string`. If `sslmode` or `ssl` is present in the URL query string, `pg-connection-string` overwrites the `ssl` object passed to `new Pool(...)`. Conversely, if `uselibpqcompat` is not set or if a provider passes custom query params (`channel_binding=require`, `sslmode=require`), connection behavior differs across environments.
  - Furthermore, `pool` has **no `pool.on('error', ...)` event listener**. When serverless PostgreSQL (Neon / Vercel Postgres) closes an idle pooled connection, `pg.Pool` emits an unhandled `'error'` event on the pool instance, crashing the Node.js process.
  - Additionally, `pool` is stored in a module-level variable (`let pool: Pool | null = null`) rather than cached on `globalThis`, risking connection pool exhaustion during hot reloads or concurrent serverless warm reuses.
- **Reproduction Steps:**
  1. Pass a standard Neon/Vercel Postgres URL (`postgres://user:pass@host/db?sslmode=require`) to `lib/db.ts`.
  2. Emit an `'error'` event on an idle client in `pool` (simulating Neon idle connection termination).
  3. Observe an uncaught exception crashing the Node.js process.
- **User Impact:** Intermittent 500 errors and cold-start crashes on serverless functions.
- **Security Impact:** Potential TLS misconfiguration if `ssl` options are silently overwritten by URL parameters; potential credential leakage if `url.toString()` is ever included in error messages.
- **SEO Impact:** Intermittent 5xx responses during crawler visits.
- **Proposed Correction:**
  1. Parse and validate the connection URL safely without ever logging credentials.
  2. Reject insecure SSL modes (`disable`, `allow`, `no-verify`, `ssl=0`, `ssl=false`) in production.
  3. Normalize TLS configuration so certificate chain validation (`rejectUnauthorized: true`), minimum TLS version (`TLSv1.2`), and hostname verification (`servername: url.hostname`) are strictly enforced in production, and set `uselibpqcompat=true&sslmode=verify-full` (or strip conflicting query params after normalizing into the explicit `ssl` config object) so `pg-connection-string` never emits a deprecation warning or clobbers `ssl`.
  4. Attach a structured `pool.on('error', ...)` handler and cache the pool singleton on `globalThis`.
- **Verification Method:** Automated unit tests in `tests/db-ssl.test.mjs` verifying URL parsing, rejection of insecure SSL modes, preservation of `rejectUnauthorized: true` and `servername`, absence of `process.emitWarning` SSL warnings, and safe handling of idle pool `'error'` events.

---

### F-03 [P0] — Admin Dashboard Layout Authentication Check Always Returns 401 and Loops to `/admin/login`
- **Severity:** P0 (Functionality / CMS Administration)
- **Exact Affected Files:**
  - `app/admin/dashboard/layout.tsx` (lines 23–27)
  - `app/api/admin/auth/route.ts` (lines 6–34)
  - `app/admin/login/page.tsx` (line 89)
- **Root Cause & Evidence:**
  - `app/admin/dashboard/layout.tsx` runs:
    ```ts
    fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(res => setAuthed(res.status !== 401 ? true : false))
    ```
  - `app/api/admin/auth/route.ts` only implements `POST` (login expecting `{ username, password }`) and `DELETE` (logout). When `POST /api/admin/auth` receives `{}` from `DashboardLayout`, `typeof username !== 'string'` is true, so it immediately returns `401 Invalid credentials`.
  - `DashboardLayout` receives `401`, sets `authed = false`, and executes `router.push('/admin/login')`.
  - Additionally, if `POST /api/admin/auth` returned `503` (e.g., database error), `res.status !== 401` evaluated to `true`, erroneously treating a 503 failure as authenticated on the client!
  - Furthermore, `app/admin/login/page.tsx` line 89 still displays `"Default: admin / admin123 — change after first login"`, contradicting `app/api/admin/auth/route.ts` which explicitly blocks `admin / admin123`.
- **Reproduction Steps:**
  1. Sign in at `/admin/login` with valid admin credentials; receive a valid `admin_token` cookie.
  2. Navigate to `/admin/dashboard`.
  3. `DashboardLayout` sends `POST /api/admin/auth` with `{}` → receives `401` → redirects the user back to `/admin/login`.
- **User Impact:** The entire CMS admin dashboard is completely unusable after login.
- **Security Impact:** Misleading default credential hint on login screen; `res.status !== 401` logic flaw treats 500/503 responses as truthy client auth state.
- **SEO Impact:** None directly, though it blocks CMS content operations.
- **Proposed Correction:**
  1. Add a dedicated `GET /api/admin/auth` endpoint in `app/api/admin/auth/route.ts` that verifies the `admin_token` JWT cookie via `verifyToken(request)` and returns `{ authenticated: true, username }` with HTTP 200 (or `401` when invalid).
  2. Update `app/admin/dashboard/layout.tsx` to call `GET /api/admin/auth` and check `res.ok` (`res.status === 200`).
  3. Remove the obsolete `admin / admin123` hint from `app/admin/login/page.tsx`.
- **Verification Method:** Integration test verifying `POST /api/admin/auth` login → `GET /api/admin/auth` session check (`200 OK`) → `DELETE /api/admin/auth` logout → `GET /api/admin/auth` (`401`).

---

### F-04 [P1] — Raw Database Error Messages Leaked in Admin API Responses & Missing Rate Limiting / Security Headers
- **Severity:** P1 (Application Security)
- **Exact Affected Files:**
  - `app/api/admin/printables/route.ts` (lines 11, 33)
  - `app/api/admin/printables/[id]/route.ts` (lines 13, 34, 46)
  - `app/api/admin/seed/route.ts` (line 39)
  - `app/api/admin/settings/route.ts` (lines 15, 31)
  - `app/api/admin/auth/route.ts`
  - `next.config.js`
- **Root Cause & Evidence:**
  - Multiple API routes return `NextResponse.json({ error: error.message }, { status: 500 })`, exposing raw PostgreSQL error strings, table names, constraint names, or connection details.
  - `app/api/admin/auth/route.ts` has no application-layer brute-force rate limiting or lockout tracking.
  - `next.config.js` defines no HTTP security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`).
  - `app/api/admin/posts/[id]/route.ts` queries `WHERE id = $1 AND archived = false` without handling missing `archived` column if `initDB()` was not re-run.
- **Reproduction Steps:**
  1. Trigger a database error on `/api/admin/printables` or `/api/admin/settings`.
  2. Inspect the JSON response body and observe raw `error.message` output.
- **User Impact:** Inconsistent error states in admin UI.
- **Security Impact:** Information disclosure of database internals (CWE-209), brute-force login exposure (CWE-307), and missing browser defense-in-depth headers.
- **SEO Impact:** None.
- **Proposed Correction:**
  1. Replace all raw `error.message` responses with sanitized error messages and log full error details server-side via `lib/logger.ts`.
  2. Add sliding-window rate limiting and brute-force protection to `/api/admin/auth` and `/api/subscribe`.
  3. Configure strict HTTP security headers in `next.config.js` and `proxy.ts`.
  4. Record administrative mutations in an `audit_logs` table.
- **Verification Method:** Security unit/integration test suite verifying sanitized error responses, rate-limit `429` responses after threshold, CSRF origin rejection, and presence of security headers.

---

### F-05 [P1] — Stale Binary PDFs Committed in `public/printables/*.pdf` Have Wrong Page Counts & Sums
- **Severity:** P1 (Functionality / Product Integrity)
- **Exact Affected Files:**
  - `public/printables/budget-starter-bundle.pdf` (3 pages in Git vs. 12 pages claimed)
  - `public/printables/30-day-savings-challenge.pdf` (1 page in Git vs. 6 pages claimed; daily amounts $5+$10+... do not equal $500)
  - `public/printables/meal-planner-budget-kit.pdf` (2 pages in Git vs. 8 pages claimed)
  - `public/printables/debt-payoff-planner.pdf` (1 page in Git vs. 10 pages claimed)
  - `scripts/generate-printables.mjs`
  - `lib/printables.ts`
- **Root Cause & Evidence:**
  - Inspecting the committed PDFs in `public/printables/` via `pypdf` revealed that the files committed in Git were never updated when `scripts/generate-printables.mjs` was added (documented in `BUDGETLOOM_IMPLEMENTATION_REPORT.md`: *"Older binary PDFs in Git are superseded during the build, not replaced in this PR"*).
  - Furthermore, the printables library only contains 4 items, uses a generic SVG placeholder (`<PrintablePreview />` and `<CardCover variant="printable" />`) instead of genuine rendered page previews, and lacks individual worksheets for weekly budgeting, paycheck budgeting, zero-based budgeting, annual overview, expense tracking, bill tracking, subscription tracking, sinking funds, 52-week savings, emergency funds, debt snowball/avalanche, grocery/pantry, no-spend challenges, family/student/holiday/vacation budgets, and finance binder covers.
- **Reproduction Steps:**
  1. Inspect `public/printables/*.pdf` from the repository checkout with `pypdf.PdfReader`.
  2. Observe page counts of 3, 1, 2, and 1 instead of 12, 6, 8, and 10.
- **User Impact:** Users downloading PDFs from static/CDN paths if `prebuild` is skipped receive incomplete 1–3 page files; users browsing `/printables` see identical generic SVG mockups instead of real page previews.
- **Security Impact:** None.
- **SEO Impact:** High bounce rate and poor user trust on printable landing pages.
- **Proposed Correction:**
  1. Expand the printables catalog in `lib/printables.ts` and `scripts/generate-printables.mjs` to a comprehensive library (16+ distinct, multi-page, high-utility PDFs including the 4 core bundles and dedicated single/multi-page planners).
  2. Generate and commit all verified PDFs into `public/printables/*.pdf` AND render real PNG page previews into `public/printables/previews/*.png`.
  3. Verify mathematically that the $100, $300, and $500 30-day savings challenges sum to exactly $100, $300, and $500, and the 52-week challenge sums to its exact target.
- **Verification Method:** Automated test script parsing every generated PDF with `pypdf` and verifying exact page counts, non-empty text streams, exact savings challenge sums, and corresponding preview PNG images.

---

### F-06 [P1] — Build & Lint Configuration Mismatch (`next lint` in Next.js 16, Unwrapped `useSearchParams()`, Duplicate UI Directories)
- **Severity:** P1 (DevOps / Build Reliability)
- **Exact Affected Files:**
  - `package.json` (`"lint": "next lint"`, `eslint-config-next: "14.2.5"` with `next: "^16.2.10"`)
  - `app/admin/dashboard/posts/edit/page.tsx` (calls `useSearchParams()` without `<Suspense>`)
  - `app/admin/dashboard/printables/edit/page.tsx` (calls `useSearchParams()` without `<Suspense>`)
  - `app/admin/dashboard/page.tsx` (imports `@/components/ui/button` from duplicate root `components/ui/` instead of `@/app/components/ui/button`)
- **Root Cause & Evidence:**
  - Next.js 16 deprecated/removed `next lint` CLI subcommand in favor of running `eslint` directly, and `eslint-config-next@14.2.5` mismatches React 18 / Next 16.
  - In Next.js App Router, client components calling `useSearchParams()` during static generation without a `<Suspense>` boundary cause `next build` prerender errors.
  - Two separate UI component directories exist: `components/ui/` (using `@base-ui/react`) and `app/components/ui/` (using `@radix-ui/*`), creating inconsistent styling and bundle bloat.
- **Reproduction Steps:**
  1. Inspect `app/admin/dashboard/posts/edit/page.tsx` and `app/admin/dashboard/printables/edit/page.tsx`.
  2. Observe `const params = useSearchParams()` directly in the page component with no `<Suspense>` wrapper.
- **User Impact:** Potential build failures on Vercel or broken hydration in admin edit screens.
- **Security Impact:** Dependency version drift.
- **SEO Impact:** Failed builds block deployment of SEO fixes.
- **Proposed Correction:**
  1. Wrap `useSearchParams()` consumers in `<Suspense>` boundaries.
  2. Standardize component imports on `@/app/components/ui/*` and keep `components/ui/*` clean/compatible.
  3. Add a reliable lint/typecheck/test script pipeline (`npm test`, `npm run lint`, `npm run verify`) in `package.json` and `.github/workflows/ci.yml`.
- **Verification Method:** Run automated verification and test suites cleanly with zero errors.

---

### F-07 [P1] — Fake Affiliate ASIN (`B0EXAMPLE4`), Repetitive Affiliate Link Injection, Corrupted UTF-8 Character, and Unconfigured Newsletter 500 Error
- **Severity:** P1 (Content Integrity / Monetization / UX)
- **Exact Affected Files:**
  - `lib/config.ts` (lines 11–12: `REPLACE_WITH_ADSTERRA_NATIVE_KEY`, line 33: `asin: "B0EXAMPLE4"`)
  - `app/blog/[slug]/page.tsx` (lines 93–101: repetitive inline affiliate link injection on every paragraph matching `'envelope'`, `'meal prep'`, or `'planner notebook'`; lines 252–256: generic boilerplate FAQ on every post)
  - `app/free-budget-template/page.tsx` (line 26: corrupted UTF-8 replacement characters `\ufffd\ufffd\ufffd` in `See the complete printable bundle `)
  - `app/components/EmailForm.tsx` & `app/api/subscribe/route.ts` (duplicate `id="email-input"`, trailing slash `/api/subscribe/`, and HTTP 500 error when `MAILERLITE_API_KEY` is unconfigured)
- **Root Cause & Evidence:**
  - `lib/config.ts` contains `asin: "B0EXAMPLE4"` which points to a dead `https://www.amazon.com/dp/B0EXAMPLE4/?tag=budgetloom20-20` URL.
  - `app/blog/[slug]/page.tsx` appends an Amazon link to *every* paragraph containing the substring `"envelope"`, `"meal prep"`, or `"planner notebook"`, resulting in spammy, repetitive affiliate links in relevant articles.
  - `app/free-budget-template/page.tsx` has corrupted bytes (`\xef\xbf\xbd\xef\xbf\xbd\xef\xbf\xbd`) instead of `→`.
  - When `MAILERLITE_API_KEY` is not set in local/staging/production environments, `/api/subscribe` returns HTTP 500 `"Email service not configured"` rather than storing the subscription request safely in the database (`newsletter_subscribers` table) or degrading gracefully.
- **Reproduction Steps:**
  1. View `/free-budget-template` bottom links and observe ``.
  2. View `/blog/cash-envelope-categories` and observe repeated `— see envelope systems on Amazon.` appended to multiple paragraphs.
  3. Submit an email in `EmailForm` without `MAILERLITE_API_KEY` set and observe a 500 failure.
- **User Impact:** Broken characters, repetitive affiliate links, and failing newsletter form when MailerLite env vars are absent.
- **Security Impact:** None.
- **SEO Impact:** Repetitive affiliate link injection and generic boilerplate FAQs harm editorial quality signals (Google Helpful Content / spam policies).
- **Proposed Correction:**
  1. Remove `B0EXAMPLE4` and `REPLACE_WITH_*` placeholders from `lib/config.ts`; use only verified products with transparent disclosures.
  2. Remove automatic paragraph-level keyword-stuffing affiliate injection from `app/blog/[slug]/page.tsx`; keep affiliate recommendations to a single clearly disclosed, contextually relevant callout where appropriate, and replace generic 3-question boilerplate FAQs with article-specific FAQs or omit when not needed.
  3. Fix the corrupted arrow character in `app/free-budget-template/page.tsx`.
  4. Use `useId()` in `EmailForm.tsx`, call `/api/subscribe` without trailing slash, validate email format + honeypot spam protection, and support database-backed subscriber storage/fallback when `MAILERLITE_API_KEY` is not configured, while never falsely claiming an email was sent if MailerLite is unconfigured.
- **Verification Method:** Automated content/link audit and unit tests for `/api/subscribe`.

---

### F-08 [P2] — Missing Information Architecture Routes (`/topics`, `/topics/[slug]`, `/tools`, and 12+ Missing Financial Calculators)
- **Severity:** P2 (Information Architecture / Product Completeness / SEO)
- **Exact Affected Files:**
  - `app/topics/page.tsx` (missing)
  - `app/topics/[slug]/page.tsx` (missing)
  - `app/tools/page.tsx` (missing)
  - `app/tools/[slug]/page.tsx` (only 2 tools under `/tools/*` plus `/budget-calculator`; missing 12 calculators required for the 15-tool library)
- **Root Cause & Evidence:**
  - Currently only 3 calculators exist (`/budget-calculator`, `/tools/savings-goal-calculator`, `/tools/savings-challenge-generator`). There is no `/tools` directory page and no `/topics` or `/topics/[slug]` hub pages.
  - Floating-point math (`Number(n)`) is used in `BudgetCalculator.tsx` and `SavingsGoalCalculator.tsx`, which can produce IEEE-754 rounding artifacts (e.g., `0.1 + 0.2 = 0.30000000000000004`) when adding fractional cents.
- **Proposed Correction:**
  1. Build a deterministic, cent-accurate financial math library (`lib/calculators.ts`) using integer cents (`Math.round(amount * 100)`) and comprehensive validation for all 15 calculators:
     - Monthly Budget Calculator (`/budget-calculator` & `/tools/monthly-budget-calculator`)
     - Zero-Based Budget Calculator (`/tools/zero-based-budget-calculator`)
     - 50/30/20 Budget Calculator (`/tools/50-30-20-budget-calculator`)
     - Paycheck Budget Planner (`/tools/paycheck-budget-planner`)
     - Biweekly Budget Calculator (`/tools/biweekly-budget-calculator`)
     - Savings Goal Calculator (`/tools/savings-goal-calculator`)
     - Sinking Fund Calculator (`/tools/sinking-fund-calculator`)
     - Emergency Fund Calculator (`/tools/emergency-fund-calculator`)
     - Debt Snowball Calculator (`/tools/debt-snowball-calculator`)
     - Debt Avalanche Calculator (`/tools/debt-avalanche-calculator`)
     - Bill & Subscription Tracker (`/tools/bill-and-subscription-tracker`)
     - Grocery Budget Calculator (`/tools/grocery-budget-calculator`)
     - 30-Day Savings Challenge Generator (`/tools/savings-challenge-generator`)
     - Expense Tracker & CSV Exporter (`/tools/expense-tracker`)
     - Household Expense Splitting Calculator (`/tools/expense-split-calculator`)
  2. Create `/tools` directory page and `/topics` + `/topics/[slug]` topic hub pages connecting all 13 content clusters to their matching guides, calculators, and printables.
- **Verification Method:** Mathematical unit test suite (`tests/calculators.test.mjs`) covering all 15 calculators, boundary conditions, zero-interest, non-amortizing debt payments, and cent rounding.

---

### F-09 [P2] — Content Backlog & Editorial Architecture Needs Unification and Expansion
- **Severity:** P2 (Content Strategy / CMS / SEO)
- **Exact Affected Files:**
  - `lib/posts.ts`, `lib/content.ts`, `content/seo-backlog.json`
- **Root Cause & Evidence:**
  - `lib/posts.ts` has 28 static posts (23 prior + 5 from `content/seo-backlog.json`), but `Post` lacks structured fields for `topicCluster`, `seoTitle`, `excerpt`, `author`, `updatedAt`, `sources`, `relatedSlugs`, `relatedTools`, `relatedPrintables`, `faqs`, and `status`.
  - Several static posts (e.g., `budget-meal-plan-for-one`, `how-to-build-a-budget-when-broke`, `30-day-money-saving-challenge`) lack worked tables, methodology disclosures, or cross-links to the new calculators and topic hubs.
  - 125 items in `content/seo-backlog.json` remain in `"idea"` status across the 13 clusters.
- **Proposed Correction:**
  1. Enrich the unified content model in `lib/posts.ts` and `lib/content.ts` with full lifecycle statuses (`draft`, `in_review`, `approved`, `scheduled`, `published`, `archived`, `updated`), cluster mapping, related tools/printables/articles, references, and article-specific FAQs.
  2. Write and publish a substantial wave of original, deeply researched, mathematically verified guides from `content/seo-backlog.json` so every single one of the 13 topic clusters has multiple comprehensive, published guides with worked examples, while accurately tracking exact counts of published vs. draft/backlog items in `content/seo-backlog.json` and `docs/seo/CONTENT_BACKLOG.md`.
- **Verification Method:** Content integrity test verifying unique slugs/titles/descriptions, valid internal links, mathematical accuracy of worked examples, and exact backlog status counts.

---

### F-10 [P3] — UI/UX Cohesion, Search/Filtering on `/blog` and `/printables`, and Accessibility Refinements
- **Severity:** P3 (UI/UX / Accessibility)
- **Exact Affected Files:**
  - `app/globals.css`, `app/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/printables/page.tsx`, `app/printables/[slug]/page.tsx`, `app/components/Header.tsx`, `app/components/Footer.tsx`
- **Root Cause & Evidence:**
  - `/blog` has no search bar or interactive filter; it renders all categories stacked vertically with anchor jumps.
  - `/printables` has only 4 cards with identical SVG covers and no category filter or real page previews.
  - `Header.tsx` only links to `Guides`, `Calculator`, `Printables`, `About`—omitting `Topics` and the full `Calculators` (`/tools`) directory.
  - Markdown rendering in `app/blog/[slug]/page.tsx` (`parseContent`) does not support Markdown tables (`| col | col |`), bold/italic/code/links inside paragraphs or list items, or callout blocks! Any Markdown table or inline formatting in a post is rendered as raw unparsed text!
- **Reproduction Steps:**
  1. Add a Markdown table or `**bold**` or `[link](/url)` inside a post in `lib/posts.ts`.
  2. View `/blog/[slug]` and observe raw `**bold**`, `[link](/url)`, and pipe `|` characters rendered literally in `<p>` tags.
- **User Impact:** Poor readability when articles use bold text, inline links, or comparison tables; difficulty finding guides or tools as the library grows.
- **Proposed Correction:**
  1. Upgrade the Markdown parser in `app/blog/[slug]/page.tsx` to cleanly render Markdown tables, inline bold/italic/code, safe internal/external links, blockquotes, and step callouts.
  2. Redesign the homepage, navigation, blog index (with live search, cluster/category filtering, reading times, and featured guides), printables marketplace (with real rendered page previews, category filtering, printing instructions, and related tools), topic hubs, and calculator pages.
- **Verification Method:** Automated DOM/rendering tests and multi-viewport visual inspections (360px, 390px, 768px, 1024px, 1440px).
