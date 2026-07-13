import Header from './components/Header'
import Footer from './components/Footer'
import EmailForm from './components/EmailForm'
import Link from 'next/link'
import { posts } from '@/lib/posts'
import { printables } from '@/lib/printables'

const categoryIcons: Record<string, string> = {
  'Savings': '💰',
  'Food': '🎧',
  'Budgeting': '📄',
  'Lifestyle': '✨',
  'Debt': '💳',
}

export default function Home() {
  const recentPosts = posts.slice(0, 6)
  const featured = printables.slice(0, 3)

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-badge">
              <span>💵</span> Free budget printables + money guides
            </div>
            <h1>Save more. <span className="accent">Stress less.</span> Start today.</h1>
            <p>Free budget printables, simple money guides, and easy savings challenges designed for real life — not spreadsheets.</p>
            <div className="hero-cta">
              <Link href="/printables/" className="btn btn-lg">Browse Printables</Link>
              <Link href="/blog/" className="btn btn-ghost btn-lg">Read Guides</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num">14+</div>
                <div className="hero-stat-label">Money Guides</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">4</div>
                <div className="hero-stat-label">Printable Kits</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">100%</div>
                <div className="hero-stat-label">Free Library</div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <div className="container">
          <div className="trust-bar">
            <div className="trust-item">Instant download</div>
            <div className="trust-item">No email required for free PDFs</div>
            <div className="trust-item">Print at home</div>
            <div className="trust-item">Beginner-friendly</div>
          </div>
        </div>

        {/* Printables */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Popular Printables</h2>
              <p>Instant download planners to help you save money and stay organized.</p>
              <Link href="/printables/" className="view-all">View all printables →</Link>
            </div>
            <div className="grid">
              {featured.map(p => (
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
          </div>
        </section>

        {/* Blog */}
        <section className="section" style={{background: 'var(--light)'}}>
          <div className="container">
            <div className="section-header">
              <h2>Latest Money Guides</h2>
              <p>Practical tips you can use today — no fluff, no jargon.</p>
              <Link href="/blog/" className="view-all">Read all guides →</Link>
            </div>
            <div className="grid">
              {recentPosts.map(post => (
                <div className="card" key={post.slug}>
                  <div className="card-cover">
                    <span className="card-cover-icon">{categoryIcons[post.category] || '📖'}</span>
                  </div>
                  <div className="card-body">
                    <span className="card-badge">{post.category}</span>
                    <h3><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h3>
                    <p>{post.description}</p>
                    <div className="card-meta">
                      <span>{post.readTime} read</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Email CTA */}
        <section className="section" id="free-library">
          <div className="container">
            <div className="lead-box">
              <h2>Join the Free Budget Library</h2>
              <p>Get a free budget starter pack plus weekly money-saving tips delivered to your inbox.</p>
              <EmailForm cta="Send my free printables" tag="budget starter pack" />
              <div className="lead-perks">
                <span className="lead-perk">Free printable pack</span>
                <span className="lead-perk">Weekly money tips</span>
                <span className="lead-perk">No spam, ever</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}