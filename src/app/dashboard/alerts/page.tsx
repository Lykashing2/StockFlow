import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AlertsClient } from './AlertsClient';

export default async function AlertsPage() {
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

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(id, name, color)')
    .eq('workspace_id', membership.workspace_id)
    .eq('is_active', true)
    .order('quantity', { ascending: true });

  // Filter products at or below their threshold
  const alertProducts = (products ?? []).filter(
    (p) => p.quantity <= p.low_stock_threshold
  );

  return (
    <DashboardShell title="Low Stock Alerts">
      <AlertsClient
        products={alertProducts}
        workspaceId={membership.workspace_id}
        userRole={membership.role as 'owner' | 'admin' | 'member' | 'viewer'}
      />
    </DashboardShell>
  );
}
