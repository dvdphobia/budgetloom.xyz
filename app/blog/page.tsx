import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import Breadcrumbs from '../components/Breadcrumbs'
import { posts } from '@/lib/posts'

export const metadata = {
  title: 'Money Guides',
  description: 'Free guides on budgeting, saving money, meal planning, debt payoff, and no-spend challenges.',
  alternates: { canonical: 'https://budgetloom.xyz/blog/' },
}

const categoryIcons: Record<string, string> = {
  'Savings': '💰',
  'Food': '🍽️',
  'Budgeting': '📊',
  'Lifestyle': '✨',
  'Debt': '💳',
}

const categoryOrder = ['Savings', 'Budgeting', 'Food', 'Debt', 'Lifestyle']

export default function BlogPage() {
  const categories = [...new Set(posts.map(p => p.category))].sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  )

  return (
    <>
      <Header />
      <main id="main" className="container section">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Guides' },
        ]} />

        <div className="section-header">
          <h1 style={{fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem'}}>Money Guides</h1>
          <p>Practical tips you can use today — no fluff, no jargon.</p>
        </div>

        {/* Category pills */}
        <div className="category-pills">
          {categories.map(cat => (
            <a key={cat} href={`#${cat.toLowerCase()}`} className="category-pill">
              {categoryIcons[cat]} {cat}
            </a>
          ))}
        </div>

        {categoryOrder.filter(c => categories.includes(c)).map(cat => {
          const catPosts = posts.filter(p => p.category === cat)
          if (catPosts.length === 0) return null
          return (
            <section key={cat} id={cat.toLowerCase()} style={{marginBottom: '3rem', scrollMarginTop: '80px'}}>
              <h2 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span>{categoryIcons[cat]}</span> {cat}
              </h2>
              <div className="grid">
                {catPosts.map(post => (
                  <div className="card" key={post.slug}>
                    <div className="card-cover">
                      <span className="card-cover-icon">{categoryIcons[post.category] || '📖'}</span>
                    </div>
                    <div className="card-body">
                      <span className="card-badge">{post.category}</span>
                      <h3><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h3>
                      <p>{post.description}</p>
                      <div className="card-meta">
                        <span>{post.date}</span>
                        <span>·</span>
                        <span>{post.readTime} read</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </main>
      <Footer />
    </>
  )
}