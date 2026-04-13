import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  return (
    <WorkspaceProvider userId={user.id}>
      {children}
      <PWAInstallPrompt />
    </WorkspaceProvider>
  );
}
