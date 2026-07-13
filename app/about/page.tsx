import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: 'About — BudgetLoom',
  description: 'BudgetLoom helps people save money with simple printables and practical guides.',
}

export default function About() {
  return (
    <>
      <Header />
      <main className="container section">
        <article style={{maxWidth: '680px', margin: '0 auto'}}>
          <h1 className="article-title">About BudgetLoom</h1>
          <div className="article-body">
            <p>BudgetLoom is here to make money simple. We create printable planners and straightforward guides for people who want to save more, spend smarter, and stop stressing about cash.</p>
            <p>Whether you are trying to pay off debt, cut grocery costs, or finally build a budget that sticks, our tools are designed to help you take the first step today.</p>
            <h2>What we offer</h2>
            <ul>
              <li>Free budget printables: monthly budgets, expense trackers, savings challenges</li>
              <li>Practical money guides: no jargon, no fluff, just tips that work</li>
              <li>Meal planning tools to cut your grocery bill</li>
              <li>Debt payoff trackers to keep you motivated</li>
            </ul>
            <h2>Our promise</h2>
            <p>Every printable and guide is designed to be simple enough for a beginner but effective enough for someone who has been budgeting for years. If it does not help you save money, we do not publish it.</p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}