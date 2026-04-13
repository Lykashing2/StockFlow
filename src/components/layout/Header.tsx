'use client';

import { Menu } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { getInitials } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { NotificationCenter } from '@/components/NotificationCenter';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { profile, workspace } = useWorkspace();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <GlobalSearch />

        <ThemeToggle />

        <NotificationCenter />

        {/* Avatar */}
        <div className="flex items-center gap-2 ml-1">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {profile?.full_name ? getInitials(profile.full_name) : '?'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">
              {profile?.full_name ?? profile?.email ?? 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{workspace?.plan ?? 'free'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
