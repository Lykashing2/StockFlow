'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Package, ArrowUpDown, Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, getStockStatus, cn } from '@/lib/utils';
import { exportToCSV } from '@/lib/csv';
import { ProductModal } from './ProductModal';
import { StockAdjustModal } from './StockAdjustModal';
import type { Product, Category, UserRole } from '@/types';

interface Props {
  initialProducts: Product[];
  categories: Category[];
  workspaceId: string;
  userRole: UserRole;
}

type SortKey = 'name' | 'quantity' | 'cost_price' | 'created_at';

export function ProductsClient({ initialProducts, categories, workspaceId, userRole }: Props) {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canEdit = userRole !== 'viewer';

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (filterCategory !== 'all') list = list.filter((p) => p.category_id === filterCategory);
    if (filterStatus === 'low') list = list.filter((p) => p.quantity > 0 && p.quantity <= p.low_stock_threshold);
    if (filterStatus === 'out') list = list.filter((p) => p.quantity === 0);
    if (filterStatus === 'ok') list = list.filter((p) => p.quantity > p.low_stock_threshold);
    list.sort((a, b) => {
      const av = a[sortKey] as string | number;
      const bv = b[sortKey] as string | number;
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [products, search, filterCategory, filterStatus, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    await supabase.from('products').update({ is_active: false }).eq('id', product.id);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setDeletingId(null);
  }

  function onSaved(saved: Product) {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
      return [saved, ...prev];
    });
    setShowModal(false);
    setEditProduct(null);
  }

  function onStockAdjusted(updated: Product) {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setAdjustProduct(null);
  }

  function handleExportCSV() {
    const rows = filtered.map((p) => ({
      name: p.name,
      sku: p.sku,
      category: p.category?.name ?? '',
      quantity: p.quantity,
      unit: p.unit,
      cost_price: p.cost_price,
      selling_price: p.selling_price,
      low_stock_threshold: p.low_stock_threshold,
    }));
    exportToCSV(rows, 'products');
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="ok">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          {canEdit && (
            <button
              onClick={() => { setEditProduct(null); setShowModal(true); }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-500">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <button className="flex items-center gap-1" onClick={() => toggleSort('name')}>
                    Product <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <button className="flex items-center gap-1 ml-auto" onClick={() => toggleSort('quantity')}>
                    Stock <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                  <button className="flex items-center gap-1 ml-auto" onClick={() => toggleSort('cost_price')}>
                    Cost <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Price</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const status = getStockStatus(product.quantity, product.low_stock_threshold);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.sku}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {product.category ? (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: product.category.color }}
                          >
                            {product.category.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {product.quantity} <span className="text-xs font-normal text-gray-400">{product.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 hidden md:table-cell">
                        {formatCurrency(product.cost_price)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 hidden md:table-cell">
                        {formatCurrency(product.selling_price)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', status.bg, status.color)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <>
                              <button
                                onClick={() => setAdjustProduct(product)}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                                title="Adjust stock"
                              >
                                <ArrowUpDown className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => { setEditProduct(product); setShowModal(true); }}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product)}
                                disabled={deletingId === product.id}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <ProductModal
          product={editProduct}
          categories={categories}
          workspaceId={workspaceId}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSaved={onSaved}
        />
      )}
      {adjustProduct && (
        <StockAdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onAdjusted={onStockAdjusted}
        />
      )}
    </div>
  );
}
