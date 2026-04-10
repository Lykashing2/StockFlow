import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { DashboardClient } from './DashboardClient';
import { CreateWorkspaceButton } from './CreateWorkspaceButton';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Fetch workspace for this user
  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(id, name)')
    .eq('user_id', user.id)
    .limit(1);

  const membership = memberships?.[0];

  if (!membership) {
    return (
      <DashboardShell title="Dashboard">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500 mb-2">No workspace found.</p>
          <p className="text-gray-400 text-sm mb-6">Create a workspace to start managing your inventory.</p>
          <CreateWorkspaceButton defaultName={user.user_metadata?.workspace_name} />
        </div>
      </DashboardShell>
    );
  }

  const workspaceId = membership.workspace_id;

  // Parallel data fetching
  const [productsRes, logsRes] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true),
    supabase
      .from('inventory_logs')
      .select('*, product:products(name, sku), profile:profiles(full_name, email)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const products = productsRes.data ?? [];
  const logs = logsRes.data ?? [];

  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.cost_price, 0);
  const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= p.low_stock_threshold).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  // Build 7-day chart data
  const now = new Date();
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayLogs = logs.filter((l) => {
      const ld = new Date(l.created_at);
      return ld.toDateString() === d.toDateString();
    });
    return {
      date: dateStr,
      added: dayLogs.filter((l) => l.action === 'add').reduce((s, l) => s + Math.abs(l.quantity_change), 0),
      removed: dayLogs.filter((l) => l.action === 'remove').reduce((s, l) => s + Math.abs(l.quantity_change), 0),
    };
  });

  return (
    <DashboardShell title="Dashboard">
      <DashboardClient
        stats={{ totalProducts: products.length, totalValue, lowStockCount, outOfStockCount }}
        recentLogs={logs.slice(0, 8)}
        topProducts={[...products].sort((a, b) => b.quantity - a.quantity).slice(0, 5)}
        chartData={chartData}
        lowStockProducts={products.filter((p) => p.quantity <= p.low_stock_threshold).slice(0, 5)}
      />
    </DashboardShell>
  );
}
