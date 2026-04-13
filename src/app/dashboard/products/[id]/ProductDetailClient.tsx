'use client';

import { useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Package, ArrowUpDown, ArrowUp, ArrowDown,
  RefreshCw, Plus, Trash2, Edit2,
} from 'lucide-react';
import { formatCurrency, formatDateTime, getStockStatus, getChangeColor, cn } from '@/lib/utils';
import type { Product, InventoryLog, UserRole, LogAction } from '@/types';

const StockAdjustModal = lazy(() =>
  import('../StockAdjustModal').then((m) => ({ default: m.StockAdjustModal }))
);

interface Props {
  product: Product;
  logs: (InventoryLog & { profile?: { full_name: string | null; email: string } })[];
  userRole: UserRole;
}

const ACTION_ICONS: Record<LogAction, typeof ArrowUp> = {
  add: ArrowUp, remove: ArrowDown, adjust: RefreshCw, create: Plus, update: RefreshCw, delete: Trash2,
};
const ACTION_COLORS: Record<LogAction, string> = {
  add: 'text-emerald-600 bg-emerald-50', remove: 'text-red-600 bg-red-50',
  adjust: 'text-indigo-600 bg-indigo-50', create: 'text-blue-600 bg-blue-50',
  update: 'text-amber-600 bg-amber-50', delete: 'text-gray-600 bg-gray-100',
};

export function ProductDetailClient({ product, logs, userRole }: Props) {
  const [adjusting, setAdjusting] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(product);
  const status = getStockStatus(currentProduct.quantity, currentProduct.low_stock_threshold);
  const canEdit = userRole !== 'viewer';
  const margin = currentProduct.selling_price - currentProduct.cost_price;
  const marginPct = currentProduct.cost_price > 0 ? (margin / currentProduct.cost_price) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/dashboard/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      {/* Product info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-4">
            {currentProduct.image_url ? (
              <Image src={currentProduct.image_url} alt={currentProduct.name} width={80} height={80} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Package className="h-8 w-8 text-gray-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentProduct.name}</h2>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', status.bg, status.color)}>{status.label}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{currentProduct.sku}{currentProduct.barcode ? ` | Barcode: ${currentProduct.barcode}` : ''}</p>
              {currentProduct.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{currentProduct.description}</p>
              )}
              {currentProduct.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium text-white mt-2" style={{ backgroundColor: currentProduct.category.color }}>
                  {currentProduct.category.name}
                </span>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{currentProduct.quantity} <span className="text-xs font-normal text-gray-400">{currentProduct.unit}</span></p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Cost Price</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(currentProduct.cost_price)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Selling Price</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(currentProduct.selling_price)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Margin</p>
              <p className={cn('text-xl font-bold mt-1', margin >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                {marginPct.toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Stock Value</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(currentProduct.quantity * currentProduct.cost_price)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Low Stock Threshold</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{currentProduct.low_stock_threshold} {currentProduct.unit}</p>
            </div>
          </div>

          {canEdit && (
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setAdjusting(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
              >
                <ArrowUpDown className="h-4 w-4" /> Adjust Stock
              </button>
            </div>
          )}
        </div>

        {/* Quick stats sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Activity Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Total changes</span>
                <span className="font-medium text-gray-900 dark:text-white">{logs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Stock added</span>
                <span className="font-medium text-emerald-600">
                  +{logs.filter((l) => l.action === 'add').reduce((s, l) => s + Math.abs(l.quantity_change), 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Stock removed</span>
                <span className="font-medium text-red-600">
                  -{logs.filter((l) => l.action === 'remove').reduce((s, l) => s + Math.abs(l.quantity_change), 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Adjustments</span>
                <span className="font-medium text-indigo-600">
                  {logs.filter((l) => l.action === 'adjust').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Stock History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Before</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Change</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">After</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Note</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    No history for this product yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const Icon = ACTION_ICONS[log.action] ?? RefreshCw;
                  const color = ACTION_COLORS[log.action] ?? 'text-gray-500 bg-gray-100';
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', color)}>
                          <Icon className="h-3 w-3" />
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{log.quantity_before}</td>
                      <td className={cn('px-4 py-3 text-right font-semibold', getChangeColor(log.quantity_change))}>
                        {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{log.quantity_after}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-[180px] truncate">{log.note ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                        {log.profile?.full_name ?? log.profile?.email ?? 'System'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Suspense fallback={null}>
        {adjusting && (
          <StockAdjustModal
            product={currentProduct}
            onClose={() => setAdjusting(false)}
            onAdjusted={(updated) => { setCurrentProduct(updated); setAdjusting(false); }}
          />
        )}
      </Suspense>
    </div>
  );
}
