import Header from '../../components/Header'
import Footer from '../../components/Footer'
import EmailForm from '../../components/EmailForm'
import AmazonLink, { AffiliateDisclaimer } from '../../components/AmazonLink'
import AdBanner from '../../components/AdBanner'
import { posts, getPostBySlug } from '@/lib/posts'
import { affiliateProducts } from '@/lib/config'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Params = { slug: string }

export async function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Not Found' }
  return {
    title: `${post.title} — BudgetLoom`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
    }
  }
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return notFound()

  const relatedPosts = posts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3)

  return (
    <>
      <Header />
      <main className="container section">
        <article style={{maxWidth: '760px', margin: '0 auto'}}>
          <div className="article-meta">
            <span className="cat">{post.category}</span>
            <span className="time">{post.date} · {post.readTime} read</span>
          </div>
          <h1 className="article-title">{post.title}</h1>
          <p style={{fontSize: '1.15rem', color: 'var(--gray)', marginBottom: '2rem'}}>{post.description}</p>

          <AffiliateDisclaimer />
          <AdBanner slot="adsterra" />

          <div className="article-body">
            {post.content.split('\n').map((line, i) => {
              if (line.startsWith('### ')) return <h3 key={i} style={{fontSize: '1.2rem', fontWeight: 600, margin: '1.5rem 0 0.5rem', color: 'var(--dark)'}}>{line.replace('### ', '')}</h3>
              if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>
              if (line.startsWith('- ')) return <li key={i}>{line.replace('- ', '')}</li>
              if (line.match(/^\d+\./)) return <p key={i}><strong>{line}</strong></p>
              if (!line.trim()) return <br key={i} />
              if (line.includes('planner notebook')) return <p key={i}>{line} — <AmazonLink asin={affiliateProducts.budgetPlannerNotebook.asin}>check price on Amazon</AmazonLink>.</p>
              if (line.includes('envelope')) return <p key={i}>{line} — <AmazonLink asin={affiliateProducts.cashEnvelopes.asin}>see envelope systems on Amazon</AmazonLink>.</p>
              if (line.includes('meal prep')) return <p key={i}>{line} — <AmazonLink asin={affiliateProducts.mealPrepContainers.asin}>browse meal prep containers</AmazonLink>.</p>
              return <p key={i}>{line}</p>
            })}
          </div>

          <AdBanner slot="adskeeper" />

          <div className="lead-box" style={{marginTop: '3rem'}}>
            <h2>Get the matching printable</h2>
            <p>This post has a free printable that goes with it. Join the library and download it instantly.</p>
            <EmailForm cta="Download the free printable" tag="matching printable" />
            <div className="lead-perks">
              <span className="lead-perk">Instant download</span>
              <span className="lead-perk">No spam</span>
              <span className="lead-perk">Unsubscribe anytime</span>
            </div>
          </div>

          {relatedPosts.length > 0 && (
            <div style={{marginTop: '3rem'}}>
              <h2 style={{fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem'}}>Related Guides</h2>
              <div className="grid">
                {relatedPosts.map(rp => (
                  <div className="card" key={rp.slug}>
                    <div className="card-body">
                      <span className="card-badge">{rp.category}</span>
                      <h3><Link href={`/blog/${rp.slug}/`}>{rp.title}</Link></h3>
                      <p>{rp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </>
  )
}