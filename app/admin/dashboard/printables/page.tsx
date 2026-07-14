'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PrintablesList() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/printables').then(r => r.json()).then(d => { setItems(d.printables || []); setLoading(false) })
  }, [])

  async function del(id: number) {
    if (!confirm('Delete this printable?')) return
    await fetch(`/api/admin/printables/${id}`, { method: 'DELETE' })
    setItems(items.filter(p => p.id !== id))
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Loading...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0c1a1e' }}>Printables ({items.length})</h2>
        <Link href="/admin/dashboard/printables/new" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#d97706', borderRadius: 8, textDecoration: 'none' }}>+ New Printable</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {items.map(p => (
          <div key={p.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0c1a1e', marginBottom: 4 }}>{p.title}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>{p.description?.substring(0, 80)}...</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12, fontWeight: 600, color: '#059669', background: '#d1fae5' }}>{p.price}</span>
              <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12, color: '#6b7280', background: '#f3f4f6' }}>{p.pages} pages</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link href={`/admin/dashboard/printables/edit?id=${p.id}`} style={{ fontSize: 13, color: '#d97706', textDecoration: 'none' }}>Edit</Link>
              <button onClick={() => del(p.id)} style={{ fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}