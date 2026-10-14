import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import InteractiveToolSuite from '@/app/components/InteractiveToolSuite'
import { TOOL_CATALOG, getToolBySlug } from '@/lib/calculators'
import { getPostBySlug } from '@/lib/posts'
import { getPrintableBySlug } from '@/lib/printables'
import { site } from '@/lib/config'

type Params = { slug: string }

export async function generateStaticParams() {
  return TOOL_CATALOG.filter((t) => t.href.startsWith('/tools/')).map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const tool = getToolBySlug(slug)
  if (!tool) return { title: 'Tool Not Found' }
  const canonical = `${site.url}${tool.href}`
  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical },
    openGraph: {
      title: tool.title,
      description: tool.description,
      url: canonical,
      type: 'website',
    },
  }
}

export default async function ToolDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const tool = getToolBySlug(slug)
  if (!tool) return notFound()

  const canonical = `${site.url}${tool.href}`
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `BudgetLoom ${tool.shortTitle}`,
    description: tool.description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    url: canonical,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

  const relatedGuides = tool.relatedGuides
    .map((s) => getPostBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const relatedPrintables = tool.relatedPrintables
    .map((s) => getPrintableBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const relatedTools = tool.relatedTools
    .map((s) => getToolBySlug(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))

  return (
    <>
      <Header />
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
        <section className="tool-hero compact">
          <div className="container narrow">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Calculators', href: '/tools' },
                { label: tool.shortTitle },
              ]}
            />
            <span className="eyebrow">{tool.eyebrow} · Free Interactive Tool</span>
            <h1>{tool.shortTitle}</h1>
            <p>{tool.description}</p>
          </div>
        </section>

        <section className="section">
          <div className="container narrow">
            <InteractiveToolSuite slug={tool.slug} />

            <div className="article-body tool-copy">
              <h2>How this calculation works</h2>
              <p>
                <strong>Core formula:</strong> <code>{tool.formulaSummary}</code>
              </p>
              <p>
                All currency inputs are converted to integer cents before adding, subtracting, or allocating across periods so floating-point rounding errors never distort your budget totals.
              </p>

              <h2>Worked example</h2>
              <p>{tool.workedExample}</p>

              <h2>Assumptions & privacy</h2>
              <p>
                This calculator runs entirely in your browser and does not transmit your personal financial numbers to our servers. Estimates are for educational planning and do not constitute individualized financial, tax, or legal advice.
              </p>
            </div>

            {tool.faqs.length > 0 && (
              <div className="faq">
                <h2>Frequently asked questions</h2>
                {tool.faqs.map((faq) => (
                  <div className="faq-item" key={faq.question}>
                    <h3>{faq.question}</h3>
                    <p>{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}

            <aside className="resource-box" aria-label="Matching guides, printables, and calculators">
              <h2>Pair this calculator with free worksheets & guides</h2>
              <p>Download a matching printable PDF or read our step-by-step worked examples.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '0.4rem' }}>
                    Matching Printable PDFs
                  </h3>
                  {relatedPrintables.map((pr) => (
                    <div key={pr.slug} style={{ marginBottom: '0.35rem' }}>
                      <Link href={`/printables/${pr.slug}`}>
                        {pr.title} ({pr.pages} pages) →
                      </Link>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '0.4rem' }}>
                    Related Money Guides
                  </h3>
                  {relatedGuides.map((g) => (
                    <div key={g.slug} style={{ marginBottom: '0.35rem' }}>
                      <Link href={`/blog/${g.slug}`}>{g.title} →</Link>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '0.4rem' }}>
                    Related Calculators
                  </h3>
                  {relatedTools.map((rt) => (
                    <div key={rt.slug} style={{ marginBottom: '0.35rem' }}>
                      <Link href={rt.href}>{rt.shortTitle} →</Link>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
