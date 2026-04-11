'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface Result {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  barcode: string | null;
}

export function GlobalSearch() {
  const router = useRouter();
  const supabase = createClient();
  const { workspace } = useWorkspace();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!workspace || q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    const { data } = await supabase
      .from('products')
      .select('id, name, sku, quantity, unit, barcode')
      .eq('workspace_id', workspace.id)
      .eq('is_active', true)
      .or(`name.ilike.%${q}%,sku.ilike.%${q}%,barcode.ilike.%${q}%`)
      .limit(8);

    setResults((data as Result[]) ?? []);
    setIsOpen(true);
    setIsLoading(false);
    setSelected(-1);
  }, [workspace, supabase]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 300);
  }

  function navigate(result: Result) {
    setIsOpen(false);
    setQuery('');
    router.push(`/dashboard/products?q=${encodeURIComponent(result.name)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { setIsOpen(false); return; }
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => (s < results.length - 1 ? s + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => (s > 0 ? s - 1 : results.length - 1));
    } else if (e.key === 'Enter' && selected >= 0) {
      e.preventDefault();
      navigate(results[selected]);
    }
  }

  return (
    <div ref={wrapperRef} className="relative hidden md:block">
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 w-56">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="Search products..."
          className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none w-full"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">Searching...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">No products found</div>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li key={r.id}>
                  <button
                    onClick={() => navigate(r)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm ${
                      i === selected ? 'bg-gray-50 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{r.name}</p>
                      <p className="text-xs text-gray-400 truncate">{r.sku}{r.barcode ? ` · ${r.barcode}` : ''}</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {r.quantity} {r.unit}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
