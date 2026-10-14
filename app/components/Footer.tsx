import Link from 'next/link'
import { LogoMark, Icon } from './Icons'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <LogoMark size={26} />
              <span className="footer-brand-name">BudgetLoom</span>
            </div>
            <p className="footer-desc">
              Practical personal finance guides, interactive budgeting calculators, and free printable planners built for real everyday numbers.
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-light)', marginTop: '0.75rem', maxWidth: '300px', lineHeight: 1.45 }}>
              Educational resource only. BudgetLoom does not provide individualized financial, tax, legal, or investment advice.
            </p>
            <div className="footer-social" style={{ marginTop: '1rem' }}>
              <a href="https://pinterest.com/budgetloom" target="_blank" rel="noopener noreferrer" aria-label="BudgetLoom on Pinterest">
                <Icon.pin />
              </a>
              <a href="mailto:hello@budgetloom.xyz" aria-label="Email BudgetLoom">
                <Icon.mail />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Calculators & Tools</h4>
            <Link href="/tools">All 15 Calculators</Link>
            <Link href="/budget-calculator">Monthly Budget Calculator</Link>
            <Link href="/tools/zero-based-budget-calculator">Zero-Based Calculator</Link>
            <Link href="/tools/50-30-20-budget-calculator">50/30/20 Split Calculator</Link>
            <Link href="/tools/paycheck-budget-planner">Paycheck Budget Planner</Link>
            <Link href="/tools/biweekly-budget-calculator">Biweekly Budget Calculator</Link>
            <Link href="/tools/sinking-fund-calculator">Sinking Fund Calculator</Link>
            <Link href="/tools/debt-snowball-calculator">Debt Snowball Calculator</Link>
            <Link href="/tools/debt-avalanche-calculator">Debt Avalanche Calculator</Link>
            <Link href="/tools/savings-goal-calculator">Savings Goal Calculator</Link>
            <Link href="/tools/savings-challenge-generator">30-Day Savings Challenge</Link>
          </div>

          <div className="footer-col">
            <h4>Topics & Printables</h4>
            <Link href="/topics">All 13 Topic Hubs</Link>
            <Link href="/topics/budget-systems">Budgeting Methods</Link>
            <Link href="/topics/paycheck-and-variable-income">Paycheck & Variable Pay</Link>
            <Link href="/topics/savings-and-sinking-funds">Savings & Sinking Funds</Link>
            <Link href="/topics/groceries-and-meal-planning">Groceries & Meal Plans</Link>
            <Link href="/topics/debt-tracking-and-payoff-planning">Debt Payoff Planning</Link>
            <Link href="/printables">All 20 Free Printables</Link>
            <Link href="/free-budget-template">Free Budget Template</Link>
            <Link href="/monthly-budget-worksheet">Monthly Budget Worksheet</Link>
            <Link href="/free-budget-spreadsheet">Free Budget Spreadsheet</Link>
          </div>

          <div className="footer-col">
            <h4>Editorial & Legal</h4>
            <Link href="/blog">All Money Guides</Link>
            <Link href="/about">About BudgetLoom</Link>
            <Link href="/editorial-policy">Editorial Policy</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
            <Link href="/contact">Contact Us</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} BudgetLoom · All calculators and printable PDFs are free for personal use.</div>
          <div>Reader-supported. We may earn commissions from clearly disclosed affiliate links.</div>
        </div>
      </div>
    </footer>
  )
}
