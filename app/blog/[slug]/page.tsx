import Header from '../../components/Header'
import Footer from '../../components/Footer'
import EmailForm from '../../components/EmailForm'
import AmazonLink, { AffiliateDisclaimer, AmazonProductCard } from '../../components/AmazonLink'
import Breadcrumbs from '../../components/Breadcrumbs'
import ShareButtons from '../../components/ShareButtons'
import AuthorBox from '../../components/AuthorBox'
import AdSlot from '../../components/AdSlot'
import { Icon } from '../../components/Icons'
import { posts, getPostBySlug, type Post } from '@/lib/posts'
import { affiliateProducts, monetization } from '@/lib/config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { site } from '@/lib/config'

type Params = { slug: string }

export async function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Not Found' }
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `${site.url}/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: [site.publisher],
      section: post.category,
      images: [{ url: `/blog/${post.slug}/opengraph-image`, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: [`/blog/${post.slug}/opengraph-image`] },
    alternates: { canonical: `${site.url}/blog/${post.slug}` },
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
  let orderedItems: string[] = []

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${listKey++}`}>{listItems.map((item, i) => <li key={i}>{item}</li>)}</ul>)
      listItems = []
    }
    if (orderedItems.length > 0) {
      elements.push(<ol key={`ol-${listKey++}`}>{orderedItems.map((item, i) => <li key={i}>{item}</li>)}</ol>)
      orderedItems = []
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
      orderedItems.push(numbered[2])
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
      } else if (line === 'Browse budget-friendly standing desks on Amazon only after you know your required width and height range.') {
        elements.push(<p key={i}>Once you know your required width and height range, <AmazonLink href={`https://www.amazon.com/s?k=budget+standing+desk&tag=${monetization.amazonTrackingId}`}>compare budget-friendly standing desks on Amazon</AmazonLink>.</p>)
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
  const postUrl = `${site.url}/blog/${post.slug}`
  const isHomeOffice = post.slug === 'modern-home-office-setup-on-a-budget'
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: postUrl,
    image: `${postUrl}/opengraph-image`,
    articleSection: post.category,
    author: { '@type': 'Organization', name: site.publisher, url: `${site.url}/about` },
    publisher: { '@type': 'Organization', name: site.name, url: site.url, logo: { '@type': 'ImageObject', url: `${site.url}/logo.png` } },
  }

  const affiliateProduct = isHomeOffice
    ? {
        name: 'Budget-Friendly Standing Desks',
        href: `https://www.amazon.com/s?k=budget+standing+desk&tag=${monetization.amazonTrackingId}`,
        desc: 'Compare desk sizes, height ranges, weight capacities, and current customer feedback before choosing a model for your space.',
      }
    : post.category === 'Food'
    ? { ...affiliateProducts.mealPrepContainers, desc: 'Good containers keep food fresh longer and make batch cooking actually work.' }
    : post.category === 'Savings'
    ? { ...affiliateProducts.cashEnvelopes, desc: 'Cash envelopes make savings visible. When the envelope is empty, you stop spending.' }
    : { ...affiliateProducts.budgetPlannerNotebook, desc: 'Writing your budget by hand makes it real. A planner notebook builds consistency.' }

  return (
    <>
      <Header />
      <main id="main" className="container section">
        <article style={{ maxWidth: '720px', margin: '0 auto' }}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Guides', href: '/blog' },
            { label: post.title },
          ]} />

          <div className="article-meta">
            <span className="cat">{post.category}</span>
            <span className="dot">·</span>
            <span className="time">{post.readTime} read</span>
            <span className="dot">·</span>
            <time dateTime={post.date}>Published {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${post.date}T00:00:00Z`))}</time>
          </div>
          <h1 className="article-title">{post.title}</h1>
          <p className="article-sub">{post.description}</p>

          <ShareButtons title={post.title} url={postUrl} />
          <AffiliateDisclaimer />

          <AdSlot placement="blog_post_top" />

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

          {post.category === 'Budgeting' && (
            <aside className="resource-box" aria-label="Free budgeting resources">
              <h2>Put this guide into practice</h2>
              <p>Use the free tools that match the next step in your budget.</p>
              <div>
                <Link href="/free-budget-template">Free budget template</Link>
                <Link href="/monthly-budget-worksheet">Monthly worksheet and example</Link>
                <Link href="/budget-calculator">Monthly budget calculator</Link>
                <Link href="/free-budget-spreadsheet">Free budget spreadsheet</Link>
              </div>
            </aside>
          )}

          <AdSlot placement="blog_post_middle" />

          {/* Single affiliate product — contextually relevant */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Recommended</h3>
            <AmazonProductCard asin={'asin' in affiliateProduct ? affiliateProduct.asin : undefined} href={'href' in affiliateProduct ? affiliateProduct.href : undefined} name={affiliateProduct.name} description={affiliateProduct.desc} />
          </div>

          {/* FAQ */}
          <div className="faq">
            <h2>Common Questions</h2>
            {isHomeOffice ? (
              <>
                <div className="faq-item"><h3>Do I need a standing desk?</h3><p>No. A stable desk at the right working height is more important. A standing desk is useful if you want to alternate positions during the day.</p></div>
                <div className="faq-item"><h3>What should I upgrade first?</h3><p>Start with the item causing daily discomfort or friction. That is usually the chair, monitor height, lighting, or cable placement—not decoration.</p></div>
                <div className="faq-item"><h3>Can a small room fit two monitors?</h3><p>Often, yes. A monitor arm can recover desk depth, but check the desk thickness, clamp clearance, and arm weight rating before buying.</p></div>
              </>
            ) : (
              <>
                <div className="faq-item"><h3>Is this guide free?</h3><p>Yes, all guides on BudgetLoom are free to read. Printable downloads are also free.</p></div>
                <div className="faq-item"><h3>Do I need special software?</h3><p>No. All printables are PDF files — download and print at home.</p></div>
                <div className="faq-item"><h3>Will this work on a low income?</h3><p>Yes. These tips are designed for real people, including those on tight budgets.</p></div>
              </>
            )}
          </div>

          <AuthorBox />

          <AdSlot placement="blog_post_bottom" />

          {/* Email CTA */}
          <div className="lead-box">
            <h2>{isHomeOffice ? 'Plan the cost before you upgrade' : 'Get the matching printable'}</h2>
            <p>{isHomeOffice ? 'Use our free budget tools to set a workspace limit and avoid impulse upgrades.' : 'Join the library and download the free printable that goes with this guide.'}</p>
            <EmailForm cta={isHomeOffice ? 'Get free budget tools' : 'Download free printable'} tag={isHomeOffice ? 'home office budget' : 'matching printable'} />
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
                  <Link href={`/blog/${rp.slug}`} className="card" key={rp.slug}>
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
