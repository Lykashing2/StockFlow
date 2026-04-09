'use client';

import { useState } from 'react';
import { AlertTriangle, TrendingDown, ArrowUpDown, Package } from 'lucide-react';
import { formatCurrency, getStockStatus, cn } from '@/lib/utils';
import { StockAdjustModal } from '../products/StockAdjustModal';
import type { Product, UserRole, Category } from '@/types';

interface Props {
  products: Product[];
  workspaceId: string;
  userRole: UserRole;
}

export function AlertsClient({ products: initialProducts, userRole }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  const outOfStock = products.filter((p) => p.quantity === 0);
  const lowStock = products.filter((p) => p.quantity > 0);

  function onAdjusted(updated: Product) {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      // Remove from alerts if now above threshold
      return next.filter((p) => p.quantity <= p.low_stock_threshold);
    });
    setAdjustProduct(null);
  }

  const canEdit = userRole !== 'viewer';

  function ProductRow({ product }: { product: Product }) {
    const status = getStockStatus(product.quantity, product.low_stock_threshold);
    const pct = product.low_stock_threshold > 0
      ? Math.round((product.quantity / product.low_stock_threshold) * 100)
      : 0;

    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Package className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
              <p className="text-xs text-gray-400">{product.sku}</p>
            </div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', status.bg, status.color)}>
              {status.label}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', product.quantity === 0 ? 'bg-red-500' : 'bg-amber-400')}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {product.quantity} / {product.low_stock_threshold} {product.unit}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
            <span>Cost: {formatCurrency(product.cost_price)}</span>
            <span>Value at 0: {formatCurrency(0)}</span>
            {product.category && (
              <span
                className="px-2 py-0.5 rounded text-white text-xs"
                style={{ backgroundColor: (product.category as Category).color }}
              >
                {(product.category as Category).name}
              </span>
            )}
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => setAdjustProduct(product)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition flex-shrink-0"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Restock
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-700">{outOfStock.length}</p>
            <p className="text-xs text-red-600 font-medium">Out of stock</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700">{lowStock.length}</p>
            <p className="text-xs text-amber-600 font-medium">Low stock</p>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-gray-700 font-semibold">All good! No alerts right now.</p>
          <p className="text-sm text-gray-400 mt-1">All products are above their stock thresholds.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {outOfStock.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" /> Out of Stock ({outOfStock.length})
              </h3>
              <div className="space-y-2">
                {outOfStock.map((p) => <ProductRow key={p.id} product={p} />)}
              </div>
            </div>
          )}
          {lowStock.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Low Stock ({lowStock.length})
              </h3>
              <div className="space-y-2">
                {lowStock.map((p) => <ProductRow key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {adjustProduct && (
        <StockAdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onAdjusted={onAdjusted}
        />
      )}
    </div>
  );
}
