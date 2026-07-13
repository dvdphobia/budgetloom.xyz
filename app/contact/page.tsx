import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'

export const metadata = {
  title: 'Contact',
  description: 'Contact BudgetLoom for partnership, press, or product questions.',
  alternates: { canonical: 'https://budgetloom.xyz/contact/' },
}

export default function Contact() {
  return (
    <>
      <Header />
      <main id="main" className="container section">
        <article style={{ maxWidth: '640px', margin: '0 auto' }}>
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
          <h1 className="article-title">Contact</h1>
          <div className="article-body">
            <p>For partnership, press, or product questions, reach out and we'll reply within 2 business days.</p>
            <p>Email: <a href="mailto:hello@budgetloom.xyz">hello@budgetloom.xyz</a></p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}