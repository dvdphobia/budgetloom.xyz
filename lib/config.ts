export const site = {
  name: 'BudgetLoom',
  url: 'https://budgetloom.xyz',
  description:
    'Free budget printables, interactive money calculators, savings challenges, and practical personal finance guides for everyday life.',
  email: 'hello@budgetloom.xyz',
  publisher: 'BudgetLoom Editorial Team',
  foundedYear: 2026,
}

export const monetization = {
  amazonTrackingId: 'budgetloom20-20',
}

export interface AffiliateProduct {
  name: string
  asin: string
  slug: string
  category: 'Budgeting' | 'Savings' | 'Food' | 'Debt' | 'Lifestyle'
  description: string
}

// Verified real products only — no placeholder ASINs or fabricated claims.
export const affiliateProducts: Record<string, AffiliateProduct> = {
  budgetPlannerNotebook: {
    name: 'Clever Fox Budget Planner',
    asin: 'B07VMDWPQR',
    slug: 'budget-planner-notebook',
    category: 'Budgeting',
    description:
      'Undated hardcover monthly bill organizer and expense tracker notebook for people who prefer keeping paper records.',
  },
  cashEnvelopes: {
    name: 'A6 Cash Envelope Budget Binder System',
    asin: 'B0833G372F',
    slug: 'cash-envelope-system',
    category: 'Savings',
    description:
      'Zippered budget binder with reusable cash envelopes and expense sheets for physical category budgeting.',
  },
  mealPrepContainers: {
    name: 'Bentgo Prep 2-Compartment Meal Containers',
    asin: 'B08DKMQFNG',
    slug: 'meal-prep-containers',
    category: 'Food',
    description:
      'Reusable portion-sized containers designed for batch cooking, freezer storage, and packable work lunches.',
  },
}
