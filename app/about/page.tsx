import Header from '../components/Header'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'

export const metadata = {
  title: 'About',
  description: 'BudgetLoom helps people save money with simple printables and practical guides.',
  alternates: { canonical: 'https://budgetloom.xyz/about/' },
}

export default function About() {
  return (
    <>
      <Header />
      <main id="main" className="container section">
        <article style={{ maxWidth: '640px', margin: '0 auto' }}>
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
          <h1 className="article-title">About BudgetLoom</h1>
          <div className="article-body">
            <p>BudgetLoom makes money simple. We create printable planners and straightforward guides for people who want to save more, spend smarter, and stop stressing about cash.</p>
            <p>Whether you are trying to pay off debt, cut grocery costs, or finally build a budget that sticks, our tools are designed to help you take the first step today.</p>
            <h2>What we offer</h2>
            <ul>
              <li><strong>Budget printables</strong> — monthly budgets, expense trackers, savings challenges</li>
              <li><strong>Money guides</strong> — no jargon, no fluff, just tips that work</li>
              <li><strong>Meal planning tools</strong> to cut your grocery bill</li>
              <li><strong>Debt payoff trackers</strong> to keep you motivated</li>
            </ul>
            <h2>How we make money</h2>
            <p>BudgetLoom is reader-supported. We earn commissions through affiliate links (like Amazon) at no extra cost to you. Some premium printables are paid. Most content is free. This keeps the site running without paywalls.</p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}