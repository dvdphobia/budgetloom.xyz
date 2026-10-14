import type { MetadataRoute } from 'next'
import { getVisiblePosts, TOPIC_CLUSTERS } from '@/lib/content'
import { printables } from '@/lib/printables'
import { TOOL_CATALOG } from '@/lib/calculators'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getVisiblePosts()
  const base = 'https://budgetloom.xyz'

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${base}/blog`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${base}/topics`, priority: 0.85, changeFrequency: 'weekly' },
    { url: `${base}/tools`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${base}/printables`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${base}/free-budget-template`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${base}/monthly-budget-worksheet`, priority: 0.85, changeFrequency: 'monthly' },
    { url: `${base}/budget-calculator`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${base}/free-budget-spreadsheet`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${base}/about`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${base}/editorial-policy`, priority: 0.4, changeFrequency: 'yearly' },
    { url: `${base}/privacy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${base}/terms`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${base}/contact`, priority: 0.3, changeFrequency: 'yearly' },
  ]

  const topicPages: MetadataRoute.Sitemap = TOPIC_CLUSTERS.map((c) => ({
    url: `${base}/topics/${c.slug}`,
    priority: 0.8,
    changeFrequency: 'weekly',
  }))

  const toolPages: MetadataRoute.Sitemap = TOOL_CATALOG.filter((t) => t.href.startsWith('/tools/')).map((t) => ({
    url: `${base}${t.href}`,
    priority: 0.85,
    changeFrequency: 'monthly',
  }))

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    priority: 0.75,
    changeFrequency: 'monthly',
    lastModified: new Date(post.updatedAt || post.date),
  }))

  const printablePages: MetadataRoute.Sitemap = printables.map((p) => ({
    url: `${base}/printables/${p.slug}`,
    priority: 0.75,
    changeFrequency: 'monthly',
  }))

  return [...staticPages, ...topicPages, ...toolPages, ...blogPages, ...printablePages]
}
