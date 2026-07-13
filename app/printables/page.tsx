import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import { printables } from '@/lib/printables'

export const metadata = {
  title: 'Budget Printables — BudgetLoom',
  description: 'Printable budget planners, savings challenges, meal planners, and debt payoff trackers. Instant download.',
}

export default function PrintablesPage() {
  return (
    <>
      <Header />
      <main className="container section">
        <div className="section-header">
          <h1 style={{fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem'}}>Budget Printables</h1>
          <p>Instant download planners to help you save money and stay organized.</p>
        </div>
        <div className="grid">
          {printables.map(p => (
            <div className="card" key={p.slug}>
              <div className="card-cover">
                <span className="card-cover-icon">📄</span>
                <span className="card-cover-tag">{p.price}</span>
              </div>
              <div className="card-body">
                <span className="card-badge">{p.pages} pages</span>
                <h3><Link href={`/printables/${p.slug}/`}>{p.title}</Link></h3>
                <p>{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}