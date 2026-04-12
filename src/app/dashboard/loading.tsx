export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex w-64 bg-slate-900 flex-col flex-shrink-0">
        <div className="px-4 py-5 border-b border-slate-700">
          <div className="h-8 w-32 bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="px-3 py-4 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-9 bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </aside>
      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-6">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </header>
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse" />
            ))}
          </div>
          {/* Chart + panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse" />
            <div className="h-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse" />
          </div>
        </main>
      </div>
    </div>
  );
}
