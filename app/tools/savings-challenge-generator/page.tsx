import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import SavingsChallengeBuilder from '@/app/components/SavingsChallengeBuilder'

export const metadata: Metadata = {
 title:'Free 30-Day Savings Challenge Generator',
 description:'Create a custom 30-day savings challenge with exact deposits, a printable schedule and a downloadable CSV.',
 alternates:{canonical:'https://budgetloom.xyz/tools/savings-challenge-generator'}
}
export default function Page() {
 return <><Header/><main id="main"><section className="tool-hero compact"><div className="container narrow">
  <Breadcrumbs items={[{label:'Home',href:'/'},{label:'Savings challenge generator'}]}/>
  <span className="eyebrow">Free interactive tool</span><h1>30-day savings challenge generator</h1>
  <p>Choose a goal and make thirty daily deposits that total the exact amount you pick.</p>
 </div></section><section className="section"><div className="container narrow">
  <SavingsChallengeBuilder/>
  <div className="article-body tool-copy">
   <h2>How are the amounts calculated?</h2>
   <p>The tool distributes the goal across 30 varied daily contributions, then assigns any rounding difference so the total matches exactly. The schedule is a planning aid rather than financial advice.</p>
   <h2>What if I miss a day?</h2>
   <p>Reschedule deposits rather than compromising rent, groceries, or other essentials. A challenge should adjust to your cash flow instead of forcing expensive borrowing.</p>
   <h2>Want a ready-made worksheet?</h2>
   <p><Link href="/printables/30-day-savings-challenge">Download our six-page savings challenge pack</Link> with preset targets and tracking worksheets.</p>
  </div>
 </div></section></main><Footer/></>
}
