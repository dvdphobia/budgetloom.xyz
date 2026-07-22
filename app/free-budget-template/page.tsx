import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import { Icon, PrintablePreview } from '../components/Icons'
import { site } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Free Budget Template: Printable Monthly Budget PDF',
  description: 'Download a free printable budget template with a monthly budget worksheet, expense tracker, savings tracker, and debt payoff sheet.',
  alternates: { canonical: `${site.url}/free-budget-template` },
  openGraph: { title: 'Free Budget Template and Monthly Budget Worksheet', description: 'Plan income, expenses, savings, and debt with this free printable budget template.', url: `${site.url}/free-budget-template`, type: 'website' },
}

const faqs = [
  ['Is the budget template really free?', 'Yes. The PDF is free to download and no email address is required.'],
  ['Can I use the template with irregular income?', 'Yes. Start with your lowest reliable monthly income, then assign extra income when it arrives.'],
  ['Should I print a new copy every month?', 'A fresh monthly page makes comparison easier. Keep completed pages so you can see spending patterns over time.'],
]

export default function FreeBudgetTemplatePage() {
  const url = `${site.url}/free-budget-template`
  const schema = { '@context': 'https://schema.org', '@type': 'DigitalDocument', name: 'Free Printable Budget Template', description: 'A free 12-page budget starter bundle for monthly planning.', url, isAccessibleForFree: true, encodingFormat: 'application/pdf', publisher: { '@type': 'Organization', name: site.name, url: site.url } }
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) }
  return <><Header /><main id="main">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <section className="tool-hero"><div className="container"><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Free Budget Template' }]} /><div className="tool-hero-grid"><div><span className="eyebrow">Free 12-page PDF</span><h1>Free budget template for a month you can actually follow</h1><p>Give every dollar a job with simple pages for income, bills, spending, savings, and debt—without creating a complicated spreadsheet.</p><div className="hero-cta left"><a href="/printables/budget-starter-bundle.pdf" download className="btn btn-primary btn-lg"><Icon.download className="" /> Download the free template</a><Link href="/budget-calculator" className="btn btn-ghost btn-lg">Try the calculator</Link></div><div className="trust-row"><span><Icon.check className="" /> No email required</span><span><Icon.check className="" /> US Letter PDF</span><span><Icon.check className="" /> Print at home</span></div></div><div className="template-preview"><PrintablePreview pages={12} /></div></div></div></section>
    <section className="section"><div className="container narrow"><h2>What is included</h2><p className="section-intro">This starter bundle covers the four jobs a useful budget needs to do: plan, record, review, and improve.</p><div className="feature-grid">{['Monthly budget worksheet','Expense tracker','Savings tracker','Debt payoff chart','Instructions and cover','12 reusable pages'].map(item => <div className="feature-item" key={item}><Icon.check className="" /><span>{item}</span></div>)}</div><h2>How to use this budget template</h2><ol className="steps"><li><strong>Write down take-home income.</strong><span>Use the money that reaches your bank account after taxes and deductions.</span></li><li><strong>List fixed bills first.</strong><span>Add rent, utilities, insurance, minimum debt payments, and other due dates.</span></li><li><strong>Set realistic flexible limits.</strong><span>Plan groceries, transportation, personal spending, and fun using recent statements.</span></li><li><strong>Assign savings and extra debt payments.</strong><span>Treat goals as planned categories instead of waiting to see what remains.</span></li><li><strong>Review actual spending weekly.</strong><span>Adjust the plan while the month is still happening.</span></li></ol><div className="callout"><h2>Prefer to calculate first?</h2><p>Enter your income and category totals in our free calculator, then copy the result to your printable.</p><Link href="/budget-calculator" className="btn btn-primary">Use the budget calculator</Link></div><div className="faq"><h2>Budget template questions</h2>{faqs.map(([q,a]) => <div className="faq-item" key={q}><h3>{q}</h3><p>{a}</p></div>)}</div><div className="related-links"><h2>Continue building your budget</h2><Link href="/monthly-budget-worksheet">How to complete a monthly budget worksheet →</Link><Link href="/blog/how-to-build-a-budget-when-broke">How to build a budget when you feel broke →</Link><Link href="/printables/budget-starter-bundle">See the complete printable bundle →</Link></div></div></section>
  </main><Footer /></>
}
