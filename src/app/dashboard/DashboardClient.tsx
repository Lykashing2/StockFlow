'use client';

import { Package, DollarSign, AlertTriangle, TrendingDown } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StockChart } from '@/components/dashboard/StockChart';
import { OnboardingTour } from '@/components/OnboardingTour';
import { formatCurrency, formatDateTime, getStockStatus, getChangeColor } from '@/lib/utils';
import Link from 'next/link';

import type { Product } from '@/types';

interface LogWithRelations {
  id: string;
  action: string;
  quantity_change: number;
  created_at: string;
  product?: { name: string; sku: string };
  profile?: { full_name: string | null; email: string };
}

interface Props {
  stats: { totalProducts: number; totalValue: number; lowStockCount: number; outOfStockCount: number };
  recentLogs: LogWithRelations[];
  topProducts: Product[];
  chartData: { date: string; added: number; removed: number }[];
  lowStockProducts: Product[];
}

export function DashboardClient({ stats, recentLogs, topProducts, chartData, lowStockProducts }: Props) {
  return (
    <div className="space-y-6">
      <OnboardingTour />
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
