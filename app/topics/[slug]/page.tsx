import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import { Icon } from '@/app/components/Icons'
import { TOPIC_CLUSTERS, getVisiblePostsByCluster, getVisiblePost } from '@/lib/content'
import { getPrintableBySlug } from '@/lib/printables'
import { TOOL_CATALOG } from '@/lib/calculators'
import { site } from '@/lib/config'

type Params = { slug: string }

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return TOPIC_CLUSTERS.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const cluster = TOPIC_CLUSTERS.find((c) => c.slug === slug)
  if (!cluster) return { title: 'Topic Not Found' }
  const canonical = `${site.url}/topics/${cluster.slug}`
  return {
    title: `${cluster.name}: Guides, Calculators & Free Printables`,
    description: cluster.description,
    alternates: { canonical },
    openGraph: {
      title: `${cluster.name} — BudgetLoom Topic Hub`,
      description: cluster.description,
      url: canonical,
      type: 'website',
    },
  }
}

export default async function TopicHubPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const cluster = TOPIC_CLUSTERS.find((c) => c.slug === slug)
  if (!cluster) return notFound()

  const clusterPosts = await getVisiblePostsByCluster(cluster.slug)
  const startPost = (await getVisiblePost(cluster.startingGuideSlug)) || clusterPosts[0]
  const matchedTools = TOOL_CATALOG.filter(
    (t) => t.clusterSlug === cluster.slug || cluster.recommendedTools.includes(t.href)
  )
  const matchedPrintables = cluster.recommendedPrintables
    .map((s) => getPrintableBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  const hubSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cluster.name} — BudgetLoom Hub`,
    description: cluster.description,
    url: `${site.url}/topics/${cluster.slug}`,
  }

  return (
    <>
      <Header />
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }} />
        <section className="tool-hero compact">
          <div className="container">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Topics', href: '/topics' },
                { label: cluster.name },
              ]}
            />
            <span className="eyebrow">{cluster.category} Topic Hub</span>
            <h1>{cluster.name}</h1>
            <p>{cluster.intro}</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {/* Recommended Starting Point */}
            {startPost && (
              <div className="callout" style={{ marginTop: 0 }}>
                <span className="eyebrow">Recommended Starting Guide</span>
                <h2 style={{ marginTop: '0.25rem' }}>{startPost.title}</h2>
                <p>{startPost.description}</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link href={`/blog/${startPost.slug}`} className="btn btn-primary">
                    Read the starter guide ({startPost.readTime})
                  </Link>
                  {matchedTools[0] && (
                    <Link href={matchedTools[0].href} className="btn btn-ghost">
                      Open {matchedTools[0].shortTitle}
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Cluster Guides */}
            <div style={{ margin: '3rem 0' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Step-by-Step Guides in {cluster.name} ({clusterPosts.length})
              </h2>
              <p style={{ color: 'var(--gray)', marginBottom: '1.5rem' }}>
                Practical explanations with worked dollar examples and realistic assumptions.
              </p>
              <div className="grid">
                {clusterPosts.map((post) => (
                  <Link href={`/blog/${post.slug}`} key={post.slug} className="card">
                    <div className="card-body">
                      <span className="card-badge">{post.category}</span>
                      <h3>{post.title}</h3>
                      <p>{post.description}</p>
                      <div className="card-meta">
                        <Icon.clock className="" style={{ width: 13, height: 13 }} />
                        <span>{post.readTime} read</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Matched Calculators & Printables */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', margin: '3rem 0' }}>
              <div className="resource-box" style={{ margin: 0 }}>
                <span className="eyebrow">Interactive Calculators</span>
                <h2>Tools for {cluster.shortName}</h2>
                <p>Run your own household numbers privately in your browser.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {matchedTools.map((t) => (
                    <Link key={t.slug} href={t.href}>
                      {t.shortTitle} →
                    </Link>
                  ))}
                  <Link href="/tools" style={{ color: 'var(--gray)', fontWeight: 500 }}>
                    View all 15 calculators →
                  </Link>
                </div>
              </div>

              <div className="resource-box" style={{ margin: 0 }}>
                <span className="eyebrow">Free Printable Worksheets</span>
                <h2>Downloadable PDFs</h2>
                <p>Print at home in color or grayscale—no email address required.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {matchedPrintables.map((pr) => (
                    <Link key={pr.slug} href={`/printables/${pr.slug}`}>
                      {pr.title} ({pr.pages} pages PDF) →
                    </Link>
                  ))}
                  <Link href="/printables" style={{ color: 'var(--gray)', fontWeight: 500 }}>
                    Browse all 20 printable packs →
                  </Link>
                </div>
              </div>
            </div>

            {/* Cluster FAQs */}
            {cluster.faqs.length > 0 && (
              <div className="faq">
                <h2>Common questions about {cluster.name.toLowerCase()}</h2>
                {cluster.faqs.map((faq) => (
                  <div className="faq-item" key={faq.question}>
                    <h3>{faq.question}</h3>
                    <p>{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
