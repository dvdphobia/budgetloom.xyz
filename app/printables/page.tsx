import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import Breadcrumbs from '../components/Breadcrumbs'
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
          <h1 style={{fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem'}}>Budget Printables</h1>
          <p>Instant download planners to help you save money and stay organized.</p>
        </div>

        <div className="grid">
          {printables.map(p => (
            <div className="card" key={p.slug}>
              <div className="card-cover">
                <span className="card-cover-icon">📄</span>
                <span className={`card-cover-tag ${p.price === 'Free' ? 'free' : ''}`}>{p.price}</span>
              </div>
              <div className="card-body">
                <span className="card-badge">{p.pages} pages</span>
                <h3><Link href={`/printables/${p.slug}/`}>{p.title}</Link></h3>
                <p>{p.description}</p>
                <div className="card-meta">
                  <Link href={`/printables/${p.slug}/`} className="btn btn-sm" style={{marginTop: '0.5rem'}}>View Details →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{marginTop: '4rem'}}>
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get your printables in 3 simple steps.</p>
          </div>
          <div className="how-it-works">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Choose a Printable</h3>
              <p>Pick from budget worksheets, savings trackers, meal planners, and debt payoff charts.</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Download & Print</h3>
              <p>Instant PDF download. Print at home or at a local print shop. No waiting.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Start Saving</h3>
              <p>Use the planner daily or weekly. Watch your savings grow and debt shrink.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}