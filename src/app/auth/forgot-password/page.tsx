'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Package, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({ email: z.string().email('Invalid email address') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
    });
    if (error) { setError(error.message); return; }
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative">
      <div className="auth-glow" />
      <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-600 rounded-xl"><Package className="h-6 w-6 text-white" /></div>
            <span className="text-2xl font-bold text-white">StockFlow</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-7 w-7 text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-6">We sent a password reset link to your email address.</p>
              <Link href="/auth/login" className="text-indigo-600 font-medium text-sm hover:text-indigo-700">Back to login</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Forgot password?</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email to receive a reset link.</p>
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className={cn('w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition', errors.email ? 'border-red-400' : 'border-gray-300')}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition text-sm">
                  {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : 'Send reset link'}
                </button>
              </form>
              <Link href="/auth/login" className="mt-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-4 w-4" />Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
