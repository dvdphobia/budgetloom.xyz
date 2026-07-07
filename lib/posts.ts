export interface Post {
  slug: string
  title: string
  description: string
  date: string
  category: string
  readTime: string
  content: string
}

export const posts: Post[] = [
  {
    slug: '30-day-money-saving-challenge',
    title: '30-Day Money Saving Challenge: Save $500 This Month',
    description: 'A simple printable challenge to save $500 in 30 days without feeling deprived.',
    date: '2026-07-07',
    category: 'Savings',
    readTime: '5 min',
    content: `## Why a 30-day challenge works
Small daily actions beat giant resolutions. This printable challenge gives you one tiny task each day so saving feels achievable.

## How to use the tracker
1. Print the tracker.
2. Cross off each day as you complete the task.
3. Put the saved cash in an envelope labeled "Challenge."

## Daily tasks preview
- Day 1: Skip one subscription trial.
- Day 2: Cook at home instead of delivery.
- Day 3: Sell one unused item.
- Day 7: No-spend day.
- Day 14: Meal plan for the week.
- Day 30: Review and celebrate.

## Download the free printable
Enter your email below and get the 30-day tracker plus a weekly budget planner sent to your inbox.`
  },
  {
    slug: 'budget-meal-plan-for-one',
    title: 'Budget Meal Plan for One: Eat for $40 a Week',
    description: 'A 7-day meal plan designed for one person on a tight grocery budget.',
    date: '2026-07-07',
    category: 'Food',
    readTime: '6 min',
    content: `## The $40 week plan
Eating cheap does not mean eating boring. This plan uses 10 ingredients, batch cooking, and zero waste.

## Shopping list
- Eggs, rice, oats, frozen vegetables, canned beans, pasta, tomato sauce, chicken thighs, onion, garlic.

## 7-day menu
- Breakfast: oatmeal or eggs.
- Lunch: rice + beans or leftover dinner.
- Dinner: pasta, stir-fry, or sheet-pan chicken + vegetables.

## Tips to stretch further
- Buy store brands.
- Cook double and freeze half.
- Use everything: vegetable scraps become broth.`
  },
  {
    slug: 'how-to-build-a-budget-when-broke',
    title: 'How to Build a Budget When You Feel Broke',
    description: 'A step-by-step guide for budgeting when money is tight.',
    date: '2026-07-07',
    category: 'Budgeting',
    readTime: '7 min',
    content: `## Stop guessing where your money goes
Most people who feel broke are not overspending on luxuries — they are leaking money on small things that add up.

## Step 1: Track one week
Write down every purchase for 7 days. No judgment.

## Step 2: Pick one bill to cut
Phone plan, subscription, or insurance. One call can save $20/month.

## Step 3: Use the 50/30/20 rule later
Right now, aim for 80% needs, 20% future you.

## Get the free starter budget printable
It includes an income tracker, expense tracker, and weekly check-in.`
  },
  {
    slug: 'no-spend-weekend-ideas',
    title: 'No-Spend Weekend Ideas That Are Actually Fun',
    description: 'Free activities to fill a weekend without spending a dollar.',
    date: '2026-07-07',
    category: 'Lifestyle',
    readTime: '4 min',
    content: `## Why try a no-spend weekend?
It resets your spending habits and shows you how much fun is free.

## Ideas
- Host a movie night with snacks you already have.
- Go hiking, walking, or biking.
- Declutter and sell items online.
- Try a new recipe with pantry ingredients.
- Game night or puzzle marathon.
- Visit free museums or library events.

## Make it a game
Set a rule: if you want to buy something, wait 48 hours. Most urges disappear.`
  }
]

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find(p => p.slug === slug)
}
