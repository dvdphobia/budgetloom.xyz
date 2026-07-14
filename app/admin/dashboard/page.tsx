'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, FilePlus, Megaphone, Database, Sparkles, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
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

  const cards = [
    { label: 'Blog Posts', value: stats.posts, href: '/admin/dashboard/posts', icon: FileText, color: 'text-primary' },
    { label: 'Printables', value: stats.printables, href: '/admin/dashboard/printables', icon: FilePlus, color: 'text-amber-600' },
    { label: 'Active Ads', value: stats.adsEnabled, href: '/admin/dashboard/ads', icon: Megaphone, color: 'text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground">Manage your BudgetLoom website</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(card => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={cn('text-3xl font-bold', card.color)}>{card.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{card.label}</div>
                  </div>
                  <card.icon className={cn('h-10 w-10 opacity-20', card.color)} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Setup
          </CardTitle>
          <CardDescription>Initialize creates all tables. Seed copies existing content into the database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Button onClick={initDB} disabled={loading}>
              <Database className="h-4 w-4 mr-2" />
              Initialize Database
            </Button>
            <Button onClick={seedContent} disabled={loading} variant="secondary">
              <Sparkles className="h-4 w-4 mr-2" />
              Seed Existing Content
            </Button>
          </div>
          {initMsg && (
            <p className={cn('text-sm', initMsg.includes('Error') ? 'text-destructive' : 'text-primary')}>{initMsg}</p>
          )}
          {seedMsg && (
            <p className={cn('text-sm', seedMsg.includes('Error') ? 'text-destructive' : 'text-primary')}>{seedMsg}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <Link href="/admin/dashboard/posts/new" className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors">
            <span className="text-sm font-medium">Create New Post</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link href="/admin/dashboard/printables/new" className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors">
            <span className="text-sm font-medium">Create New Printable</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link href="/admin/dashboard/ads" className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors">
            <span className="text-sm font-medium">Manage Ads</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link href="/admin/dashboard/settings" className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors">
            <span className="text-sm font-medium">Edit Settings</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
