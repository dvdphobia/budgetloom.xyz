import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import { TOPIC_CLUSTERS, getVisiblePosts } from '@/lib/content'
import { site } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Budgeting Topics & Learning Hubs (13 Complete Topic Clusters)',
  description:
    'Explore BudgetLoom’s 13 personal finance topic hubs covering monthly budget systems, paycheck planning, sinking funds, groceries, debt payoff, and printables.',
  alternates: { canonical: `${site.url}/topics` },
  openGraph: {
    title: 'Budgeting Topics & Learning Hubs — BudgetLoom',
    description: 'Structured learning hubs connecting step-by-step money guides, calculators, and free printable worksheets.',
    url: `${site.url}/topics`,
    type: 'website',
  },
}

export const dynamic = 'force-dynamic'

export default async function TopicsDirectoryPage() {
  const allPosts = await getVisiblePosts()

  return (
    <>
      <Header />
      <main id="main">
        <section className="tool-hero compact">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Topic Hubs' }]} />
            <span className="eyebrow">13 Structured Learning Hubs</span>
            <h1>Browse by money goal or budgeting challenge</h1>
            <p>
              Each topic hub brings together our recommended starting guide, worked examples, interactive calculators, and free printable worksheets for that exact financial situation.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="grid">
              {TOPIC_CLUSTERS.map((cluster) => {
                const count = allPosts.filter((p) => p.topicSlug === cluster.slug).length
                return (
                  <Link href={`/topics/${cluster.slug}`} key={cluster.slug} className="card">
                    <div className="card-body">
                      <span className="card-badge">
                        {cluster.category} · {count} {count === 1 ? 'Guide' : 'Guides'}
                      </span>
                      <h3>{cluster.name}</h3>
                      <p>{cluster.description}</p>
                      <div className="card-meta" style={{ marginTop: '1rem', color: 'var(--green-dark)', fontWeight: 600 }}>
                        <span>Explore hub, tools & printables →</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
