# BudgetLoom scripts

Run `npm run generate:printables` from the project root to regenerate the PDF assets with Node.js (no Python dependencies). The generator runs automatically before `npm run dev` and `npm run build`.

`scripts/generate_printables.py` is a legacy ReportLab alternative. The Node generator is the production source of truth for printable downloads.

Always check page counts, savings challenge totals, PDF rendering, and download URLs before publishing.
