import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = { title: 'About - BudgetLoom', description: 'BudgetLoom helps people save money with simple printables and practical guides.' }

export default function About() {
  return (
    <>
      <Header />
      <main className="container section">
        <h1>About BudgetLoom</h1>
        <p>BudgetLoom is here to make money simple. We create printable planners and straight-forward guides for people who want to save more, spend smarter, and stop stressing about cash.</p>
        <p>Whether you are trying to pay off debt, cut grocery costs, or finally build a budget that sticks, our tools are designed to help you take the first step today.</p>
      </main>
      <Footer />
    </>
  )
}
