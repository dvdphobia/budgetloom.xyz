import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">BudgetLoom</div>
            <p className="footer-desc">
              Free budget printables, money-saving challenges, and simple guides to help you save more and spend smarter.
            </p>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <Link href="/blog/">Guides</Link>
            <Link href="/printables/">Printables</Link>
            <Link href="/about/">About</Link>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <Link href="/privacy/">Privacy</Link>
            <Link href="/terms/">Terms</Link>
            <Link href="/contact/">Contact</Link>
          </div>
          <div className="footer-col">
            <h4>Follow</h4>
            <a href="https://pinterest.com/budgetloom" target="_blank" rel="noopener noreferrer">Pinterest</a>
            <a href="/#free-library">Free Library</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} BudgetLoom. All rights reserved.</div>
          <div className="footer-social">
            <a href="https://pinterest.com/budgetloom" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">P</a>
            <a href="mailto:hello@budgetloom.xyz" aria-label="Email">@</a>
          </div>
        </div>
      </div>
    </footer>
  )
}