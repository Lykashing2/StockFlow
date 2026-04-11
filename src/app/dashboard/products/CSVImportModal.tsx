'use client';

import { useState, useRef } from 'react';
import { X, Upload, Loader2, CheckCircle, AlertCircle, FileDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { parseCSV, downloadTemplate } from '@/lib/csv';
import { generateSKU } from '@/lib/utils';
import type { Product, Category } from '@/types';

interface Props {
  workspaceId: string;
  categories: Category[];
  onClose: () => void;
  onImported: (products: Product[]) => void;
}

interface ParsedRow {
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  cost_price: number;
  selling_price: number;
  low_stock_threshold: number;
  category_id: string | null;
  barcode: string | null;
  error?: string;
}

export function CSVImportModal({ workspaceId, categories, onClose, onImported }: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState({ success: 0, failed: 0 });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const raw = parseCSV(text);
      const parsed = raw.map((r) => validateRow(r));
      setRows(parsed);
      setStep('preview');
    };
    reader.readAsText(file);
  }

  function validateRow(r: Record<string, string>): ParsedRow {
    const name = r.name?.trim() ?? '';
    const sku = r.sku?.trim() || generateSKU(name.substring(0, 3).toUpperCase() || 'IMP');
    const quantity = parseInt(r.quantity) || 0;
    const unit = r.unit?.trim() || 'pcs';
    const cost_price = parseFloat(r.cost_price) || 0;
    const selling_price = parseFloat(r.selling_price) || 0;
    const low_stock_threshold = parseInt(r.low_stock_threshold) || 10;
    const barcode = r.barcode?.trim() || null;

    // Resolve category by name
    const catName = r.category?.trim().toLowerCase() ?? '';
    const cat = categories.find((c) => c.name.toLowerCase() === catName);
    const category_id = cat?.id ?? null;

    let error: string | undefined;
    if (!name) error = 'Missing name';
    else if (quantity < 0) error = 'Invalid quantity';

    return { name, sku, quantity, unit, cost_price, selling_price, low_stock_threshold, category_id, barcode, error };
  }

  const validRows = rows.filter((r) => !r.error);
  const errorRows = rows.filter((r) => r.error);

  async function handleImport() {
    setImporting(true);
    let success = 0;
    let failed = 0;

    // Batch insert valid rows
    const payload = validRows.map((r) => ({
      workspace_id: workspaceId,
      name: r.name,
      sku: r.sku,
      quantity: r.quantity,
      unit: r.unit,
      cost_price: r.cost_price,
      selling_price: r.selling_price,
      low_stock_threshold: r.low_stock_threshold,
      category_id: r.category_id,
      barcode: r.barcode,
    }));

    const { data: inserted, error } = await supabase
      .from('products')
      .insert(payload)
      .select('*, category:categories(id, name, color)');

    if (error) {
      failed = validRows.length;
    } else {
      success = inserted?.length ?? 0;
      failed = validRows.length - success;

      // Log creation for each
      const { data: { user } } = await supabase.auth.getUser();
      if (user && inserted) {
        const logs = inserted.map((p) => ({
          workspace_id: workspaceId,
          product_id: p.id,
          user_id: user.id,
          action: 'create' as const,
          quantity_before: 0,
          quantity_after: p.quantity,
          quantity_change: p.quantity,
          note: 'Imported via CSV',
        }));
        await supabase.from('inventory_logs').insert(logs);
      }

      if (inserted) onImported(inserted as Product[]);
    }

    setResult({ success, failed: failed + errorRows.length });
    setStep('done');
    setImporting(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">Import Products from CSV</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition"
              >
                <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">Click to upload a CSV file</p>
                <p className="text-xs text-gray-400 mt-1">Supports .csv files with headers</p>
                <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <FileDown className="h-4 w-4" />
                Download template CSV
              </button>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
                  <p className="text-lg font-bold text-green-700">{validRows.length}</p>
                  <p className="text-xs text-green-600">Valid rows</p>
                </div>
                <div className="flex-1 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                  <p className="text-lg font-bold text-red-700">{errorRows.length}</p>
                  <p className="text-xs text-red-600">Errors</p>
                </div>
              </div>

              {/* Preview table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-3 py-2 text-left font-medium text-gray-500">Name</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">SKU</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-500">Qty</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-500">Price</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.slice(0, 10).map((r, i) => (
                        <tr key={i} className={r.error ? 'bg-red-50' : ''}>
                          <td className="px-3 py-1.5 text-gray-900">{r.name || '—'}</td>
                          <td className="px-3 py-1.5 text-gray-500">{r.sku}</td>
                          <td className="px-3 py-1.5 text-right text-gray-700">{r.quantity}</td>
                          <td className="px-3 py-1.5 text-right text-gray-700">${r.selling_price.toFixed(2)}</td>
                          <td className="px-3 py-1.5">
                            {r.error ? (
                              <span className="text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />{r.error}
                              </span>
                            ) : (
                              <span className="text-green-600">OK</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rows.length > 10 && (
                  <p className="text-xs text-gray-400 text-center py-2 border-t">
                    Showing 10 of {rows.length} rows
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('upload'); setRows([]); }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={validRows.length === 0 || importing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition text-sm"
                >
                  {importing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Importing...</>
                  ) : (
                    <>Import {validRows.length} products</>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Import complete</h3>
              <p className="text-sm text-gray-500 mb-6">
                {result.success} product{result.success !== 1 ? 's' : ''} imported successfully.
                {result.failed > 0 && ` ${result.failed} failed.`}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition text-sm"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
