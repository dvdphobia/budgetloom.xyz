import Link from 'next/link'
import { LogoMark, Icon } from './Icons'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <LogoMark size={24} />
              <span className="footer-brand-name">BudgetLoom</span>
            </div>
            <p className="footer-desc">
              Free budget printables and money guides for people who want to save more without stress.
            </p>
            <div className="footer-social" style={{ marginTop: '1rem' }}>
              <a href="https://pinterest.com/budgetloom" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                <Icon.pin />
              </a>
              <a href="mailto:hello@budgetloom.xyz" aria-label="Email">
                <Icon.mail />
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <Link href="/blog">Guides</Link>
            <Link href="/blog#savings">Savings</Link>
            <Link href="/blog#budgeting">Budgeting</Link>
            <Link href="/blog#food">Food</Link>
            <Link href="/blog#debt">Debt</Link>
            <Link href="/printables">Printables</Link>
            <Link href="/free-budget-template">Budget Template</Link>
            <Link href="/budget-calculator">Budget Calculator</Link>
            <Link href="/about">About</Link>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} BudgetLoom</div>
          <div>Reader-supported. We may earn commissions from affiliate links.</div>
        </div>
      </div>
    </footer>
  )
}
