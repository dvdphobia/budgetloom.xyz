import Link from 'next/link'

export default function Header() {
  return (
    <header>
      <div className="container">
        <Link href="/" className="logo">BudgetLoom</Link>
        <nav>
          <Link href="/blog/">Guides</Link>
          <Link href="/printables/">Printables</Link>
          <Link href="/about/">About</Link>
        </nav>
      </div>
    </header>
  )
}
