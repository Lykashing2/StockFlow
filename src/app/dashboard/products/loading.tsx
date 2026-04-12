import { DashboardShell } from '@/components/layout/DashboardShell';

export default function ProductsLoading() {
  return (
    <DashboardShell title="Products">
      <div className="space-y-4 animate-pulse">
        <div className="flex gap-3">
          <div className="flex-1 h-11 bg-gray-200 rounded-lg" />
          <div className="h-11 w-32 bg-gray-200 rounded-lg" />
          <div className="h-11 w-32 bg-gray-200 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="h-12 bg-gray-50 border-b" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 border-b border-gray-100 px-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
