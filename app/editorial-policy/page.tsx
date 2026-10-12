import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'

export const metadata = {
  title: 'Editorial Policy',
  description: 'How BudgetLoom creates, reviews, updates and corrects its educational budgeting resources.',
  alternates: { canonical: 'https://budgetloom.xyz/editorial-policy' },
}

export default function EditorialPolicyPage() {
  return (
    <>
      <Header />
      <main id="main" className="container section">
        <article style={{ maxWidth: '720px', margin: '0 auto' }}>
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Editorial Policy' }]} />
          <h1 className="article-title">Our editorial standards</h1>
          <div className="article-body">
            <p>BudgetLoom provides general education about budgeting, planning expenses and saving money. Our resources are intended to help readers make their own informed decisions.</p>
            <h2>Research and accuracy</h2>
            <p>We aim to distinguish factual claims from examples and opinions, verify calculations, explain assumptions and use reliable references for material financial information. A worked example is not a promise about an individual's results.</p>
            <h2>Original practical value</h2>
            <p>We prefer useful worksheets, clear examples and functioning tools over repetitive articles written solely for search rankings. Suggested article topics are reviewed before publication.</p>
            <h2>Corrections and updates</h2>
            <p>Financial information can change. If you find an inaccurate article, calculation or printable, contact hello@budgetloom.xyz with the page and the issue so it can be reviewed and corrected.</p>
            <h2>Advertising and affiliates</h2>
            <p>Ads and affiliate links may support the website, but paid placements should be labeled and kept separate from editorial content. We do not invent product testing experiences or professional qualifications.</p>
            <h2>Financial information limits</h2>
            <p>BudgetLoom is not a substitute for personalized financial, tax, legal or investment advice. Seek appropriate qualified help when your circumstances require it.</p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
