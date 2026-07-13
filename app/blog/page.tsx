import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import Breadcrumbs from '../components/Breadcrumbs'
import { CardCover, Icon } from '../components/Icons'
import { posts } from '@/lib/posts'

export const metadata = {
  title: 'Money Guides',
  description: 'Free guides on budgeting, saving money, meal planning, debt payoff, and no-spend challenges.',
  alternates: { canonical: 'https://budgetloom.xyz/blog/' },
}

const categoryIcons: Record<string, { label: string, cat: string }> = {
  'Savings': { label: 'Savings', cat: 'savings' },
  'Budgeting': { label: 'Budgeting', cat: 'budgeting' },
  'Food': { label: 'Food', cat: 'food' },
  'Debt': { label: 'Debt', cat: 'debt' },
  'Lifestyle': { label: 'Lifestyle', cat: 'lifestyle' },
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
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '-0.025em' }}>Money Guides</h1>
          <p>Practical tips you can use today — no fluff, no jargon.</p>
        </div>

        <div className="category-pills">
          {categories.map(cat => (
            <a key={cat} href={`#${cat.toLowerCase()}`} className="category-pill">
              {categoryIcons[cat].label}
            </a>
          ))}
        </div>

        {categoryOrder.filter(c => categories.includes(c)).map(cat => {
          const catPosts = posts.filter(p => p.category === cat)
          if (catPosts.length === 0) return null
          return (
            <section key={cat} id={cat.toLowerCase()} style={{ marginBottom: '3rem', scrollMarginTop: '80px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--dark)' }}>{cat}</h2>
              <div className="grid">
                {catPosts.map(post => (
                  <Link href={`/blog/${post.slug}/`} className="card" key={post.slug}>
                    <div className="card-cover">
                      <CardCover category={categoryIcons[post.category]?.cat || 'printable'} />
                    </div>
                    <div className="card-body">
                      <span className="card-badge">{post.category}</span>
                      <h3>{post.title}</h3>
                      <p>{post.description}</p>
                      <div className="card-meta">
                        <Icon.clock className="" style={{ width: '13px', height: '13px' }} />
                        <span>{post.readTime} read</span>
                      </div>
                    </div>
                  </Link>
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