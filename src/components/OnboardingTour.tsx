'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, AlertTriangle, Users, ArrowRight, X } from 'lucide-react';

const STORAGE_KEY = 'sf_onboarded';

const steps = [
  {
    icon: Package,
    title: 'Welcome to StockFlow!',
    desc: 'Your all-in-one inventory management tool. Let us show you around in 30 seconds.',
  },
  {
    icon: Plus,
    title: 'Add your products',
    desc: 'Go to Products to add items one by one, or bulk import via CSV. You can also scan barcodes!',
  },
  {
    icon: AlertTriangle,
    title: 'Never run out of stock',
    desc: 'Set low stock thresholds and get automatic alerts when products need restocking.',
  },
  {
    icon: Users,
    title: 'Invite your team',
    desc: 'Add team members with different roles — owners, admins, members, and viewers.',
  },
];

export function OnboardingTour() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setShow(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setShow(false);
  }

  function next() {
    if (step < steps.length - 1) setStep(step + 1);
    else dismiss();
  }

  if (!show) return null;

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center relative">
        <button onClick={dismiss} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
          <Icon className="h-7 w-7 text-indigo-600" />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-2">{current.title}</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{current.desc}</p>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mb-5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition ${i === step ? 'bg-indigo-600 w-5' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={dismiss}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition"
          >
            Skip
          </button>
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition text-sm"
          >
            {step < steps.length - 1 ? (
              <>Next <ArrowRight className="h-4 w-4" /></>
            ) : (
              "Let's go!"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
