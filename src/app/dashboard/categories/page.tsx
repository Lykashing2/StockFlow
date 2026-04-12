import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { CategoriesClient } from './CategoriesClient';

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('user_id', user.id)
    .limit(1);

  const membership = memberships?.[0];
  if (!membership) redirect('/dashboard');

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('workspace_id', membership.workspace_id)
    .order('name');

  return (
    <DashboardShell title="Categories">
      <CategoriesClient
        initialCategories={categories ?? []}
        workspaceId={membership.workspace_id}
        userRole={membership.role as 'owner' | 'admin' | 'member' | 'viewer'}
      />
    </DashboardShell>
  );
}
