# BudgetLoom — Deployment & Operations Runbook (`DEPLOYMENT_RUNBOOK.md`)

**Target Platform:** Vercel (`budgetloom-xyz`) + Managed PostgreSQL (Vercel Postgres / Neon)  
**Default Branch:** `master`  
**Implementation Branch:** `feat/budgetloom-complete-rebuild`  
**Recovery Baseline Tag:** `recovery-baseline-1d9d37c`

---

## 1. Environment Variables Configuration

Configure the following environment variables in **Vercel → Project Settings → Environment Variables** (for `Production` and `Preview`):

| Variable | Required? | Purpose & Format |
|---|---|---|
| `POSTGRES_URL` | Optional (Recommended for CMS) | Pooled PostgreSQL connection URL (`postgres://user:pass@host/db?sslmode=verify-full`). Note: Public pages gracefully serve the static catalog if unset or during DB maintenance. |
| `JWT_SECRET` | Required for `/admin` | At least 32 cryptographically random characters (`openssl rand -hex 32`). |
| `ADMIN_SETUP_TOKEN` | One-Time Bootstrap Only | At least 32 random characters; remove immediately after provisioning the initial admin user. |
| `ADMIN_BOOTSTRAP_USERNAME` | One-Time Bootstrap Only | Admin username (`3–64` alphanumeric characters, e.g. `editor_admin`). |
| `ADMIN_BOOTSTRAP_PASSWORD` | One-Time Bootstrap Only | Strong password (minimum 16 characters); remove immediately after bootstrap. |
| `MAILERLITE_API_KEY` | Optional | MailerLite API v2 bearer token for syncing email signups. |
| `MAILERLITE_GROUP_ID` | Optional | Comma-separated MailerLite group ID(s). |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Optional | Approved AdSense publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`). No ads load if unset. |
| `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INTRO` | Optional | Numeric AdSense slot ID for top-of-article placement. |
| `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MIDDLE` | Optional | Numeric AdSense slot ID for mid-article placement. |
| `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_END` | Optional | Numeric AdSense slot ID for end-of-article placement. |

---

## 2. Controlled Staged Release Procedure

1. **Push Feature Branch & Open Pull Request:**
   ```bash
   git push -u origin feat/budgetloom-complete-rebuild
   ```
   Open a Pull Request against `master`. GitHub Actions (`.github/workflows/ci.yml`) will automatically run:
   - `npm ci`
   - `npm run generate:printables`
   - `npm test`
   - `npx tsc --noEmit`
   - `npm run build`
2. **Verify Vercel Preview Deployment:**
   - Test `/`, `/blog`, `/blog/how-to-fix-a-month-when-you-overspend-your-budget`, `/topics`, `/topics/budget-systems`, `/tools`, `/budget-calculator`, `/tools/debt-snowball-calculator`, `/printables`, `/printables/budget-starter-bundle`, `/printables/budget-starter-bundle.pdf`, `/sitemap.xml`, `/robots.txt`, and `/admin/login`.
3. **Run Idempotent Database Schema Migrations (`v3`):**
   - Log in at `/admin/login` and click **Run Schema Migrations** on `/admin/dashboard` (or send an authenticated `POST /api/admin/init`).
   - This safely applies Migrations `001`–`003` (`posts.archived`, `posts.status`, `posts.topic_cluster`, `audit_logs`, `slug_redirects`, `newsletter_subscribers`, `download_events`) without modifying or deleting existing rows.
   - Note: Even before `POST /api/admin/init` is triggered, `lib/content.ts` includes a 3-tier schema fallback so public pages never fail with `42703`.
4. **Promote to Production (`master`):**
   - Merge the PR into `master` once preview checks pass.
   - Run post-deploy smoke checks across all primary routes and submit updated sitemap URLs via `npm run indexnow`.

---

## 3. Rollback Plan

- **Application Code Rollback:** Revert to tag `recovery-baseline-1d9d37c` or promote the prior known working deployment in the Vercel Dashboard (**Deployments → Instant Rollback**).
- **Database Compatibility on Rollback:** All database schema changes in Migrations `001`–`003` are strictly additive (`CREATE TABLE IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS ... DEFAULT ...`). Rolling back application code requires zero destructive database changes.


## Review corrections (October 14, 2026)

- The migration runner now uses a transaction-scoped advisory lock and applies
  only unrecorded versions, so concurrent first runs do not interleave schema
  changes. Always back up production data before initial migration.
- Review-only machine validation used system-wide TypeScript because this sandbox
  had no npm network access. Run `npm ci && npm test && npm run typecheck && npm run build`
  via normal GitHub Actions before production promotion.
- The uploaded Git bundle starts from a *recreated snapshot* of the prior master.
  Create a review branch anchored to the **actual GitHub master commit**, copying
  the complete new worktree, rather than force-pushing the synthetic history.
