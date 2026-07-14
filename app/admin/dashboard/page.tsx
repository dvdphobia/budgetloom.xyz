'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, FilePlus, Megaphone, Database, Sparkles, ArrowRight, TrendingUp } from 'lucide-react'
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
    { label: 'Blog Posts', value: stats.posts, href: '/admin/dashboard/posts', icon: FileText, gradient: 'from-emerald-500/20 to-transparent', accentColor: 'text-emerald-600' },
    { label: 'Printables', value: stats.printables, href: '/admin/dashboard/printables', icon: FilePlus, gradient: 'from-amber-500/20 to-transparent', accentColor: 'text-amber-600' },
    { label: 'Active Ads', value: stats.adsEnabled, href: '/admin/dashboard/ads', icon: Megaphone, gradient: 'from-violet-500/20 to-transparent', accentColor: 'text-violet-600' },
  ]

  return (
    <div className="space-y-8 pb-8">
      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Welcome Back</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-300 text-lg">Manage your BudgetLoom content, settings, and performance</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card, idx) => (
          <Link key={card.label} href={card.href}>
            <Card className={cn(
              "relative overflow-hidden transition-all duration-300 cursor-pointer group h-full",
              "hover:shadow-xl hover:-translate-y-2 border border-slate-200/40 hover:border-primary/50"
            )}>
              {/* Background Gradient */}
              <div className={cn("absolute inset-0 bg-gradient-to-br", card.gradient, "opacity-40 group-hover:opacity-60 transition-opacity")} />
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl -mr-20 -mt-20 group-hover:from-primary/10 transition-all" />
              
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">{card.label}</p>
                    <div className={cn("text-5xl font-black tracking-tighter", card.accentColor)}>
                      {card.value}
                    </div>
                  </div>
                  <div className={cn(
                    "h-14 w-14 rounded-lg flex items-center justify-center flex-shrink-0",
                    "bg-gradient-to-br from-slate-100 to-slate-50 group-hover:scale-110 transition-transform duration-300",
                    "shadow-sm group-hover:shadow-md"
                  )}>
                    <card.icon className={cn("h-7 w-7", card.accentColor)} />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
                  <TrendingUp className="h-3 w-3" />
                  <span>View all items</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Database Setup Section */}
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-slate-50/50 to-slate-50/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-40 -mt-40" />
        
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold">Database Setup</CardTitle>
          </div>
          <CardDescription className="text-sm">Initialize creates all required tables. Seed copies existing content into the database.</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={initDB} 
              disabled={loading}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
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
            <div className={cn(
              'p-3 rounded-lg text-sm font-medium transition-all',
              initMsg.includes('Error') 
                ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                : 'bg-primary/10 text-primary border border-primary/20'
            )}>
              {initMsg}
            </div>
          )}
          {seedMsg && (
            <div className={cn(
              'p-3 rounded-lg text-sm font-medium transition-all',
              seedMsg.includes('Error')
                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                : 'bg-primary/10 text-primary border border-primary/20'
            )}>
              {seedMsg}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Section */}
      <Card className="border-slate-200/40">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
          <CardDescription>Frequently used shortcuts to manage your content</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {[
            { href: "/admin/dashboard/posts/new", label: "Create New Post", icon: FilePlus, color: 'emerald' },
            { href: "/admin/dashboard/printables/new", label: "Create Printable", icon: FileText, color: 'amber' },
            { href: "/admin/dashboard/ads", label: "Manage Ads", icon: Megaphone, color: 'violet' },
            { href: "/admin/dashboard/settings", label: "Site Settings", icon: Database, color: 'slate' }
          ].map(action => {
            const IconComponent = action.icon
            const colorMap: any = {
              emerald: { bg: 'from-emerald-500/10 to-emerald-500/5', icon: 'text-emerald-600', border: 'hover:border-emerald-500/50' },
              amber: { bg: 'from-amber-500/10 to-amber-500/5', icon: 'text-amber-600', border: 'hover:border-amber-500/50' },
              violet: { bg: 'from-violet-500/10 to-violet-500/5', icon: 'text-violet-600', border: 'hover:border-violet-500/50' },
              slate: { bg: 'from-slate-500/10 to-slate-500/5', icon: 'text-slate-600', border: 'hover:border-slate-500/50' }
            }
            const colors = colorMap[action.color]
            return (
              <Link 
                key={action.label}
                href={action.href} 
                className={cn(
                  "group relative overflow-hidden rounded-lg border border-slate-200/40 p-4",
                  "transition-all duration-300 hover:shadow-md",
                  colors.border
                )}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br", colors.bg, "opacity-0 group-hover:opacity-100 transition-opacity")} />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      "bg-gradient-to-br from-slate-100 to-slate-50 group-hover:scale-110 transition-transform"
                    )}>
                      <IconComponent className={cn("h-5 w-5", colors.icon)} />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{action.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
