import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import { posts } from '@/lib/posts'

export const metadata = {
  title: 'Money Guides — BudgetLoom',
  description: 'Free guides on budgeting, saving money, meal planning, debt payoff, and no-spend challenges.',
}

const categoryColors: Record<string, string> = {
  'Savings': '💰',
  'Food': '🎧',
  'Budgeting': '📄',
  'Lifestyle': '✨',
  'Debt': '💳',
}

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="container section">
        <div className="section-header">
          <h1 style={{fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem'}}>Money Guides</h1>
          <p>Practical tips you can use today — no fluff, no jargon.</p>
        </div>
        <div className="grid">
          {posts.map(post => (
            <div className="card" key={post.slug}>
              <div className="card-cover">
                <span className="card-cover-icon">{categoryColors[post.category] || '📖'}</span>
              </div>
              <div className="card-body">
                <span className="card-badge">{post.category}</span>
                <h3><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h3>
                <p>{post.description}</p>
                <div className="card-meta">
                  <span>{post.date}</span>
                  <span>{post.readTime} read</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}