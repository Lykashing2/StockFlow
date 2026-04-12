import { DashboardShell } from '@/components/layout/DashboardShell';

export default function ReportsLoading() {
  return (
    <DashboardShell title="Reports">
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-gray-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-white rounded-xl border border-gray-200" />
          <div className="h-72 bg-white rounded-xl border border-gray-200" />
        </div>
      </div>
    </DashboardShell>
  );
}
