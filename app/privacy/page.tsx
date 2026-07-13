import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for BudgetLoom.',
  alternates: { canonical: 'https://budgetloom.xyz/privacy/' },
}

export default function Privacy() {
  return (
    <>
      <Header />
      <main id="main" className="container section">
        <article style={{ maxWidth: '640px', margin: '0 auto' }}>
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy' }]} />
          <h1 className="article-title">Privacy Policy</h1>
          <div className="article-body">
            <p><strong>Last updated:</strong> July 14, 2026</p>
            <p>BudgetLoom respects your privacy. We collect your email only if you join our free printable library. We do not sell your email. We use it to send the requested printables and occasional money-saving tips.</p>
            <h2>Cookies</h2>
            <p>This site may use analytics and advertising cookies from third-party providers. You can disable cookies in your browser settings.</p>
            <h2>Affiliate links</h2>
            <p>This site contains Amazon affiliate links. If you click and purchase, we may earn a commission at no extra cost to you.</p>
            <h2>Contact</h2>
            <p>For questions about this policy, email <a href="mailto:hello@budgetloom.xyz">hello@budgetloom.xyz</a>.</p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}