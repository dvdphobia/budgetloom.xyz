import Header from './components/Header'
import Footer from './components/Footer'
import EmailForm from './components/EmailForm'
import Link from 'next/link'
import { posts } from '@/lib/posts'
import { printables } from '@/lib/printables'
import { CardCover, Icon } from './components/Icons'

const categoryMap: Record<string, string> = {
  'Savings': 'savings',
  'Food': 'food',
  'Budgeting': 'budgeting',
  'Lifestyle': 'lifestyle',
  'Debt': 'debt',
}

export default function Home() {
  const recentPosts = posts.slice(0, 6)
  const featured = printables.slice(0, 3)

  return (
    <>
      <Header />
      <main id="main">
        {/* Hero */}
        <section className="hero">
          <div className="container hero-inner">
            <h1>Save more. <span className="accent">Stress less.</span><br /><span className="serif">Start today.</span></h1>
            <p>Free budget printables and simple money guides designed for real life — not spreadsheets.</p>
            <div className="hero-cta">
              <Link href="/free-budget-template" className="btn btn-primary btn-lg">Get Free Budget Template</Link>
              <Link href="/budget-calculator" className="btn btn-ghost btn-lg">Try Budget Calculator</Link>
            </div>
          </div>
        </section>

        {/* Printables */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Popular Printables</h2>
              <p>Download planners that help you save money and stay organized.</p>
            </div>
            <div className="grid">
              {featured.map(p => (
                <Link href={`/printables/${p.slug}`} className="card" key={p.slug}>
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
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/printables" className="btn btn-ghost btn-sm">View all printables <Icon.arrow className="" /></Link>
            </div>
          </div>
        </section>

        <section className="section tools-strip">
          <div className="container">
            <div className="section-header">
              <h2>Free Budget Tools</h2>
              <p>Choose paper, spreadsheet, or calculator—then build your monthly plan.</p>
            </div>
            <div className="tool-link-grid">
              <Link href="/free-budget-template"><strong>Budget Template</strong><span>Free 12-page printable PDF</span></Link>
              <Link href="/monthly-budget-worksheet"><strong>Monthly Worksheet</strong><span>Instructions and completed example</span></Link>
              <Link href="/budget-calculator"><strong>Budget Calculator</strong><span>Calculate needs, wants, and goals</span></Link>
              <Link href="/free-budget-spreadsheet"><strong>Budget Spreadsheet</strong><span>Editable CSV download</span></Link>
            </div>
          </div>
        </section>

        {/* Blog */}
        <section className="section" style={{ background: 'var(--light)' }}>
          <div className="container">
            <div className="section-header">
              <h2>Latest Money Guides</h2>
              <p>Practical tips you can use today — no fluff, no jargon.</p>
            </div>
            <div className="grid">
              {recentPosts.map(post => (
                <Link href={`/blog/${post.slug}`} className="card" key={post.slug}>
                  <div className="card-cover">
                    <CardCover category={categoryMap[post.category]} />
                  </div>
                  <div className="card-body">
                    <span className="card-badge">{post.category}</span>
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                    <div className="card-meta">
                      <Icon.clock className="" style={{ width: '13px', height: '13px' }} />
                      <span>{post.readTime} read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/blog" className="btn btn-ghost btn-sm">Read all guides <Icon.arrow className="" /></Link>
            </div>
          </div>
        </section>

        {/* Email CTA */}
        <section className="section" id="free-library">
          <div className="container">
            <div className="lead-box">
              <h2>Join the Free Budget Library</h2>
              <p>Get a free budget starter pack plus weekly money-saving tips.</p>
              <EmailForm cta="Send my free printables" tag="budget starter pack" />
              <div className="lead-perks">
                <span className="lead-perk"><Icon.check className="" /> Free printable pack</span>
                <span className="lead-perk"><Icon.check className="" /> Weekly money tips</span>
                <span className="lead-perk"><Icon.check className="" /> No spam, ever</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
