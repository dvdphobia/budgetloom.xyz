import Header from '../../components/Header'
import Footer from '../../components/Footer'
import EmailForm from '../../components/EmailForm'
import AmazonLink, { AffiliateDisclaimer, AmazonProductCard } from '../../components/AmazonLink'
import AdBanner from '../../components/AdBanner'
import Breadcrumbs from '../../components/Breadcrumbs'
import ShareButtons from '../../components/ShareButtons'
import AuthorBox from '../../components/AuthorBox'
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
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
    alternates: { canonical: `https://budgetloom.xyz/blog/${post.slug}/` },
  }
}

function generateTOC(content: string) {
  const headings: { level: number, text: string, id: string }[] = []
  for (const line of content.split('\n')) {
    const h2 = line.match(/^## (.+)/)
    if (h2) {
      const text = h2[1]
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      headings.push({ level: 2, text, id })
    }
  }
  return headings
}

function generateTakeaways(post: { category: string, title: string, description: string }) {
  const takeaways: string[] = []
  if (post.category === 'Savings') {
    takeaways.push('Small daily savings actions beat big monthly resolutions')
    takeaways.push('Track your progress visually to stay motivated')
    takeaways.push('Automate savings to remove willpower from the equation')
  } else if (post.category === 'Food') {
    takeaways.push('Meal planning is the fastest way to cut grocery spending')
    takeaways.push('Store brands and bulk staples save 20-30% with no quality loss')
    takeaways.push('Never shop without a list — impulse buys add up fast')
  } else if (post.category === 'Budgeting') {
    takeaways.push('Track every dollar for one week before building a budget')
    takeaways.push('Start with 80/20 split: 80% needs, 20% future')
    takeaways.push('Review and adjust your budget monthly')
  } else if (post.category === 'Debt') {
    takeaways.push('List all debts with balance, rate, and minimum payment')
    takeaways.push('Snowball = motivation, Avalanche = math. Pick what you will stick with')
    takeaways.push('Roll payments from paid-off debts into the next one')
  } else {
    takeaways.push('Free activities are often more memorable than paid ones')
    takeaways.push('Boredom is the enemy of your budget — plan ahead')
    takeaways.push('Small lifestyle changes compound into big savings')
  }
  return takeaways
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return notFound()

  const relatedPosts = posts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3)
  const tocItems = generateTOC(post.content)
  const takeaways = generateTakeaways(post)
  const postUrl = `https://budgetloom.xyz/blog/${post.slug}/`

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'BudgetLoom' },
    publisher: { '@type': 'Organization', name: 'BudgetLoom', url: 'https://budgetloom.xyz' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Is this budget guide free?`,
        acceptedAnswer: { '@type': 'Answer', text: 'Yes, all guides on BudgetLoom are free to read. Printable downloads are also free — just enter your email to get the PDF.' },
      },
      {
        '@type': 'Question',
        name: 'Do I need any special software to use the printables?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. All printables are PDF files. Download, open with any PDF reader, and print at home or at a local print shop.' },
      },
      {
        '@type': 'Question',
        name: 'Will this work if I have a low income?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. BudgetLoom guides are designed for real people, including those on tight budgets. The tips work regardless of income level.' },
      },
    ],
  }

  return (
    <>
      <Header />
      <main id="main" className="container section">
        <article style={{maxWidth: '760px', margin: '0 auto'}}>
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Guides', href: '/blog/' },
            { label: post.title },
          ]} />

          <div className="article-meta">
            <span className="cat">{post.category}</span>
            <span className="time">{post.date} · {post.readTime} read</span>
          </div>
          <h1 className="article-title">{post.title}</h1>
          <p style={{fontSize: '1.15rem', color: 'var(--gray)', marginBottom: '1.5rem'}}>{post.description}</p>

          <ShareButtons title={post.title} url={postUrl} />

          <AffiliateDisclaimer />

          {/* Key Takeaways */}
          <div className="takeaways">
            <h2>Key Takeaways</h2>
            <ul>
              {takeaways.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>

          {/* Table of Contents */}
          {tocItems.length > 2 && (
            <nav className="toc" aria-label="Table of contents">
              <h2>In this article</h2>
              <ol>
                {tocItems.map((item, i) => (
                  <li key={i}><a href={`#${item.id}`}>{item.text}</a></li>
                ))}
              </ol>
            </nav>
          )}

          <AdBanner slot="adsterra" />

          <div className="article-body">
            {post.content.split('\n').map((line, i) => {
              const h2 = line.match(/^## (.+)/)
              if (h2) {
                const text = h2[1]
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                return <h2 key={i} id={id}>{text}</h2>
              }
              const h3 = line.match(/^### (.+)/)
              if (h3) {
                const text = h3[1]
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                return <h3 key={i} id={id}>{text}</h3>
              }
              if (line.startsWith('- ')) return <li key={i}>{line.replace('- ', '')}</li>
              if (line.match(/^\d+\./)) return <p key={i}><strong>{line}</strong></p>
              if (!line.trim()) return <br key={i} />
              if (line.includes('planner notebook')) return <p key={i}>{line} — <AmazonLink asin={affiliateProducts.budgetPlannerNotebook.asin}>check price on Amazon</AmazonLink>.</p>
              if (line.includes('envelope')) return <p key={i}>{line} — <AmazonLink asin={affiliateProducts.cashEnvelopes.asin}>see envelope systems on Amazon</AmazonLink>.</p>
              if (line.includes('meal prep')) return <p key={i}>{line} — <AmazonLink asin={affiliateProducts.mealPrepContainers.asin}>browse meal prep containers</AmazonLink>.</p>
              return <p key={i}>{line}</p>
            })}
          </div>

          {/* Affiliate product recommendation */}
          {(post.category === 'Budgeting' || post.category === 'Debt') && (
            <div style={{marginTop: '2rem'}}>
              <h3 style={{fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem'}}>Recommended Tool</h3>
              <AmazonProductCard
                asin={affiliateProducts.budgetPlannerNotebook.asin}
                name={affiliateProducts.budgetPlannerNotebook.name}
                description="A physical budget planner notebook makes it easier to stick with your budget. Writing by hand builds awareness."
              />
            </div>
          )}
          {post.category === 'Food' && (
            <div style={{marginTop: '2rem'}}>
              <h3 style={{fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem'}}>Recommended Tool</h3>
              <AmazonProductCard
                asin={affiliateProducts.mealPrepContainers.asin}
                name={affiliateProducts.mealPrepContainers.name}
                description="Good meal prep containers keep food fresh longer and make batch cooking actually work."
              />
            </div>
          )}
          {post.category === 'Savings' && (
            <div style={{marginTop: '2rem'}}>
              <h3 style={{fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem'}}>Recommended Tool</h3>
              <AmazonProductCard
                asin={affiliateProducts.cashEnvelopes.asin}
                name={affiliateProducts.cashEnvelopes.name}
                description="Cash envelopes make savings visible. When the envelope is empty, you stop spending."
              />
            </div>
          )}

          <AdBanner slot="adskeeper" />

          {/* FAQ */}
          <div className="faq">
            <h2 style={{fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem'}}>Frequently Asked Questions</h2>
            <div className="faq-item">
              <h3>Is this budget guide free?</h3>
              <p>Yes, all guides on BudgetLoom are free to read. Printable downloads are also free — just enter your email to get the PDF.</p>
            </div>
            <div className="faq-item">
              <h3>Do I need any special software to use the printables?</h3>
              <p>No. All printables are PDF files. Download, open with any PDF reader, and print at home or at a local print shop.</p>
            </div>
            <div className="faq-item">
              <h3>Will this work if I have a low income?</h3>
              <p>Yes. BudgetLoom guides are designed for real people, including those on tight budgets. The tips work regardless of income level.</p>
            </div>
          </div>

          <AuthorBox />

          {/* Email CTA */}
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

          {/* Related */}
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
                      <div className="card-meta">
                        <span>{rp.readTime} read</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </article>
      </main>
      <Footer />
    </>
  )
}