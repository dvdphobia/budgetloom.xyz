import Header from '../../components/Header'
import Footer from '../../components/Footer'
import EmailForm from '../../components/EmailForm'
import Breadcrumbs from '../../components/Breadcrumbs'
import ShareButtons from '../../components/ShareButtons'
import { PrintablePreview, Icon } from '../../components/Icons'
import { printables, getPrintableBySlug } from '@/lib/printables'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { site } from '@/lib/config'

type Params = { slug: string }

export async function generateStaticParams() {
  return printables.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const p = getPrintableBySlug(slug)
  if (!p) return { title: 'Not Found' }
  return {
    title: p.title,
    description: p.description,
    openGraph: { title: p.title, description: p.description, type: 'website', url: `${site.url}/printables/${p.slug}`, images: [{ url: `/printables/${p.slug}/opengraph-image`, width: 1200, height: 630, alt: p.title }] },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description, images: [`/printables/${p.slug}/opengraph-image`] },
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
    image: `${printableUrl}/opengraph-image`,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    encodingFormat: 'application/pdf',
    publisher: { '@type': 'Organization', name: site.name, url: site.url },
  }

  return (
    <>
      <Header />
      <main id="main" className="container section">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(printableSchema) }} />
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Printables', href: '/printables' },
          { label: p.title },
        ]} />

        <div className="printable-hero">
          <div className="printable-preview">
            <PrintablePreview pages={p.pages} />
          </div>
          <div className="printable-info">
            <h1>{p.title}</h1>
            <p>{p.description}</p>
            <div className="printable-price">
              <span className="printable-price-tag">{p.price}</span>
              <span className="printable-price-pages">{p.pages} pages · PDF</span>
            </div>
            <a href={`/printables/${p.slug}.pdf`} className="btn btn-primary btn-lg" download>
              <Icon.download className="" /> Download PDF
            </a>
            <div className="printable-trust">
              <span><Icon.check className="" /> No email required</span>
              <span><Icon.print className="" /> Print at home</span>
            </div>
          </div>
        </div>

        <ShareButtons title={p.title} url={printableUrl} />

        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '2rem', marginBottom: '0.5rem' }}>What's included</h2>
        <ul className="includes-list">
          {p.includes.map(item => (
            <li key={item}>
              <Icon.check className="" />
              {item}
            </li>
          ))}
        </ul>

        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1rem' }}>Save on Pinterest</h2>
        <div className="pin-preview">
          <Image
            src={`/pins/pin_${p.slug.replace(/-/g, '_')}.png`}
            alt={`${p.title} printable`}
            width={280}
            height={420}
            style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}
          />
          <p className="pin-label">Pin this to your budget board for later</p>
        </div>

        <div className="lead-box">
          <h2>Get more free printables</h2>
          <p>Join the library for weekly printables and money tips.</p>
          <EmailForm cta="Send me more printables" tag={p.title} />
          <div className="lead-perks">
            <span className="lead-perk"><Icon.check className="" /> Weekly printables</span>
            <span className="lead-perk"><Icon.check className="" /> Money-saving tips</span>
            <span className="lead-perk"><Icon.check className="" /> No spam</span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
