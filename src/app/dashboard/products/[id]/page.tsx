import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProductDetailClient } from './ProductDetailClient';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const [productRes, logsRes] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(id, name, color)')
      .eq('id', id)
      .eq('workspace_id', membership.workspace_id)
      .single(),
    supabase
      .from('inventory_logs')
      .select('*, profile:profiles(full_name, email)')
      .eq('product_id', id)
      .eq('workspace_id', membership.workspace_id)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  if (!productRes.data) notFound();

  return (
    <DashboardShell title={productRes.data.name}>
      <ProductDetailClient
        product={productRes.data}
        logs={logsRes.data ?? []}
        userRole={membership.role as 'owner' | 'admin' | 'member' | 'viewer'}
      />
    </DashboardShell>
  );
}
