import Header from './components/Header'
import Footer from './components/Footer'
import EmailForm from './components/EmailForm'
import Link from 'next/link'
import { posts } from '@/lib/posts'
import { printables } from '@/lib/printables'

export default function Home() {
  const recentPosts = posts.slice(0, 3)
  const featured = printables.slice(0, 3)

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="container">
            <h1>Save more. Stress less. Start today.</h1>
            <p>Free budget printables, simple money guides, and easy savings challenges — designed for real life.</p>
            <Link href="/printables/" className="btn">Browse Printables</Link>
            <Link href="/blog/" className="btn btn-ghost" style={{marginLeft:'0.6rem'}}>Read Guides</Link>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 style={{textAlign:'center', marginBottom:'2rem'}}>Popular Printables</h2>
            <div className="grid">
              {featured.map(p => (
                <div className="card" key={p.slug}>
                  <span className="tag">{p.price} · {p.pages} pages</span>
                  <h3><Link href={`/printables/${p.slug}/`}>{p.title}</Link></h3>
                  <p>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{background:'var(--light)'}}>
          <div className="container">
            <h2 style={{textAlign:'center', marginBottom:'2rem'}}>Latest Money Guides</h2>
            <div className="grid">
              {recentPosts.map(post => (
                <div className="card" key={post.slug}>
                  <span className="tag">{post.category}</span>
                  <h3><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h3>
                  <p>{post.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="lead-box">
              <h2>Join the Free Budget Library</h2>
              <p>Get a free budget starter pack plus weekly money-saving tips.</p>
              <EmailForm cta="Send my free printables" tag="budget starter pack" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
