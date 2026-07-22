# BudgetLoom — Full Project Knowledge Base

> This file is a complete export of everything about the BudgetLoom project.
> Designed to be fed to Codex (or any AI coding assistant) for context.

## Project Overview

BudgetLoom is a niche content website focused on **budget printables + money-saving guides**.
Monetized through Amazon affiliate links, Adsterra display ads, and email list building.
Traffic strategy: Pinterest + organic Google search.

### SEO tool cluster (added 2026-07-22)
- `/free-budget-template` targets budget template/free budget template and promotes the existing 12-page PDF.
- `/monthly-budget-worksheet` targets monthly budget worksheet and includes a completed example.
- `/budget-calculator` provides an interactive needs/wants/savings calculator.
- `/free-budget-spreadsheet` provides `/budgetloom-monthly-budget.csv` for common spreadsheet apps.
- All four routes are internally linked, use canonical metadata, and are included in the sitemap.
- Eight supporting guides cover monthly budgeting, budget categories, 50/30/20 examples, irregular income, biweekly budgeting, monthly checklists, planner selection, and cash envelopes.
- The budgeting cluster contains 23 total blog posts and produces 62 application routes in the verified production build.

- **Domain:** budgetloom.xyz (no www)
- **GitHub:** https://github.com/dvdphobia/budgetloom.xyz.git
- **Hosting:** Vercel free tier
- **DNS/CDN:** Cloudflare (SSL/TLS must be "Full (strict)", NOT "Flexible")
- **Branch:** master → origin/master
- **Working directory:** ~/Desktop/workspace/websites/budget-printables

## Tech Stack

- **Framework:** Next.js 16 (Turbopack)
- **React:** 18.3.1
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (@tailwindcss/postcss) + custom CSS in globals.css
- **UI Components:** shadcn/ui (Button, Card, Input, Table, Badge, Switch, Select, Label, Separator, Textarea)
- **Icons:** lucide-react
- **Database:** Vercel Postgres (free 500MB) via `pg` library (NOT @vercel/postgres)
- **Auth:** bcryptjs + jose (JWT)
- **Analytics:** Google Analytics G-CRZCXM56DQ
- **Ads:** Adsterra (native banner, popunder, social bar)

## Build & Verify Commands

```bash
npm run lint
npm run build
git add -A && git commit -m "message" && git push
```

## Project Structure

