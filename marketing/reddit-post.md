# Reddit Post Templates

## r/SideProject

**Title:** I built a free inventory management SaaS — would love your feedback

**Body:**

Hey everyone! I'm a student developer from Cambodia and I just launched **StockFlow** — a free, open inventory management tool for small businesses.

**What it does:**
- Track products with SKUs, barcodes, and categories
- Real-time dashboard with stock charts and alerts
- Low stock alerts so you never run out
- Team collaboration with role-based access (owner, admin, member, viewer)
- CSV import/export for easy migration from spreadsheets
- Works on mobile as a PWA (install it like an app)
- Dark mode

**Tech stack:** Next.js 14, Supabase, TypeScript, Tailwind CSS, deployed on Vercel

**Live:** https://stock-flow-2fqn.vercel.app

It's completely free right now. I built this to learn full-stack development and to solve a real problem — small shops near me still track inventory on paper or basic spreadsheets.

I'd love feedback on what to improve or add next. Thanks for checking it out!

---

## r/webdev

**Title:** Built my first full-stack SaaS — inventory management with Next.js 14 + Supabase

**Body:**

Just shipped my first real project and wanted to share. It's an inventory management SaaS called **StockFlow**.

**Some things I learned building this:**
- Supabase Row Level Security is powerful but the circular policy bug will destroy your week
- `.single()` on queries that return 0 or 2+ rows causes silent cascading failures
- Using `auth.admin.createUser()` with `email_confirm: true` bypasses the Supabase email rate limit entirely
- PWA + Next.js works surprisingly well for mobile inventory management
- Dark mode with Tailwind's `darkMode: 'class'` + localStorage is the simplest approach

**Features:** Product CRUD, barcode support, CSV import/export, team roles, audit logs, reports with charts, low stock alerts, onboarding tour for new users.

**Stack:** Next.js 14 (App Router), Supabase (Auth + DB + Storage), TypeScript, Tailwind, Recharts, deployed on Vercel.

Would appreciate any code review or UX feedback. I'm still learning!

**Live:** https://stock-flow-2fqn.vercel.app
**GitHub:** github.com/Lykashing2/StockFlow

---

## r/smallbusiness

**Title:** Free inventory tracking tool for small businesses — no signup fees, no credit card

**Body:**

Hi! I built a free tool called **StockFlow** that helps small businesses track their inventory online.

If you're currently using spreadsheets or paper to track stock, this might save you time:

- **Add products** with names, SKUs, barcodes, prices, and photos
- **Get alerts** when stock is running low
- **Import from CSV** — upload your existing spreadsheet data in one click
- **Invite your team** — give different access levels to employees
- **Works on your phone** — install it as an app, no app store needed
- **Reports** — see your inventory value, stock movement, and top products

It's 100% free. No credit card, no trial that expires. I'm a student building this to learn, and I want it to actually be useful for real businesses.

Try it here: https://stock-flow-2fqn.vercel.app

I'd love to hear what features would make this more useful for your business!
