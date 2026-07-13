import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: 'Contact — BudgetLoom',
  description: 'Contact BudgetLoom.',
}

export default function Contact() {
  return (
    <>
      <Header />
      <main className="container section">
        <article style={{maxWidth: '680px', margin: '0 auto'}}>
          <h1 className="article-title">Contact</h1>
          <div className="article-body">
            <p>Email: <a href="mailto:hello@budgetloom.xyz">hello@budgetloom.xyz</a></p>
            <p>For partnership, press, or product questions, reach out and we will reply within 2 business days.</p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}