import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = { title: 'Terms - BudgetLoom', description: 'Terms of use for BudgetLoom.' }

export default function Terms() {
  return (
    <>
      <Header />
      <main className="container section">
        <h1>Terms of Use</h1>
        <p><strong>Last updated:</strong> July 7, 2026</p>
        <p>By using BudgetLoom, you agree to these terms. All content is for personal use only. Printables are digital downloads sold or offered under the license described on each product page.</p>
        <p>We are not financial advisors. Our content is educational and should not replace professional financial advice.</p>
      </main>
      <Footer />
    </>
  )
}
