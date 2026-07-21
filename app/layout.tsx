import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import SiteWideAds from './components/SiteWideAds';
import { site } from '@/lib/config'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const SITE_URL = site.url

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'BudgetLoom — Free Budget Printables & Money-Saving Guides',
    template: '%s — BudgetLoom',
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.publisher, url: `${SITE_URL}/about` }],
  creator: site.publisher,
  publisher: site.name,
  category: 'personal finance',
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }], shortcut: '/favicon.svg' },
  openGraph: {
    title: 'BudgetLoom — Free Budget Printables & Money-Saving Guides',
    description: 'Free budget printables, savings challenges, and practical money guides.',
    url: SITE_URL,
    siteName: 'BudgetLoom',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'BudgetLoom free budget printables and money guides' }],
  },
  twitter: { card: 'summary_large_image', images: ['/opengraph-image'] },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BudgetLoom',
  url: SITE_URL,
  description: 'Free budget printables and money-saving guides.',
  email: site.email,
  logo: `${SITE_URL}/logo.png`,
  sameAs: ['https://pinterest.com/budgetloom'],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: site.name,
  url: SITE_URL,
  description: site.description,
  publisher: { '@type': 'Organization', name: site.name, url: SITE_URL },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans bg-background", geist.variable)}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-CRZCXM56DQ" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CRZCXM56DQ');
        `}</Script>
        <SiteWideAds />
        {children}
      </body>
    </html>
  )
}
