'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, X, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Category, UserRole } from '@/types';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#64748b', '#78716c',
];

interface Props {
  initialCategories: Category[];
  workspaceId: string;
  userRole: UserRole;
}

export function CategoriesClient({ initialCategories, workspaceId, userRole }: Props) {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canEdit = userRole !== 'viewer';

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    const { data, error } = await supabase
      .from('categories')
      .insert({ workspace_id: workspaceId, name: newName.trim(), color: newColor })
      .select()
      .single();
    if (!error && data) {
      setCategories((prev) => [...prev, data as Category].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
      setNewColor(PRESET_COLORS[0]);
    }
    setAdding(false);
  }

  async function handleSaveEdit() {
    if (!editId || !editName.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('categories')
      .update({ name: editName.trim(), color: editColor })
      .eq('id', editId)
      .select()
      .single();
    if (!error && data) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editId ? (data as Category) : c)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditId(null);
    }
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? Products using it will become uncategorized.`)) return;
    setDeletingId(id);
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) setCategories((prev) => prev.filter((c) => c.id !== id));
    setDeletingId(null);
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Add category */}
      {canEdit && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-600" /> Add Category
          </h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="e.g. Electronics"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Color</label>
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={cn('w-7 h-7 rounded-lg transition ring-offset-1', newColor === c ? 'ring-2 ring-indigo-500 scale-110' : 'hover:scale-105')}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition text-sm flex items-center gap-1.5"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="h-4 w-4 text-indigo-600" /> Categories ({categories.length})
          </h3>
        </div>
        {categories.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <Tag className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No categories yet. Add one above to organize your products.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <li key={cat.id} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition">
                {editId === cat.id ? (
                  <>
                    <div className="flex gap-1 flex-shrink-0">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
                          className={cn('w-5 h-5 rounded transition', editColor === c ? 'ring-2 ring-indigo-500 scale-110' : '')}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                    <button onClick={handleSaveEdit} disabled={saving} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="flex-1 text-sm font-medium text-gray-900">{cat.name}</span>
                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={deletingId === cat.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
