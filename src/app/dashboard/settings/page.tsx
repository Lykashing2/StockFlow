import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { SettingsClient } from './SettingsClient';
import type { Profile, Workspace, UserRole } from '@/types';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('workspace_members')
      .select('role, workspace:workspaces(*)')
      .eq('user_id', user.id)
      .limit(1),
  ]);

  const membership = memberships?.[0];

  return (
    <DashboardShell title="Settings">
      <SettingsClient
        profile={profile as unknown as Profile}
        workspace={membership?.workspace as unknown as Workspace}
        userRole={membership?.role as UserRole}
      />
    </DashboardShell>
  );
}
