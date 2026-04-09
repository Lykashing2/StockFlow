import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // Check if user has a workspace — if not, create a default one
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!membership) {
    const name = user.user_metadata?.full_name
      ? `${user.user_metadata.full_name}'s Workspace`
      : 'My Workspace';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    await supabase.rpc('create_workspace', { p_name: name, p_slug: slug });
  }

  return (
    <WorkspaceProvider userId={user.id}>
      {children}
    </WorkspaceProvider>
  );
}
