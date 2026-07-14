'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/dashboard/posts', label: 'Blog Posts', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { href: '/admin/dashboard/printables', label: 'Printables', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/admin/dashboard/ads', label: 'Ad Management', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13.118l-6.5-3.5m6.5 3.5l3.417 2.094M18 13.118V6.5m0 6.618L14 19.5' },
  { href: '/admin/dashboard/settings', label: 'Site Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
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
    return <div style={{ minHeight: '100vh', background: '#0c1a1e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>
  }

  if (!authed) {
    router.push('/admin/login')
    return null
  }

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#0c1a1e', color: '#fff', minHeight: '100vh',
        display: sidebarOpen ? 'block' : 'none', position: 'fixed', zIndex: 50,
        '@media (min-width: 768px)': { display: 'block', position: 'sticky', top: 0 } } as any}
      >
        <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>BudgetLoom</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Admin Panel</div>
        </div>
        <nav style={{ padding: 8 }}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                borderRadius: 8, fontSize: 14, fontWeight: 500, marginBottom: 2,
                color: pathname === item.href || pathname?.startsWith(item.href + '/') ? '#fff' : '#9ca3af',
                background: pathname === item.href || pathname?.startsWith(item.href + '/') ? 'rgba(5,150,105,0.2)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s',
              }}>
              <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
          <a href="/" target="_blank" style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 8, textDecoration: 'none' }}>View Site →</a>
          <button onClick={logout} style={{ fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'block', '@media (min-width: 768px)': { display: 'none' } } as any}>
            <svg width={24} height={24} fill="none" stroke="#0c1a1e" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: '#0c1a1e' }}>{navItems.find(n => pathname === n.href || pathname?.startsWith(n.href + '/'))?.label || 'Admin'}</h1>
        </header>
        <main style={{ padding: 24 }}>{children}</main>
      </div>
    </div>
  )
}