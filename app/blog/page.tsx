import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import BlogCatalogClient from '../components/BlogCatalogClient'
import { getVisiblePosts, TOPIC_CLUSTERS } from '@/lib/content'
import Link from 'next/link'

export const metadata = {
  title: 'Practical Money & Budgeting Guides (Worked Examples & Free Tools)',
  description:
    'Step-by-step guides on monthly budgeting, biweekly paychecks, sinking funds, emergency savings, frugal grocery shopping, and debt payoff.',
  alternates: { canonical: 'https://budgetloom.xyz/blog' },
}

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const posts = await getVisiblePosts()

  return (
    <>
      <Header />
      <main id="main">
        <section className="tool-hero compact">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides' }]} />
            <span className="eyebrow">{posts.length} Verified Money Guides · 13 Topic Clusters</span>
            <h1>Practical Money Guides</h1>
            <p>
              Actionable step-by-step instructions with worked dollar examples, realistic assumptions, and matching free calculators and printables.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <BlogCatalogClient posts={posts} clusters={TOPIC_CLUSTERS} />

            <div className="callout" style={{ marginTop: '3.5rem' }}>
              <span className="eyebrow">Browse by Learning Path</span>
              <h2>Looking for a complete topic roadmap?</h2>
              <p>
                Visit our 13 Topic Hubs to see the recommended starting guide, interactive calculators, and printable PDF workbooks for each goal.
              </p>
              <Link href="/topics" className="btn btn-primary">
                Explore all 13 Topic Hubs
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
