'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Truck, X, Loader2, Mail, Phone, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Supplier, UserRole } from '@/types';

interface Props {
  initialSuppliers: Supplier[];
  workspaceId: string;
  userRole: UserRole;
}

export function SuppliersClient({ initialSuppliers, workspaceId, userRole }: Props) {
  const supabase = createClient();
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [showForm, setShowForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const canEdit = userRole !== 'viewer';

  function resetForm() {
    setName(''); setContactName(''); setEmail(''); setPhone(''); setAddress(''); setNotes('');
    setEditSupplier(null); setShowForm(false);
  }

  function openEdit(s: Supplier) {
    setEditSupplier(s);
    setName(s.name);
    setContactName(s.contact_name ?? '');
    setEmail(s.email ?? '');
    setPhone(s.phone ?? '');
    setAddress(s.address ?? '');
    setNotes(s.notes ?? '');
    setShowForm(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      workspace_id: workspaceId,
      name: name.trim(),
      contact_name: contactName.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      address: address.trim() || null,
      notes: notes.trim() || null,
    };

    if (editSupplier) {
      const { data, error } = await supabase.from('suppliers').update(payload).eq('id', editSupplier.id).select().single();
      if (!error && data) setSuppliers((prev) => prev.map((s) => s.id === editSupplier.id ? data as Supplier : s));
    } else {
      const { data, error } = await supabase.from('suppliers').insert(payload).select().single();
      if (!error && data) setSuppliers((prev) => [...prev, data as Supplier].sort((a, b) => a.name.localeCompare(b.name)));
    }
    setSaving(false);
    resetForm();
  }

  async function handleDelete(s: Supplier) {
    if (!confirm(`Delete supplier "${s.name}"?`)) return;
    setDeletingId(s.id);
    await supabase.from('suppliers').update({ is_active: false }).eq('id', s.id);
    setSuppliers((prev) => prev.filter((x) => x.id !== s.id));
    setDeletingId(null);
  }

  const inputCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''}</p>
        {canEdit && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition">
            <Plus className="h-4 w-4" /> Add Supplier
          </button>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">{editSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. ABC Supplies Co." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person</label>
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputCls} placeholder="e.g. John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputCls} placeholder="supplier@email.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+855 12 345 678" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} placeholder="123 Street, City" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} placeholder="Payment terms, delivery schedule..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={resetForm} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button onClick={handleSave} disabled={saving || !name.trim()} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition text-sm">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : (editSupplier ? 'Save changes' : 'Add supplier')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supplier cards */}
      {suppliers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
          <Truck className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">No suppliers yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first supplier to track who provides your products.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Truck className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{s.name}</h3>
                    {s.contact_name && <p className="text-xs text-gray-400">{s.contact_name}</p>}
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(s)} disabled={deletingId === s.id} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                {s.email && <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{s.email}</p>}
                {s.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{s.phone}</p>}
                {s.address && <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{s.address}</p>}
              </div>
              {s.notes && <p className="mt-2 text-xs text-gray-400 italic line-clamp-2">{s.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
