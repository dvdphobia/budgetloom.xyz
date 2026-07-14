'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputStyle = { width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 8, outline: 'none' }
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }

export default function NewPrintable() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

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
      const res = await fetch('/api/admin/printables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (res.ok) router.push('/admin/dashboard/printables')
      else { const d = await res.json(); setError(d.error || 'Save failed') }
    } catch { setError('Network error') }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <Link href="/admin/dashboard/printables" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none', marginBottom: 16, display: 'inline-block' }}>← Back to Printables</Link>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0c1a1e', marginBottom: 24 }}>New Printable</h2>
      <form onSubmit={save} style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div><label style={labelStyle}>Slug</label><input name="slug" style={inputStyle} placeholder="my-printable" required /></div>
          <div><label style={labelStyle}>Title</label><input name="title" style={inputStyle} placeholder="Printable title" required /></div>
        </div>
        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Description</label><input name="description" style={inputStyle} placeholder="Short description" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div><label style={labelStyle}>Price</label><input name="price" style={inputStyle} defaultValue="Free" /></div>
          <div><label style={labelStyle}>Pages</label><input name="pages" type="number" style={inputStyle} defaultValue="1" /></div>
          <div><label style={labelStyle}>File URL</label><input name="file_url" style={inputStyle} placeholder="/printables/slug.pdf" /></div>
        </div>
        <div style={{ marginBottom: 20 }}><label style={labelStyle}>Includes (comma-separated)</label><input name="includes" style={inputStyle} placeholder="Monthly Budget, Expense Tracker, Savings Tracker" /></div>
        {error && <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{error}</p>}
        <button type="submit" disabled={saving} style={{ padding: '12px 24px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#d97706', border: 'none', borderRadius: 8, cursor: saving ? 'wait' : 'pointer' }}>{saving ? 'Saving...' : 'Create Printable'}</button>
      </form>
    </div>
  )
}