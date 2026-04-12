'use client';

import { useState } from 'react';
import { Plus, X, Loader2, ClipboardList, Trash2, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { PurchaseOrder, UserRole, POStatus } from '@/types';

interface SimpleSupplier { id: string; name: string }
interface SimpleProduct { id: string; name: string; sku: string; cost_price: number }
interface LineItem { product_id: string; quantity: number; unit_cost: number }

interface Props {
  initialOrders: PurchaseOrder[];
  suppliers: SimpleSupplier[];
  products: SimpleProduct[];
  workspaceId: string;
  userRole: UserRole;
}

const STATUS_CONFIG: Record<POStatus, { label: string; bg: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', bg: 'bg-gray-100', color: 'text-gray-600', icon: FileText },
  pending: { label: 'Pending', bg: 'bg-amber-100', color: 'text-amber-700', icon: Clock },
  received: { label: 'Received', bg: 'bg-green-100', color: 'text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', bg: 'bg-red-100', color: 'text-red-700', icon: XCircle },
};

export function PurchaseOrdersClient({ initialOrders, suppliers, products, workspaceId, userRole }: Props) {
  const supabase = createClient();
  const [orders, setOrders] = useState<PurchaseOrder[]>(initialOrders);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ product_id: '', quantity: 1, unit_cost: 0 }]);

  const canEdit = userRole !== 'viewer';

  function addItem() {
    setItems([...items, { product_id: '', quantity: 1, unit_cost: 0 }]);
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    const updated = [...items];
    if (field === 'product_id') {
      updated[idx].product_id = value as string;
      const prod = products.find(p => p.id === value);
      if (prod) updated[idx].unit_cost = prod.cost_price;
    } else {
      updated[idx] = { ...updated[idx], [field]: Number(value) || 0 };
    }
    setItems(updated);
  }

  const total = items.reduce((s, i) => s + i.quantity * i.unit_cost, 0);

  async function handleCreate() {
    const validItems = items.filter(i => i.product_id && i.quantity > 0);
    if (validItems.length === 0) return;
    setSaving(true);

    const poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;

    const { data: po, error } = await supabase
      .from('purchase_orders')
      .insert({
        workspace_id: workspaceId,
        supplier_id: supplierId || null,
        po_number: poNumber,
        status: 'draft',
        total_amount: total,
        expected_delivery: expectedDelivery || null,
        notes: notes.trim() || null,
      })
      .select('*, supplier:suppliers(id, name)')
      .single();

    if (!error && po) {
      await supabase.from('purchase_order_items').insert(
        validItems.map(i => ({ purchase_order_id: po.id, product_id: i.product_id, quantity: i.quantity, unit_cost: i.unit_cost }))
      );
      setOrders([po as PurchaseOrder, ...orders]);
    }

    setSaving(false);
    setShowForm(false);
    setSupplierId(''); setNotes(''); setExpectedDelivery('');
    setItems([{ product_id: '', quantity: 1, unit_cost: 0 }]);
  }

  async function updateStatus(id: string, status: POStatus) {
    const { error } = await supabase.from('purchase_orders').update({ status }).eq('id', id);
    if (!error) setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }

  const inputCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        {canEdit && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition">
            <Plus className="h-4 w-4" /> New Order
          </button>
        )}
      </div>

      {/* Create PO Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">New Purchase Order</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
                  <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className={inputCls}>
                    <option value="">Select supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Expected Delivery</label>
                  <input type="date" value={expectedDelivery} onChange={e => setExpectedDelivery(e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Line items */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Items</label>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)} className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Select product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                      <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Qty" />
                      <input type="number" min="0" step="0.01" value={item.unit_cost} onChange={e => updateItem(idx, 'unit_cost', e.target.value)} className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Cost" />
                      {items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addItem} className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium">+ Add another item</button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={inputCls} placeholder="Special instructions..." />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-sm font-semibold text-gray-900">Total: {formatCurrency(total)}</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                  <button onClick={handleCreate} disabled={saving || items.every(i => !i.product_id)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition text-sm">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : 'Create Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders table */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">No purchase orders yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first order to track restocking from suppliers.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">PO #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Date</th>
                  {canEdit && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => {
                  const cfg = STATUS_CONFIG[o.status as POStatus];
                  const Icon = cfg.icon;
                  return (
                    <tr key={o.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">{o.po_number}</td>
                      <td className="px-4 py-3 text-gray-600">{o.supplier?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium', cfg.bg, cfg.color)}>
                          <Icon className="h-3 w-3" />{cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(o.total_amount)}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(o.created_at)}</td>
                      {canEdit && (
                        <td className="px-4 py-3 text-right">
                          {o.status === 'draft' && (
                            <button onClick={() => updateStatus(o.id, 'pending')} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mr-2">Send</button>
                          )}
                          {o.status === 'pending' && (
                            <button onClick={() => updateStatus(o.id, 'received')} className="text-xs text-green-600 hover:text-green-700 font-medium mr-2">Mark Received</button>
                          )}
                          {(o.status === 'draft' || o.status === 'pending') && (
                            <button onClick={() => updateStatus(o.id, 'cancelled')} className="text-xs text-red-500 hover:text-red-600 font-medium">Cancel</button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
