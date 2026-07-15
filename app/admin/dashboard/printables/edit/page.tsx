'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Card, CardContent } from '@/app/components/ui/card'

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

  if (!item) return <p className="text-muted-foreground">Loading...</p>
  const includesArr = Array.isArray(item.includes) ? item.includes : []

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/dashboard/printables" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Printables
      </Link>
      <h2 className="text-xl font-bold">Edit Printable</h2>
      <form onSubmit={save}>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="slug">Slug</Label><Input id="slug" name="slug" defaultValue={item.slug} required /></div>
              <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" name="title" defaultValue={item.title} required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="description">Description</Label><Input id="description" name="description" defaultValue={item.description} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label htmlFor="price">Price</Label><Input id="price" name="price" defaultValue={item.price} /></div>
              <div className="space-y-2"><Label htmlFor="pages">Pages</Label><Input id="pages" name="pages" type="number" defaultValue={item.pages} /></div>
              <div className="space-y-2"><Label htmlFor="file_url">File URL</Label><Input id="file_url" name="file_url" defaultValue={item.file_url} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="includes">Includes (comma-separated)</Label><Input id="includes" name="includes" defaultValue={includesArr.join(', ')} /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}</Button>
              <Button type="button" variant="outline" onClick={del} className="text-destructive border-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}