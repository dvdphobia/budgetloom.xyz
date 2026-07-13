import Header from '../../components/Header'
import Footer from '../../components/Footer'
import EmailForm from '../../components/EmailForm'
import Breadcrumbs from '../../components/Breadcrumbs'
import ShareButtons from '../../components/ShareButtons'
import { printables, getPrintableBySlug } from '@/lib/printables'
import { notFound } from 'next/navigation'
import Image from 'next/image'

type Params = { slug: string }

export async function generateStaticParams() {
  return printables.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const p = getPrintableBySlug(slug)
  if (!p) return { title: 'Not Found' }
  return {
    title: p.title,
    description: p.description,
    openGraph: {
      title: p.title,
      description: p.description,
      type: 'article',
    },
    alternates: { canonical: `https://budgetloom.xyz/printables/${p.slug}/` },
  }
}

export default async function PrintablePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const p = getPrintableBySlug(slug)
  if (!p) return notFound()

  const printableUrl = `https://budgetloom.xyz/printables/${p.slug}/`

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    description: p.description,
    brand: { '@type': 'Brand', name: 'BudgetLoom' },
    offers: {
      '@type': 'Offer',
      price: p.price.replace('$', ''),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: printableUrl,
    },
  }

  return (
    <>
      <Header />
      <main id="main" className="container section">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Printables', href: '/printables/' },
          { label: p.title },
        ]} />

        <div className="printable-hero">
          <div className="printable-preview">
            <span className="printable-preview-icon">📄</span>
            <span className="printable-preview-label">{p.pages}-page printable PDF</span>
            <span style={{fontSize: '0.8rem', color: 'var(--gray)'}}>Instant download</span>
          </div>
          <div className="printable-info">
            <h1>{p.title}</h1>
            <p>{p.description}</p>
            <div className="printable-price">
              <span className="printable-price-tag">{p.price}</span>
              <span className="printable-price-pages">{p.pages} pages · PDF download</span>
            </div>
            <a href={`/printables/${p.slug}.pdf`} className="btn btn-lg" download>Download PDF</a>
            <div style={{marginTop: '1rem', fontSize: '0.85rem', color: 'var(--gray)'}}>
              ✅ No email required · ✅ Print at home · ✅ Beginner-friendly
            </div>
          </div>
        </div>

        <ShareButtons title={p.title} url={printableUrl} />

        <h2 style={{fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.5rem'}}>What is included</h2>
        <ul className="includes-list">
          {p.includes.map(item => <li key={item}>{item}</li>)}
        </ul>

        <h2 style={{fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem'}}>Share on Pinterest</h2>
        <div className="pin-preview">
          <Image
            src={`/pins/pin_${p.slug.replace(/-/g, '_')}.png`}
            alt={`${p.title} - free printable from BudgetLoom`}
            width={280}
            height={420}
            style={{borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)'}}
          />
          <p className="pin-label">Save this pin to your budget board for later</p>
        </div>

        <div className="lead-box" style={{marginTop: '2rem'}}>
          <h2>Get more free printables</h2>
          <p>Join the BudgetLoom library for weekly printables and money tips.</p>
          <EmailForm cta="Send me more printables" tag={p.title} />
          <div className="lead-perks">
            <span className="lead-perk">Weekly printables</span>
            <span className="lead-perk">Money-saving tips</span>
            <span className="lead-perk">No spam</span>
          </div>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      </main>
      <Footer />
    </>
  )
}