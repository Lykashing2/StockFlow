import { DashboardShell } from '@/components/layout/DashboardShell';

export default function InventoryLoading() {
  return (
    <DashboardShell title="Inventory Log">
      <div className="space-y-4 animate-pulse">
        <div className="flex gap-3">
          <div className="flex-1 h-11 bg-gray-200 rounded-lg" />
          <div className="h-11 w-32 bg-gray-200 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-gray-100 px-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
