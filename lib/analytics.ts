// Analytics intentionally excludes email, financial amounts and other sensitive values.
export function trackEvent(name: 'printable_download_started' | 'newsletter_signup' |
  'budget_saved_locally' | 'budget_exported' | 'savings_schedule_exported' |
  'challenge_schedule_exported', details?: Record<string, string>) {
  if (typeof window === 'undefined') return
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag
  if (typeof gtag === 'function') gtag('event', name, details ?? {})
}
