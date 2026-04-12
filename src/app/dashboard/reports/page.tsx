import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ReportsClient } from './ReportsClient';

export default async function ReportsPage() {
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

  // Fetch products, categories, and last 30 days of logs
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [productsRes, categoriesRes, logsRes] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(id, name, color)')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true),
    supabase
      .from('categories')
      .select('*')
      .eq('workspace_id', workspaceId),
    supabase
      .from('inventory_logs')
      .select('*, product:products(name, sku)')
      .eq('workspace_id', workspaceId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true }),
  ]);

  return (
    <DashboardShell title="Reports">
      <ReportsClient
        products={productsRes.data ?? []}
        categories={categoriesRes.data ?? []}
        logs={logsRes.data ?? []}
      />
    </DashboardShell>
  );
}