```
budget-printables/
├── app/
│   ├── layout.tsx              # Root layout: fonts, GA, SiteWideAds, metadata
│   ├── globals.css             # Tailwind v4 import + shadcn theme + custom site CSS + mobile breakpoints
│   ├── page.tsx                # Homepage
│   ├── blog/
│   │   ├── page.tsx            # Blog list (by category)
│   │   └── [slug]/page.tsx     # Blog post detail (with 3 AdSlot placements)
│   ├── printables/
│   │   ├── page.tsx            # Printables list
│   │   └── [slug]/page.tsx     # Printable detail
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── sitemap.ts              # Dynamic sitemap (38 URLs: 11 static + 23 blog + 4 printables)
│   ├── robots.ts               # Disallow /api/ and /admin/
│   ├── admin/
│   │   ├── login/page.tsx      # Admin login (shadcn Card, Input, Button)
│   │   └── dashboard/
│   │       ├── layout.tsx      # Sidebar nav (shadcn, mobile-responsive)
│   │       ├── page.tsx        # Overview (stats cards, init/seed DB)
│   │       ├── posts/
│   │       │   ├── page.tsx    # Posts list (shadcn Table)
│   │       │   ├── new/page.tsx
│   │       │   └── edit/page.tsx
│   │       ├── printables/
│   │       │   ├── page.tsx    # Printables grid
│   │       │   ├── new/page.tsx
│   │       │   └── edit/page.tsx
│   │       ├── ads/page.tsx    # Ad manager (switch toggles + textareas)
│   │       └── settings/page.tsx
│   ├── api/
│   │   ├── admin/
│   │   │   ├── auth/route.ts       # POST login (auto-inits DB), DELETE logout
│   │   │   ├── init/route.ts       # POST initDB (public, no auth)
│   │   │   ├── posts/route.ts      # GET list, POST create
│   │   │   ├── posts/[id]/route.ts # GET, PUT, DELETE (params: Promise<{id:string}>)
│   │   │   ├── printables/route.ts
│   │   │   ├── printables/[id]/route.ts
│   │   │   ├── ads/route.ts         # GET, PUT
│   │   │   ├── settings/route.ts
│   │   │   └── seed/route.ts       # Seeds DB from static files
│   │   ├── public-ads/route.ts     # GET (no auth) returns popunder + socialbar codes
│   │   └── subscribe/route.ts     # Email signup (MailerLite not configured yet)
│   └── components/
│       ├── Header.tsx           # Site header with logo
│       ├── Footer.tsx           # Site footer
│       ├── AdBanner.tsx         # Client component: hardcoded Adsterra codes, injects scripts
│       ├── AdSlot.tsx           # Server wrapper for AdBanner (used on blog posts)
│       ├── SiteWideAds.tsx      # Re-exports AdBanner default (popunder + social bar)
│       ├── EmailForm.tsx        # Email signup form
│       ├── AmazonLink.tsx       # Affiliate link + product card
│       ├── Breadcrumbs.tsx
│       ├── ShareButtons.tsx
│       ├── AuthorBox.tsx
│       ├── Icons.tsx            # Custom inline SVG icons (no emoji)
│       └── ui/                  # shadcn components
│           ├── button.tsx
│           ├── card.tsx
│           ├── input.tsx
│           ├── textarea.tsx
│           ├── table.tsx
│           ├── badge.tsx
│           ├── label.tsx
│           ├── select.tsx
│           ├── switch.tsx
│           └── separator.tsx
├── lib/
│   ├── config.ts               # Site URL, Amazon ASINs, affiliate ID
│   ├── posts.ts                # 15 blog posts, including the budget home-office Pinterest funnel
│   ├── printables.ts           # 4 printables
│   ├── db.ts                   # pg Pool, query(), initDB(), getAdByPlacement()
│   ├── auth.ts                 # JWT signToken/verifyToken with jose
│   └── utils.ts                # cn() utility (clsx + tailwind-merge)
├── public/
│   ├── logo.png                # AI-generated logo (loom weave circle)
│   ├── favicon.png             # Same as logo
│   └── printables/              # 4 PDF files (2-3KB each)
├── scripts/
│   ├── generate_pins.py        # Pinterest pin generation
│   ├── generate_printables.py  # PDF printable generation
│   └── .venv/                   # Python venv with reportlab + Pillow
├── next.config.js              # trailingSlash: false (was true, caused redirect loop)
├── postcss.config.js           # @tailwindcss/postcss
├── proxy.ts                    # JWT auth middleware for /admin/dashboard
├── tsconfig.json               # @/* path alias → ./*
└── package.json
```

## Content

### Blog Posts (15 total in lib/posts.ts)

1. 30-day-money-saving-challenge (Savings, 9 min)
2. budget-meal-plan-for-one (Food, 8 min)
3. how-to-build-a-budget-when-broke (Budgeting, 8 min)
4. no-spend-weekend-ideas (Lifestyle, 6 min)
5. how-to-build-1000-emergency-fund (Savings, 8 min)
6. frugal-grocery-shopping-tips (Food, 9 min)
7. cash-envelope-system (Budgeting, 7 min)
8. how-to-pay-off-debt-fast (Debt, 8 min)
9. zero-based-budgeting (Budgeting, 7 min)
10. 50-30-20-rule (Budgeting, 6 min)
11. no-spend-month-guide (Lifestyle, 7 min)
12. save-money-on-utilities (Savings, 6 min)
13. budgeting-for-beginners (Budgeting, 8 min)
14. debt-snowball-vs-avalanche (Debt, 7 min)
15. modern-home-office-setup-on-a-budget (Lifestyle, 9 min)

Categories: Savings, Budgeting, Food, Debt, Lifestyle

### Printables (4 in lib/printables.ts + 4 PDFs in public/printables/)

1. budget-starter-bundle (12 pages, Free)
2. 30-day-savings-challenge (6 pages, Free)
3. meal-planner-budget-kit (8 pages, Free)
4. debt-payoff-planner (5 pages, Free)

All printables are FREE (email lead magnets, no payment gateway).

## Amazon Affiliate

- **Store ID:** budgetloom20 (final tag: budgetloom20-20)
- **ASINs:**
  - B07VMDWPQR — Budget Planner Notebook
  - B0833G372F — Cash Envelopes
  - B08DKMQFNG — Meal Prep Containers
