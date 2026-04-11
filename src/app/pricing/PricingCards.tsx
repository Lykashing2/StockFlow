'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlight: boolean;
  planKey: string | null;
}

const plans: Plan[] = [
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
    planKey: null,
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
    planKey: 'pro',
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
    planKey: 'business',
  },
];

export function PricingCards() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleCheckout(planKey: string) {
    try {
      setLoadingPlan(planKey);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        // If not authenticated, redirect to signup
        if (res.status === 401) {
          window.location.href = '/auth/signup';
          return;
        }
        console.error('Checkout error:', data.error);
        alert(data.error ?? 'Failed to start checkout. Please try again.');
        return;
      }

      // Redirect to LemonSqueezy checkout
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
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
          <p
            className={`text-sm mb-4 ${plan.highlight ? 'text-indigo-200' : 'text-slate-400'}`}
          >
            {plan.description}
          </p>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-bold">{plan.price}</span>
            <span
              className={`text-sm ${plan.highlight ? 'text-indigo-200' : 'text-slate-400'}`}
            >
              {plan.period}
            </span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check
                  className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-indigo-200' : 'text-indigo-400'}`}
                />
                <span
                  className={plan.highlight ? 'text-indigo-50' : 'text-slate-300'}
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>

          {/* Free plan: static link. Pro/Business: checkout button */}
          {plan.planKey ? (
            <button
              onClick={() => handleCheckout(plan.planKey!)}
              disabled={loadingPlan === plan.planKey}
              className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition disabled:opacity-70 ${
                plan.highlight
                  ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              {loadingPlan === plan.planKey ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                plan.cta
              )}
            </button>
          ) : (
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
          )}
        </div>
      ))}
    </div>
  );
}
