# BudgetLoom

Static Next.js site for budget printables + money guides.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

This app is deployed as a standard Next.js app (not a static export), because
the `/api/subscribe` route needs a server runtime to call the MailerLite API
without exposing the API key in the browser.

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values for local dev:

- `MAILERLITE_API_KEY` — MailerLite API token (Integrations > MailerLite API in your MailerLite account).
- `MAILERLITE_GROUP_ID` — optional, comma-separated group ID(s) to add subscribers to.

`.env.local` is gitignored and must never be committed. When deploying, set the
same variables in Vercel under Project Settings > Environment Variables.

## Deploy

1. Push to GitHub.
2. Import repo into Vercel.
3. Set framework preset to Next.js.
4. Add the environment variables above in Vercel's project settings.
5. Done.

## Secure CMS initialization

**Important:** There is no longer any public GET-based database initializer or default `admin/admin123` credential. The old default login is blocked. If you previously provisioned the default account, reset its password through a trusted database-administration workflow before enabling the CMS.

For a new installation, configure `POSTGRES_URL`, a strong `JWT_SECRET` (at least 32 random characters), `ADMIN_SETUP_TOKEN` (at least 32 random characters) and `ADMIN_BOOTSTRAP_PASSWORD` (at least 16 characters) in your host's secret environment. Make a one-time POST request to `/api/admin/init` with `Authorization: Bearer <ADMIN_SETUP_TOKEN>`. Never paste this token into the web dashboard or publicly accessible code. Remove the bootstrap credentials from your host immediately after account creation. Subsequent schema initialization requires an authenticated admin session.

Protect `/api/admin/auth` with Cloudflare/hosting-level rate limiting: in-process rate limiting alone is not reliable on serverless platforms. Use HTTPS and a verified database CA certificate. Do not use `rejectUnauthorized:false` for production database connections.

Use a branch/PR workflow. Do not place actual keys in `.env.example`.

## Privacy-first advertising configuration

The previous Adsterra popunder/social bar scripts are disabled. The public ad component only renders approved AdSense units when `NEXT_PUBLIC_ADSENSE_CLIENT` is a valid `ca-pub-...` identifier and a unique numeric slot is assigned with `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INTRO` and `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MIDDLE`. The corresponding placement switches in `/admin/dashboard/ads` control enablement when the database is configured. Ad code textareas are not executed.

Publish an `ads.txt` file **only after** receiving your verified seller entry from the network. Handle consent and cookie/privacy requirements for your audience before loading personalized ads. Verify production display, Core Web Vitals, and provider policy compliance. Do not configure a popunder or a social-bar placement.

## Verified budget printables

The `npm run build` and `npm run dev` lifecycle hooks regenerate all four downloadable PDF resources using `scripts/generate-printables.mjs` (Node built-ins only), before Next.js runs. You can also run `npm run generate:printables` explicitly.

Expected PDF page counts: Budget Starter Bundle 12; 30-Day Savings Challenge 6; Meal Planner Budget Kit 8; Debt Payoff Planner 10. The three 30-day savings schedules are algorithmically verified to total exactly $100, $300 and $500. Do not deploy the older committed static PDFs without running the generator first. This build-time generation is required to fix the previously mismatched files.
