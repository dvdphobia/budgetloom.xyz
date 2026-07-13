import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import Breadcrumbs from '../components/Breadcrumbs'
import { CardCover } from '../components/Icons'
import { printables } from '@/lib/printables'

export const metadata = {
  title: 'Budget Printables',
  description: 'Printable budget planners, savings challenges, meal planners, and debt payoff trackers. Instant download.',
  alternates: { canonical: 'https://budgetloom.xyz/printables/' },
}

export default function PrintablesPage() {
  return (
    <>
      <Header />
      <main id="main" className="container section">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Printables' },
        ]} />

        <div className="section-header">
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '-0.025rem' }}>Budget Printables</h1>
          <p>Download planners to help you save money and stay organized.</p>
        </div>

        <div className="grid">
          {printables.map(p => (
            <Link href={`/printables/${p.slug}/`} className="card" key={p.slug}>
              <div className="card-cover">
                <CardCover variant="printable" />
                <span className={`card-cover-tag ${p.price === 'Free' ? 'free' : ''}`}>{p.price}</span>
              </div>
              <div className="card-body">
                <span className="card-badge">{p.pages} pages</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}