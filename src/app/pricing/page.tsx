import Link from 'next/link';
import { Package } from 'lucide-react';
import { PricingCards } from './PricingCards';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">StockFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-slate-300 hover:text-white text-sm font-medium transition">
              Sign in
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="px-4 lg:px-8 pt-16 pb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Start free. Upgrade when you need more power. No hidden fees.
        </p>
      </section>

      {/* Plans */}
      <section className="px-4 lg:px-8 pb-20">
        <PricingCards />
      </section>

      {/* FAQ */}
      <section className="px-4 lg:px-8 pb-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Questions?</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-1">Can I change plans later?</h3>
              <p className="text-slate-400 text-sm">Yes! You can upgrade or downgrade at any time. Changes take effect on your next billing cycle.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Is there a free trial?</h3>
              <p className="text-slate-400 text-sm">Pro plan comes with a 14-day free trial. No credit card required to start.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">What payment methods do you accept?</h3>
              <p className="text-slate-400 text-sm">We accept all major credit cards, debit cards, and digital wallets through our secure payment processor.</p>
            </div>
          </div>
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
          <p className="text-slate-500 text-xs">&copy; {new Date().getFullYear()} StockFlow. Built by Phearun Lykashing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
