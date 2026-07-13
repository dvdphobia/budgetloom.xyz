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
            <div className="footer-social" style={{marginTop: '1rem'}}>
              <a href="https://pinterest.com/budgetloom" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">P</a>
              <a href="mailto:hello@budgetloom.xyz" aria-label="Email">@</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <Link href="/blog/">Guides</Link>
            <Link href="/blog/#savings">Savings</Link>
            <Link href="/blog/#budgeting">Budgeting</Link>
            <Link href="/blog/#food">Food</Link>
            <Link href="/blog/#debt">Debt</Link>
            <Link href="/printables/">Printables</Link>
            <Link href="/about/">About</Link>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <Link href="/privacy/">Privacy</Link>
            <Link href="/terms/">Terms</Link>
            <Link href="/contact/">Contact</Link>
          </div>
          <div className="footer-col footer-newsletter">
            <h4>Free Weekly Tips</h4>
            <p style={{fontSize: '0.85rem', marginBottom: '0.8rem'}}>Get money-saving tips and free printables in your inbox.</p>
            <form action="/api/subscribe/" method="POST" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              <input type="email" name="email" placeholder="your@email.com" aria-label="Email address" required />
              <input type="hidden" name="tag" value="footer" />
              <button type="submit" className="btn btn-sm" style={{width: '100%'}}>Subscribe Free</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} BudgetLoom. All rights reserved.</div>
          <div>BudgetLoom is reader-supported. We may earn commissions from affiliate links.</div>
        </div>
      </div>
    </footer>
  )
}