'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="" width={28} height={28} sizes="28px" priority style={{ borderRadius: 6 }} />
          BudgetLoom
        </Link>
        <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
        <nav className={`nav ${open ? 'open' : ''}`} onClick={() => setOpen(false)} aria-label="Main navigation">
          <Link href="/blog">Guides</Link>
          <Link href="/budget-calculator">Calculator</Link>
          <Link href="/printables">Printables</Link>
          <Link href="/about">About</Link>
          <Link href="/#free-library" className="nav-cta">Free Library</Link>
        </nav>
      </div>
    </header>
  )
}
