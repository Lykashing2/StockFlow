import Link from 'next/link';
import { Package, BarChart3, Bell, Users, Smartphone, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">StockFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-slate-300 hover:text-white text-sm font-medium transition">
              Pricing
            </Link>
            <Link href="/auth/login" className="text-slate-300 hover:text-white text-sm font-medium transition">
              Sign in
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 lg:px-8 pt-20 pb-16 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
            Inventory management built for modern teams
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Track your stock.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Grow your business.
            </span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            StockFlow is the all-in-one inventory SaaS that keeps your products, team, and data in perfect sync — from warehouse to storefront.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition text-base">
              Start free — no card required
            </Link>
            <Link href="/auth/login" className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition text-base border border-slate-700">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/50 transition">
                <div className="p-2.5 bg-indigo-600/20 rounded-xl w-fit mb-4">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 lg:px-8 pb-20">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to take control of your inventory?</h2>
          <p className="text-indigo-100 mb-6">Join thousands of businesses using StockFlow.</p>
          <Link href="/auth/signup" className="inline-block px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition">
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-indigo-600 rounded-md">
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">StockFlow</span>
          </div>
          <p className="text-slate-500 text-xs">© {new Date().getFullYear()} StockFlow. Built by Phearun Lykashing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
