import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'

export const metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for BudgetLoom.',
  alternates: { canonical: 'https://budgetloom.xyz/terms/' },
}

export default function Terms() {
  return (
    <>
      <Header />
      <main id="main" className="container section">
        <article style={{ maxWidth: '640px', margin: '0 auto' }}>
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Terms' }]} />
          <h1 className="article-title">Terms of Use</h1>
          <div className="article-body">
            <p><strong>Last updated:</strong> July 14, 2026</p>
            <p>By using BudgetLoom, you agree to these terms. All content is for personal use only. Printables are digital downloads offered under the license described on each product page.</p>
            <h2>Not financial advice</h2>
            <p>We are not financial advisors. Our content is educational and should not replace professional financial advice. Always consult a qualified professional before making financial decisions.</p>
            <h2>Limitation</h2>
            <p>BudgetLoom is not liable for any financial decisions made based on content on this site.</p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}