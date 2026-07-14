'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function OverviewPage() {
  const [stats, setStats] = useState({ posts: 0, printables: 0, adsEnabled: 0 })
  const [initMsg, setInitMsg] = useState('')
  const [seedMsg, setSeedMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/posts').then(r => r.json()),
      fetch('/api/admin/printables').then(r => r.json()),
      fetch('/api/admin/ads').then(r => r.json()),
    ]).then(([p, pr, a]) => {
      setStats({
        posts: p.posts?.length || 0,
        printables: pr.printables?.length || 0,
        adsEnabled: a.ads?.filter((ad: any) => ad.enabled).length || 0,
      })
    })
  }, [])

  async function initDB() {
    setLoading(true); setInitMsg('')
    try {
      const res = await fetch('/api/admin/init', { method: 'POST' })
      const data = await res.json()
      setInitMsg(res.ok ? 'Database initialized successfully!' : `Error: ${data.error}`)
    } catch { setInitMsg('Network error') }
    setLoading(false)
  }

  async function seedContent() {
    setLoading(true); setSeedMsg('')
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' })
      const data = await res.json()
      setSeedMsg(res.ok ? `Seeded ${data.postsSeeded} posts and ${data.printablesSeeded} printables!` : `Error: ${data.error}`)
    } catch { setSeedMsg('Network error') }
    setLoading(false)
  }

  const cards = [
    { label: 'Blog Posts', value: stats.posts, href: '/admin/dashboard/posts', color: '#059669' },
    { label: 'Printables', value: stats.printables, href: '/admin/dashboard/printables', color: '#d97706' },
    { label: 'Active Ads', value: stats.adsEnabled, href: '/admin/dashboard/ads', color: '#7c3aed' },
  ]

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0c1a1e', marginBottom: 4 }}>Dashboard Overview</h2>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Manage your BudgetLoom website</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(card => (
          <Link key={card.label} href={card.href} style={{ display: 'block', background: '#fff', borderRadius: 12, padding: 24, textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>{card.label}</div>
          </Link>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0c1a1e', marginBottom: 8 }}>Database Setup</h3>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>Initialize creates all tables. Seed copies existing content into the database.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={initDB} disabled={loading} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#059669', border: 'none', borderRadius: 8, cursor: loading ? 'wait' : 'pointer' }}>Initialize Database</button>
          <button onClick={seedContent} disabled={loading} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#d97706', border: 'none', borderRadius: 8, cursor: loading ? 'wait' : 'pointer' }}>Seed Existing Content</button>
        </div>
        {initMsg && <p style={{ fontSize: 14, color: initMsg.includes('Error') ? '#dc2626' : '#059669', marginTop: 12 }}>{initMsg}</p>}
        {seedMsg && <p style={{ fontSize: 14, color: seedMsg.includes('Error') ? '#dc2626' : '#059669', marginTop: 12 }}>{seedMsg}</p>}
      </div>
    </div>
  )
}