- **Tax classification:** Individual, non-U.S. person, all services performed outside U.S.
- **User location:** Cambodia

## Adsterra Ads (Hardcoded in AdBanner.tsx)

All ad codes are hardcoded directly in `app/components/AdBanner.tsx` — no database needed.

### Native Banner
```html
<script async="async" data-cfasync="false" src="https://pl30367165.effectivecpmnetwork.com/3e2687892d1d43c8539f6524b4567ffc/invoke.js"></script>
<div id="container-3e2687892d1d43c8539f6524b4567ffc"></div>
```
Placed on blog post pages at 3 positions:
- blog_post_top (above article, after share buttons)
- blog_post_middle (after article body, before product card)
- blog_post_bottom (after author box, before email CTA)

### Popunder (site-wide)
```html
<script src="https://pl30367166.effectivecpmnetwork.com/16/8f/3e/168f3e03e4f71a06d7a81835149eafed.js"></script>
```

### Social Bar (site-wide)
```html
<script src="https://pl30367167.effectivecpmnetwork.com/e7/21/7f/e7217f6a3487bff983f5a28ab3a4a38c.js"></script>
```

Popunder and Social Bar load on every page via `SiteWideAds` component in layout.tsx.

## CMS / Admin Panel

- **URL:** /admin/login
- **Default credentials:** admin / admin123 (should be changed)
- **Auth:** JWT via jose, password hashed with bcryptjs
- **Middleware:** proxy.ts (Next.js 16 uses `proxy` function, not `middleware`)
- **DB:** Vercel Postgres via `pg` Pool, env var `POSTGRES_URL` (pooled connection string)

### DB Schema (5 tables in lib/db.ts initDB())
1. posts (id, slug, title, description, date, category, read_time, content, published)
2. printables (id, slug, title, description, price, pages, includes, file_url)
3. ad_placements (id, placement, label, ad_code, enabled)
4. settings (key, value)
5. admin_users (id, username, password_hash)

### 9 Ad Placements
1. header_banner — Social Bar (site-wide)
2. blog_list_top
3. blog_post_top — Native Banner
4. blog_post_middle — Native Banner
5. blog_post_bottom — Native Banner
6. sidebar
7. printables_top
8. printables_bottom
9. footer_banner — Popunder (site-wide)

Note: Ads are currently hardcoded in AdBanner.tsx. The CMS ad manager can control them once DB is connected, but hardcoded ensures ads show without DB.

## CSS / Styling System

### Tailwind v4 Setup
- `@import "tailwindcss"` in globals.css (must come AFTER font @import)
- `@theme inline` block maps shadcn color variables (--color-background, --color-primary, etc.)
- postcss.config.js uses `@tailwindcss/postcss`
- shadcn components in `app/components/ui/`

### CSS Variable Naming (IMPORTANT)
Custom site CSS variables use `--brand-*` prefix to avoid collisions with shadcn:
- `--brand-border` (was `--border` — collided with shadcn HSL border)
- `--brand-radius` (was `--radius` — collided with shadcn 0.5rem radius)
- `--brand-radius-sm`, `--brand-radius-lg`, `--brand-radius-xl`

shadcn variables (HSL format, no prefix):
- `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`

### Admin CSS Isolation
Admin pages use `admin-shell` class on root div. CSS `body:has(.admin-shell)` overrides the public site's global body styles.

### Mobile Breakpoints (in globals.css)
- 768px: grid stacks to 1 column, container padding 1rem, header 56px
- 600px: hero h1 2.2rem, section padding 2.5rem
- 480px: hero CTA stack vertical, article title 1.6rem, footer single column, product card stacks

## Design System

- **Primary green:** #059669 (emerald)
- **Accent amber:** #d97706
- **Dark:** #0c1a1e
- **Cream:** #fdfcf7
- **Fonts:** Inter (UI), Newsreader (article body)
- **No emoji** — 18 custom inline SVG icons in Icons.tsx
- **Logo:** AI-generated, loom weave circle pattern, emerald green on cream

## Next.js 16 Quirks

1. **Dynamic route params:** `params: Promise<{ id: string }>` with `await params` (not `params: { id: string }`)
2. **Middleware file:** `proxy.ts` exporting `proxy()` function (not `middleware.ts` with `middleware()`)
3. **trailingSlash: false** in next.config.js (was true, caused redirect loops on sitemap/robots)

