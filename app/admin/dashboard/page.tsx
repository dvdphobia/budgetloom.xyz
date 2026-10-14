'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { cn } from '@/lib/utils'

export default function OverviewPage() {
  const [stats, setStats] = useState({
    posts: 0,
    printables: 0,
    adsEnabled: 0,
    subscribers: 0,
    downloads: 0,
    databaseConnected: false,
  })
  const [backlog, setBacklog] = useState({ total: 130, published: 0, draft: 0, idea: 0 })
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [initMsg, setInitMsg] = useState('')
  const [seedMsg, setSeedMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/posts').then((r) => r.json()).catch(() => ({})),
      fetch('/api/admin/printables').then((r) => r.json()).catch(() => ({})),
      fetch('/api/admin/ads').then((r) => r.json()).catch(() => ({})),
      fetch('/api/admin/audit').then((r) => r.json()).catch(() => ({})),
    ]).then(([p, pr, a, au]) => {
      setStats({
        posts: p.posts?.length || au.counts?.staticPosts || 0,
        printables: pr.printables?.length || au.counts?.staticPrintables || 0,
        adsEnabled: a.ads?.filter((ad: any) => ad.enabled).length || 0,
        subscribers: au.counts?.subscribers || 0,
        downloads: au.counts?.downloads || 0,
        databaseConnected: Boolean(au.databaseConnected || p.databaseConnected),
      })
      if (au.backlogCounts) setBacklog(au.backlogCounts)
      if (Array.isArray(au.auditLogs)) setAuditLogs(au.auditLogs)
    })
  }, [])

  async function runMigrations() {
    setLoading(true)
    setInitMsg('')
    try {
      const res = await fetch('/api/admin/init', { method: 'POST' })
      const data = await res.json()
      setInitMsg(
        res.ok
          ? `Database migrations applied successfully (Schema v${data.schemaVersion ?? 3}).`
          : `Error: ${data.error}`
      )
    } catch {
      setInitMsg('Network error running migrations')
    }
    setLoading(false)
  }

  async function seedContent() {
    setLoading(true)
    setSeedMsg('')
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' })
      const data = await res.json()
      setSeedMsg(
        res.ok
          ? `Synced ${data.postsSeeded} static guides and ${data.printablesSeeded} printables to database.`
          : `Error: ${data.error}`
      )
    } catch {
      setSeedMsg('Network error seeding content')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Editorial & System Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time repository, database, and content pipeline status. No synthetic metrics are displayed.
          </p>
        </div>
        <Badge variant={stats.databaseConnected ? 'success' : 'secondary'} className="w-fit flex items-center gap-1.5">
          {stats.databaseConnected ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" /> PostgreSQL Connected
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5" /> Static Catalog Mode (DB Unconfigured)
            </>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Money Guides', value: stats.posts, href: '/admin/dashboard/posts' },
          { label: 'Printable PDFs', value: stats.printables, href: '/admin/dashboard/printables' },
          { label: 'Enabled Ad Slots', value: stats.adsEnabled, href: '/admin/dashboard/ads' },
          { label: 'SEO Backlog Topics', value: backlog.total, href: '/admin/dashboard/posts' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <p className="text-3xl font-bold mt-2 text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">130-Topic SEO Content Backlog Pipeline</CardTitle>
            <CardDescription>Status distribution across the 13 topic clusters in content/seo-backlog.json</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Published from backlog</span>
              <Badge variant="success">{backlog.published}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">In review / Draft</span>
              <Badge variant="secondary">{backlog.draft}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Queued candidate briefs</span>
              <Badge variant="outline">{backlog.idea}</Badge>
            </div>
            <div className="pt-3 border-t flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href="/admin/dashboard/posts/new">
                  Create New Guide <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/dashboard/printables/new">Add Printable</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Database Schema & Maintenance</CardTitle>
            <CardDescription>
              Run idempotent schema migrations (v3) and sync static guides/printables into PostgreSQL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={runMigrations} disabled={loading} variant="outline" size="sm">
                Run Schema Migrations
              </Button>
              <Button onClick={seedContent} disabled={loading} variant="outline" size="sm">
                Sync Static Catalog to DB
              </Button>
            </div>
            {initMsg && (
              <div
                className={cn(
                  'text-xs p-3 rounded border',
                  initMsg.includes('Error')
                    ? 'border-destructive/30 bg-destructive/10 text-destructive'
                    : 'border-primary/30 bg-primary/10 text-primary'
                )}
              >
                {initMsg}
              </div>
            )}
            {seedMsg && (
              <div
                className={cn(
                  'text-xs p-3 rounded border',
                  seedMsg.includes('Error')
                    ? 'border-destructive/30 bg-destructive/10 text-destructive'
                    : 'border-primary/30 bg-primary/10 text-primary'
                )}
              >
                {seedMsg}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Administrative Audit Logs</CardTitle>
          <CardDescription>Recorded authentication and content mutations in PostgreSQL</CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No database audit events recorded yet. Connect PostgreSQL and run migrations to persist audit trails.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {auditLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between text-xs py-2 border-b last:border-0 border-slate-100"
                >
                  <div>
                    <span className="font-semibold text-slate-900">{log.actor}</span>{' '}
                    <span className="text-muted-foreground">performed</span>{' '}
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded">{log.action}</code>{' '}
                    <span className="text-muted-foreground">on {log.entity_type}</span>{' '}
                    {log.entity_id && <span className="font-mono">({log.entity_id})</span>}
                  </div>
                  <time className="text-muted-foreground">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                  </time>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
