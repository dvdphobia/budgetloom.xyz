'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PostsList() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/posts').then(r => r.json()).then(d => { setPosts(d.posts || []); setLoading(false) })
  }, [])

  async function del(id: number) {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    setPosts(posts.filter(p => p.id !== id))
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Loading...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0c1a1e' }}>Blog Posts ({posts.length})</h2>
        <Link href="/admin/dashboard/posts/new" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#059669', borderRadius: 8, textDecoration: 'none' }}>+ New Post</Link>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>Title</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>Category</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>Date</th>
              <th style={{ padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#374151' }}>Published</th>
              <th style={{ padding: 12, textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 12, fontSize: 14, color: '#0c1a1e', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                <td style={{ padding: 12, fontSize: 14, color: '#6b7280' }}>{p.category}</td>
                <td style={{ padding: 12, fontSize: 14, color: '#6b7280' }}>{p.date}</td>
                <td style={{ padding: 12, textAlign: 'center' }}>
                  <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12, fontWeight: 600, color: p.published ? '#059669' : '#9ca3af', background: p.published ? '#d1fae5' : '#f3f4f6' }}>{p.published ? 'Live' : 'Draft'}</span>
                </td>
                <td style={{ padding: 12, textAlign: 'right' }}>
                  <Link href={`/admin/dashboard/posts/edit?id=${p.id}`} style={{ fontSize: 13, color: '#059669', marginRight: 12, textDecoration: 'none' }}>Edit</Link>
                  <button onClick={() => del(p.id)} style={{ fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}