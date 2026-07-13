import type { Metadata } from 'next'
import Header from './components/Header'
import Footer from './components/Footer'

export const metadata: Metadata = {
  title: 'BudgetLoom — Free Budget Printables & Money-Saving Guides',
  description: 'Free budget printables, savings challenges, meal planners, and practical money guides. Save more, stress less, start today.',
  openGraph: {
    title: 'BudgetLoom — Free Budget Printables & Money-Saving Guides',
    description: 'Free budget printables, savings challenges, and practical money guides.',
    url: 'https://budgetloom.xyz',
    siteName: 'BudgetLoom',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="p:domain_verify" content="REPLACE_WITH_PINTEREST_TAG" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  )
}