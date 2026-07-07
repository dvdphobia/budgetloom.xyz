import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import { printables } from '@/lib/printables'

export const metadata = { title: 'Budget Printables - BudgetLoom', description: 'Printable budget planners, savings challenges, meal planners, and debt payoff trackers.' }

export default function PrintablesPage() {
  return (
    <>
      <Header />
      <main className="container section">
        <h1>Budget Printables</h1>
        <p style={{color:'var(--gray)'}}>Instant download planners to help you save money and stay organized.</p>
        <div className="grid" style={{marginTop:'2rem'}}>
          {printables.map(p => (
            <div className="card" key={p.slug}>
              <span className="tag">{p.price} · {p.pages} pages</span>
              <h3><Link href={`/printables/${p.slug}/`}>{p.title}</Link></h3>
              <p>{p.description}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
