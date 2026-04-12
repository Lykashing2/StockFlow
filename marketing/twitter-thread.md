# Twitter/X Thread — Build in Public

## Tweet 1 (Hook)

I'm a student from Cambodia and I just built a full inventory management SaaS from scratch.

It's free, it's live, and it actually works.

Here's what I built and what I learned (thread):

## Tweet 2

StockFlow lets small businesses track their inventory online instead of using paper or spreadsheets.

Features:
- Product management with barcodes
- Low stock alerts
- Team collaboration
- CSV import/export
- Reports with charts
- Works on mobile (PWA)

[screenshot of dashboard]

## Tweet 3

The tech stack:

- Next.js 14 (App Router)
- Supabase (auth, database, storage)
- TypeScript
- Tailwind CSS
- Recharts for charts
- Deployed on Vercel

Total cost to run: $0/month on free tiers.

## Tweet 4

Hardest bugs I hit:

1. Supabase RLS circular policy — a policy on workspace_members that referenced itself = infinite recursion

2. `.single()` returning errors on 0 rows — caused my app to create 12 duplicate workspaces

3. Email confirmation rate limits — had to bypass with admin API

## Tweet 5

Things that actually went smooth:

- Tailwind dark mode (just add `darkMode: 'class'`)
- Supabase Storage for product images
- CSV parsing (wrote my own in ~40 lines)
- Recharts for dashboard charts
- Vercel deployment (push to GitHub = deployed)

## Tweet 6

What's next:

- Setting up payments with LemonSqueezy (when I turn 18)
- Email notifications for low stock
- Multi-currency support
- More chart types in reports

If you run a small business or know someone who does, try it free:

https://stock-flow-2fqn.vercel.app

## Tweet 7

If you're a student wanting to build a SaaS:

1. Pick a real problem (not a todo app)
2. Use Supabase — it's free and handles auth, DB, and storage
3. Ship fast, fix later
4. Post about it — people want to help

Your age is not a disadvantage. It's your superpower.

---

## Standalone Tweets (post these separately over time)

**Tweet A:**
Built a product image upload feature for my inventory SaaS today.

Supabase Storage + Next.js = surprisingly easy.

The hardest part was getting the file input to look good with Tailwind.

[screenshot of product modal with image]

**Tweet B:**
Added a CSV import feature to StockFlow.

Users can now upload their entire product catalog from a spreadsheet in one click.

The CSV parser is 40 lines of TypeScript. No libraries needed.

[screenshot of CSV import modal]

**Tweet C:**
My inventory SaaS now has a full reports page:

- Inventory value (cost vs retail)
- Weekly stock movement charts
- Category breakdown pie chart
- Top movers table
- One-click CSV export

All built with Recharts + Supabase.

[screenshot of reports page]
