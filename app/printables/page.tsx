import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import PrintablesCatalogClient from '../components/PrintablesCatalogClient'
import { printables } from '@/lib/printables'

export const metadata = {
  title: 'Free Budget Printables Library (20 Printable PDF Workbooks & Trackers)',
  description:
    'Download 20 free printable budget planners, paycheck worksheets, 30-day and 52-week savings challenges, meal planners, and debt payoff trackers.',
  alternates: { canonical: 'https://budgetloom.xyz/printables' },
}

export default function PrintablesPage() {
  const totalPages = printables.reduce((sum, p) => sum + p.pages, 0)

  return (
    <>
      <Header />
      <main id="main">
        <section className="tool-hero compact">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Printables' }]} />
            <span className="eyebrow">
              {printables.length} Free Printable Workbooks · {totalPages} Total Pages · Instant PDF Download
            </span>
            <h1>Free Budget Printables Library</h1>
            <p>
              Every worksheet and multi-page bundle is 100% free to download and formatted for standard US Letter or A4 home printing in color or grayscale—no email wall required.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <PrintablesCatalogClient items={printables} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
