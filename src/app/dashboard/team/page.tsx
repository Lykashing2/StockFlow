import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TeamClient } from './TeamClient';

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: myMembership } = await supabase
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!myMembership) redirect('/dashboard');

  const { data: members } = await supabase
    .from('workspace_members')
    .select('*, profile:profiles(id, email, full_name, avatar_url, created_at)')
    .eq('workspace_id', myMembership.workspace_id)
    .order('created_at', { ascending: true });

  return (
    <DashboardShell title="Team">
      <TeamClient
        members={members ?? []}
        workspaceId={myMembership.workspace_id}
        currentUserId={user.id}
        currentUserRole={myMembership.role as 'owner' | 'admin' | 'member' | 'viewer'}
      />
    </DashboardShell>
  );
}
