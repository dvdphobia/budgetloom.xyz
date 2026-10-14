import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import { Icon } from '../components/Icons'
import { site } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Free Budget Template: Printable 12-Page Monthly Budget PDF',
  description:
    'Download a free printable 12-page budget template with a monthly budget worksheet, paycheck allocator, expense tracker, savings tracker, and debt payoff sheet.',
  alternates: { canonical: `${site.url}/free-budget-template` },
  openGraph: {
    title: 'Free Budget Template and Monthly Budget Worksheet',
    description: 'Plan income, expenses, savings, and debt with this free 12-page printable budget template.',
    url: `${site.url}/free-budget-template`,
    type: 'website',
  },
}

const faqs = [
  ['Is the budget template really free?', 'Yes. All 12 pages of the PDF are free to download immediately and no email address is required.'],
  ['Can I use the template with irregular or biweekly income?', 'Yes. Start with your lowest reliable monthly income on Page 2, then use Page 3 (Paycheck Allocation) to assign bills to each deposit.'],
  ['Should I print a new copy every month?', 'Printing a fresh monthly summary and weekly review sheet each month makes month-over-month comparison easy.'],
]

export default function FreeBudgetTemplatePage() {
  const url = `${site.url}/free-budget-template`
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'DigitalDocument',
    name: 'Free Printable Budget Template (12-Page Starter Bundle)',
    description: 'A free 12-page budget starter bundle for monthly planning.',
    url,
    isAccessibleForFree: true,
    encodingFormat: 'application/pdf',
    numberOfPages: 12,
    publisher: { '@type': 'Organization', name: site.name, url: site.url },
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }

  return (
    <>
      <Header />
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <section className="tool-hero">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Free Budget Template' }]} />
            <div className="tool-hero-grid">
              <div>
                <span className="eyebrow">Free 12-Page Printable PDF</span>
                <h1>Free budget template for a month you can actually follow</h1>
                <p>
                  Give every dollar a job with clean, print-ready worksheets for income, fixed bills, paycheck splits, sinking funds, savings, and debt—without creating a complicated spreadsheet.
                </p>
                <div className="hero-cta left">
                  <a href="/printables/budget-starter-bundle.pdf" download className="btn btn-primary btn-lg">
                    <Icon.download className="" /> Download the free 12-page PDF
                  </a>
                  <Link href="/budget-calculator" className="btn btn-ghost btn-lg">
                    Try the calculator
                  </Link>
                </div>
                <div className="trust-row">
                  <span>
                    <Icon.check className="" /> No email required
                  </span>
                  <span>
                    <Icon.check className="" /> US Letter / A4 PDF
                  </span>
                  <span>
                    <Icon.check className="" /> Grayscale friendly
                  </span>
                </div>
              </div>
              <div className="template-preview" style={{ padding: '0.75rem', background: 'var(--cream)' }}>
                <img
                  src="/printables/previews/budget-starter-bundle-page2.png"
                  alt="Monthly Budget Summary worksheet preview from the 12-page Budget Starter Bundle"
                  width={360}
                  height={466}
                  style={{ width: '100%', height: 'auto', borderRadius: 10 }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container narrow">
            <h2>What is included in the 12-page bundle</h2>
            <p className="section-intro">
              This starter bundle covers the four jobs a useful household budget needs to do: plan, record, review, and improve.
            </p>
            <div className="feature-grid">
              {[
                'Monthly budget summary worksheet',
                'Paycheck-by-paycheck allocation sheet',
                'Fixed bills & variable spending trackers',
                'Sinking funds & savings goal sheets',
                'Debt payment & subscription audit logs',
                'Weekly 10-minute review & monthly closeout',
              ].map((item) => (
                <div className="feature-item" key={item}>
                  <Icon.check className="" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <h2>How to use this budget template</h2>
            <ol className="steps">
              <li>
                <strong>Write down take-home income.</strong>
                <span>Use the net money that reaches your bank account after taxes and payroll deductions.</span>
              </li>
              <li>
                <strong>List fixed bills first.</strong>
                <span>Add rent, utilities, insurance, minimum debt payments, and due dates.</span>
              </li>
              <li>
                <strong>Set realistic flexible limits.</strong>
                <span>Plan groceries, transportation, personal spending, and dining out using recent statements.</span>
              </li>
              <li>
                <strong>Assign savings and extra debt payments.</strong>
                <span>Treat emergency savings and sinking funds as planned bills instead of waiting to see what remains.</span>
              </li>
              <li>
                <strong>Review actual spending weekly.</strong>
                <span>Spend 10 minutes once a week updating actual numbers while the month is still underway.</span>
              </li>
            </ol>

            <div className="callout">
              <h2>Prefer to calculate first?</h2>
              <p>Enter your income and category totals in our free interactive calculator, then copy the finalized numbers onto your printable.</p>
              <Link href="/budget-calculator" className="btn btn-primary">
                Use the monthly budget calculator
              </Link>
            </div>

            <div className="faq">
              <h2>Budget template questions</h2>
              {faqs.map(([q, a]) => (
                <div className="faq-item" key={q}>
                  <h3>{q}</h3>
                  <p>{a}</p>
                </div>
              ))}
            </div>

            <div className="related-links">
              <h2>Continue building your budget</h2>
              <Link href="/monthly-budget-worksheet">How to complete a monthly budget worksheet →</Link>
              <Link href="/blog/how-to-build-a-budget-when-broke">How to build a budget when you feel broke →</Link>
              <Link href="/printables/budget-starter-bundle">See the complete 12-page printable bundle →</Link>
              <Link href="/printables">Browse all 20 free printable PDF workbooks →</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
