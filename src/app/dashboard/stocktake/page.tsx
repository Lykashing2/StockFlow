import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { StocktakeClient } from './StocktakeClient';

export default async function StocktakePage() {
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
  if (membership.role === 'viewer') redirect('/dashboard');

  const { data: products } = await supabase
    .from('products')
    .select('id, name, sku, quantity, unit, low_stock_threshold, category:categories(name)')
    .eq('workspace_id', membership.workspace_id)
    .eq('is_active', true)
    .order('name');

  return (
    <DashboardShell title="Stocktake">
      <StocktakeClient
        products={products ?? []}
        workspaceId={membership.workspace_id}
      />
    </DashboardShell>
  );
}
