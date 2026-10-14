import Header from '../../components/Header'
import Footer from '../../components/Footer'
import EmailForm from '../../components/EmailForm'
import TrackedDownload from '../../components/TrackedDownload'
import Breadcrumbs from '../../components/Breadcrumbs'
import ShareButtons from '../../components/ShareButtons'
import { Icon } from '../../components/Icons'
import { printables, getPrintableBySlug } from '@/lib/printables'
import { getPostBySlug } from '@/lib/posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { site } from '@/lib/config'

type Params = { slug: string }

export async function generateStaticParams() {
  return printables.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const p = getPrintableBySlug(slug)
  if (!p) return { title: 'Not Found' }
  return {
    title: `${p.title} (${p.pages}-Page Free Printable PDF)`,
    description: p.description,
    openGraph: {
      title: `${p.title} — Free ${p.pages}-Page Printable PDF`,
      description: p.description,
      type: 'website',
      url: `${site.url}/printables/${p.slug}`,
      images: [{ url: `/printables/${p.slug}/opengraph-image`, width: 1200, height: 630, alt: p.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: p.title,
      description: p.description,
      images: [`/printables/${p.slug}/opengraph-image`],
    },
    alternates: { canonical: `${site.url}/printables/${p.slug}` },
  }
}

export default async function PrintablePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const p = getPrintableBySlug(slug)
  if (!p) return notFound()

  const printableUrl = `${site.url}/printables/${p.slug}`
  const printableSchema = {
    '@context': 'https://schema.org',
    '@type': 'DigitalDocument',
    name: p.title,
    description: p.description,
    url: printableUrl,
    image: `${site.url}${p.previewCoverUrl}`,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    encodingFormat: 'application/pdf',
    numberOfPages: p.pages,
    publisher: { '@type': 'Organization', name: site.name, url: site.url },
  }

  const relatedGuides = p.relatedGuides
    .map((s) => getPostBySlug(s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
  const otherPrintables = printables.filter((item) => item.slug !== p.slug && item.category === p.category).slice(0, 3)

  return (
    <>
      <Header />
      <main id="main" className="container section">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(printableSchema) }} />
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Printables', href: '/printables' },
            { label: p.title },
          ]}
        />

        <div className="printable-hero">
          <div className="printable-preview-gallery">
            <figure style={{ margin: 0 }}>
              <img
                src={p.previewCoverUrl}
                alt={`${p.title} — Cover Page Preview`}
                width={420}
                height={544}
                style={{ width: '100%', height: 'auto', borderRadius: 12, border: '1px solid var(--brand-border)' }}
              />
              <figcaption style={{ fontSize: '0.78rem', color: 'var(--gray)', textAlign: 'center', marginTop: 6 }}>
                Page 1 (Workbook Cover & Index)
              </figcaption>
            </figure>
            <figure style={{ margin: 0 }}>
              <img
                src={p.previewInsideUrl}
                alt={`${p.title} — Inside Worksheet Preview`}
                width={420}
                height={544}
                style={{ width: '100%', height: 'auto', borderRadius: 12, border: '1px solid var(--brand-border)' }}
              />
              <figcaption style={{ fontSize: '0.78rem', color: 'var(--gray)', textAlign: 'center', marginTop: 6 }}>
                Page 2 (Sample Inside Worksheet)
              </figcaption>
            </figure>
          </div>

          <div className="printable-info">
            <span className="eyebrow">{p.category}</span>
            <h1>{p.title}</h1>
            <p>{p.description}</p>
            <div className="printable-price">
              <span className="printable-price-tag">{p.price}</span>
              <span className="printable-price-pages">
                {p.pages} verified pages · Instant PDF download
              </span>
            </div>
            <TrackedDownload slug={p.slug} />
            <div className="printable-trust">
              <span>
                <Icon.check className="" /> No email required
              </span>
              <span>
                <Icon.print className="" /> Grayscale & color friendly
              </span>
              <span>
                <Icon.check className="" /> Standard US Letter / A4
              </span>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', fontSize: '0.9rem' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--dark)' }}>Best for:</strong> {p.audience}
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--dark)' }}>How to use:</strong> {p.useCase}
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong style={{ color: 'var(--dark)' }}>Printing instructions:</strong> {p.printingInstructions}
              </p>
            </div>
          </div>
        </div>

        <ShareButtons title={p.title} url={printableUrl} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              What is included ({p.pages} pages)
            </h2>
            <ul className="includes-list">
              {p.includes.map((item) => (
                <li key={item}>
                  <Icon.check className="" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="resource-box" style={{ marginTop: 0 }}>
              <span className="eyebrow">Pair With Interactive Tools & Guides</span>
              <h2>Calculate your numbers before filling out the sheet</h2>
              <p>Use our free calculators and step-by-step guides alongside this printable workbook.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {p.relatedTools.map((toolHref) => (
                  <Link key={toolHref} href={toolHref}>
                    Open matching calculator ({toolHref.replace('/tools/', '').replace('/', '').replace(/-/g, ' ')}) →
                  </Link>
                ))}
                {relatedGuides.map((g) => (
                  <Link key={g.slug} href={`/blog/${g.slug}`}>
                    Guide: {g.title} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {otherPrintables.length > 0 && (
          <div style={{ marginTop: '3.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>
              More in {p.category}
            </h2>
            <div className="grid">
              {otherPrintables.map((op) => (
                <Link href={`/printables/${op.slug}`} key={op.slug} className="card">
                  <div className="card-body">
                    <span className="card-badge">
                      {op.price} · {op.pages} Pages
                    </span>
                    <h3>{op.title}</h3>
                    <p>{op.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="lead-box">
          <h2>Get notified about new printable packs</h2>
          <p>Join the library for new budgeting worksheets and weekly money tips.</p>
          <EmailForm cta="Send me new printables" tag={p.title} />
          <div className="lead-perks">
            <span className="lead-perk">
              <Icon.check className="" /> All downloads free
            </span>
            <span className="lead-perk">
              <Icon.check className="" /> Practical money tips
            </span>
            <span className="lead-perk">
              <Icon.check className="" /> No spam
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
