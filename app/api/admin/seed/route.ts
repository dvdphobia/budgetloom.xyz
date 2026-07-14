import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { verifyToken } from '@/lib/auth'
import { posts as staticPosts } from '@/lib/posts'
import { printables as staticPrintables } from '@/lib/printables'

export async function POST(request: NextRequest) {
  if (!await verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    let postsCount = 0
    let printablesCount = 0

    // Seed posts
    for (const post of staticPosts) {
      const existing = await sql`SELECT id FROM posts WHERE slug = ${post.slug};`
      if (existing.rows.length === 0) {
        await sql`
          INSERT INTO posts (slug, title, description, date, category, read_time, content, published)
          VALUES (${post.slug}, ${post.title}, ${post.description}, ${post.date}, ${post.category}, ${post.readTime}, ${post.content}, true);
        `
        postsCount++
      }
    }

    // Seed printables
    for (const p of staticPrintables) {
      const existing = await sql`SELECT id FROM printables WHERE slug = ${p.slug};`
      if (existing.rows.length === 0) {
        await sql`
          INSERT INTO printables (slug, title, description, price, pages, includes, file_url)
          VALUES (${p.slug}, ${p.title}, ${p.description}, ${p.price}, ${p.pages}, ${JSON.stringify(p.includes)}, ${'/printables/' + p.slug + '.pdf'});
        `
        printablesCount++
      }
    }

    return NextResponse.json({ success: true, postsSeeded: postsCount, printablesSeeded: printablesCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}