'use client';

import { useState } from 'react';
import { Users, Crown, Shield, User, Eye, Trash2, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate, getInitials, cn } from '@/lib/utils';
import type { UserRole } from '@/types';

const ROLE_ICONS: Record<UserRole, typeof Crown> = {
  owner: Crown, admin: Shield, member: User, viewer: Eye,
};
const ROLE_COLORS: Record<UserRole, string> = {
  owner: 'text-amber-600 bg-amber-50',
  admin: 'text-indigo-600 bg-indigo-50',
  member: 'text-emerald-600 bg-emerald-50',
  viewer: 'text-gray-600 bg-gray-100',
};

interface Member {
  id: string;
  workspace_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  profile?: { id: string; email: string; full_name: string | null; avatar_url: string | null; created_at: string };
}

interface Props {
  members: Member[];
  workspaceId: string;
  currentUserId: string;
  currentUserRole: UserRole;
}

export function TeamClient({ members: initialMembers, workspaceId, currentUserId, currentUserRole }: Props) {
  const supabase = createClient();
  const [members, setMembers] = useState(initialMembers);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteError, setInviteError] = useState('');

  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';

  async function handleInvite() {
    if (!inviteEmail) return;
    setIsInviting(true);
    setInviteError('');
    setInviteMsg('');

    // Look up user by email in profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', inviteEmail)
      .single();

    if (!profile) {
      setInviteError('No user found with that email. They must sign up first.');
      setIsInviting(false);
      return;
    }

    const { error } = await supabase
      .from('workspace_members')
      .insert({ workspace_id: workspaceId, user_id: profile.id, role: inviteRole });

    if (error) {
      setInviteError(error.code === '23505' ? 'This user is already a member.' : error.message);
    } else {
      setInviteMsg(`${inviteEmail} added as ${inviteRole}.`);
      setInviteEmail('');
      // Refresh members
      const { data: newMembers } = await supabase
        .from('workspace_members')
        .select('*, profile:profiles(id, email, full_name, avatar_url, created_at)')
        .eq('workspace_id', workspaceId);
      setMembers(newMembers ?? []);
    }
    setIsInviting(false);
  }

  async function handleRoleChange(memberId: string, newRole: UserRole) {
    await supabase.from('workspace_members').update({ role: newRole }).eq('id', memberId);
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role: newRole } : m));
  }

  async function handleRemove(member: Member) {
    if (!confirm(`Remove ${member.profile?.full_name ?? member.profile?.email} from this workspace?`)) return;
    await supabase.from('workspace_members').delete().eq('id', member.id);
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Invite */}
      {canManage && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="h-4 w-4 text-indigo-600" /> Add Team Member
          </h3>
          {inviteMsg && <div className="mb-3 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg">{inviteMsg}</div>}
          {inviteError && <div className="mb-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{inviteError}</div>}
          <div className="flex gap-2">
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              type="email"
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              onClick={handleInvite}
              disabled={isInviting || !inviteEmail}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition text-sm whitespace-nowrap"
            >
              {isInviting ? 'Adding…' : 'Add'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">User must already have a StockFlow account.</p>
        </div>
      )}

      {/* Members list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Members ({members.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {members.map((member) => {
            const RoleIcon = ROLE_ICONS[member.role] ?? User;
            const isCurrentUser = member.user_id === currentUserId;
            return (
              <div key={member.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold text-sm">
                  {member.profile?.full_name ? getInitials(member.profile.full_name) : '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 text-sm">
                      {member.profile?.full_name ?? 'Unknown'}
                      {isCurrentUser && <span className="ml-1 text-xs text-gray-400">(you)</span>}
                    </p>
                    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full', ROLE_COLORS[member.role])}>
                      <RoleIcon className="h-3 w-3" />
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{member.profile?.email} · Joined {formatDate(member.created_at)}</p>
                </div>
                {canManage && !isCurrentUser && member.role !== 'owner' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                      className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      onClick={() => handleRemove(member)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
