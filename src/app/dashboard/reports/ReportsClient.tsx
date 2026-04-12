'use client';

import { useMemo } from 'react';
import { BarChart3, TrendingUp, ArrowUpDown, Download, Package } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { exportToCSV } from '@/lib/csv';
import type { Product, Category } from '@/types';

interface Log {
  id: string;
  action: string;
  quantity_change: number;
  created_at: string;
  product?: { name: string; sku: string };
}

interface Props {
  products: Product[];
  categories: Category[];
  logs: Log[];
}

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#3b82f6', '#eab308', '#64748b', '#14b8a6'];

export function ReportsClient({ products, categories, logs }: Props) {
  // Stock movement summary (last 30 days)
  const movement = useMemo(() => {
    let added = 0, removed = 0, adjusted = 0;
    logs.forEach((l) => {
      const qty = Math.abs(l.quantity_change);
      if (l.action === 'add' || l.action === 'create') added += qty;
      else if (l.action === 'remove' || l.action === 'delete') removed += qty;
      else adjusted += qty;
    });
    return { added, removed, adjusted };
  }, [logs]);

  // Weekly bar chart data (last 4 weeks)
  const weeklyData = useMemo(() => {
    const weeks: { week: string; added: number; removed: number }[] = [];
    const now = new Date();
    for (let w = 3; w >= 0; w--) {
      const start = new Date(now);
      start.setDate(start.getDate() - (w + 1) * 7);
      const end = new Date(now);
      end.setDate(end.getDate() - w * 7);
      const weekLogs = logs.filter((l) => {
        const d = new Date(l.created_at);
        return d >= start && d < end;
      });
      weeks.push({
        week: `Week ${4 - w}`,
        added: weekLogs.filter((l) => l.action === 'add' || l.action === 'create').reduce((s, l) => s + Math.abs(l.quantity_change), 0),
        removed: weekLogs.filter((l) => l.action === 'remove' || l.action === 'delete').reduce((s, l) => s + Math.abs(l.quantity_change), 0),
      });
    }
    return weeks;
  }, [logs]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const map = new Map<string, { name: string; count: number; value: number; color: string }>();
    products.forEach((p) => {
      const catName = p.category?.name ?? 'Uncategorized';
      const catColor = p.category?.color ?? '#64748b';
      const existing = map.get(catName) ?? { name: catName, count: 0, value: 0, color: catColor };
      existing.count += 1;
      existing.value += p.quantity * p.cost_price;
      map.set(catName, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [products]);

  // Top movers (most stock changes)
  const topMovers = useMemo(() => {
    const map = new Map<string, { name: string; sku: string; changes: number }>();
    logs.forEach((l) => {
      if (!l.product) return;
      const key = l.product.sku;
      const existing = map.get(key) ?? { name: l.product.name, sku: l.product.sku, changes: 0 };
      existing.changes += Math.abs(l.quantity_change);
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.changes - a.changes).slice(0, 8);
  }, [logs]);

  // Inventory value
  const totalValue = products.reduce((s, p) => s + p.quantity * p.cost_price, 0);
  const totalRetail = products.reduce((s, p) => s + p.quantity * p.selling_price, 0);

  function handleExportReport() {
    const rows = products.map((p) => ({
      name: p.name,
      sku: p.sku,
      category: p.category?.name ?? '',
      quantity: p.quantity,
      unit: p.unit,
      cost_price: p.cost_price,
      selling_price: p.selling_price,
      stock_value: p.quantity * p.cost_price,
      retail_value: p.quantity * p.selling_price,
    }));
    exportToCSV(rows, `inventory-report-${new Date().toISOString().slice(0, 10)}`);
  }

  return (
    <div className="space-y-6">
      {/* Header with export */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Last 30 days overview</p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Value cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Inventory Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalValue)}</p>
          <p className="text-xs text-gray-400 mt-1">At cost price</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Retail Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRetail)}</p>
          <p className="text-xs text-gray-400 mt-1">At selling price</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Potential Profit</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalRetail - totalValue)}</p>
          <p className="text-xs text-gray-400 mt-1">Retail - cost</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
          <p className="text-xs text-gray-400 mt-1">{categories.length} categories</p>
        </div>
      </div>

      {/* Stock movement summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="p-2.5 bg-green-100 rounded-xl">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Stock Added</p>
            <p className="text-xl font-bold text-gray-900">{movement.added.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="p-2.5 bg-red-100 rounded-xl">
            <Package className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Stock Removed</p>
            <p className="text-xl font-bold text-gray-900">{movement.removed.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <ArrowUpDown className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Adjustments</p>
            <p className="text-xl font-bold text-gray-900">{movement.adjusted.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly stock movement chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-600" /> Weekly Stock Movement
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="added" name="Added" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="removed" name="Removed" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown pie chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-indigo-600" /> Products by Category
          </h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No products yet</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 space-y-1.5">
                {categoryData.slice(0, 6).map((c, i) => (
                  <li key={c.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-gray-700 truncate flex-1">{c.name}</span>
                    <span className="text-gray-400 text-xs">{c.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Top movers table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-600" /> Top Movers (Last 30 Days)
          </h3>
        </div>
        {topMovers.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <ArrowUpDown className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No stock movements yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Units Moved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topMovers.map((m, i) => (
                <tr key={m.sku} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{m.name}</p>
                        <p className="text-xs text-gray-400">{m.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900">{m.changes.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
