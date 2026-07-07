import Header from '../../components/Header'
import Footer from '../../components/Footer'
import EmailForm from '../../components/EmailForm'
import PinTemplate from '../../components/PinTemplate'
import AmazonLink, { AffiliateDisclaimer } from '../../components/AmazonLink'
import AdBanner from '../../components/AdBanner'
import { posts, getPostBySlug } from '@/lib/posts'
import { affiliateProducts } from '@/lib/config'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  return { title: post ? post.title : 'Not Found', description: post?.description }
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) return notFound()

  return (
    <>
      <Header />
      <main className="container section">
        <span className="tag">{post.category}</span>
        <h1>{post.title}</h1>
        <div className="post-meta">{post.date} · {post.readTime} read</div>

        <AffiliateDisclaimer />
        <AdBanner slot="adsterra" />

        <div style={{lineHeight:1.7, fontSize:'1.05rem'}}>
          {post.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} style={{marginTop:'2rem'}}>{line.replace('## ', '')}</h2>
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

        <div className="lead-box">
          <h2>Get the matching printable</h2>
          <p>This post has a free printable that goes with it. Join the library and download it instantly.</p>
          <EmailForm cta="Download the free printable" tag="matching printable" />
        </div>

        <PinTemplate title={post.title} />
      </main>
      <Footer />
    </>
  )
}
