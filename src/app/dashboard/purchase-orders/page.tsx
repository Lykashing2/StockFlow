import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PurchaseOrdersClient } from './PurchaseOrdersClient';

export default async function PurchaseOrdersPage() {
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

  const workspaceId = membership.workspace_id;

  const [ordersRes, suppliersRes, productsRes] = await Promise.all([
    supabase
      .from('purchase_orders')
      .select('*, supplier:suppliers(id, name)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false }),
    supabase
      .from('suppliers')
      .select('id, name')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('products')
      .select('id, name, sku, cost_price')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .order('name'),
  ]);

  return (
    <DashboardShell title="Purchase Orders">
      <PurchaseOrdersClient
        initialOrders={ordersRes.data ?? []}
        suppliers={suppliersRes.data ?? []}
        products={productsRes.data ?? []}
        workspaceId={workspaceId}
        userRole={membership.role as 'owner' | 'admin' | 'member' | 'viewer'}
      />
    </DashboardShell>
  );
}
