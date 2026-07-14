import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

const SITE_URL = 'https://budgetloom.xyz'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'BudgetLoom — Free Budget Printables & Money-Saving Guides',
    template: '%s — BudgetLoom',
  },
  description: 'Free budget printables, savings challenges, and practical money guides. Save more, stress less, start today.',
  openGraph: {
    title: 'BudgetLoom — Free Budget Printables & Money-Saving Guides',
    description: 'Free budget printables, savings challenges, and practical money guides.',
    url: SITE_URL,
    siteName: 'BudgetLoom',
    type: 'website',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BudgetLoom',
  url: SITE_URL,
  description: 'Free budget printables and money-saving guides.',
  email: 'hello@budgetloom.xyz',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="p:domain_verify" content="REPLACE_WITH_PINTEREST_TAG" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
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
        {children}
      </body>
    </html>
  )
}