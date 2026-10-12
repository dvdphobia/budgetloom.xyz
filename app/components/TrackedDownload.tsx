'use client'
import { trackEvent } from '@/lib/analytics'
export default function TrackedDownload({ slug }: { slug: string }) {
  return <a href={'/printables/' + slug + '.pdf'} className="btn btn-primary btn-lg" download
    onClick={() => trackEvent('printable_download_started', { resource_slug: slug })}>
    Download PDF
  </a>
}
