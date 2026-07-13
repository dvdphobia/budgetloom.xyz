import Header from '../../components/Header'
import Footer from '../../components/Footer'
import EmailForm from '../../components/EmailForm'
import AmazonLink, { AffiliateDisclaimer, AmazonProductCard } from '../../components/AmazonLink'
import Breadcrumbs from '../../components/Breadcrumbs'
import ShareButtons from '../../components/ShareButtons'
import AuthorBox from '../../components/AuthorBox'
import { Icon } from '../../components/Icons'
import { posts, getPostBySlug, type Post } from '@/lib/posts'
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
    title: post.title,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: 'article', publishedTime: post.date },
    alternates: { canonical: `https://budgetloom.xyz/blog/${post.slug}/` },
  }
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let listKey = 0

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${listKey++}`}>{listItems.map((item, i) => <li key={i}>{item}</li>)}</ul>)
      listItems = []
    }
  }

  lines.forEach((line, i) => {
    const h2 = line.match(/^## (.+)/)
    const h3 = line.match(/^### (.+)/)
    const bullet = line.match(/^- (.+)/)
    const numbered = line.match(/^(\d+)\.\s+(.+)/)

    if (h2) {
      flushList(`f-${i}`)
      elements.push(<h2 key={i} id={slugify(h2[1])}>{h2[1]}</h2>)
    } else if (h3) {
      flushList(`f-${i}`)
      elements.push(<h3 key={i} id={slugify(h3[1])}>{h3[1]}</h3>)
    } else if (bullet) {
      listItems.push(bullet[1])
    } else if (numbered) {
      flushList(`f-${i}`)
      elements.push(<p key={i}><strong>{numbered[2]}</strong></p>)
    } else if (!line.trim()) {
      flushList(`f-${i}`)
    } else {
      flushList(`f-${i}`)
      // Inject affiliate links inline
      if (line.includes('planner notebook')) {
        elements.push(<p key={i}>{line} — <AmazonLink asin={affiliateProducts.budgetPlannerNotebook.asin}>check price on Amazon</AmazonLink>.</p>)
      } else if (line.includes('envelope')) {
        elements.push(<p key={i}>{line} — <AmazonLink asin={affiliateProducts.cashEnvelopes.asin}>see envelope systems on Amazon</AmazonLink>.</p>)
      } else if (line.includes('meal prep')) {
        elements.push(<p key={i}>{line} — <AmazonLink asin={affiliateProducts.mealPrepContainers.asin}>browse meal prep containers</AmazonLink>.</p>)
      } else {
        elements.push(<p key={i}>{line}</p>)
      }
    }
  })
  flushList('final')
  return elements
}

function generateTOC(content: string) {
  const headings: { text: string, id: string }[] = []
  for (const line of content.split('\n')) {
    const h2 = line.match(/^## (.+)/)
    if (h2) headings.push({ text: h2[1], id: slugify(h2[1]) })
  }
  return headings
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return notFound()

  const relatedPosts = posts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3)
  const tocItems = generateTOC(post.content)
  const postUrl = `https://budgetloom.xyz/blog/${post.slug}/`

  const affiliateProduct = post.category === 'Food'
    ? { ...affiliateProducts.mealPrepContainers, desc: 'Good containers keep food fresh longer and make batch cooking actually work.' }
    : post.category === 'Savings'
    ? { ...affiliateProducts.cashEnvelopes, desc: 'Cash envelopes make savings visible. When the envelope is empty, you stop spending.' }
    : { ...affiliateProducts.budgetPlannerNotebook, desc: 'Writing your budget by hand makes it real. A planner notebook builds consistency.' }

  return (
    <>
      <Header />
      <main id="main" className="container section">
        <article style={{ maxWidth: '720px', margin: '0 auto' }}>
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Guides', href: '/blog/' },
            { label: post.title },
          ]} />

          <div className="article-meta">
            <span className="cat">{post.category}</span>
            <span className="dot">·</span>
            <span className="time">{post.readTime} read</span>
          </div>
          <h1 className="article-title">{post.title}</h1>
          <p className="article-sub">{post.description}</p>

          <ShareButtons title={post.title} url={postUrl} />
          <AffiliateDisclaimer />

          {tocItems.length > 2 && (
            <nav className="toc" aria-label="Table of contents">
              <div className="toc-label">In this article</div>
              <ol>
                {tocItems.map((item, i) => (
                  <li key={i}><a href={`#${item.id}`}>{item.text}</a></li>
                ))}
              </ol>
            </nav>
          )}

          <div className="article-body" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.12rem' }}>
            {parseContent(post.content)}
          </div>

          {/* Single affiliate product — contextually relevant */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Recommended</h3>
            <AmazonProductCard asin={affiliateProduct.asin} name={affiliateProduct.name} description={affiliateProduct.desc} />
          </div>

          {/* FAQ */}
          <div className="faq">
            <h2>Common Questions</h2>
            <div className="faq-item">
              <h3>Is this guide free?</h3>
              <p>Yes, all guides on BudgetLoom are free to read. Printable downloads are also free.</p>
            </div>
            <div className="faq-item">
              <h3>Do I need special software?</h3>
              <p>No. All printables are PDF files — download and print at home.</p>
            </div>
            <div className="faq-item">
              <h3>Will this work on a low income?</h3>
              <p>Yes. These tips are designed for real people, including those on tight budgets.</p>
            </div>
          </div>

          <AuthorBox />

          {/* Email CTA */}
          <div className="lead-box">
            <h2>Get the matching printable</h2>
            <p>Join the library and download the free printable that goes with this guide.</p>
            <EmailForm cta="Download free printable" tag="matching printable" />
            <div className="lead-perks">
              <span className="lead-perk"><Icon.check className="" /> Instant download</span>
              <span className="lead-perk"><Icon.check className="" /> No spam</span>
              <span className="lead-perk"><Icon.check className="" /> Unsubscribe anytime</span>
            </div>
          </div>

          {/* Related */}
          {relatedPosts.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Keep reading</h2>
              <div className="grid">
                {relatedPosts.map(rp => (
                  <Link href={`/blog/${rp.slug}/`} className="card" key={rp.slug}>
                    <div className="card-body">
                      <span className="card-badge">{rp.category}</span>
                      <h3>{rp.title}</h3>
                      <p>{rp.description}</p>
                      <div className="card-meta">
                        <Icon.clock className="" style={{ width: '13px', height: '13px' }} />
                        <span>{rp.readTime} read</span>
                      </div>
                    </div>
                  </Link>
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