import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = { title: 'Contact - BudgetLoom', description: 'Contact BudgetLoom.' }

export default function Contact() {
  return (
    <>
      <Header />
      <main className="container section">
        <h1>Contact</h1>
        <p>Email: hello@budgetloom.com</p>
        <p>For partnership, press, or product questions, reach out and we will reply within 2 business days.</p>
      </main>
      <Footer />
    </>
  )
}
