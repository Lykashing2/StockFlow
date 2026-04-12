import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { SuppliersClient } from './SuppliersClient';

export default async function SuppliersPage() {
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

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .eq('workspace_id', membership.workspace_id)
    .eq('is_active', true)
    .order('name');

  return (
    <DashboardShell title="Suppliers">
      <SuppliersClient
        initialSuppliers={suppliers ?? []}
        workspaceId={membership.workspace_id}
        userRole={membership.role as 'owner' | 'admin' | 'member' | 'viewer'}
      />
    </DashboardShell>
  );
}
