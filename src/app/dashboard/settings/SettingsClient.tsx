'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Building2, Loader2, Check, ArrowUpRight, Lock, AlertCircle, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn, slugify } from '@/lib/utils';
import Link from 'next/link';
import type { Profile, Workspace, UserRole } from '@/types';

interface Props {
  profile: Profile | null;
  workspace: Workspace | null;
  userRole: UserRole;
}

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
});
const workspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});
const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type WorkspaceForm = z.infer<typeof workspaceSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export function SettingsClient({ profile, workspace, userRole }: Props) {
  const supabase = createClient();
  const [profileSaved, setProfileSaved] = useState(false);
  const [wsSaved, setWsSaved] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: profile?.full_name ?? '' },
  });
  const wsForm = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: workspace?.name ?? '' },
  });
  const pwForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  });

  async function saveProfile(data: ProfileForm) {
    await supabase.from('profiles').update({ full_name: data.full_name }).eq('id', profile!.id);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  }

  async function saveWorkspace(data: WorkspaceForm) {
    await supabase.from('workspaces').update({
      name: data.name,
      slug: slugify(data.name),
    }).eq('id', workspace!.id);
    setWsSaved(true);
    setTimeout(() => setWsSaved(false), 3000);
  }

  async function changePassword(data: PasswordForm) {
    setPwError(null);
    setPwSuccess(false);

    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile?.email ?? '',
      password: data.current_password,
    });
    if (signInError) {
      setPwError('Current password is incorrect.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: data.new_password });
    if (error) {
      setPwError(error.message);
      return;
    }

    setPwSuccess(true);
    pwForm.reset();
    setTimeout(() => setPwSuccess(false), 3000);
  }

  const canEditWorkspace = userRole === 'owner';

  const inputCls = (err?: { message?: string }) =>
    cn('w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition',
      err ? 'border-red-400' : 'border-gray-300');

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-600" /> Profile
        </h3>
        <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Full name</label>
            <input {...profileForm.register('full_name')} className={inputCls(profileForm.formState.errors.full_name)} />
            {profileForm.formState.errors.full_name && <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.full_name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
            <input value={profile?.email ?? ''} disabled className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>
          <button
            type="submit"
            disabled={profileForm.formState.isSubmitting}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition text-sm"
          >
            {profileForm.formState.isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> :
              profileSaved ? <><Check className="h-4 w-4" />Saved!</> : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Workspace settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-indigo-600" /> Workspace
        </h3>
        <form onSubmit={wsForm.handleSubmit(saveWorkspace)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Workspace name</label>
            <input
              {...wsForm.register('name')}
              disabled={!canEditWorkspace}
              className={cn(inputCls(wsForm.formState.errors.name), !canEditWorkspace && 'bg-gray-50 cursor-not-allowed')}
            />
            {wsForm.formState.errors.name && <p className="mt-1 text-xs text-red-500">{wsForm.formState.errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Plan</label>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold capitalize">
                {workspace?.plan ?? 'free'}
              </span>
              {(!workspace?.plan || workspace.plan === 'free') && (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
                >
                  Upgrade <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
          {canEditWorkspace && (
            <button
              type="submit"
              disabled={wsForm.formState.isSubmitting}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition text-sm"
            >
              {wsForm.formState.isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> :
                wsSaved ? <><Check className="h-4 w-4" />Saved!</> : 'Save changes'}
            </button>
          )}
        </form>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Lock className="h-4 w-4 text-indigo-600" /> Security
        </h3>
        <form onSubmit={pwForm.handleSubmit(changePassword)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Current password</label>
            <input
              type="password"
              {...pwForm.register('current_password')}
              className={inputCls(pwForm.formState.errors.current_password)}
            />
            {pwForm.formState.errors.current_password && (
              <p className="mt-1 text-xs text-red-500">{pwForm.formState.errors.current_password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">New password</label>
            <input
              type="password"
              {...pwForm.register('new_password')}
              className={inputCls(pwForm.formState.errors.new_password)}
            />
            {pwForm.formState.errors.new_password && (
              <p className="mt-1 text-xs text-red-500">{pwForm.formState.errors.new_password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm new password</label>
            <input
              type="password"
              {...pwForm.register('confirm_password')}
              className={inputCls(pwForm.formState.errors.confirm_password)}
            />
            {pwForm.formState.errors.confirm_password && (
              <p className="mt-1 text-xs text-red-500">{pwForm.formState.errors.confirm_password.message}</p>
            )}
          </div>
          {pwError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <Check className="h-4 w-4 shrink-0" />
              Password updated successfully.
            </div>
          )}
          <button
            type="submit"
            disabled={pwForm.formState.isSubmitting}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition text-sm"
          >
            {pwForm.formState.isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Updating...</>
            ) : (
              'Update password'
            )}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      {canEditWorkspace && (
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h3 className="font-semibold text-red-700 mb-4">Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete workspace</p>
              <p className="text-xs text-gray-500 mt-0.5">Permanently delete all data. This cannot be undone.</p>
            </div>
            <button
              disabled
              className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg opacity-50 cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
