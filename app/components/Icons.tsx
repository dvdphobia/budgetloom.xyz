// Centralized SVG icons — no emoji anywhere on the site

interface IconProps {
  className?: string
  style?: React.CSSProperties
}

export const Icon = {
  check: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10l4 4 8-8" />
    </svg>
  ),
  arrow: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12M10 4l6 6-6 6" />
    </svg>
  ),
  download: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3v10m0 0l-4-4m4 4l4-4M3 17h14" />
    </svg>
  ),
  print: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h8v4H6zM6 13h8v4H6zM4 7v6h12V7" />
    </svg>
  ),
  sparkles: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" />
    </svg>
  ),
  bookmark: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h10v14l-5-3.5L5 17V3z" />
    </svg>
  ),
  clock: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7" /><path d="M10 6v4l3 2" />
    </svg>
  ),
  package: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2L3 6v8l7 4 7-4V6l-7-4zM3 6l7 4 7-4M10 10v8" />
    </svg>
  ),
  user: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="7" r="3" /><path d="M4 17c0-3 3-5 6-5s6 2 6 5" />
    </svg>
  ),
  pin: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 1C6.1 1 3 4.1 3 8c0 5.2 7 11 7 11s7-5.8 7-11c0-3.9-3.1-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
    </svg>
  ),
  facebook: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="currentColor">
      <path d="M11 18v-7h2.4l.4-2.8H11V6.4c0-.8.2-1.4 1.4-1.4h1.5V2.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2H6v2.8h2v7h3z" />
    </svg>
  ),
  twitter: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="currentColor">
      <path d="M18 5.5c-.6.3-1.2.4-1.9.5.7-.4 1.2-1 1.5-1.8-.7.4-1.4.7-2.1.8-.6-.7-1.5-1.1-2.5-1.1-1.9 0-3.5 1.6-3.5 3.5 0 .3 0 .5.1.8-2.9-.2-5.5-1.6-7.2-3.7-.3.5-.5 1.1-.5 1.7 0 1.2.6 2.3 1.6 2.9-.6 0-1.2-.2-1.6-.4 0 1.7 1.2 3.1 2.8 3.5-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.4 1.7 2.4 3.2 2.4-1.2.9-2.6 1.5-4.2 1.5H2c1.5.9 3.2 1.5 5.1 1.5 6.1 0 9.5-5.1 9.5-9.5v-.4c.7-.4 1.2-1 1.7-1.7z" />
    </svg>
  ),
  link: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 12l4-4M7 8L5 10a3 3 0 004 4l2-2M13 12l2-2a3 3 0 00-4-4l-2 2" />
    </svg>
  ),
  mail: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="16" height="12" rx="2" /><path d="M2 6l8 6 8-6" />
    </svg>
  ),
  savings: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 9a6 6 0 00-6-6H9a6 6 0 00-6 6c0 2.5 1.5 4.5 3.5 5.5V18h9v-3.5c2-1 3.5-3 3.5-5.5z" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <path d="M12 3v3" />
    </svg>
  ),
  chart: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18M7 14l4-4 3 3 5-6" />
    </svg>
  ),
  food: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3v8a3 3 0 003 3v7M8 3v8M8 3c2 0 3 2 3 5s-1 5-3 5M16 3c-2 0-3 3-3 7s1 7 3 7 3-3 3-7-1-7-3-7z" />
    </svg>
  ),
  card: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
    </svg>
  ),
  sun: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  page: ({ className = '', style }: IconProps) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h8l4 4v16H6V2z" /><path d="M14 2v4h4M9 12h6M9 16h6" />
    </svg>
  ),
}

// Logo mark — stylized loom/weaving pattern
export const LogoMark = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="7" fill="#059669" />
    <path d="M7 8h14M7 12h14M7 16h14M7 20h14" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M10 7v14M14 7v14M18 7v14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="14" cy="14" r="2" fill="#fef3c7" />
  </svg>
)

