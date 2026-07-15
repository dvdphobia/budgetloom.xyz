import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Public endpoint — returns only site-wide ad codes (no auth needed)
export async function GET() {
  try {
    // footer_banner = popunder, header_banner = social bar
    const result = await query(
      `SELECT placement, ad_code FROM ad_placements WHERE enabled = true AND placement IN ('footer_banner', 'header_banner')`
    )
    
    let popunder = null
    let socialbar = null
    
    for (const row of result.rows as any[]) {
      if (row.placement === 'footer_banner') popunder = row.ad_code
      if (row.placement === 'header_banner') socialbar = row.ad_code
    }

    return NextResponse.json({ popunder, socialbar })
  } catch {
    return NextResponse.json({ popunder: null, socialbar: null })
  }
}