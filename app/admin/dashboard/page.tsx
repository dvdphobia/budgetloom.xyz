'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, FilePlus, Megaphone, Database, Sparkles, ArrowRight, TrendingUp, Zap, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
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
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 md:p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 size-80 bg-primary/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary animate-pulse" />
            <Badge variant="secondary" className="font-semibold">Dashboard v1</Badge>
          </div>
          <h1 className="mb-2 text-5xl font-black">Welcome, Admin</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Manage all your content, resources, and monetization settings from one beautiful interface.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Zap className="size-6 text-primary" />
            Your Content
          </h2>
          <Badge>Live</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Blog Posts', value: stats.posts, href: '/admin/dashboard/posts', icon: FileText },
            { label: 'Printables', value: stats.printables, href: '/admin/dashboard/printables', icon: FilePlus },
            { label: 'Active Ads', value: stats.adsEnabled, href: '/admin/dashboard/ads', icon: Megaphone },
          ].map(stat => (
            <Link key={stat.label} href={stat.href}>
              <Card className="group relative overflow-hidden border-primary/10 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                      <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                        <stat.icon className="size-4 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-4xl font-black tracking-tight">{stat.value}</p>
                      <div className="h-1 w-16 rounded-full bg-gradient-to-r from-primary to-transparent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="actions" className="gap-2">
            <FilePlus className="size-4" />
            Quick Actions
          </TabsTrigger>
          <TabsTrigger value="setup" className="gap-2">
            <Database className="size-4" />
            Database
          </TabsTrigger>
        </TabsList>

        {/* Quick Actions Tab */}
        <TabsContent value="actions" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Create and manage all your content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { href: '/admin/dashboard/posts/new', label: 'Create New Blog Post', desc: 'Write and publish blog content', icon: FileText },
                  { href: '/admin/dashboard/printables/new', label: 'Create Printable Resource', desc: 'Add new printable products', icon: FilePlus },
                  { href: '/admin/dashboard/ads', label: 'Manage Advertisements', desc: 'Configure monetization ads', icon: Megaphone },
                  { href: '/admin/dashboard/settings', label: 'Site Configuration', desc: 'Update site settings', icon: Database },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <Link key={item.label} href={item.href}>
                      <div className="group flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/20">
                            <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Setup Tab */}
        <TabsContent value="setup" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Setup</CardTitle>
              <CardDescription>Initialize and manage your database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Initialize */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Initialize Database</h3>
                      <p className="text-sm text-muted-foreground">Create all required tables and schema</p>
                    </div>
                  </div>
                  <Button 
                    onClick={initDB} 
                    disabled={loading}
                    size="sm"
                    className="gap-2 flex-shrink-0"
                  >
                    <Database className="size-4" />
                    Initialize
                  </Button>
                </div>
                {initMsg && (
                  <div className={cn(
                    'p-3 rounded-lg text-sm border-l-4',
                    initMsg.includes('Error')
                      ? 'border-l-destructive bg-destructive/5 text-destructive'
                      : 'border-l-primary bg-primary/5 text-primary'
                  )}>
                    {initMsg}
                  </div>
                )}
              </div>

              <Separator />

              {/* Seed Content */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="size-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Seed Sample Data</h3>
                      <p className="text-sm text-muted-foreground">Populate with example posts and printables</p>
                    </div>
                  </div>
                  <Button 
                    onClick={seedContent} 
                    disabled={loading} 
                    variant="secondary"
                    size="sm"
                    className="gap-2 flex-shrink-0"
                  >
                    <Sparkles className="size-4" />
                    Seed
                  </Button>
                </div>
                {seedMsg && (
                  <div className={cn(
                    'p-3 rounded-lg text-sm border-l-4',
                    seedMsg.includes('Error')
                      ? 'border-l-destructive bg-destructive/5 text-destructive'
                      : 'border-l-primary bg-primary/5 text-primary'
                  )}>
                    {seedMsg}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
