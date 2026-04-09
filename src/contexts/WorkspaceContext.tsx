'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Workspace, WorkspaceMember, Profile } from '@/types';

interface WorkspaceContextType {
  workspace: Workspace | null;
  member: WorkspaceMember | null;
  profile: Profile | null;
  workspaces: Workspace[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspace: null,
  member: null,
  profile: null,
  workspaces: [],
  isLoading: true,
  refresh: async () => {},
  switchWorkspace: () => {},
});

export function WorkspaceProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string;
}) {
  const supabase = createClient();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [member, setMember] = useState<WorkspaceMember | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(profileData);

      // Load all workspaces for user
      const { data: memberships } = await supabase
        .from('workspace_members')
        .select('*, workspace:workspaces(*)')
        .eq('user_id', userId);

      if (!memberships?.length) {
        setIsLoading(false);
        return;
      }

      const allWorkspaces = memberships.map((m) => m.workspace as Workspace);
      setWorkspaces(allWorkspaces);

      // Active workspace: from localStorage or first
      const savedId = typeof window !== 'undefined'
        ? localStorage.getItem('sf_active_workspace')
        : null;
      const active = allWorkspaces.find((w) => w.id === savedId) ?? allWorkspaces[0];
      setWorkspace(active);

      const activeMembership = memberships.find((m) => m.workspace_id === active.id);
      setMember(activeMembership ?? null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => { load(); }, [load]);

  function switchWorkspace(workspaceId: string) {
    const found = workspaces.find((w) => w.id === workspaceId);
    if (!found) return;
    localStorage.setItem('sf_active_workspace', workspaceId);
    setWorkspace(found);
    window.location.reload();
  }

  return (
    <WorkspaceContext.Provider
      value={{ workspace, member, profile, workspaces, isLoading, refresh: load, switchWorkspace }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
