'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';

export function CreateWorkspaceButton({ defaultName }: { defaultName?: string }) {
  const router = useRouter();
  const [name, setName] = useState(defaultName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!name.trim()) {
      setError('Please enter a workspace name');
      return;
    }
    setLoading(true);
    setError('');

    const res = await fetch('/api/workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(result.error || 'Failed to create workspace');
      return;
    }

    router.refresh();
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Workspace name"
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition mb-3"
      />
      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition text-sm"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Creating…</>
        ) : (
          <><Plus className="h-4 w-4" />Create Workspace</>
        )}
      </button>
    </div>
  );
}
