'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, FilePlus, Megaphone, Database, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function OverviewPage() {
  const [stats, setStats] = useState({ posts: 0, printables: 0, adsEnabled: 0 })
  const [initMsg, setInitMsg] = useState('')
  const [seedMsg, setSeedMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/posts').then(r => r.json()),
      fetch('/api/admin/printables').then(r => r.json()),
      fetch('/api/admin/ads').then(r => r.json()),
    ]).then(([p, pr, a]) => {
      setStats({
        posts: p.posts?.length || 0,
        printables: pr.printables?.length || 0,
        adsEnabled: a.ads?.filter((ad: any) => ad.enabled).length || 0,
      })
    }).catch(() => {})
  }, [])

  async function initDB() {
    setLoading(true); setInitMsg('')
    try {
      const res = await fetch('/api/admin/init', { method: 'POST' })
      const data = await res.json()
      setInitMsg(res.ok ? 'Database initialized successfully!' : `Error: ${data.error}`)
    } catch { setInitMsg('Network error') }
    setLoading(false)
  }

  async function seedContent() {
    setLoading(true); setSeedMsg('')
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' })
      const data = await res.json()
      setSeedMsg(res.ok ? `Seeded ${data.postsSeeded} posts and ${data.printablesSeeded} printables!` : `Error: ${data.error}`)
    } catch { setSeedMsg('Network error') }
    setLoading(false)
  }

  return (
    <div className="space-y-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage content and site settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-8">
        {[
          { label: 'Posts', value: stats.posts, href: '/admin/dashboard/posts' },
          { label: 'Printables', value: stats.printables, href: '/admin/dashboard/printables' },
          { label: 'Ads enabled', value: stats.adsEnabled, href: '/admin/dashboard/ads' },
        ].map(stat => (
          <Link key={stat.label} href={stat.href} className="group">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <p className="text-4xl font-semibold group-hover:text-primary transition-colors">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Actions Section */}
      <div className="space-y-8">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Content</h2>
          <div className="space-y-3">
            {[
              { href: '/admin/dashboard/posts/new', label: 'New blog post' },
              { href: '/admin/dashboard/printables/new', label: 'New printable' },
              { href: '/admin/dashboard/ads', label: 'Manage ads' },
            ].map(action => (
              <Link key={action.label} href={action.href}>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer">
                  <span className="text-sm font-medium group-hover:text-foreground">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Site</h2>
          <Link href="/admin/dashboard/settings">
            <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer">
              <span className="text-sm font-medium group-hover:text-foreground">Settings</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          </Link>
        </div>
      </div>

      {/* Database Section */}
      <div className="space-y-6 pt-8 border-t">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Database</h2>
          <p className="text-xs text-muted-foreground mt-1">Initialize tables and seed sample data</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={initDB} disabled={loading} variant="outline">
            Initialize
          </Button>
          <Button onClick={seedContent} disabled={loading} variant="outline">
            Seed data
          </Button>
        </div>

        {initMsg && (
          <div className={cn(
            'text-xs p-3 rounded border',
            initMsg.includes('Error')
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-primary/30 bg-primary/10 text-primary'
          )}>
            {initMsg}
          </div>
        )}

        {seedMsg && (
          <div className={cn(
            'text-xs p-3 rounded border',
            seedMsg.includes('Error')
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-primary/30 bg-primary/10 text-primary'
          )}>
            {seedMsg}
          </div>
        )}
      </div>
    </div>
  )
}
