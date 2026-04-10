import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Get the logged-in user
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name } = await req.json();
    const wsName = name || user.user_metadata?.workspace_name || 'My Workspace';
    const slug = wsName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    // Use admin client to bypass RLS
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if user already has a workspace
    const { data: existing } = await admin
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, workspace_id: existing[0].workspace_id });
    }

    // Create workspace
    const { data: workspace, error: wsError } = await admin
      .from('workspaces')
      .insert({ name: wsName, slug, owner_id: user.id })
      .select('id')
      .single();

    if (wsError) {
      return NextResponse.json({ error: wsError.message }, { status: 400 });
    }

    // Add user as owner
    const { error: memError } = await admin
      .from('workspace_members')
      .insert({ workspace_id: workspace.id, user_id: user.id, role: 'owner' });

    if (memError) {
      return NextResponse.json({ error: memError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, workspace_id: workspace.id });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
