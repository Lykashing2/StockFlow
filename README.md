# StockFlow — Inventory Management SaaS

A production-ready, multi-tenant inventory management web app built with Next.js 14, Supabase, and Tailwind CSS. Installable as a PWA and fully mobile-friendly.

---

## Features

- **Auth** — Email/password login & signup, forgot password flow
- **Multi-tenant Workspaces** — Each user gets a workspace; invite teammates with role-based access (owner, admin, member, viewer)
- **Products** — Full CRUD with SKU, categories, pricing, stock levels, unit types
- **Stock Tracking** — Add, remove, or set-exact stock adjustments with atomic DB transactions
- **Inventory Logs** — Full audit trail of every stock change with user attribution
- **Low Stock Alerts** — Real-time alerts for products below their threshold
- **Dashboard** — Stats cards, stock activity chart (7-day), top products, recent activity
- **PWA** — Installable on iOS/Android/Desktop, offline support, app shortcuts
- **Security** — Row-Level Security (RLS) on every table, security headers

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 14 (App Router)             |
| Language    | TypeScript                          |
| Styling     | Tailwind CSS                        |
| Database    | Supabase (PostgreSQL + Auth)        |
| PWA         | next-pwa (Workbox)                  |
| Charts      | Recharts                            |
| Forms       | React Hook Form + Zod               |
| State       | React Context + Zustand             |

---

## Project Structure

```
src/
├── app/
│   ├── auth/                # Login, signup, forgot-password, update-password
│   ├── dashboard/
│   │   ├── page.tsx         # Dashboard (stats + charts)
│   │   ├── DashboardClient.tsx
│   │   ├── products/        # Product CRUD + stock adjust modal
│   │   ├── inventory/       # Inventory audit log
│   │   ├── alerts/          # Low stock alerts
│   │   ├── team/            # Team management
│   │   └── settings/        # Profile & workspace settings
│   ├── offline/             # PWA offline fallback page
│   ├── layout.tsx           # Root layout (PWA meta, fonts)
│   └── page.tsx             # Landing page
├── components/
│   ├── layout/              # Sidebar, Header, DashboardShell
│   └── dashboard/           # StatsCard, StockChart
├── contexts/
│   └── WorkspaceContext.tsx  # Active workspace + user state
├── lib/
│   ├── supabase/            # client.ts, server.ts, middleware.ts
│   └── utils.ts             # cn, formatCurrency, getStockStatus, etc.
├── middleware.ts             # Route protection
└── types/index.ts           # Shared TypeScript types
supabase/
└── migrations/
    └── 001_initial_schema.sql  # Full DB schema with RLS + functions
```

---

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/migrations/001_initial_schema.sql`
3. In your project dashboard, get:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add the following environment variables in Vercel's dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` → set to your Vercel URL (e.g. `https://stockflow.vercel.app`)
4. Click **Deploy**

### Supabase Auth Redirect URLs

In your Supabase dashboard → **Authentication → URL Configuration**, add:

```
https://your-domain.vercel.app/auth/callback
```

---

## PWA Setup

The app is PWA-ready out of the box with `next-pwa`:

- **manifest.json** is at `public/manifest.json`
- Icons are at `public/icons/` (PNG files for all sizes)
- Service worker is auto-generated at build time
- Offline fallback page: `/offline`
- Runtime caching configured for Supabase API, static assets, and pages

To install on mobile: Open the app in Safari/Chrome → tap **Share → Add to Home Screen**.

---

## Database Schema

| Table               | Purpose                                |
|---------------------|----------------------------------------|
| `profiles`          | Extended user data (name, avatar)      |
| `workspaces`        | Tenant isolation (1 per company)       |
| `workspace_members` | User-workspace roles                   |
| `categories`        | Product categories per workspace       |
| `products`          | Core inventory items                   |
| `inventory_logs`    | Immutable audit log of stock changes   |

### Key PostgreSQL Functions

- `create_workspace(name, slug)` — Creates workspace + owner membership atomically
- `adjust_stock(product_id, action, quantity, note)` — Thread-safe stock mutation + log

---

## Security

- All tables have **Row Level Security (RLS)** enabled
- Users can only access data within their own workspaces
- Role hierarchy: `owner > admin > member > viewer`
- Viewers have read-only access
- Security headers added via `next.config.js`

---

## License

MIT
