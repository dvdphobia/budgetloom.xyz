# BudgetLoom — Design System & UI/UX Architecture (`DESIGN_SYSTEM.md`)

**Last Updated:** 2026-10-14  
**Stylesheet:** `app/globals.css`

---

## 1. Brand Personality & Design Principles

- **Trustworthy & Calm:** Warm cream (`#fdfcf7`), deep charcoal (`#0c1a1e`), and emerald green (`#059669`) establish an editorial, approachable consumer finance identity without aggressive popups or hype.
- **Content & Tool First:** Interactive calculators, worked dollar tables, and real PDF previews sit above the fold; optional monetization never obscures primary user tasks.
- **WCAG 2.2 AA Accessibility:** High-contrast text (`#0c1a1e` and `#374151` on `#ffffff` and `#fdfcf7` exceeding 7:1 contrast), keyboard-accessible navigation with `Escape` key handling, visible `:focus-visible` outlines (`2px solid var(--green)`), explicit `<label htmlFor>` associations, and `aria-live="polite"` result panels.

---

## 2. Color Tokens (`:root` in `app/globals.css`)

| Token | Hex Value | Usage |
|---|---|---|
| `--green` | `#059669` | Primary brand actions, active pills, progress bars, positive indicators |
| `--green-dark` | `#065f46` | Button hover states, eyebrow labels, high-contrast badges (WCAG AA compliant) |
| `--green-light` | `#d1fae5` | Subtle callout borders, progress bar tracks, link underlines |
| `--green-mint` | `#ecfdf5` | Callout backgrounds, active nav highlights, table row tinting |
| `--amber` | `#d97706` | Secondary accent for warnings, food/lifestyle badges, and highlights |
| `--amber-light` | `#fef3c7` | Warm warning surface and icon badges |
| `--dark` | `#0c1a1e` | Primary headings, calculator result panel surface, footer background |
| `--slate` | `#374151` | Body prose and table cell copy |
| `--gray` | `#6b7280` | Secondary metadata, captions, and form hints |
| `--cream` | `#fdfcf7` | Hero background, printable preview stage, lead capture surface |
| `--white` | `#ffffff` | Primary page background and card surfaces |
| `--brand-border` | `#e5e7eb` | Hairline card, input, and table borders |

---

## 3. Typography & Spacing Scale

- **UI & Headings (`--font`):** `'Inter', system-ui, -apple-system, sans-serif` (`h1`: `2.8rem–3.1rem` desktop / `1.9rem–2.2rem` mobile, weight `800`, tracking `-0.035em`).
- **Editorial Guide Prose (`--font-serif`):** `'Newsreader', Georgia, serif` at `1.12rem` (`18px`) with `1.75` line-height and `740px` max measure for comfortable long-form reading.
- **8px Spacing Scale:** `--s-1` (`0.5rem`) through `--s-7` (`6rem`), container max-width `1040px` (`780px` `.narrow` for calculators and long-form guides).

---

## 4. Core Component Patterns

1. **Split Conversion Hero (`.hero-split` & `.hero-showcase-card`):** Left column presents the value proposition, two primary CTAs, and trust checkmarks; right column displays a live-formatted `Monthly Budget Snapshot` card demonstrating a balanced `$4,000` budget.
2. **Searchable & Filterable Catalogs (`.catalog-controls`, `BlogCatalogClient`, `PrintablesCatalogClient`):** Instant client-side search input paired with category pills (`.category-pill.active`) and 13-cluster select filtering.
3. **Printable Marketplace Cards (`.printable-marketplace-card`):** Displays genuine rendered PNG previews of the actual PDF cover (`public/printables/previews/<slug>-cover.png`), page count badge, 3-item preview checklist, and direct download/preview actions.
4. **Interactive Calculator Suite (`.calculator`, `.calculator-results`):** Structured input fields with `.money-input` focus rings paired with a high-contrast dark result panel (`#0c1a1e`) with emerald `#6ee7b7` totals, live `aria-live="polite"` updates, CSV export, and print styling.

---

## 5. Multi-Viewport Visual Verification (`docs/design/screenshots/`)

Verified in Headless Chromium across all 5 target viewports with zero horizontal overflow (`scrollWidth === clientWidth`):
- `docs/design/screenshots/homepage-360px-mobile.png` (`360×960`)
- `docs/design/screenshots/homepage-390px-mobile.png` (`390×960`)
- `docs/design/screenshots/homepage-768px-tablet.png` (`768×1024`)
- `docs/design/screenshots/homepage-1024px-laptop.png` (`1024×960`)
- `docs/design/screenshots/homepage-1440px-desktop.png` (`1440×1080`)
