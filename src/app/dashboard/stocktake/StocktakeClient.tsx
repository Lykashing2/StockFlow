'use client';

import { useState, useMemo } from 'react';
import { Search, CheckCircle2, AlertTriangle, Loader2, Package, ClipboardCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface StocktakeProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  category?: { name: string }[] | { name: string } | null;
}

interface CountEntry {
  productId: string;
  counted: number | null;
  note: string;
}

type Step = 'setup' | 'counting' | 'review' | 'done';

interface Props {
  products: StocktakeProduct[];
  workspaceId: string;
}

export function StocktakeClient({ products, workspaceId }: Props) {
  const supabase = createClient();
  const [step, setStep] = useState<Step>('setup');
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState<Map<string, CountEntry>>(new Map());
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(0);

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [products, search]);

  function setCount(productId: string, field: 'counted' | 'note', value: string) {
    const next = new Map(counts);
    const existing = next.get(productId) ?? { productId, counted: null, note: '' };
    if (field === 'counted') {
      existing.counted = value === '' ? null : Number(value);
    } else {
      existing.note = value;
    }
    next.set(productId, existing);
    setCounts(next);
  }

  const differences = useMemo(() => {
    return products
      .map((p) => {
        const entry = counts.get(p.id);
        if (!entry || entry.counted === null) return null;
        const diff = entry.counted - p.quantity;
        return { product: p, counted: entry.counted, diff, note: entry.note };
      })
      .filter((d) => d !== null && d.diff !== 0);
  }, [products, counts]);

  const countedCount = Array.from(counts.values()).filter((c) => c.counted !== null).length;

  async function applyAdjustments() {
    setApplying(true);
    setApplied(0);

    for (const d of differences) {
      if (!d) continue;
      const { product, counted, diff, note } = d;

      await supabase.from('products').update({ quantity: counted }).eq('id', product.id);
      await supabase.from('inventory_logs').insert({
        product_id: product.id,
        workspace_id: workspaceId,
        action: 'adjust',
        quantity_before: product.quantity,
        quantity_change: diff,
        quantity_after: counted,
        note: note || `Stocktake adjustment`,
      });

      setApplied((prev) => prev + 1);
    }

    setStep('done');
    setApplying(false);
  }

  if (step === 'setup') {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardCheck className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Start a Stocktake</h2>
        <p className="text-gray-500 mb-6">
          Count your physical inventory and compare it against the system. Any differences will be applied as adjustments.
        </p>
        <p className="text-sm text-gray-400 mb-6">{products.length} products to count</p>
        <button
          onClick={() => setStep('counting')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
        >
          Begin Count
        </button>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Stocktake Complete</h2>
        <p className="text-gray-500 mb-6">
          {differences.length} adjustment{differences.length !== 1 ? 's' : ''} applied successfully. Your inventory is now up to date.
        </p>
        <button
          onClick={() => { setStep('setup'); setCounts(new Map()); }}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
        >
          Start New Stocktake
        </button>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Review Adjustments</h2>
            <p className="text-sm text-gray-500">{differences.length} product{differences.length !== 1 ? 's' : ''} with discrepancies</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('counting')} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition">
              Back to Count
            </button>
            <button
              onClick={applyAdjustments}
              disabled={applying || differences.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
            >
              {applying ? <><Loader2 className="h-4 w-4 animate-spin" /> Applying {applied}/{differences.length}</> : `Apply ${differences.length} Adjustments`}
            </button>
          </div>
        </div>

        {differences.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-gray-500">All counts match the system. No adjustments needed.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">System</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Counted</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Difference</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {differences.map((d) => d && (
                  <tr key={d.product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{d.product.name}</p>
                      <p className="text-xs text-gray-400">{d.product.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{d.product.quantity}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{d.counted}</td>
                    <td className={cn('px-4 py-3 text-right font-semibold', d.diff > 0 ? 'text-emerald-600' : 'text-red-600')}>
                      {d.diff > 0 ? '+' : ''}{d.diff}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{d.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Counting step
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Count Inventory</h2>
          <p className="text-sm text-gray-500">{countedCount} of {products.length} counted</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setStep('setup'); setCounts(new Map()); }} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            onClick={() => setStep('review')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Review ({differences.length} changes)
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${(countedCount / products.length) * 100}%` }} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Count grid */}
      <div className="space-y-2">
        {filtered.map((p) => {
          const entry = counts.get(p.id);
          const counted = entry?.counted;
          const hasDiff = counted !== null && counted !== undefined && counted !== p.quantity;
          return (
            <div key={p.id} className={cn(
              'bg-white rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition',
              counted !== null && counted !== undefined ? (hasDiff ? 'border-amber-300 bg-amber-50/30' : 'border-emerald-300 bg-emerald-50/30') : 'border-gray-200'
            )}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 truncate">{p.name}</p>
                  {counted !== null && counted !== undefined && !hasDiff && <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                  {hasDiff && <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-400">{p.sku}{p.category ? ` · ${Array.isArray(p.category) ? p.category[0]?.name : p.category.name}` : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-400">System</p>
                  <p className="text-sm font-semibold text-gray-900">{p.quantity} {p.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Actual count</p>
                  <input
                    type="number"
                    min="0"
                    placeholder="—"
                    value={counted ?? ''}
                    onChange={(e) => setCount(p.id, 'counted', e.target.value)}
                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-400 mb-0.5">Note</p>
                  <input
                    placeholder="Optional"
                    value={entry?.note ?? ''}
                    onChange={(e) => setCount(p.id, 'note', e.target.value)}
                    className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
