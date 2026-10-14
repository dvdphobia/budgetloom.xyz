'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { CardCover, Icon } from './Icons'
import type { PublicPost, TopicClusterMeta } from '@/lib/content'

const CATEGORY_MAP: Record<string, string> = {
  Savings: 'savings',
  Food: 'food',
  Budgeting: 'budgeting',
  Lifestyle: 'lifestyle',
  Debt: 'debt',
}

const CATEGORIES = ['All', 'Budgeting', 'Savings', 'Food', 'Debt', 'Lifestyle']

export default function BlogCatalogClient({
  posts,
  clusters,
}: {
  posts: PublicPost[]
  clusters: TopicClusterMeta[]
}) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedCluster, setSelectedCluster] = useState('all')

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((post) => {
      const matchesCat = selectedCategory === 'All' || post.category === selectedCategory
      const matchesCluster = selectedCluster === 'all' || post.topicSlug === selectedCluster
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.topicCluster.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q)
      return matchesCat && matchesCluster && matchesQuery
    })
  }, [posts, query, selectedCategory, selectedCluster])

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="catalog-controls" role="search" aria-label="Filter money guides">
        <div className="catalog-search-row">
          <label htmlFor="guide-search" className="sr-only">
            Search guides by topic or keyword
          </label>
          <input
            id="guide-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 40+ money guides (e.g., biweekly, groceries, sinking funds, debt snowball)..."
            className="catalog-search-input"
          />
          <label htmlFor="cluster-filter" className="sr-only">
            Filter by topic cluster
          </label>
          <select
            id="cluster-filter"
            value={selectedCluster}
            onChange={(e) => setSelectedCluster(e.target.value)}
            className="catalog-select"
          >
            <option value="all">All 13 Topic Clusters</option>
            {clusters.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="category-pills" style={{ justifyContent: 'flex-start', marginBottom: '1.25rem' }}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat
            const count = cat === 'All' ? posts.length : posts.filter((p) => p.category === cat).length
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={active}
                className={`category-pill ${active ? 'active' : ''}`}
              >
                <span>{cat}</span>
                <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>({count})</span>
              </button>
            )
          })}
          {(query || selectedCategory !== 'All' || selectedCluster !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSelectedCategory('All')
                setSelectedCluster('all')
              }}
              className="category-pill"
              style={{ color: 'var(--green-dark)', borderColor: 'var(--green)' }}
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--gray)', marginBottom: '1.5rem' }} aria-live="polite">
        Showing <strong>{filteredPosts.length}</strong> of {posts.length} practical money guides
      </p>

      {filteredPosts.length === 0 ? (
        <div className="callout" style={{ textAlign: 'center' }}>
          <h2>No matching guides found</h2>
          <p>Try a broader keyword or reset the category and topic cluster filters.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setQuery('')
              setSelectedCategory('All')
              setSelectedCluster('all')
            }}
          >
            Show all {posts.length} guides
          </button>
        </div>
      ) : (
        <div className="grid">
          {filteredPosts.map((post) => (
            <Link href={`/blog/${post.slug}`} className="card" key={post.slug}>
              <div className="card-cover">
                <CardCover category={CATEGORY_MAP[post.category] || 'budgeting'} />
                <span className="card-cover-tag">{post.category}</span>
              </div>
              <div className="card-body">
                <span className="card-badge">{post.topicCluster}</span>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <div className="card-meta">
                  <Icon.clock className="" style={{ width: '13px', height: '13px' }} />
                  <span>{post.readTime} read</span>
                  <span>·</span>
                  <span>Updated {post.updatedAt || post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
