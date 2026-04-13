'use client';

import { useState, useMemo } from 'react';
import { Search, Package, ArrowUp, ArrowDown, RefreshCw, Plus, Trash2, Download } from 'lucide-react';
import { formatDateTime, getChangeColor, cn } from '@/lib/utils';
import { exportToCSV } from '@/lib/csv';
import type { InventoryLog, LogAction } from '@/types';

interface Props {
  logs: (InventoryLog & { product?: { name: string; sku: string; unit: string }; profile?: { full_name: string | null; email: string } })[];
}

const ACTION_ICONS: Record<LogAction, typeof ArrowUp> = {
  add: ArrowUp,
  remove: ArrowDown,
  adjust: RefreshCw,
  create: Plus,
  update: RefreshCw,
  delete: Trash2,
};

const ACTION_COLORS: Record<LogAction, string> = {
  add: 'text-emerald-600 bg-emerald-50',
  remove: 'text-red-600 bg-red-50',
  adjust: 'text-indigo-600 bg-indigo-50',
  create: 'text-blue-600 bg-blue-50',
  update: 'text-amber-600 bg-amber-50',
  delete: 'text-gray-600 bg-gray-100',
};

export function InventoryClient({ logs }: Props) {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const filtered = useMemo(() => {
    let list = [...logs];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((l) =>
        l.product?.name.toLowerCase().includes(q) ||
        l.product?.sku.toLowerCase().includes(q) ||
        l.note?.toLowerCase().includes(q)
      );
    }
    if (filterAction !== 'all') list = list.filter((l) => l.action === filterAction);
    return list;
  }, [logs, search, filterAction]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const filterKey = `${search}${filterAction}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) { setPrevFilterKey(filterKey); setPage(0); }

  function handleExport() {
    const rows = filtered.map((l) => ({
      action: l.action,
      product: l.product?.name ?? '',
      sku: l.product?.sku ?? '',
      before: l.quantity_before,
      change: l.quantity_change,
      after: l.quantity_after,
      note: l.note ?? '',
      user: l.profile?.full_name ?? l.profile?.email ?? '',
      date: l.created_at,
    }));
    exportToCSV(rows, 'inventory-log');
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product or note…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="all">All Actions</option>
          <option value="add">Add</option>
          <option value="remove">Remove</option>
          <option value="adjust">Adjust</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      <p className="text-sm text-gray-500">{filtered.length} log{filtered.length !== 1 ? 's' : ''}</p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Before</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Change</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">After</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Note</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    No activity found.
                  </td>
                </tr>
              ) : (
                paginated.map((log) => {
                  const ActionIcon = ACTION_ICONS[log.action] ?? RefreshCw;
                  const actionColor = ACTION_COLORS[log.action] ?? 'text-gray-500 bg-gray-100';
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', actionColor)}>
                          <ActionIcon className="h-3 w-3" />
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{log.product?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{log.product?.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{log.quantity_before}</td>
                      <td className={cn('px-4 py-3 text-right font-semibold', getChangeColor(log.quantity_change))}>
                        {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{log.quantity_after}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-[180px] truncate">
                        {log.note ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                        {log.profile?.full_name ?? log.profile?.email ?? 'System'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-8 h-8 text-sm rounded-lg transition',
                    p === page ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 text-gray-700'
                  )}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
