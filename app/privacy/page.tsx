import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: 'Privacy Policy — BudgetLoom',
  description: 'Privacy policy for BudgetLoom.',
}

export default function Privacy() {
  return (
    <>
      <Header />
      <main className="container section">
        <article style={{maxWidth: '680px', margin: '0 auto'}}>
          <h1 className="article-title">Privacy Policy</h1>
          <div className="article-body">
            <p><strong>Last updated:</strong> July 14, 2026</p>
            <p>BudgetLoom respects your privacy. This site may collect your email address if you choose to join our free printable library. We do not sell your email. We use it only to send the requested printables and occasional money-saving tips.</p>
            <h2>Cookies</h2>
            <p>This site may use analytics and advertising cookies from third-party providers such as Google, Adsterra, and AdsKeeper. You can disable cookies in your browser settings.</p>
            <h2>Affiliate links</h2>
            <p>This site contains Amazon affiliate links. If you click and purchase, we may earn a commission at no extra cost to you.</p>
            <h2>Contact</h2>
            <p>For questions about this policy, email hello@budgetloom.xyz.</p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}