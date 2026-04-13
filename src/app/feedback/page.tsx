'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Package, Loader2, CheckCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  type: z.enum(['bug', 'feature', 'general', 'other']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});
type FormData = z.infer<typeof schema>;

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { type: 'general' },
  });

  async function onSubmit(data: FormData) {
    setSubmitError(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to submit');
      }
      setSubmitted(true);
      reset();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  const inputCls = (err?: { message?: string }) =>
    cn('w-full px-3 py-2.5 bg-slate-800 border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition',
      err ? 'border-red-400' : 'border-slate-700');

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="hero-glow animate-glow" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/25">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">StockFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-slate-400 hover:text-white text-sm font-medium transition">
              Pricing
            </Link>
            <Link href="/auth/login" className="text-slate-400 hover:text-white text-sm font-medium transition">
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      <div className="px-4 py-16 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Send us feedback</h1>
          <p className="text-slate-400">Bug report, feature request, or just want to say hi? We&apos;d love to hear from you.</p>
        </div>

        {submitted ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-10 text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Thank you!</h2>
            <p className="text-slate-400 mb-6">Your feedback has been submitted. We&apos;ll review it soon.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition text-sm"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Name</label>
              <input {...register('name')} className={inputCls(errors.name)} placeholder="Your name" />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
              <input {...register('email')} type="email" className={inputCls(errors.email)} placeholder="you@example.com" />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Type</label>
              <select {...register('type')} className={inputCls()}>
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Message</label>
              <textarea {...register('message')} rows={5} className={inputCls(errors.message)} placeholder="Tell us what's on your mind..." />
              {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
            </div>

            {submitError && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-lg transition text-sm"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Sending...</>
              ) : (
                <><Send className="h-4 w-4" />Send Feedback</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
