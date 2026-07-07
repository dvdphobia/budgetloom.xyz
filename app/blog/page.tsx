import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import { posts } from '@/lib/posts'

export const metadata = { title: 'Money Guides - BudgetLoom', description: 'Free guides on budgeting, saving money, meal planning, and no-spend challenges.' }

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="container section">
        <h1>Money Guides</h1>
        <p style={{color:'var(--gray)'}}>Practical tips you can use today.</p>
        <ul className="post-list">
          {posts.map(post => (
            <li key={post.slug}>
              <h3><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h3>
              <p>{post.description}</p>
              <div className="post-meta">{post.date} · {post.category} · {post.readTime} read</div>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  )
}
