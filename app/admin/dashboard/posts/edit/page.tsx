'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const inputStyle = { width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 8, outline: 'none' }
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }

export default function EditPost() {
  const [post, setPost] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get('id')

  useEffect(() => {
    if (id) fetch(`/api/admin/posts/${id}`).then(r => r.json()).then(d => setPost(d.post))
  }, [id])

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    const form = e.target as HTMLFormElement
    const data = {
      slug: (form.elements.namedItem('slug') as HTMLInputElement).value,
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLInputElement).value,
      date: (form.elements.namedItem('date') as HTMLInputElement).value,
      category: (form.elements.namedItem('category') as HTMLSelectElement).value,
      read_time: (form.elements.namedItem('read_time') as HTMLInputElement).value,
      content: (form.elements.namedItem('content') as HTMLTextAreaElement).value,
      published: (form.elements.namedItem('published') as HTMLInputElement).checked,
    }
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (res.ok) router.push('/admin/dashboard/posts')
      else { const d = await res.json(); setError(d.error || 'Save failed') }
    } catch { setError('Network error') }
    setSaving(false)
  }

  async function del() {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    router.push('/admin/dashboard/posts')
  }

  if (!post) return <p style={{ color: '#6b7280' }}>Loading...</p>

  return (
    <div style={{ maxWidth: 800 }}>
      <Link href="/admin/dashboard/posts" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none', marginBottom: 16, display: 'inline-block' }}>← Back to Posts</Link>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0c1a1e', marginBottom: 24 }}>Edit Post</h2>
      <form onSubmit={save} style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div><label style={labelStyle}>Slug</label><input name="slug" defaultValue={post.slug} style={inputStyle} required /></div>
          <div><label style={labelStyle}>Title</label><input name="title" defaultValue={post.title} style={inputStyle} required /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div><label style={labelStyle}>Category</label>
            <select name="category" defaultValue={post.category} style={inputStyle}>
              <option value="Budgeting">Budgeting</option><option value="Savings">Savings</option><option value="Food">Food</option><option value="Debt">Debt</option><option value="Lifestyle">Lifestyle</option>
            </select>
          </div>
          <div><label style={labelStyle}>Date</label><input name="date" type="date" defaultValue={post.date?.split('T')[0]} style={inputStyle} /></div>
          <div><label style={labelStyle}>Read Time</label><input name="read_time" defaultValue={post.read_time} style={inputStyle} /></div>
        </div>
        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Description</label><input name="description" defaultValue={post.description} style={inputStyle} /></div>
        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Content (Markdown)</label><textarea name="content" defaultValue={post.content} style={{ ...inputStyle, fontFamily: 'monospace', minHeight: 400, lineHeight: 1.6 }} required /></div>
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input name="published" type="checkbox" defaultChecked={post.published} id="pub" /><label htmlFor="pub" style={{ fontSize: 14, color: '#374151' }}>Published</label>
        </div>
        {error && <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={saving} style={{ padding: '12px 24px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#059669', border: 'none', borderRadius: 8, cursor: saving ? 'wait' : 'pointer' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" onClick={del} style={{ padding: '12px 24px', fontSize: 14, fontWeight: 600, color: '#dc2626', background: 'none', border: '1px solid #dc2626', borderRadius: 8, cursor: 'pointer' }}>Delete</button>
        </div>
      </form>
    </div>
  )
}