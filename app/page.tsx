import Header from './components/Header'
import Footer from './components/Footer'
import EmailForm from './components/EmailForm'
import Link from 'next/link'
import { getVisiblePosts, TOPIC_CLUSTERS } from '@/lib/content'
import { printables } from '@/lib/printables'
import { TOOL_CATALOG } from '@/lib/calculators'
import { CardCover, Icon } from './components/Icons'

const categoryMap: Record<string, string> = {
  Savings: 'savings',
  Food: 'food',
  Budgeting: 'budgeting',
  Lifestyle: 'lifestyle',
  Debt: 'debt',
}

export const dynamic = 'force-dynamic'

export default async function Home() {
  const allPosts = await getVisiblePosts()
  const recentPosts = allPosts.slice(0, 6)
  const featuredPrintables = printables.slice(0, 6)
  const featuredTools = TOOL_CATALOG.slice(0, 8)
  const featuredClusters = TOPIC_CLUSTERS.slice(0, 6)

  return (
    <>
      <Header />
      <main id="main">
        {/* 1. Hero with immediate value proposition, 2 primary CTAs & realistic product preview */}
        <section className="hero">
          <div className="container hero-split">
            <div className="hero-copy">
              <span className="eyebrow">100% Free Personal Finance Education · No Bank Login Required</span>
              <h1>
                Give every dollar a clear job. <span className="accent">Stress less</span> about money.
              </h1>
              <p>
                Practical budgeting guides, 15 browser-private financial calculators, and 20 print-ready PDF workbooks built for real everyday incomes—not textbook perfection.
              </p>
              <div className="hero-cta left">
                <Link href="/free-budget-template" className="btn btn-primary btn-lg">
                  Get Free 12-Page Budget Template
                </Link>
                <Link href="/budget-calculator" className="btn btn-ghost btn-lg">
                  Try Monthly Budget Calculator
                </Link>
              </div>
              <div className="trust-row">
                <span>
                  <Icon.check className="" /> 20 Free Printable PDFs
                </span>
                <span>
                  <Icon.check className="" /> 15 Interactive Calculators
                </span>
                <span>
                  <Icon.check className="" /> Instant Download (No Email Wall)
                </span>
              </div>
            </div>

            <div className="hero-showcase" aria-label="Sample budget workbook preview">
              <div className="hero-showcase-card">
                <div className="hero-showcase-header">
                  <span className="badge-pill">Monthly Budget Snapshot</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--gray)' }}>Example: $4,000 Take-Home</span>
                </div>
                <div className="hero-showcase-rows">
                  <div className="showcase-row">
                    <span>Fixed Bills & Housing (50%)</span>
                    <strong>$2,000.00</strong>
                  </div>
                  <div className="showcase-row">
                    <span>Groceries, Fuel & Essentials (20%)</span>
                    <strong>$800.00</strong>
                  </div>
                  <div className="showcase-row">
                    <span>Emergency & Sinking Funds (15%)</span>
                    <strong style={{ color: 'var(--green-dark)' }}>$600.00</strong>
                  </div>
                  <div className="showcase-row">
                    <span>Flexible Wants & Buffer (15%)</span>
                    <strong>$600.00</strong>
                  </div>
                  <div className="showcase-row total">
                    <span>Unallocated Remaining Balance</span>
                    <strong style={{ color: 'var(--green)' }}>$0.00 (Balanced)</strong>
                  </div>
                </div>
                <div className="hero-showcase-footer">
                  <Link href="/budget-calculator">Enter your own numbers →</Link>
                  <Link href="/printables/budget-starter-bundle">Download 12-page PDF →</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Featured Interactive Calculators */}
        <section className="section tools-strip">
          <div className="container">
            <div className="section-header">
              <span className="eyebrow">Interactive Financial Tools</span>
              <h2>Free Budgeting & Debt Calculators</h2>
              <p>
                Run your numbers privately in your browser with cent-accurate formulas, worked examples, and instant CSV export.
              </p>
            </div>
            <div className="tool-link-grid">
              {featuredTools.map((tool) => (
                <Link href={tool.href} key={tool.slug}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green-dark)', textTransform: 'uppercase' }}>
                    {tool.category}
                  </span>
                  <strong style={{ marginTop: '0.15rem' }}>{tool.shortTitle}</strong>
                  <span>{tool.description}</span>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/tools" className="btn btn-primary btn-sm">
                Explore all 15 financial calculators <Icon.arrow className="" />
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Downloadable Printable Collection with Real Rendered Previews */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="eyebrow">Print-Ready PDF Library</span>
              <h2>Popular Printable Workbooks & Trackers</h2>
              <p>
                Genuine multi-page US Letter PDFs designed to print cleanly in color or grayscale—no signup wall required.
              </p>
            </div>
            <div className="grid">
              {featuredPrintables.map((p) => (
                <Link href={`/printables/${p.slug}`} className="card printable-marketplace-card" key={p.slug}>
                  <div className="printable-card-media">
                    <img
                      src={p.previewCoverUrl}
                      alt={`${p.title} cover preview`}
                      loading="lazy"
                      width={306}
                      height={396}
                      className="printable-thumb-img"
                    />
                    <span className="card-cover-tag free">
                      {p.price} · {p.pages} Pages
                    </span>
                  </div>
                  <div className="card-body">
                    <span className="card-badge">{p.category}</span>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/printables" className="btn btn-ghost btn-sm">
                Browse all {printables.length} printable PDF packs <Icon.arrow className="" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4. Topic-Based Browsing (13 Topic Clusters) */}
        <section className="section" style={{ background: 'var(--cream)' }}>
          <div className="container">
            <div className="section-header">
              <span className="eyebrow">Structured Learning Paths</span>
              <h2>Browse by Money Topic</h2>
              <p>Start with the topic hub that matches your household cash flow, pay schedule, or current priority.</p>
            </div>
            <div className="grid">
              {featuredClusters.map((cluster) => (
                <Link href={`/topics/${cluster.slug}`} key={cluster.slug} className="card">
                  <div className="card-body">
                    <span className="card-badge">{cluster.category} Hub</span>
                    <h3>{cluster.name}</h3>
                    <p>{cluster.description}</p>
                    <div className="card-meta" style={{ color: 'var(--green-dark)', fontWeight: 600 }}>
                      <span>Open topic hub →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/topics" className="btn btn-ghost btn-sm">
                View all 13 topic hubs <Icon.arrow className="" />
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Featured Money Guides */}
        <section className="section" style={{ background: 'var(--light)' }}>
          <div className="container">
            <div className="section-header">
              <span className="eyebrow">Step-by-Step Editorial Guides</span>
              <h2>Latest Practical Money Guides</h2>
              <p>Worked dollar examples, transparent assumptions, and actionable checklists—no jargon or filler.</p>
            </div>
            <div className="grid">
              {recentPosts.map((post) => (
                <Link href={`/blog/${post.slug}`} className="card" key={post.slug}>
                  <div className="card-cover">
                    <CardCover category={categoryMap[post.category]} />
                    <span className="card-cover-tag">{post.category}</span>
                  </div>
                  <div className="card-body">
                    <span className="card-badge">{post.topicCluster}</span>
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
              <Link href="/blog" className="btn btn-ghost btn-sm">
                Read all {allPosts.length} money guides <Icon.arrow className="" />
              </Link>
            </div>
          </div>
        </section>

        {/* 6. Simple Explanation of How BudgetLoom Helps & Editorial Trust */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="eyebrow">How BudgetLoom Works</span>
              <h2>A calm, three-step system for everyday money</h2>
              <p>You do not need paid software or bank-linking apps to build a reliable household budget.</p>
            </div>
            <div className="grid">
              <div className="card">
                <div className="card-body">
                  <span className="card-badge">Step 1 · Plan</span>
                  <h3>Calculate your real baseline</h3>
                  <p>
                    Start with actual take-home pay and real bank statements in our{' '}
                    <Link href="/budget-calculator">Monthly Budget Calculator</Link> or{' '}
                    <Link href="/tools/paycheck-budget-planner">Paycheck Planner</Link>.
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <span className="card-badge">Step 2 · Track</span>
                  <h3>Print the worksheet that fits</h3>
                  <p>
                    Download the matching PDF from our <Link href="/printables">Printables Library</Link>—from a 12-page starter bundle to a 30-day savings challenge.
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <span className="card-badge">Step 3 · Review</span>
                  <h3>Check in for 10 minutes a week</h3>
                  <p>
                    Use our <Link href="/blog/weekly-budget-check-in-a-ten-minute-routine">10-minute weekly routine</Link> to catch overruns early and adjust flexible categories without guilt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Optional Email Subscription Section */}
        <section className="section" id="free-library" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="lead-box">
              <h2>Join the Free Budget Library</h2>
              <p>Get notified when we publish new printable workbooks, calculators, and practical money guides.</p>
              <EmailForm cta="Send me new printables" tag="homepage library" />
              <div className="lead-perks">
                <span className="lead-perk">
                  <Icon.check className="" /> All 20 PDFs free right now
                </span>
                <span className="lead-perk">
                  <Icon.check className="" /> Practical weekly money tips
                </span>
                <span className="lead-perk">
                  <Icon.check className="" /> Unsubscribe anytime
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
