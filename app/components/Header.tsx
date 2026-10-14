'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { href: '/blog', label: 'Guides' },
  { href: '/topics', label: 'Topics' },
  { href: '/tools', label: 'Calculators' },
  { href: '/printables', label: 'Printables' },
  { href: '/about', label: 'About' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="" width={28} height={28} sizes="28px" priority style={{ borderRadius: 6 }} />
          <span>BudgetLoom</span>
        </Link>
        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="primary-navigation"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
        <nav
          id="primary-navigation"
          className={`nav ${open ? 'open' : ''}`}
          onClick={() => setOpen(false)}
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname?.startsWith(item.href + '/')) ||
              (item.href === '/tools' && pathname === '/budget-calculator')
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? 'active' : undefined}
              >
                {item.label}
              </Link>
            )
          })}
          <Link href="/free-budget-template" className="nav-cta">
            Free Template
          </Link>
        </nav>
      </div>
    </header>
  )
}
