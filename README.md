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
