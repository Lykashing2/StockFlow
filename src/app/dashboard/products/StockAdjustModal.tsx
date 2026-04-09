'use client';

import { useState } from 'react';
import { X, Loader2, Plus, Minus, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface Props {
  product: Product;
  onClose: () => void;
  onAdjusted: (updated: Product) => void;
}

type Action = 'add' | 'remove' | 'adjust';

export function StockAdjustModal({ product, onClose, onAdjusted }: Props) {
  const supabase = createClient();
  const [action, setAction] = useState<Action>('add');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const preview = (() => {
    if (action === 'add') return product.quantity + quantity;
    if (action === 'remove') return Math.max(0, product.quantity - quantity);
    return quantity;
  })();

  async function handleSubmit() {
    if (quantity < 0 || (action !== 'adjust' && quantity === 0)) {
      setError('Quantity must be greater than 0');
      return;
    }
    setIsLoading(true);
    setError('');
    const { data, error: err } = await supabase.rpc('adjust_stock', {
      p_product_id: product.id,
      p_action: action,
      p_quantity: quantity,
      p_note: note || null,
    });
    setIsLoading(false);
    if (err) { setError(err.message); return; }
    onAdjusted(data as Product);
  }

  const actions: { key: Action; label: string; icon: typeof Plus; color: string }[] = [
    { key: 'add', label: 'Add Stock', icon: Plus, color: 'bg-emerald-600 text-white' },
    { key: 'remove', label: 'Remove Stock', icon: Minus, color: 'bg-red-600 text-white' },
    { key: 'adjust', label: 'Set Exact', icon: RefreshCw, color: 'bg-indigo-600 text-white' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Adjust Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-semibold text-gray-900">{product.name}</p>
            <p className="text-xs text-gray-500">{product.sku} · Current: <span className="font-bold text-gray-900">{product.quantity} {product.unit}</span></p>
          </div>

          <div className="flex gap-2">
            {actions.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setAction(key)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-semibold border-2 transition',
                  action === key ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {action === 'adjust' ? 'New quantity' : 'Quantity'}
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">New stock level</span>
            <span className={cn('text-lg font-bold', preview === 0 ? 'text-red-600' : preview <= product.low_stock_threshold ? 'text-amber-600' : 'text-emerald-600')}>
              {preview} {product.unit}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. Received from supplier, damaged goods…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition text-sm">
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : 'Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
