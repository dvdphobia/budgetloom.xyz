# BudgetLoom — Fix & SEO Roadmap

Tracking doc for critical fixes and SEO/traffic optimization.
Check items off as they're completed.

## Phase 1 — Critical Fixes (revenue-blocking)

- [ ] Replace free PDF download with real Gumroad checkout
      (`app/printables/[slug]/page.tsx`, `lib/printables.ts`)
- [x] Wire `EmailForm` to MailerLite API (`app/components/EmailForm.tsx` →
      `app/api/subscribe/route.ts` → MailerLite `/api/subscribers`).
      API key stored in gitignored `.env.local` (never committed). Tested
      live against MailerLite and verified working (test subscriber added
      then deleted). **Removed `output: 'export'` from `next.config.js`** —
      this was required so the app has a server runtime to call MailerLite
      without exposing the API key in the browser. Now deploys as a normal
      Next.js app on Vercel instead of a static export.
      ⚠️ TODO: create a MailerLite Group for BudgetLoom signups and set
      `MAILERLITE_GROUP_ID` in `.env.local` / Vercel env vars so subscribers
      land in a specific list instead of just the general account.
- [ ] Push repo to GitHub
- [ ] Deploy to Vercel
      ⚠️ Must set `MAILERLITE_API_KEY` (and optional `MAILERLITE_GROUP_ID`)
      in Vercel → Project Settings → Environment Variables before/while
      deploying, since `.env.local` is not committed and won't exist there.
- [ ] Connect `budgetloom.xyz` domain (DNS + Vercel)
- [x] Set real Amazon Associates tracking ID: `budgetloom20-20` (`lib/config.ts`)
- [ ] Replace placeholder ASINs in `affiliateProducts` (`lib/config.ts`) with
      real Amazon products in the budgeting/meal-prep niche
- [ ] Replace Adsterra key + AdsKeeper ID (`lib/config.ts`)
- [ ] Verify Pinterest business account, replace `p:domain_verify` tag (`app/layout.tsx`)

## Phase 2 — SEO & Traffic Optimization

### Technical SEO
- [ ] Convert `app/sitemap.xml` (static) to `app/sitemap.ts` (dynamic, includes all
      blog + printable slugs)
- [ ] Add `metadataBase` + Open Graph + Twitter card tags (layout + per-page metadata)
- [ ] Add favicon, apple-touch-icon, default OG share image to `public/`
- [ ] Add JSON-LD structured data:
  - [ ] `Article` schema on blog posts
  - [ ] `Product`/`Offer` schema on printables (price, availability)
  - [ ] `Organization` / `WebSite` schema site-wide
  - [ ] `BreadcrumbList` schema
- [ ] Add explicit canonical URLs per page

### Content & internal linking
- [ ] Publish 10 queued outlines from `content/outlines.json` into `lib/posts.ts`
- [ ] Add "Related Printable" / "Related Guide" cross-links on blog & printable pages
- [ ] Add breadcrumb UI (Home > Guides > Post Title)

### Traffic channels
- [ ] Set up Google Search Console, submit sitemap
- [ ] Set up Bing Webmaster Tools, submit sitemap
- [ ] Add analytics (Plausible or GA4)
- [ ] Add UTM parameters to Pinterest pin links, point each pin at its matching page

### Performance polish
- [ ] Compress/audit images in `public/pins` and `public/printables`

## Suggested order

1. Gumroad checkout
2. MailerLite wiring
3. Deploy + domain
4. Sitemap + metadata + JSON-LD
5. Real affiliate/ad keys
6. Content expansion + internal linking
7. Search Console / analytics / Pinterest UTMs
