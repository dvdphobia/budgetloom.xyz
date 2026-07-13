'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo" onClick={() => setOpen(false)}>
          <span className="logo-mark">B</span>
          BudgetLoom
        </Link>
        <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
        <nav className={`nav ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
          <Link href="/blog/">Guides</Link>
          <Link href="/printables/">Printables</Link>
          <Link href="/about/">About</Link>
          <Link href="/#free-library" className="nav-cta">Free Library</Link>
        </nav>
      </div>
    </header>
  )
}