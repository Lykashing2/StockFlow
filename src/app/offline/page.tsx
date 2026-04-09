import { Package, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <Package className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">StockFlow</span>
        </div>
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <WifiOff className="h-8 w-8 text-slate-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">You&apos;re offline</h1>
        <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
          Check your internet connection. Some features may be available from cache.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition text-sm"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
