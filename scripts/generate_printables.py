#!/usr/bin/env python3
"""
Generate simple printable PDFs for BudgetLoom.
Uses only Python stdlib + reportlab (install with pip install reportlab).
Output: public/printables/*.pdf
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

OUT = "../../public/printables"
os.makedirs(OUT, exist_ok=True)


def draw_header(c, title, subtitle=""):
    c.setFont("Helvetica-Bold", 22)
    c.drawString(1*inch, 10*inch, title)
    if subtitle:
        c.setFont("Helvetica", 12)
        c.setFillColorRGB(0.3, 0.3, 0.3)
        c.drawString(1*inch, 9.6*inch, subtitle)
        c.setFillColorRGB(0, 0, 0)


def make_budget_starter_bundle():
    path = os.path.join(OUT, "budget-starter-bundle.pdf")
    c = canvas.Canvas(path, pagesize=letter)
    draw_header(c, "Monthly Budget Worksheet", "BudgetLoom Budget Starter Bundle")
    c.setFont("Helvetica-Bold", 14)
    c.drawString(1*inch, 8.8*inch, "Income")
    rows = ["Paycheck 1", "Paycheck 2", "Side income", "Other", "TOTAL"]
    y = 8.4
    for r in rows:
        c.setFont("Helvetica", 12)
        c.drawString(1*inch, y*inch, r)
        c.line(3.5*inch, y*inch, 7.5*inch, y*inch)
        y -= 0.5

    c.setFont("Helvetica-Bold", 14)
    c.drawString(1*inch, 5.5*inch, "Expenses")
    expenses = ["Rent/Mortgage", "Utilities", "Groceries", "Transport", "Insurance", "Debt", "Subscriptions", "Other", "TOTAL"]
    y = 5.1
    for e in expenses:
        c.setFont("Helvetica", 12)
        c.drawString(1*inch, y*inch, e)
        c.line(3.5*inch, y*inch, 7.5*inch, y*inch)
        y -= 0.5
    c.showPage()

    draw_header(c, "Savings Tracker", "BudgetLoom Budget Starter Bundle")
    goals = ["Emergency fund", "Vacation", "Big purchase", "Other"]
    y = 8.5
    for g in goals:
        c.setFont("Helvetica", 12)
        c.drawString(1*inch, y*inch, g)
        c.line(3*inch, y*inch, 4.5*inch, y*inch)
        c.drawString(5*inch, y*inch, "Goal: $")
        c.line(6*inch, y*inch, 7.5*inch, y*inch)
        y -= 0.8
    c.showPage()

    draw_header(c, "Debt Payoff Chart", "BudgetLoom Budget Starter Bundle")
    c.setFont("Helvetica", 12)
    c.drawString(1*inch, 8.5*inch, "Debt name: ________________________ Balance: $__________")
    c.drawString(1*inch, 8*inch, "Minimum payment: $__________ Target payoff date: __________")
    for i in range(25):
        c.rect(1*inch + (i % 5)*1.3*inch, 5.5*inch - (i//5)*0.7*inch, 0.5*inch, 0.5*inch)
    c.setFont("Helvetica", 10)
    c.drawString(1*inch, 2*inch, "Color one square for each payment made.")
    c.save()
    print(f"Created {path}")


def make_savings_challenge():
    path = os.path.join(OUT, "30-day-savings-challenge.pdf")
    c = canvas.Canvas(path, pagesize=letter)
    draw_header(c, "30-Day $500 Savings Challenge", "BudgetLoom")
    amounts = [5,10,15,20,10,5,25,15,10,20,30,10,5,15,25,10,5,20,15,10,25,10,15,20,5,30,15,10,20,50]
    y = 9.5
    for i, a in enumerate(amounts, 1):
        c.setFont("Helvetica", 11)
        c.drawString(1*inch, y*inch, f"Day {i:02d}: Save ${a}")
        c.rect(4.5*inch, y*inch-4, 0.3*inch, 0.3*inch)
        y -= 0.3
    c.save()
    print(f"Created {path}")


def make_meal_planner():
    path = os.path.join(OUT, "meal-planner-budget-kit.pdf")
    c = canvas.Canvas(path, pagesize=letter)
    draw_header(c, "Weekly Meal Planner", "BudgetLoom Meal Planner Kit")
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    y = 8.7
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, y*inch, "Day")
    c.drawString(2*inch, y*inch, "Breakfast")
    c.drawString(3.5*inch, y*inch, "Lunch")
    c.drawString(5*inch, y*inch, "Dinner")
    c.drawString(6.5*inch, y*inch, "Cost")
    y -= 0.4
    for d in days:
        c.setFont("Helvetica", 12)
        c.drawString(1*inch, y*inch, d)
        for x in [2, 3.5, 5, 6.5]:
            c.line(x*inch, y*inch, (x+1.2)*inch, y*inch)
        y -= 0.5
    c.showPage()

    draw_header(c, "Grocery List", "BudgetLoom Meal Planner Kit")
    categories = ["Produce", "Protein", "Pantry", "Dairy", "Frozen", "Other"]
    x = 1
    for cat in categories:
        c.setFont("Helvetica-Bold", 13)
        c.drawString(x*inch, 9*inch, cat)
        for i in range(10):
            c.rect(x*inch, (8.5 - i*0.4)*inch, 0.2*inch, 0.2*inch)
            c.line((x+0.3)*inch, (8.5 - i*0.4)*inch, (x+2.2)*inch, (8.5 - i*0.4)*inch)
        x += 2.2
        if x > 6:
            x = 1
    c.save()
    print(f"Created {path}")


def make_debt_payoff():
    path = os.path.join(OUT, "debt-payoff-planner.pdf")
    c = canvas.Canvas(path, pagesize=letter)
    draw_header(c, "Debt Inventory", "BudgetLoom Debt Payoff Planner")
    headers = ["Debt", "Balance", "Min Payment", "Interest", "Priority"]
    x = [1, 3, 4.5, 6, 7.2]
    y = 9
    for h, px in zip(headers, x):
        c.setFont("Helvetica-Bold", 11)
        c.drawString(px*inch, y*inch, h)
    for i in range(10):
        y -= 0.4
        for px in x:
            c.line(px*inch, y*inch, (px+1.6)*inch, y*inch)
    c.save()
    print(f"Created {path}")


if __name__ == "__main__":
    make_budget_starter_bundle()
    make_savings_challenge()
    make_meal_planner()
    make_debt_payoff()
    print("Done. PDFs are ready in public/printables/")
