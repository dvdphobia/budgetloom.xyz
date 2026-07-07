export interface Printable {
  slug: string
  title: string
  description: string
  price: string
  pages: number
  includes: string[]
}

export const printables: Printable[] = [
  {
    slug: 'budget-starter-bundle',
    title: 'Budget Starter Bundle',
    description: 'Everything you need to start budgeting: monthly budget, expense tracker, savings tracker, and debt payoff sheet.',
    price: '$7',
    pages: 12,
    includes: ['Monthly Budget Worksheet', 'Expense Tracker', 'Savings Tracker', 'Debt Payoff Chart', 'Cover + Instructions']
  },
  {
    slug: '30-day-savings-challenge',
    title: '30-Day Savings Challenge Pack',
    description: 'Three challenge variations: save $100, $300, or $500 in 30 days with daily checkboxes.',
    price: '$5',
    pages: 6,
    includes: ['$100 Challenge', '$300 Challenge', '$500 Challenge', 'Reverse Challenge', 'Blank Template']
  },
  {
    slug: 'meal-planner-budget-kit',
    title: 'Meal Planner Budget Kit',
    description: 'Weekly meal planner, grocery list, pantry inventory, and recipe cost sheet.',
    price: '$6',
    pages: 8,
    includes: ['Weekly Meal Planner', 'Grocery List', 'Pantry Inventory', 'Recipe Cost Calculator', 'Freezer Inventory']
  },
  {
    slug: 'debt-payoff-planner',
    title: 'Debt Payoff Planner',
    description: 'Debt snowball and avalanche trackers plus payoff milestone charts.',
    price: '$5',
    pages: 10,
    includes: ['Debt Inventory', 'Snowball Tracker', 'Avalanche Tracker', 'Milestone Charts', 'Monthly Check-in']
  }
]

export function getPrintableBySlug(slug: string): Printable | undefined {
  return printables.find(p => p.slug === slug)
}
