import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import { TOOL_CATALOG } from '@/lib/calculators'
import { site } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Free Budgeting Calculators & Financial Tools (15 Interactive Tools)',
  description:
    'Plan monthly spending, zero-based budgets, 50/30/20 splits, biweekly paychecks, sinking funds, emergency savings, and debt snowball or avalanche payoffs.',
  alternates: { canonical: `${site.url}/tools` },
  openGraph: {
    title: 'Free Budgeting Calculators & Personal Finance Tools — BudgetLoom',
    description: '15 free, browser-private financial calculators with instant CSV export and printable schedules.',
    url: `${site.url}/tools`,
    type: 'website',
  },
}

const GROUPS = ['Budgeting', 'Paycheck', 'Savings', 'Debt', 'Tracking & Household'] as const

export default function ToolsDirectoryPage() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'BudgetLoom Free Financial Calculators & Budgeting Tools',
    description:
      '15 interactive budgeting, paycheck, savings, sinking fund, and debt payoff calculators that run privately in your browser.',
    url: `${site.url}/tools`,
    hasPart: TOOL_CATALOG.map((t) => ({
      '@type': 'WebApplication',
      name: t.shortTitle,
      url: `${site.url}${t.href}`,
      applicationCategory: 'FinanceApplication',
    })),
  }

  return (
    <>
      <Header />
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
        <section className="tool-hero compact">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Calculators & Tools' }]} />
            <span className="eyebrow">15 Free Interactive Calculators · Browser-Private</span>
            <h1>Practical budgeting calculators for real-life numbers</h1>
            <p>
              Every calculator runs 100% in your browser using cent-accurate math. No account signup, no bank login, and instant CSV or print export.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {GROUPS.map((group) => {
              const tools = TOOL_CATALOG.filter((t) => t.category === group)
              return (
                <div key={group} style={{ marginBottom: '3.5rem' }}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span className="eyebrow">{group} Tools</span>
                    <h2 style={{ fontSize: '1.55rem', fontWeight: 700, letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
                      {group === 'Budgeting'
                        ? 'Monthly, Zero-Based & Percentage Split Calculators'
                        : group === 'Paycheck'
                        ? 'Paycheck & Biweekly Cash-Flow Planners'
                        : group === 'Savings'
                        ? 'Emergency Fund, Sinking Fund & Savings Challenges'
                        : group === 'Debt'
                        ? 'Debt Snowball & Avalanche Payoff Calculators'
                        : 'Grocery, Subscription, Expense & Household Split Tools'}
                    </h2>
                  </div>
                  <div className="grid">
                    {tools.map((tool) => (
                      <Link href={tool.href} key={tool.slug} className="card">
                        <div className="card-body">
                          <span className="card-badge">{tool.eyebrow}</span>
                          <h3>{tool.shortTitle}</h3>
                          <p>{tool.description}</p>
                          <div
                            style={{
                              marginTop: '0.9rem',
                              paddingTop: '0.75rem',
                              borderTop: '1px solid var(--border-light)',
                              fontSize: '0.78rem',
                              color: 'var(--gray)',
                            }}
                          >
                            <strong>Formula:</strong> {tool.formulaSummary}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
