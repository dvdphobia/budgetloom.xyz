# BudgetLoom — System Architecture Overview (`SYSTEM_OVERVIEW.md`)

**Last Updated:** 2026-10-14  
**Framework:** Next.js 16 (App Router) + React 18 + TypeScript 5 + Tailwind CSS v4 + PostgreSQL (`pg`)

---

## 1. High-Level Architecture

BudgetLoom uses a **hybrid resilient publishing architecture** designed so public pages are fast, SEO-friendly, and immune to database downtime while still supporting full dynamic CMS administration when PostgreSQL is connected:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Public & Editorial Routes                        │
│  /  |  /blog, /blog/[slug]  |  /topics, /topics/[slug]                  │
│  /tools, /tools/[slug], /budget-calculator                              │
│  /printables, /printables/[slug]  |  /sitemap.xml, /robots.txt          │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                Unified Content & Resource Layer (`lib/`)                │
│  • `lib/content.ts`: Merges PostgreSQL CMS posts with `lib/posts.ts`    │
│    using a 3-tier schema fallback (`full CMS` → `archived` → `legacy`)  │
│  • `lib/calculators.ts`: Deterministic cent-accurate math for 15 tools  │
│  • `lib/printables.ts`: 16 verified PDF workbooks & page preview assets │
│  • `lib/logger.ts`: Structured JSON logging with automatic PII redaction│
└───────────────┬─────────────────────────────────────────┬───────────────┘
                │                                         │
                ▼                                         ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────┐
│   PostgreSQL (`lib/db.ts`)            │ │ Static Fallback Catalog       │
│  • Strict `verify-full` TLS           │ │ • 40+ published guides        │
│  • Global Pool singleton + error hook │ │ • 13 topic cluster hubs       │
│  • Versioned idempotent migrations    │ │ • 16 pre-built PDFs + PNGs    │
│  • Audit logs & slug redirects        │ │ • 15 interactive calculators  │
└───────────────────────────────────────┘ └───────────────────────────────┘
```

---

## 2. Database Schema & Migrations (`lib/db.ts`)

`initDB()` executes versioned, idempotent SQL migrations tracked in `schema_migrations`:

1. **Migration v1 (`001_core_tables`):**
   - `admin_users (id, username, password_hash, created_at)`
   - `posts (id, slug, title, description, date, category, read_time, content, published, archived, created_at, updated_at)`
   - `printables (id, slug, title, description, price, pages, includes, file_url, created_at, updated_at)`
   - `ad_placements (id, placement, label, ad_code, enabled, created_at, updated_at)`
   - `site_settings (id, key, value, updated_at)`
2. **Migration v2 (`002_cms_lifecycle_and_seo_columns`):**
   - Extends `posts` with `status` (`draft`, `in_review`, `approved`, `scheduled`, `published`, `archived`, `updated`), `seo_title`, `excerpt`, `topic_cluster`, `author`, `reviewer`, `featured_image`, `featured_image_alt`, `sources` (`JSONB`), `related_slugs`, `related_tools`, `related_printables`, `canonical_url`, `scheduled_for`, and `published_at`.
3. **Migration v3 (`003_audit_logs_redirects_and_subscribers`):**
   - `audit_logs (id, actor, action, entity_type, entity_id, details, created_at)`
   - `slug_redirects (id, from_slug, to_slug, created_at)`
   - `newsletter_subscribers (id, email_hash, tag, synced_to_provider, created_at)`
   - `download_events (id, resource_slug, resource_type, created_at)`

---

## 3. Route Map & Information Architecture

| Route Pattern | Purpose | Data Source |
|---|---|---|
| `/` | Conversion-focused homepage with hero, featured tools, topic clusters, printables, and guides | `getVisiblePosts()`, `printables`, `TOOL_CATALOG`, `TOPIC_CLUSTERS` |
| `/blog` | Searchable, filterable editorial guide index with category & topic cluster filters | `getVisiblePosts()`, `TOPIC_CLUSTERS` |
| `/blog/[slug]` | Individual money guide with table of contents, Markdown tables, contextual tool/printable callouts, references, and JSON-LD `Article` schema | `getVisiblePost(slug)`, `resolveSlugRedirect(slug)` |
| `/topics` | Directory of all 13 personal finance topic clusters | `TOPIC_CLUSTERS`, `getVisiblePosts()` |
| `/topics/[slug]` | Comprehensive topic hub with starting guide, cluster articles, calculators, printables, and FAQs | `TOPIC_CLUSTERS`, `getVisiblePostsByCluster(slug)` |
| `/tools` | Directory of all 15 interactive financial calculators grouped by purpose | `TOOL_CATALOG` |
| `/tools/[slug]` | Dedicated interactive calculator page with live cent-accurate calculations, CSV export, print view, formulas, worked examples, and `WebApplication` schema | `getToolBySlug(slug)`, `lib/calculators.ts` |
| `/budget-calculator` | Canonical Monthly Budget Calculator preserved at its historical root URL | `BudgetCalculator`, `lib/calculators.ts` |
| `/printables` | Digital resource marketplace with category filters and real rendered PDF page previews | `printables` (`lib/printables.ts`) |
| `/printables/[slug]` | Printable detail page with rendered cover/page previews, page count, printing guide, and instant PDF download | `getPrintableBySlug(slug)` |
| `/free-budget-template`, `/monthly-budget-worksheet`, `/free-budget-spreadsheet` | High-intent SEO landing pages preserved at their indexed URLs | Static + `printables` |
| `/about`, `/editorial-policy`, `/contact`, `/privacy`, `/terms` | Trust, transparency, and legal pages | Static |
| `/admin/login`, `/admin/dashboard/*` | Protected editorial CMS dashboard (`noindex, nofollow`) | `/api/admin/*` |
