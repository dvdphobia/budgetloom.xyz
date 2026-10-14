'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Icon } from './Icons'
import type { Printable } from '@/lib/printables'

const PRINTABLE_CATEGORIES = [
  'All',
  'Core Bundles',
  'Budget Planners',
  'Expense & Bill Trackers',
  'Savings Challenges',
  'Debt & Specialty',
] as const

export default function PrintablesCatalogClient({ items }: { items: Printable[] }) {
  const [category, setCategory] = useState<string>('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchesCat = category === 'All' || item.category === category
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.includes.some((inc) => inc.toLowerCase().includes(q))
      return matchesCat && matchesSearch
    })
  }, [items, category, search])

  return (
    <div>
      <div className="catalog-controls" role="search" aria-label="Filter printable planners">
        <div className="catalog-search-row">
          <label htmlFor="printable-search" className="sr-only">
            Search printables
          </label>
          <input
            id="printable-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 20 printable PDF workbooks (e.g., paycheck, 52-week, debt snowball, meal planner)..."
            className="catalog-search-input"
          />
        </div>
        <div className="category-pills" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
          {PRINTABLE_CATEGORIES.map((cat) => {
            const active = category === cat
            const count = cat === 'All' ? items.length : items.filter((p) => p.category === cat).length
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                aria-pressed={active}
                className={`category-pill ${active ? 'active' : ''}`}
              >
                <span>{cat}</span>
                <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--gray)', marginBottom: '1.5rem' }} aria-live="polite">
        Showing <strong>{filtered.length}</strong> of {items.length} free printable PDF resources (no email required)
      </p>

      <div className="grid">
        {filtered.map((p) => (
          <div className="card printable-marketplace-card" key={p.slug}>
            <Link href={`/printables/${p.slug}`} className="printable-card-media">
              <img
                src={p.previewCoverUrl}
                alt={`${p.title} cover page preview`}
                loading="lazy"
                width={306}
                height={396}
                className="printable-thumb-img"
              />
              <span className="card-cover-tag free">
                {p.price} · {p.pages} Pages
              </span>
            </Link>
            <div className="card-body">
              <span className="card-badge">{p.category}</span>
              <h3>
                <Link href={`/printables/${p.slug}`}>{p.title}</Link>
              </h3>
              <p>{p.description}</p>
              <ul className="printable-mini-includes">
                {p.includes.slice(0, 3).map((inc) => (
                  <li key={inc}>
                    <Icon.check className="" /> <span>{inc}</span>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <Link href={`/printables/${p.slug}`} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                  Preview Pages
                </Link>
                <a
                  href={`/printables/${p.slug}.pdf`}
                  download
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Icon.download className="" /> PDF ({p.pages}p)
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
