import type { MetadataRoute } from 'next'
import { posts } from '@/lib/posts'
import { printables } from '@/lib/printables'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://budgetloom.xyz'
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${base}/blog`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${base}/printables`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${base}/free-budget-template`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${base}/monthly-budget-worksheet`, priority: 0.85, changeFrequency: 'monthly' },
    { url: `${base}/budget-calculator`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${base}/free-budget-spreadsheet`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${base}/about`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${base}/privacy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${base}/terms`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${base}/contact`, priority: 0.3, changeFrequency: 'yearly' },
  ]

  const blogPages: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${base}/blog/${post.slug}`,
    priority: 0.7,
    changeFrequency: 'monthly',
    lastModified: new Date(post.date),
  }))

  const printablePages: MetadataRoute.Sitemap = printables.map(p => ({
    url: `${base}/printables/${p.slug}`,
    priority: 0.7,
    changeFrequency: 'monthly',
  }))

  return [...staticPages, ...blogPages, ...printablePages]
}
