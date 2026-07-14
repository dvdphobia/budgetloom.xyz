'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const inputStyle = { width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 8, outline: 'none' }
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }

export default function EditPrintable() {
  const [item, setItem] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get('id')

  useEffect(() => {
    if (id) fetch(`/api/admin/printables/${id}`).then(r => r.json()).then(d => setItem(d.printable))
  }, [id])

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    const form = e.target as HTMLFormElement
    const includesStr = (form.elements.namedItem('includes') as HTMLInputElement).value
    const data = {
      slug: (form.elements.namedItem('slug') as HTMLInputElement).value,
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLInputElement).value,
      price: (form.elements.namedItem('price') as HTMLInputElement).value,
      pages: parseInt((form.elements.namedItem('pages') as HTMLInputElement).value) || 1,
      includes: includesStr.split(',').map((s: string) => s.trim()).filter(Boolean),
      file_url: (form.elements.namedItem('file_url') as HTMLInputElement).value,
    }
    try {
      const res = await fetch(`/api/admin/printables/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (res.ok) router.push('/admin/dashboard/printables')
      else { const d = await res.json(); setError(d.error || 'Save failed') }
    } catch { setError('Network error') }
    setSaving(false)
  }

  async function del() {
    if (!confirm('Delete this printable?')) return
    await fetch(`/api/admin/printables/${id}`, { method: 'DELETE' })
    router.push('/admin/dashboard/printables')
  }

  if (!item) return <p style={{ color: '#6b7280' }}>Loading...</p>
  const includesArr = Array.isArray(item.includes) ? item.includes : []

  return (
    <div style={{ maxWidth: 800 }}>
      <Link href="/admin/dashboard/printables" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none', marginBottom: 16, display: 'inline-block' }}>← Back to Printables</Link>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0c1a1e', marginBottom: 24 }}>Edit Printable</h2>
      <form onSubmit={save} style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div><label style={labelStyle}>Slug</label><input name="slug" defaultValue={item.slug} style={inputStyle} required /></div>
          <div><label style={labelStyle}>Title</label><input name="title" defaultValue={item.title} style={inputStyle} required /></div>
        </div>
        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Description</label><input name="description" defaultValue={item.description} style={inputStyle} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div><label style={labelStyle}>Price</label><input name="price" defaultValue={item.price} style={inputStyle} /></div>
          <div><label style={labelStyle}>Pages</label><input name="pages" type="number" defaultValue={item.pages} style={inputStyle} /></div>
          <div><label style={labelStyle}>File URL</label><input name="file_url" defaultValue={item.file_url} style={inputStyle} /></div>
        </div>
        <div style={{ marginBottom: 20 }}><label style={labelStyle}>Includes (comma-separated)</label><input name="includes" defaultValue={includesArr.join(', ')} style={inputStyle} /></div>
        {error && <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={saving} style={{ padding: '12px 24px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#d97706', border: 'none', borderRadius: 8, cursor: saving ? 'wait' : 'pointer' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" onClick={del} style={{ padding: '12px 24px', fontSize: 14, fontWeight: 600, color: '#dc2626', background: 'none', border: '1px solid #dc2626', borderRadius: 8, cursor: 'pointer' }}>Delete</button>
        </div>
      </form>
    </div>
  )
}