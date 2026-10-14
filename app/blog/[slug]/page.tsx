import Header from '../../components/Header'
import Footer from '../../components/Footer'
import EmailForm from '../../components/EmailForm'
import { AffiliateDisclaimer, AmazonProductCard } from '../../components/AmazonLink'
import Breadcrumbs from '../../components/Breadcrumbs'
import ShareButtons from '../../components/ShareButtons'
import AuthorBox from '../../components/AuthorBox'
import AdSlot from '../../components/AdSlot'
import { Icon } from '../../components/Icons'
import { posts as staticPosts } from '@/lib/posts'
import { getVisiblePosts, getVisiblePost, resolveSlugRedirect, getClusterForPost } from '@/lib/content'
import { getPrintableBySlug } from '@/lib/printables'
import { affiliateProducts, monetization, site } from '@/lib/config'
import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

type Params = { slug: string }

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return staticPosts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getVisiblePost(slug)
  if (!post) return { title: 'Not Found' }
  return {
    title: post.seoTitle || post.title,
    description: post.description,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.description,
      type: 'article',
      url: `${site.url}/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updatedAt ?? post.date,
      authors: [post.author || site.publisher],
      section: post.category,
      images: [{ url: `/blog/${post.slug}/opengraph-image`, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || post.title,
      description: post.description,
      images: [`/blog/${post.slug}/opengraph-image`],
    },
    alternates: { canonical: post.canonicalUrl || `${site.url}/blog/${post.slug}` },
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function renderInlineFormatting(text: string, keyPrefix: string): React.ReactNode {
  // Parse inline links [label](url), bold **text**, and inline code `code`
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g
  const parts = text.split(tokenRegex)
  return parts.map((part, idx) => {
    if (!part) return null
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      const [, label, href] = linkMatch
      if (href.startsWith('/')) {
        return (
          <Link key={`${keyPrefix}-l-${idx}`} href={href}>
            {label}
          </Link>
        )
      }
      return (
        <a key={`${keyPrefix}-a-${idx}`} href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      )
    }
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/)
    if (boldMatch) {
      return <strong key={`${keyPrefix}-b-${idx}`}>{boldMatch[1]}</strong>
    }
    const codeMatch = part.match(/^`([^`]+)`$/)
    if (codeMatch) {
      return (
        <code
          key={`${keyPrefix}-c-${idx}`}
          style={{ background: '#f3f4f6', padding: '0.12rem 0.35rem', borderRadius: 4, fontSize: '0.9em' }}
        >
          {codeMatch[1]}
        </code>
      )
    }
    return part
  })
}

function parseContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let orderedItems: string[] = []
  let tableRows: string[][] = []
  let blockKey = 0

  const flushListsAndTables = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${blockKey++}`}>
          {listItems.map((item, i) => (
            <li key={i}>{renderInlineFormatting(item, `ul-${blockKey}-${i}`)}</li>
          ))}
        </ul>
      )
      listItems = []
    }
    if (orderedItems.length > 0) {
      elements.push(
        <ol key={`ol-${blockKey++}`}>
          {orderedItems.map((item, i) => (
            <li key={i}>{renderInlineFormatting(item, `ol-${blockKey}-${i}`)}</li>
          ))}
        </ol>
      )
      orderedItems = []
    }
    if (tableRows.length > 0) {
      const headerRow = tableRows[0]
      const bodyRows = tableRows.slice(1).filter((r) => !r.every((cell) => /^[-:\s]+$/.test(cell)))
      elements.push(
        <div className="budget-table-wrap" key={`tbl-${blockKey++}`}>
          <table className="budget-table">
            <thead>
              <tr>
                {headerRow.map((h, i) => (
                  <th key={i} scope="col">
                    {renderInlineFormatting(h, `th-${blockKey}-${i}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci}>{renderInlineFormatting(c, `td-${blockKey}-${ri}-${ci}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      tableRows = []
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    const h2 = trimmed.match(/^## (.+)/)
    const h3 = trimmed.match(/^### (.+)/)
    const bullet = trimmed.match(/^- (.+)/)
    const numbered = trimmed.match(/^(\d+)\.\s+(.+)/)
    const isTableRow = trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.split('|').length > 2

    if (isTableRow) {
      if (listItems.length || orderedItems.length) flushListsAndTables()
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim())
      tableRows.push(cells)
    } else if (h2) {
      flushListsAndTables()
      elements.push(
        <h2 key={`h2-${i}`} id={slugify(h2[1])}>
          {h2[1]}
        </h2>
      )
    } else if (h3) {
      flushListsAndTables()
      elements.push(
        <h3 key={`h3-${i}`} id={slugify(h3[1])}>
          {h3[1]}
        </h3>
      )
    } else if (bullet) {
      if (tableRows.length || orderedItems.length) flushListsAndTables()
      listItems.push(bullet[1])
    } else if (numbered) {
      if (tableRows.length || listItems.length) flushListsAndTables()
      orderedItems.push(numbered[2])
    } else if (!trimmed) {
      flushListsAndTables()
    } else {
      flushListsAndTables()
      elements.push(<p key={`p-${i}`}>{renderInlineFormatting(trimmed, `p-${i}`)}</p>)
    }
  })
  flushListsAndTables()
  return elements
}

function generateTOC(content: string) {
  const headings: { text: string; id: string }[] = []
  for (const line of content.split('\n')) {
    const h2 = line.trim().match(/^## (.+)/)
    if (h2) headings.push({ text: h2[1], id: slugify(h2[1]) })
  }
  return headings
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const post = await getVisiblePost(slug)
  if (!post) {
    const redirected = await resolveSlugRedirect(slug)
    if (redirected) {
      permanentRedirect(`/blog/${redirected}`)
    }
    return notFound()
  }

  const cluster = getClusterForPost(post)
  const allPosts = await getVisiblePosts()
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && (p.topicSlug === post.topicSlug || p.category === post.category))
    .slice(0, 3)
  const matchedPrintables = (post.relatedPrintables || cluster.recommendedPrintables)
    .map((s) => getPrintableBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
  const tocItems = generateTOC(post.content)
  const postUrl = `${site.url}/blog/${post.slug}`
  const isHomeOffice = post.slug === 'modern-home-office-setup-on-a-budget'

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updatedAt ?? post.date,
    mainEntityOfPage: postUrl,
    image: `${postUrl}/opengraph-image`,
    articleSection: post.topicCluster || post.category,
    author: { '@type': 'Organization', name: post.author || site.publisher, url: `${site.url}/about` },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      url: site.url,
      logo: { '@type': 'ImageObject', url: `${site.url}/logo.png` },
    },
  }

  const affiliateProduct = isHomeOffice
    ? {
        name: 'Budget-Friendly Standing Desks',
        href: `https://www.amazon.com/s?k=budget+standing+desk&tag=${monetization.amazonTrackingId}`,
        desc: 'Compare desk sizes, height ranges, weight capacities, and customer feedback before choosing a model for your space.',
      }
    : post.category === 'Food'
    ? { ...affiliateProducts.mealPrepContainers, desc: affiliateProducts.mealPrepContainers.description }
    : post.category === 'Savings'
    ? { ...affiliateProducts.cashEnvelopes, desc: affiliateProducts.cashEnvelopes.description }
    : { ...affiliateProducts.budgetPlannerNotebook, desc: affiliateProducts.budgetPlannerNotebook.description }

  const activeFaqs = post.faqs?.length ? post.faqs : cluster.faqs

  return (
    <>
      <Header />
      <main id="main" className="container section">
        <article style={{ maxWidth: '740px', margin: '0 auto' }}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Guides', href: '/blog' },
              { label: cluster.shortName, href: `/topics/${cluster.slug}` },
              { label: post.title },
            ]}
          />

          <div className="article-meta">
            <Link href={`/topics/${cluster.slug}`} className="cat">
              {post.topicCluster || post.category}
            </Link>
            <span className="dot">·</span>
            <span className="time">{post.readTime} read</span>
            <span className="dot">·</span>
            <time dateTime={post.date}>
              Published{' '}
              {new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
              }).format(new Date(`${post.date}T00:00:00Z`))}
            </time>
          </div>
          <h1 className="article-title">{post.title}</h1>
          <p className="article-sub">{post.description}</p>

          <ShareButtons title={post.title} url={postUrl} />
          <AffiliateDisclaimer />

          {tocItems.length > 2 && (
            <nav className="toc" aria-label="Table of contents">
              <div className="toc-label">In this guide</div>
              <ol>
                {tocItems.map((item, i) => (
                  <li key={i}>
                    <a href={`#${item.id}`}>{item.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="article-body" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.12rem' }}>
            {(() => {
              const blocks = parseContent(post.content)
              const firstBreak = Math.max(3, Math.floor(blocks.length * 0.28))
              const secondBreak = Math.max(firstBreak + 3, Math.floor(blocks.length * 0.66))
              if (blocks.length < 10) return blocks
              return (
                <>
                  {blocks.slice(0, firstBreak)}
                  <AdSlot placement="blog_post_top" />
                  {blocks.slice(firstBreak, secondBreak)}
                  <AdSlot placement="blog_post_middle" />
                  {blocks.slice(secondBreak)}
                </>
              )
            })()}
          </div>

          {/* Contextual Interactive Tools & Printables Box */}
          <aside className="resource-box" aria-label="Free calculators and printable worksheets">
            <span className="eyebrow">Put This Guide Into Practice</span>
            <h2>Free calculators & printable worksheets for {cluster.shortName.toLowerCase()}</h2>
            <p>Run your own numbers or print a clean worksheet—no email signup required.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem 1.25rem' }}>
              {(post.relatedTools || cluster.recommendedTools).map((toolHref) => (
                <Link key={toolHref} href={toolHref}>
                  Interactive Tool: {toolHref.replace('/tools/', '').replace('/', '').replace(/-/g, ' ')} →
                </Link>
              ))}
              {matchedPrintables.map((pr) => (
                <Link key={pr.slug} href={`/printables/${pr.slug}`}>
                  Free PDF: {pr.title} ({pr.pages} pages) →
                </Link>
              ))}
              <Link href={`/topics/${cluster.slug}`}>Explore {cluster.name} Hub →</Link>
            </div>
          </aside>

          {/* References & Editorial Sources */}
          {post.sources && post.sources.length > 0 && (
            <section
              aria-label="References and educational sources"
              style={{
                margin: '2rem 0',
                padding: '1.25rem',
                borderRadius: 'var(--brand-radius)',
                border: '1px solid var(--border-light)',
                background: 'var(--white)',
              }}
            >
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                References & Methodology Notes
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--gray)', marginBottom: '0.6rem' }}>
                Worked dollar examples in this article are illustrative planning scenarios. Verify interest rates, tax rules, and account terms with your provider.
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.84rem' }}>
                {post.sources.map((src) => (
                  <li key={src.url} style={{ marginBottom: '0.25rem' }}>
                    <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-dark)' }}>
                      {src.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Single clearly disclosed affiliate product card */}
          <div style={{ marginTop: '2rem' }}>
            <h3
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--gray)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
              }}
            >
              Optional Paper Tool (Affiliate Link)
            </h3>
            <AmazonProductCard
              asin={'asin' in affiliateProduct ? affiliateProduct.asin : undefined}
              href={'href' in affiliateProduct ? affiliateProduct.href : undefined}
              name={affiliateProduct.name}
              description={affiliateProduct.desc}
            />
          </div>

          {activeFaqs.length > 0 && (
            <div className="faq">
              <h2>Common questions</h2>
              {activeFaqs.map((faq) => (
                <div className="faq-item" key={faq.question}>
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          )}

          <AuthorBox />

          <div className="lead-box">
            <h2>Get our free printable budget library</h2>
            <p>Receive new printable worksheets and practical money guides as they are published.</p>
            <EmailForm cta="Join free library" tag={post.topicCluster || post.category} />
            <div className="lead-perks">
              <span className="lead-perk">
                <Icon.check className="" /> 20 free PDF workbooks
              </span>
              <span className="lead-perk">
                <Icon.check className="" /> Practical examples
              </span>
              <span className="lead-perk">
                <Icon.check className="" /> Unsubscribe anytime
              </span>
            </div>
          </div>

          {relatedPosts.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                More guides in {cluster.name}
              </h2>
              <div className="grid">
                {relatedPosts.map((rp) => (
                  <Link href={`/blog/${rp.slug}`} className="card" key={rp.slug}>
                    <div className="card-body">
                      <span className="card-badge">{rp.topicCluster || rp.category}</span>
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
