import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { InventoryClient } from './InventoryClient';

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1);

  const membership = memberships?.[0];
  if (!membership) redirect('/dashboard');

  const { data: logs } = await supabase
    .from('inventory_logs')
    .select('*, product:products(id, name, sku, unit), profile:profiles(full_name, email)')
    .eq('workspace_id', membership.workspace_id)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <DashboardShell title="Inventory Logs">
      <InventoryClient logs={logs ?? []} />
    </DashboardShell>
  );
}
