'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FileText, FilePlus, Megaphone, Settings, LogOut, ExternalLink, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/app/components/ui/button'

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/dashboard/posts', label: 'Blog Posts', icon: FileText },
  { href: '/admin/dashboard/printables', label: 'Printables', icon: FilePlus },
  { href: '/admin/dashboard/ads', label: 'Ad Management', icon: Megaphone },
  { href: '/admin/dashboard/settings', label: 'Site Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(res => setAuthed(res.status !== 401 ? true : false))
      .catch(() => setAuthed(false))
  }, [])

  if (authed === null) {
    return <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#0c1a1e' }}>Loading...</div>
  }

  if (!authed) {
    router.push('/admin/login')
    return null
  }

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const currentLabel = navItems.find(n => pathname === n.href || pathname?.startsWith(n.href + '/'))?.label || 'Admin'

  return (
    <div className="min-h-screen bg-muted/30 flex admin-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 bg-card border-r border-border",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex flex-col gap-1">
            <div className="text-base font-bold text-foreground">BudgetLoom</div>
            <div className="text-xs text-muted-foreground font-medium">Management</div>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden text-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  active 
                    ? "bg-primary/10 text-primary border border-primary/30" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200">
            <ExternalLink className="h-5 w-5 flex-shrink-0" />
            View Site
          </a>
          <button onClick={logout} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-destructive hover:text-destructive hover:bg-destructive/5 transition-all duration-200 w-full">
            <LogOut className="h-5 w-5 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100/50">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200/50 bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">{currentLabel}</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
