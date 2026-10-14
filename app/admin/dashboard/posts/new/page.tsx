'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'

const CLUSTERS = [
  'Budget Systems',
  'Paycheck and Variable Income',
  'Budget Printables and Binders',
  'Savings and Sinking Funds',
  'Groceries and Meal Planning',
  'Debt Tracking and Payoff Planning',
  'Bills and Utilities',
  'Household and Family Budgets',
  'Students and First Jobs',
  'No-Spend Challenges and Habits',
  'Seasonal and Event Budgeting',
  'Calculator Tutorials and Worked Examples',
  'Spreadsheets and Expense Tracking',
]

export default function NewPost() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('Budgeting')
  const [topicCluster, setTopicCluster] = useState('Budget Systems')
  const [status, setStatus] = useState('draft')
  const [title, setTitle] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const router = useRouter()

  const qualityChecks = useMemo(() => {
    const h2Count = (content.match(/^##\s+/gm) || []).length
    const hasNumbers = /\$\d+/.test(content)
    const hasInternalLink = /\/(blog|tools|printables|topics|budget-calculator|free-budget-template)/.test(content)
    const descOk = description.trim().length >= 70 && description.trim().length <= 165
    const titleOk = title.trim().length >= 20 && title.trim().length <= 90
    return [
      { label: 'Title between 20 and 90 characters', ok: titleOk },
      { label: 'Meta description between 70 and 165 characters', ok: descOk },
      { label: 'At least 3 structured H2 sections (##)', ok: h2Count >= 3 },
      { label: 'Includes concrete worked dollar examples ($)', ok: hasNumbers },
      { label: 'Links to a related calculator, printable, or guide', ok: hasInternalLink },
    ]
  }, [title, description, content])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const form = e.target as HTMLFormElement
    const relatedSlugsRaw = (form.elements.namedItem('related_slugs') as HTMLInputElement)?.value || ''
    const relatedToolsRaw = (form.elements.namedItem('related_tools') as HTMLInputElement)?.value || ''
    const relatedPrintablesRaw = (form.elements.namedItem('related_printables') as HTMLInputElement)?.value || ''

    const data = {
      slug: (form.elements.namedItem('slug') as HTMLInputElement).value.trim(),
      title: title.trim(),
      seo_title: (seoTitle || title).trim(),
      description: description.trim(),
      date: (form.elements.namedItem('date') as HTMLInputElement).value,
      category,
      topic_cluster: topicCluster,
      read_time: (form.elements.namedItem('read_time') as HTMLInputElement).value || '7 min',
      author: (form.elements.namedItem('author') as HTMLInputElement).value || 'BudgetLoom Editorial Team',
      reviewer: (form.elements.namedItem('reviewer') as HTMLInputElement).value || '',
      scheduled_for: (form.elements.namedItem('scheduled_for') as HTMLInputElement)?.value || null,
      related_slugs: relatedSlugsRaw.split(',').map((s) => s.trim()).filter(Boolean),
      related_tools: relatedToolsRaw.split(',').map((s) => s.trim()).filter(Boolean),
      related_printables: relatedPrintablesRaw.split(',').map((s) => s.trim()).filter(Boolean),
      content,
      status,
      published: status === 'published' || status === 'updated',
    }
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
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

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/dashboard/posts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Guides
        </Link>
        <Button type="button" variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
          <Eye className="h-4 w-4 mr-1.5" />
          {previewMode ? 'Edit Mode' : 'Preview Guide'}
        </Button>
      </div>

      <h2 className="text-xl font-bold">Create New Money Guide</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={save}>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug">Permanent URL Slug</Label>
                    <Input id="slug" name="slug" placeholder="how-to-build-a-monthly-budget" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Article Title ({title.length}/90)</Label>
                    <Input
                      id="title"
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Clear, reader-first headline"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Title Tag (optional override)</Label>
                  <Input
                    id="seo_title"
                    name="seo_title"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Defaults to article title if left blank"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <Label>Topic Cluster</Label>
                    <Select value={topicCluster} onValueChange={setTopicCluster}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CLUSTERS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Publication Status</Label>
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Publication Date</Label>
                    <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="read_time">Read Time</Label>
                    <Input id="read_time" name="read_time" defaultValue="8 min" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_for">Schedule For (if Scheduled)</Label>
                    <Input id="scheduled_for" name="scheduled_for" type="datetime-local" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Author Attribution</Label>
                    <Input id="author" name="author" defaultValue="BudgetLoom Editorial Team" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviewer">Editorial Reviewer (optional)</Label>
                    <Input id="reviewer" name="reviewer" placeholder="Only if legitimately reviewed" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Meta Description ({description.length}/160)</Label>
                  <Input
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Concise summary of the guide and its worked examples"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="related_slugs">Related Guide Slugs</Label>
                    <Input id="related_slugs" name="related_slugs" placeholder="how-to-make-a-monthly-budget" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="related_tools">Related Calculator Paths</Label>
                    <Input id="related_tools" name="related_tools" placeholder="/budget-calculator" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="related_printables">Related Printable Slugs</Label>
                    <Input id="related_printables" name="related_printables" placeholder="budget-starter-bundle" />
                  </div>
                </div>

                {previewMode ? (
                  <div className="rounded-lg border p-6 bg-white space-y-3 prose max-w-none">
                    <h1 className="text-2xl font-bold">{title || 'Untitled Guide'}</h1>
                    <p className="text-muted-foreground">{description}</p>
                    <hr />
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{content}</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="content">Article Body (Markdown)</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[420px] font-mono text-sm leading-relaxed"
                      placeholder="## Start with your real numbers..."
                      required
                    />
                  </div>
                )}

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Guide'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Editorial Quality Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {qualityChecks.map((check) => (
                <div key={check.label} className="flex items-start gap-2 text-xs">
                  {check.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={check.ok ? 'text-slate-800' : 'text-muted-foreground'}>{check.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}