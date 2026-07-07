import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div>&copy; {new Date().getFullYear()} BudgetLoom. All rights reserved.</div>
        <div>
          <Link href="/privacy/">Privacy</Link> · <Link href="/terms/">Terms</Link> · <Link href="/contact/">Contact</Link>
        </div>
      </div>
    </footer>
  )
}