// Card cover patterns — sophisticated, unique per category
export function CardCover({ category, variant = 'green' }: { category?: string, variant?: string }) {
  const colors: Record<string, [string, string]> = {
    savings: ['#059669', '#d1fae5'],
    food: ['#d97706', '#fef3c7'],
    budgeting: ['#2563eb', '#dbeafe'],
    debt: ['#dc2626', '#fee2e2'],
    lifestyle: ['#7c3aed', '#ede9fe'],
    printable: ['#059669', '#ecfdf5'],
  }

  const [c1, c2] = colors[category?.toLowerCase() || variant] || colors.printable

  return (
    <svg viewBox="0 0 300 140" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={`grad-${category || variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c2} />
          <stop offset="100%" stopColor={c1} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="300" height="140" fill={`url(#grad-${category || variant})`} />
      {/* Abstract lines — loom motif */}
      <g opacity="0.12" stroke={c1} strokeWidth="1" fill="none">
        <path d="M0 30 Q75 20 150 35 T300 30" />
        <path d="M0 50 Q75 40 150 55 T300 50" />
        <path d="M0 70 Q75 60 150 75 T300 70" />
        <path d="M0 90 Q75 80 150 95 T300 90" />
        <path d="M0 110 Q75 100 150 115 T300 110" />
      </g>
      <g opacity="0.18" stroke={c1} strokeWidth="1.5" fill="none" strokeLinecap="round">
        <line x1="60" y1="20" x2="60" y2="120" />
        <line x1="120" y1="15" x2="120" y2="125" />
        <line x1="180" y1="20" x2="180" y2="120" />
        <line x1="240" y1="25" x2="240" y2="115" />
      </g>
      <circle cx="150" cy="70" r="3" fill={c1} opacity="0.5" />
    </svg>
  )
}

// Printable preview — multi-page document mockup
export function PrintablePreview({ pages }: { pages: number }) {
  return (
    <svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%', maxHeight: '300px' }}>
      <rect width="300" height="300" fill="#fdfcf7" />
      {/* Back pages */}
      <rect x="200" y="40" width="70" height="220" rx="4" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1" />
      <rect x="195" y="35" width="70" height="220" rx="4" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" />
      {/* Front page */}
      <rect x="35" y="30" width="120" height="240" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.06))" />
      {/* Page content lines */}
      <g fill="none" stroke="#e5e7eb" strokeWidth="1" strokeLinecap="round">
        <line x1="50" y1="55" x2="120" y2="55" stroke="#059669" strokeWidth="2" />
        <line x1="50" y1="75" x2="140" y2="75" />
        <line x1="50" y1="85" x2="130" y2="85" />
        <line x1="50" y1="105" x2="140" y2="105" />
        <line x1="50" y1="115" x2="100" y2="115" />
        {/* Mini chart */}
        <rect x="50" y="135" width="90" height="50" rx="4" stroke="#d1fae5" fill="#ecfdf5" />
        <line x1="60" y1="170" x2="60" y2="150" stroke="#059669" strokeWidth="2" />
        <line x1="75" y1="170" x2="75" y2="155" stroke="#059669" strokeWidth="2" />
        <line x1="90" y1="170" x2="90" y2="145" stroke="#059669" strokeWidth="2" />
        <line x1="105" y1="170" x2="105" y2="160" stroke="#059669" strokeWidth="2" />
        <line x1="120" y1="170" x2="120" y2="140" stroke="#059669" strokeWidth="2" />
        {/* Bottom lines */}
        <line x1="50" y1="205" x2="140" y2="205" />
        <line x1="50" y1="215" x2="120" y2="215" />
        <line x1="50" y1="225" x2="135" y2="225" />
        <line x1="50" y1="240" x2="90" y2="240" />
      </g>
      <text x="50" y="265" fontSize="9" fill="#9ca3af" fontFamily="Inter, sans-serif" fontWeight="500">
        {pages} pages · PDF
      </text>
    </svg>
  )
}