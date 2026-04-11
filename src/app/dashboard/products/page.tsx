import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProductsClient } from './ProductsClient';

export default async function ProductsPage() {
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

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(id, name, color)')
      .eq('workspace_id', membership.workspace_id)
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .eq('workspace_id', membership.workspace_id),
  ]);

  return (
    <DashboardShell title="Products">
      <ProductsClient
        initialProducts={productsRes.data ?? []}
        categories={categoriesRes.data ?? []}
        workspaceId={membership.workspace_id}
        userRole={membership.role as 'owner' | 'admin' | 'member' | 'viewer'}
      />
    </DashboardShell>
  );
}
