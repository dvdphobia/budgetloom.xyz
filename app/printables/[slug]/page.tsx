import Header from '../../components/Header'
import Footer from '../../components/Footer'
import EmailForm from '../../components/EmailForm'
import { printables, getPrintableBySlug } from '@/lib/printables'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export function generateStaticParams() {
  return printables.map(p => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getPrintableBySlug(params.slug)
  return { title: p ? p.title : 'Not Found', description: p?.description }
}

export default function PrintablePage({ params }: { params: { slug: string } }) {
  const p = getPrintableBySlug(params.slug)
  if (!p) return notFound()

  return (
    <>
      <Header />
      <main className="container section">
        <span className="tag">{p.price} · {p.pages} pages</span>
        <h1>{p.title}</h1>
        <p style={{fontSize:'1.1rem', color:'var(--gray)'}}>{p.description}</p>

        <a href={`/printables/${p.slug}.pdf`} className="btn" download style={{marginTop:'1rem', display:'inline-block'}}>Download PDF</a>

        <h2 style={{marginTop:'2rem'}}>What is included</h2>
        <ul>
          {p.includes.map(item => <li key={item}>{item}</li>)}
        </ul>

        <h2>Share on Pinterest</h2>
        <Image src={`/pins/pin_${p.slug.replace(/-/g, '_')}.png`} alt={p.title} width={300} height={450} style={{borderRadius:12, margin:'1rem 0'}} />
        <p>Use this image to pin this printable to Pinterest.</p>

        <div className="lead-box" style={{marginTop:'2rem'}}>
          <h2>Get more free printables</h2>
          <p>Join the BudgetLoom library for weekly printables and money tips.</p>
          <EmailForm cta="Send me more printables" tag={p.title} />
        </div>
      </main>
      <Footer />
    </>
  )
}
