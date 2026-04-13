'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Package, AlertTriangle, ArrowDown, ArrowUp, RefreshCw, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'stock_add' | 'stock_remove' | 'stock_adjust';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const ICONS = {
  low_stock: AlertTriangle,
  out_of_stock: AlertTriangle,
  stock_add: ArrowUp,
  stock_remove: ArrowDown,
  stock_adjust: RefreshCw,
};

const COLORS = {
  low_stock: 'text-amber-600 bg-amber-50',
  out_of_stock: 'text-red-600 bg-red-50',
  stock_add: 'text-emerald-600 bg-emerald-50',
  stock_remove: 'text-red-600 bg-red-50',
  stock_adjust: 'text-indigo-600 bg-indigo-50',
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { workspace } = useWorkspace();
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    if (!workspace?.id) return;
    setLoading(true);

    const [logsRes, productsRes] = await Promise.all([
      supabase
        .from('inventory_logs')
        .select('id, action, quantity_change, created_at, note, product:products(name)')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('products')
        .select('id, name, quantity, low_stock_threshold')
        .eq('workspace_id', workspace.id)
        .eq('is_active', true),
    ]);

    const items: Notification[] = [];

    // Low stock / out of stock alerts
    const lowStock = (productsRes.data ?? []).filter(
      (p) => p.quantity <= p.low_stock_threshold
    );
    lowStock.forEach((p) => {
      items.push({
        id: `ls-${p.id}`,
        type: p.quantity === 0 ? 'out_of_stock' : 'low_stock',
        title: p.quantity === 0 ? 'Out of Stock' : 'Low Stock Alert',
        message: `${p.name} has ${p.quantity} units (threshold: ${p.low_stock_threshold})`,
        time: 'Now',
        read: false,
      });
    });

    // Recent activity
    (logsRes.data ?? []).forEach((log) => {
      const typeMap: Record<string, Notification['type']> = {
        add: 'stock_add',
        remove: 'stock_remove',
        adjust: 'stock_adjust',
      };
      const t = typeMap[log.action];
      if (!t) return;
      items.push({
        id: log.id,
        type: t,
        title: log.action === 'add' ? 'Stock Added' : log.action === 'remove' ? 'Stock Removed' : 'Stock Adjusted',
        message: `${((log.product as unknown as { name: string })?.name) ?? 'Product'}: ${log.quantity_change > 0 ? '+' : ''}${log.quantity_change} units`,
        time: formatRelative(log.created_at),
        read: true,
      });
    });

    setNotifications(items);
    setLoading(false);
  }, [workspace?.id, supabase]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No notifications
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = ICONS[n.type] ?? Package;
                const color = COLORS[n.type] ?? 'text-gray-500 bg-gray-100';
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 transition',
                      !n.read && 'bg-indigo-50/50 dark:bg-indigo-900/20'
                    )}
                  >
                    <div className={cn('p-1.5 rounded-lg flex-shrink-0 mt-0.5', color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{n.message}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{n.time}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelative(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
