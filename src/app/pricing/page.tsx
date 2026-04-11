import Link from 'next/link';
import { Package, Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individuals getting started',
    features: [
      '1 workspace',
      'Up to 50 products',
      '1 team member',
      'Basic inventory tracking',
      'Low stock alerts',
      'PWA mobile access',
    ],
    cta: 'Get started free',
    href: '/auth/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For growing businesses',
    features: [
      'Unlimited workspaces',
      'Unlimited products',
      'Up to 10 team members',
      'Advanced analytics & reports',
      'Export to CSV/Excel',
      'Priority support',
      'Custom categories',
      'Inventory history (1 year)',
    ],
    cta: 'Start 14-day free trial',
    href: '/auth/signup',
    highlight: true,
  },
  {
    name: 'Business',
    price: '$49',
    period: '/month',
    description: 'For teams that need more',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'SSO & advanced security',
      'Inventory history (unlimited)',
      'Custom branding',
    ],
    cta: 'Contact sales',
    href: '/auth/signup',
    highlight: false,
  },
];

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
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col ${
                plan.highlight
                  ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 border-2 border-indigo-400 relative'
                  : 'bg-slate-800/50 border border-slate-700'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-400 text-indigo-900 text-xs font-bold rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <p className={`text-sm mb-4 ${plan.highlight ? 'text-indigo-200' : 'text-slate-400'}`}>
                {plan.description}
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-indigo-200' : 'text-indigo-400'}`} />
                    <span className={plan.highlight ? 'text-indigo-50' : 'text-slate-300'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition ${
                  plan.highlight
                    ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
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
