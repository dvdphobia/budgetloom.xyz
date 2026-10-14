'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import { Badge } from '@/app/components/ui/badge'
import { Card } from '@/app/components/ui/card'

export default function PostsList() {
  const [posts, setPosts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/posts')
      .then((r) => r.json())
      .then((d) => {
        setPosts(d.posts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function del(id: number) {
    if (!confirm('Archive this post? It will be hidden from public views and the sitemap.')) return
    const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts(posts.filter((p) => p.id !== id))
    }
  }

  const filtered = posts.filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    const effectiveStatus = p.status || (p.published ? 'published' : 'draft')
    const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) return <p className="text-muted-foreground">Loading guides...</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Money Guides ({filtered.length} of {posts.length})</h2>
          <p className="text-xs text-muted-foreground">Manage published articles, drafts, review statuses, and topic clusters</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/dashboard/posts/new">
            <Plus className="h-4 w-4 mr-2" />
            New Guide
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by title, slug, or category..."
            className="pl-9"
          />
        </div>
        <select
          aria-label="Filter by publication status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="scheduled">Scheduled</option>
          <option value="updated">Updated</option>
        </select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title & Slug</TableHead>
              <TableHead>Category / Cluster</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const status = p.status || (p.published ? 'published' : 'draft')
              return (
                <TableRow key={p.id || p.slug}>
                  <TableCell className="max-w-xs">
                    <div className="font-medium truncate">{p.title}</div>
                    <div className="text-xs text-muted-foreground truncate">/blog/{p.slug}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    <div className="font-medium text-foreground">{p.category}</div>
                    <div>{p.topic_cluster || 'Budget Systems'}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{p.date}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={status === 'published' || status === 'updated' ? 'success' : 'secondary'}>
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/blog/${p.slug}`} target="_blank">
                          View
                        </Link>
                      </Button>
                      {p.source !== 'static' && (
                        <>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/dashboard/posts/edit?id=${p.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => del(p.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}