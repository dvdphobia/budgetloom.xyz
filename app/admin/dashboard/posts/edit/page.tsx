'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Eye } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Card, CardContent } from '@/app/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

function EditPostInner() {
  const [post, setPost] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('Budgeting')
  const [status, setStatus] = useState('published')
  const [previewMode, setPreviewMode] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get('id')

  useEffect(() => {
    if (id) {
      fetch(`/api/admin/posts/${id}`)
        .then((r) => r.json())
        .then((d) => {
          setPost(d.post)
          setCategory(d.post?.category || 'Budgeting')
          setStatus(d.post?.status || (d.post?.published ? 'published' : 'draft'))
        })
    }
  }, [id])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const form = e.target as HTMLFormElement
    const data = {
      slug: (form.elements.namedItem('slug') as HTMLInputElement).value,
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      seo_title: (form.elements.namedItem('seo_title') as HTMLInputElement)?.value || '',
      description: (form.elements.namedItem('description') as HTMLInputElement).value,
      date: (form.elements.namedItem('date') as HTMLInputElement).value,
      category,
      topic_cluster: (form.elements.namedItem('topic_cluster') as HTMLInputElement)?.value || category,
      read_time: (form.elements.namedItem('read_time') as HTMLInputElement).value,
      content: (form.elements.namedItem('content') as HTMLTextAreaElement).value,
      status,
      published: status === 'published' || status === 'updated',
    }
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) router.push('/admin/dashboard/posts')
      else {
        const d = await res.json().catch(() => ({}))
        setError(d.error || 'Save failed')
      }
    } catch {
      setError('Network error')
    }
    setSaving(false)
  }

  async function del() {
    if (!confirm('Archive this post?')) return
    await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    router.push('/admin/dashboard/posts')
  }

  if (!post) return <p className="text-muted-foreground">Loading guide...</p>

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/dashboard/posts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Guides
        </Link>
        <Button type="button" variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
          <Eye className="h-4 w-4 mr-1.5" />
          {previewMode ? 'Edit Mode' : 'Preview'}
        </Button>
      </div>

      <h2 className="text-xl font-bold">Edit Money Guide</h2>

      <form onSubmit={save}>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (Immutable URL)</Label>
                <Input id="slug" name="slug" defaultValue={post.slug} readOnly required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={post.title} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input id="seo_title" name="seo_title" defaultValue={post.seo_title || post.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic_cluster">Topic Cluster</Label>
                <Input id="topic_cluster" name="topic_cluster" defaultValue={post.topic_cluster || 'Budget Systems'} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Budgeting">Budgeting</SelectItem>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Debt">Debt</SelectItem>
                    <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="updated">Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={post.date?.split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="read_time">Read Time</Label>
                <Input id="read_time" name="read_time" defaultValue={post.read_time} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Meta Description</Label>
              <Input id="description" name="description" defaultValue={post.description} />
            </div>

            {previewMode ? (
              <div className="rounded-lg border p-6 bg-white space-y-3">
                <h1 className="text-2xl font-bold">{post.title}</h1>
                <p className="text-muted-foreground">{post.description}</p>
                <hr />
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="content">Content (Markdown)</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={post.content}
                  className="min-h-[400px] font-mono text-sm leading-relaxed"
                  required
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={del}
                className="text-destructive border-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Archive
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default function EditPost() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading editor...</p>}>
      <EditPostInner />
    </Suspense>
  )
}