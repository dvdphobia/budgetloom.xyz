'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Card, CardContent } from '@/app/components/ui/card'

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
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/dashboard/printables" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Printables
      </Link>
      <h2 className="text-xl font-bold">New Printable</h2>
      <form onSubmit={save}>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="slug">Slug</Label><Input id="slug" name="slug" placeholder="my-printable" required /></div>
              <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" name="title" placeholder="Printable title" required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="description">Description</Label><Input id="description" name="description" placeholder="Short description" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label htmlFor="price">Price</Label><Input id="price" name="price" defaultValue="Free" /></div>
              <div className="space-y-2"><Label htmlFor="pages">Pages</Label><Input id="pages" name="pages" type="number" defaultValue="1" /></div>
              <div className="space-y-2"><Label htmlFor="file_url">File URL</Label><Input id="file_url" name="file_url" placeholder="/printables/slug.pdf" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="includes">Includes (comma-separated)</Label><Input id="includes" name="includes" placeholder="Monthly Budget, Expense Tracker, Savings Tracker" /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Create Printable'}</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}