import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = { title: 'Privacy Policy - BudgetLoom', description: 'Privacy policy for BudgetLoom.' }

export default function Privacy() {
  return (
    <>
      <Header />
      <main className="container section">
        <h1>Privacy Policy</h1>
        <p><strong>Last updated:</strong> July 7, 2026</p>
        <p>BudgetLoom respects your privacy. This site may collect your email address if you choose to join our free printable library. We do not sell your email. We use it only to send the requested printables and occasional money-saving tips.</p>
        <p>This site may use analytics and advertising cookies from third-party providers such as Google and Pinterest. You can disable cookies in your browser settings.</p>
        <p>For questions, contact us via the Contact page.</p>
      </main>
      <Footer />
    </>
  )
}