## Cloudflare Configuration (IMPORTANT)

1. **SSL/TLS:** Must be "Full (strict)" — NOT "Flexible" (Flexible causes redirect loops and blocks crawlers)
2. **Bot Fight Mode:** Must be OFF (blocks Googlebot/Bingbot by default on free plans)
3. **WAF Custom Rules:** Check for any "AI Crawl Control" rules that block Googlebot/Bingbot — disable them
4. **Security Level:** Set to "Essentially Off" or "Low" if crawlers are being blocked

## Current Status

### Working
- 15 blog posts (all rewritten, research-based content)
- 4 free printables (PDFs in public/printables/)
- 18 Pinterest pins generated
- Homepage, blog, printables, about, contact, privacy, terms pages
- Admin CMS with shadcn/ui dashboard
- Adsterra ads hardcoded (native banner on blog posts, popunder + social bar site-wide)
- Google Analytics (G-CRZCXM56DQ)
- Sitemap (26 URLs, accessible to Googlebot)
- robots.txt (disallows /api/ and /admin/)
- Mobile responsive (all breakpoints)
- AI-generated logo + favicon
- SEO hardening completed: consistent non-www/no-trailing-slash URLs, canonical metadata, robots/sitemap alignment
- Dynamic 1200x630 Open Graph images for the site, every blog post, and every printable
- Article and DigitalDocument structured data, visible publication dates, and stronger editorial disclosures
- Admin routes explicitly set to noindex/nofollow
- Bing IndexNow key is hosted from `/db72385a0c4840b6aa559005feacc25a.txt`; run `npm run indexnow` after deploying changed URLs

### Pending / Not Done
- Vercel Postgres not connected (DB env vars not set on Vercel)
- JWT_SECRET env var not set on Vercel
- DB not initialized or seeded (user needs to click "Initialize Database" in admin panel)
- Admin password not changed (still admin/admin123)
- Pinterest Business account not created
- MailerLite not set up (email signup form exists but doesn't send)
- Amazon Associates not fully approved
- Google Search Console sitemap pending (was blocked, now fixed, waiting for Google to retry)
- No OG images per page

### Blocked / Known Issues
- Cloudflare 522 from some locations (SSL/TLS was Flexible, user changed to Full strict)
- Google "Sitemap could not be read" — was caused by Cloudflare WAF blocking Googlebot. Rule disabled. Sitemap now returns 200 for Googlebot. Google needs 24-48h to retry.
- Bing reads sitemap fine.

## User Preferences

- **Communication:** Direct, concise. Short prompts. Hates long waits. "Start now" means implement.
- **Design:** Eliminate filler, emoji icons, vanity stats. Wants billion-dollar-startup polish.
- **Cost:** Free > paid. Minimize infrastructure costs. Free Vercel, cheap .xyz domain.
- **Location:** Cambodia (ICT, UTC+7)
- **Printables:** All free (email lead magnets, no payment gateway)
- **CMS:** Wants full custom admin panel, not third-party hosted CMS. Uses shadcn/ui.
- **When asked to choose:** Wants agent's opinion with reasoning, not neutral options.

## Scripts

```bash
# Generate Pinterest pins
cd scripts && .venv/bin/python generate_pins.py

# Generate printables
cd scripts && .venv/bin/python generate_printables.py
```

Scripts venv: `scripts/.venv` with reportlab + Pillow

## Environment Variables Needed

```
POSTGRES_URL=postgres://...@pooler.xxx.db.vercel.com/...  # Pooled connection string
JWT_SECRET=your-secret-key
```

Set these in Vercel Project Settings > Environment Variables.

## Key Decisions Made

1. **Niche:** Budget & money-saving printables — highest buyer intent, Pinterest-friendly
2. **Tech:** Next.js 16 on Vercel free tier — $0 hosting
3. **Domain:** .xyz for cost savings
4. **All printables free:** Email list magnets
5. **Ad system:** Hardcoded Adsterra codes (not DB-driven) to ensure ads show without DB
6. **DB:** Switched from @vercel/postgres to `pg` library for pooled connection support
7. **trailingSlash: false:** Fixed sitemap/robots redirect loop
8. **SSL/TLS:** Full (strict) required for Vercel — Flexible breaks everything
9. **Canonical URLs:** Always use `https://budgetloom.xyz` without `www` and without trailing slashes (except the root URL)
