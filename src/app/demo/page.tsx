'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Package, DollarSign, AlertTriangle, TrendingDown,
  LayoutDashboard, Tag, ClipboardList, Bell, Users,
  Settings, FileBarChart, Truck, ShoppingCart, LogOut,
  Menu, X, ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Sample data ──────────────────────────────────────────

const DEMO_STATS = {
  totalProducts: 48,
  totalValue: 127450,
  lowStockCount: 7,
  outOfStockCount: 2,
};

const DEMO_PRODUCTS = [
  { id: '1', name: 'MacBook Pro 14"', sku: 'ELEC-001', quantity: 23, category: 'Electronics', price: 1999 },
  { id: '2', name: 'iPhone 15 Pro', sku: 'ELEC-002', quantity: 45, category: 'Electronics', price: 1199 },
  { id: '3', name: 'AirPods Pro', sku: 'ELEC-003', quantity: 120, category: 'Accessories', price: 249 },
  { id: '4', name: 'Magic Keyboard', sku: 'ELEC-004', quantity: 67, category: 'Accessories', price: 99 },
  { id: '5', name: 'USB-C Hub', sku: 'ACC-001', quantity: 3, category: 'Accessories', price: 59 },
  { id: '6', name: 'Wireless Mouse', sku: 'ACC-002', quantity: 0, category: 'Accessories', price: 79 },
  { id: '7', name: 'Monitor Stand', sku: 'FURN-001', quantity: 4, category: 'Furniture', price: 149 },
  { id: '8', name: 'Desk Lamp', sku: 'FURN-002', quantity: 15, category: 'Furniture', price: 45 },
];

const DEMO_ACTIVITY = [
  { id: '1', product: 'MacBook Pro 14"', change: +5, user: 'Sopheak Keo', time: '2 min ago' },
  { id: '2', product: 'iPhone 15 Pro', change: -12, user: 'Dara Phan', time: '15 min ago' },
  { id: '3', product: 'AirPods Pro', change: +30, user: 'Sopheak Keo', time: '1 hour ago' },
  { id: '4', product: 'USB-C Hub', change: -8, user: 'Visal Chea', time: '3 hours ago' },
  { id: '5', product: 'Wireless Mouse', change: -5, user: 'Dara Phan', time: 'Yesterday' },
];

const DEMO_LOW_STOCK = [
  { id: '5', name: 'USB-C Hub', sku: 'ACC-001', quantity: 3, threshold: 10 },
  { id: '7', name: 'Monitor Stand', sku: 'FURN-001', quantity: 4, threshold: 10 },
  { id: '6', name: 'Wireless Mouse', sku: 'ACC-002', quantity: 0, threshold: 5 },
];

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Products', icon: Package },
  { label: 'Categories', icon: Tag },
  { label: 'Inventory', icon: ClipboardList },
  { label: 'Suppliers', icon: Truck },
  { label: 'Purchase Orders', icon: ShoppingCart },
  { label: 'Low Stock Alerts', icon: Bell, badge: '!' },
  { label: 'Reports', icon: FileBarChart },
  { label: 'Team', icon: Users },
  { label: 'Settings', icon: Settings },
];

// ── Components ───────────────────────────────────────────

function DemoSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-slate-900 z-30 flex flex-col transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-600 rounded-lg"><Package className="h-5 w-5 text-white" /></div>
            <span className="text-white font-bold text-lg">StockFlow</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="px-3 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <span className="text-slate-200 text-sm font-medium">Demo Workspace</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, icon: Icon, active, badge }) => (
            <button
              key={label}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
              {badge && <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700">
          <Link href="/auth/signup" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 transition">
            <LogOut className="h-4 w-4" />Sign up for free
          </Link>
        </div>
      </aside>
    </>
  );
}

function StatCard({ title, value, icon: Icon, iconColor, iconBg, subtitle }: {
  title: string; value: string; icon: typeof Package; iconColor: string; iconBg: string; subtitle: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <div className={cn('p-2 rounded-lg', iconBg)}><Icon className={cn('h-4 w-4', iconColor)} /></div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────

export default function DemoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DemoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Demo banner */}
        <div className="bg-indigo-600 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-3">
          <span>You&apos;re viewing StockFlow in demo mode</span>
          <Link href="/auth/signup" className="px-3 py-1 bg-white text-indigo-600 rounded-md text-xs font-bold hover:bg-indigo-50 transition">
            Sign up free
          </Link>
        </div>

        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              DU
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard title="Total Products" value="48" icon={Package} iconColor="text-indigo-600" iconBg="bg-indigo-100" subtitle="Active SKUs" />
              <StatCard title="Inventory Value" value="$127,450" icon={DollarSign} iconColor="text-emerald-600" iconBg="bg-emerald-100" subtitle="At cost price" />
              <StatCard title="Low Stock" value="7" icon={AlertTriangle} iconColor="text-amber-600" iconBg="bg-amber-100" subtitle="Need restock soon" />
              <StatCard title="Out of Stock" value="2" icon={TrendingDown} iconColor="text-red-600" iconBg="bg-red-100" subtitle="Immediate action needed" />
            </div>

            {/* Chart placeholder + Low stock */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Stock Movement (Last 7 Days)</h3>
                <div className="h-48 flex items-end gap-3 px-4">
                  {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-0.5">
                        <div className="flex-1 bg-indigo-500 rounded-t" style={{ height: `${h * 1.8}px` }} />
                        <div className="flex-1 bg-rose-400 rounded-t" style={{ height: `${h * 0.8}px` }} />
                      </div>
                      <span className="text-xs text-gray-400">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-indigo-500 rounded" /> Added</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-rose-400 rounded" /> Removed</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
                <div className="space-y-3">
                  {DEMO_LOW_STOCK.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.sku}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-900">{p.quantity}</span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          p.quantity === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        )}>
                          {p.quantity === 0 ? 'Out' : 'Low'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity + Top products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {DEMO_ACTIVITY.map((log) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{log.product}</span>{' '}
                          <span className="text-gray-500">—</span>{' '}
                          <span className={log.change > 0 ? 'text-emerald-600' : 'text-red-600'}>
                            {log.change > 0 ? '+' : ''}{log.change} units
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{log.user} · {log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Top Products by Stock</h3>
                <div className="space-y-3">
                  {DEMO_PRODUCTS.slice(0, 5).map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-5 text-right">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                          <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{p.quantity}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(p.quantity / 120) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products table preview */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Products</h3>
                <span className="text-xs text-gray-400">{DEMO_PRODUCTS.length} items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {DEMO_PRODUCTS.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                        <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{p.category}</span></td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn('font-semibold', p.quantity === 0 ? 'text-red-600' : p.quantity < 5 ? 'text-amber-600' : 'text-gray-900')}>
                            {p.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">${p.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-2">Ready to manage your inventory?</h2>
              <p className="text-indigo-100 mb-6">Sign up free and start tracking your stock in under 2 minutes.</p>
              <Link href="/auth/signup" className="inline-flex px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition text-sm">
                Get started free
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
