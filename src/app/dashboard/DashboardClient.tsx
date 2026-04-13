'use client';

import { lazy, Suspense, useState, useMemo } from 'react';
import { Package, DollarSign, AlertTriangle, TrendingDown, Calendar } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StockChart } from '@/components/dashboard/StockChart';
import { formatCurrency, formatDateTime, getStockStatus, getChangeColor } from '@/lib/utils';
import Link from 'next/link';

const OnboardingTour = lazy(() => import('@/components/OnboardingTour').then(m => ({ default: m.OnboardingTour })));

import type { Product } from '@/types';

interface LogWithRelations {
  id: string;
  action: string;
  quantity_change: number;
  created_at: string;
  product?: { name: string; sku: string };
  profile?: { full_name: string | null; email: string };
}

type Range = '7d' | '14d' | '30d';

interface Props {
  stats: { totalProducts: number; totalValue: number; lowStockCount: number; outOfStockCount: number };
  recentLogs: LogWithRelations[];
  topProducts: Product[];
  chartData: { date: string; added: number; removed: number }[];
  lowStockProducts: Product[];
  allLogs?: LogWithRelations[];
}

export function DashboardClient({ stats, recentLogs, topProducts, chartData: defaultChart, lowStockProducts, allLogs }: Props) {
  const [range, setRange] = useState<Range>('7d');
  const logs = allLogs ?? recentLogs;

  const chartData = useMemo(() => {
    const days = range === '7d' ? 7 : range === '14d' ? 14 : 30;
    const now = new Date();
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (days - 1 - i));
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayLogs = logs.filter((l) => {
        const ld = new Date(l.created_at);
        return ld.toDateString() === d.toDateString();
      });
      return {
        date: dateStr,
        added: dayLogs.filter((l) => l.action === 'add').reduce((s, l) => s + Math.abs(l.quantity_change), 0),
        removed: dayLogs.filter((l) => l.action === 'remove').reduce((s, l) => s + Math.abs(l.quantity_change), 0),
      };
    });
  }, [logs, range]);

  return (
    <div className="space-y-6">
      <Suspense fallback={null}><OnboardingTour /></Suspense>

      {/* Date range picker */}
      <div className="flex items-center justify-end gap-1">
        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
        {(['7d', '14d', '30d'] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              range === r
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {r === '7d' ? '7 Days' : r === '14d' ? '14 Days' : '30 Days'}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Products"
          value={String(stats.totalProducts)}
          icon={Package}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-100"
          subtitle="Active SKUs"
        />
        <StatsCard
          title="Inventory Value"
          value={formatCurrency(stats.totalValue)}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
          subtitle="At cost price"
        />
        <StatsCard
          title="Low Stock"
          value={String(stats.lowStockCount)}
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
          subtitle="Need restock soon"
        />
        <StatsCard
          title="Out of Stock"
          value={String(stats.outOfStockCount)}
          icon={TrendingDown}
          iconColor="text-red-600"
          iconBg="bg-red-100"
          subtitle="Immediate action needed"
        />
      </div>

      {/* Chart + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <StockChart data={chartData} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Low Stock Alerts</h3>
            <Link href="/dashboard/alerts" className="text-indigo-600 text-xs hover:underline">
              View all
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">All stock levels are healthy!</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => {
                const status = getStockStatus(p.quantity, p.low_stock_threshold);
                return (
                  <div key={p.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.sku}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-900">{p.quantity}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent logs */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <Link href="/dashboard/inventory" className="text-indigo-600 text-xs hover:underline">
              View all
            </Link>
          </div>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{log.product?.name ?? 'Unknown'}</span>{' '}
                      <span className="text-gray-500">—</span>{' '}
                      <span className={getChangeColor(log.quantity_change)}>
                        {log.quantity_change > 0 ? '+' : ''}{log.quantity_change} units
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {log.profile?.full_name ?? log.profile?.email ?? 'System'} · {formatDateTime(log.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products by stock */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top Products by Stock</h3>
            <Link href="/dashboard/products" className="text-indigo-600 text-xs hover:underline">
              View all
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No products yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-5 text-right">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{p.quantity}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, (p.quantity / (topProducts[0]?.quantity || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
