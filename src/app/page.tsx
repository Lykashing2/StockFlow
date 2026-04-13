import Link from 'next/link';
import { Package, BarChart3, Bell, Users, Smartphone, Shield, UserPlus, ScanBarcode, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

const features = [
  { icon: Package, title: 'Product Management', desc: 'Add, edit, and track products with SKUs, categories, and pricing.' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Live dashboards showing inventory value, turnover, and stock trends.' },
  { icon: Bell, title: 'Low Stock Alerts', desc: 'Automatic alerts when products fall below custom thresholds.' },
  { icon: Users, title: 'Multi-tenant Teams', desc: 'Workspaces with role-based access — owner, admin, member, viewer.' },
  { icon: Smartphone, title: 'Works Offline (PWA)', desc: 'Install on any device. Works without internet, syncs when back online.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Row-level security, encrypted data, and audit logs on every action.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid animate-grid-fade pointer-events-none" />
      <div className="hero-glow animate-glow" />
      <div className="hero-glow-purple animate-glow" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/25">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">StockFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/demo" className="text-slate-400 hover:text-white text-sm font-medium transition hidden sm:block">
              Demo
            </Link>
            <Link href="/pricing" className="text-slate-400 hover:text-white text-sm font-medium transition hidden sm:block">
              Pricing
            </Link>
            <Link href="/feedback" className="text-slate-400 hover:text-white text-sm font-medium transition hidden sm:block">
              Feedback
            </Link>
            <Link href="/auth/login" className="text-slate-400 hover:text-white text-sm font-medium transition">
              Sign in
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition shadow-lg shadow-indigo-600/25">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-4 lg:px-8 pt-24 pb-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-indigo-300 text-xs font-medium mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            Inventory management built for modern teams
          </div>

          <h1 className="animate-fade-up delay-100 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 tracking-tight">
            Track your stock.{' '}
            <span className="shimmer-text animate-shimmer">
              Grow your business.
            </span>
          </h1>

          <p className="animate-fade-up delay-200 text-slate-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            StockFlow is the all-in-one inventory SaaS that keeps your products, team, and data in perfect sync — from warehouse to storefront.
          </p>

          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition text-base shadow-xl shadow-indigo-600/25 hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
              Start free — no card required
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 glass hover:bg-white/[0.06] text-white font-semibold rounded-xl transition text-base flex items-center justify-center gap-2"
            >
              Try live demo
            </Link>
          </div>
        </div>
      </section>

      {/* Tech strip */}
      <section className="relative z-10 px-4 lg:px-8 pb-20">
        <div className="max-w-3xl mx-auto text-center animate-fade-in delay-400">
          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.2em] mb-5">Powered by modern infrastructure</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {['Next.js', 'Supabase', 'Vercel', 'TypeScript', 'Tailwind CSS'].map((tech) => (
              <span key={tech} className="text-slate-600 hover:text-slate-300 text-sm font-medium transition cursor-default">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 lg:px-8 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="animate-fade-up text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Everything you need</h2>
            <p className="animate-fade-up delay-100 text-slate-400 max-w-xl mx-auto">
              Powerful features to manage your inventory at any scale.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`animate-fade-up delay-${(i + 1) * 100} glass card-hover rounded-2xl p-6 hover:border-indigo-500/30`}
              >
                <div className="p-2.5 bg-indigo-600/15 rounded-xl w-fit mb-4 ring-1 ring-indigo-500/20">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-4 lg:px-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">How it works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Get up and running in minutes — no complicated setup required.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: 1, icon: UserPlus, title: 'Sign up in seconds', desc: 'Create your free account. No credit card required.' },
              { step: 2, icon: ScanBarcode, title: 'Add your products', desc: 'Bulk import via CSV, scan barcodes, or manually add products.' },
              { step: 3, icon: TrendingUp, title: 'Track & grow', desc: 'Get real-time insights, low stock alerts, and team collaboration.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center group">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl glass ring-1 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition animate-float" style={{ animationDelay: `${step * 0.5}s` }}>
                  <Icon className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.15em] mb-2">Step {step}</div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-4 lg:px-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 tracking-tight">Trusted by businesses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { stat: '500+', label: 'Businesses' },
              { stat: '10,000+', label: 'Products tracked' },
              { stat: '99.9%', label: 'Uptime' },
            ].map(({ stat, label }) => (
              <div key={label} className="glass card-hover rounded-2xl p-8 text-center">
                <p className="text-4xl sm:text-5xl font-bold shimmer-text animate-shimmer mb-2">
                  {stat}
                </p>
                <p className="text-slate-400 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 lg:px-8 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
            <div className="relative p-12 sm:p-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Ready to take control of your inventory?</h2>
              <p className="text-indigo-100 mb-2 text-lg">Start with up to 50 products free. No credit card required.</p>
              <p className="text-indigo-200/70 text-sm mb-8">Set up in under 2 minutes.</p>
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition shadow-xl shadow-black/10"
              >
                Get started free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-4 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-indigo-600 rounded-md shadow-lg shadow-indigo-600/20">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-sm">StockFlow</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                All-in-one inventory management for modern teams.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition">Features</a></li>
                <li><Link href="/pricing" className="text-slate-500 hover:text-slate-300 text-sm transition">Pricing</Link></li>
                <li><Link href="/demo" className="text-slate-500 hover:text-slate-300 text-sm transition">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition">About</a></li>
                <li><Link href="/feedback" className="text-slate-500 hover:text-slate-300 text-sm transition">Feedback</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition">Privacy</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-600 text-xs">&copy; {new Date().getFullYear()} StockFlow. Built by Phearun Lykashing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
