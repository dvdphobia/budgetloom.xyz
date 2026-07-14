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
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Manage your BudgetLoom content and settings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(card => (
          <Link key={card.label} href={card.href}>
            <Card className="relative overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={cn('text-4xl font-bold tracking-tight', card.color)}>{card.value}</div>
                    <p className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-wide">{card.label}</p>
                  </div>
                  <div className={cn('h-12 w-12 rounded-lg bg-gradient-to-br from-background to-muted flex items-center justify-center', 'group-hover:scale-110 transition-transform')}>
                    <card.icon className={cn('h-6 w-6', card.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Database Setup Section */}
      <Card className="border-l-4 border-l-primary/50">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
          <CardTitle className="text-xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            Database Setup
          </CardTitle>
          <CardDescription className="mt-2">Initialize creates all tables. Seed copies existing content into the database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={initDB} 
              disabled={loading}
              className="gap-2"
            >
              <Database className="h-4 w-4" />
              Initialize Database
            </Button>
            <Button 
              onClick={seedContent} 
              disabled={loading} 
              variant="secondary"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Seed Content
            </Button>
          </div>
          {initMsg && (
            <div className={cn('p-3 rounded-lg text-sm font-medium', initMsg.includes('Error') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary')}>
              {initMsg}
            </div>
          )}
          {seedMsg && (
            <div className={cn('p-3 rounded-lg text-sm font-medium', seedMsg.includes('Error') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary')}>
              {seedMsg}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {[
            { href: "/admin/dashboard/posts/new", label: "Create New Post", icon: FilePlus },
            { href: "/admin/dashboard/printables/new", label: "Create New Printable", icon: FileText },
            { href: "/admin/dashboard/ads", label: "Manage Ads", icon: Megaphone },
            { href: "/admin/dashboard/settings", label: "Edit Settings", icon: Database }
          ].map(action => {
            const IconComponent = action.icon
            return (
              <Link 
                key={action.label}
                href={action.href} 
                className="group flex items-center justify-between rounded-lg border border-border p-4 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
