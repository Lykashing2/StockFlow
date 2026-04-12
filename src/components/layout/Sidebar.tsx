'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  AlertTriangle,
  Settings,
  Users,
  LogOut,
  X,
  ChevronDown,
  Check,
  MessageSquare,
  Tag,
  FileBarChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/categories', label: 'Categories', icon: Tag },
  { href: '/dashboard/inventory', label: 'Inventory', icon: ClipboardList },
  { href: '/dashboard/alerts', label: 'Low Stock Alerts', icon: AlertTriangle },
  { href: '/dashboard/reports', label: 'Reports', icon: FileBarChart },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { workspace, workspaces, switchWorkspace } = useWorkspace();
  const supabase = createClient();
  const router = useRouter();
  const [wsDropdown, setWsDropdown] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-slate-900 z-30 flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">StockFlow</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace switcher */}
        <div className="px-3 py-3 border-b border-slate-700">
          <button
            onClick={() => setWsDropdown(!wsDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {workspace?.name?.[0]?.toUpperCase() ?? 'W'}
                </span>
              </div>
              <span className="text-slate-200 text-sm font-medium truncate">
                {workspace?.name ?? 'No workspace'}
              </span>
            </div>
            <ChevronDown className={cn('h-4 w-4 text-slate-400 flex-shrink-0 transition', wsDropdown && 'rotate-180')} />
          </button>

          {wsDropdown && workspaces.length > 1 && (
            <div className="mt-1 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => { switchWorkspace(ws.id); setWsDropdown(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700 text-sm text-slate-300 transition"
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === workspace?.id && <Check className="h-4 w-4 text-indigo-400 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
                {label === 'Low Stock Alerts' && (
                  <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    !
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer links */}
        <div className="px-3 py-4 border-t border-slate-700 space-y-1">
          <Link
            href="/feedback"
            onClick={onClose}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <MessageSquare className="h-4 w-4" />
            Send Feedback
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
