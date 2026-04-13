export default function PurchaseOrdersLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-40" />
        <div className="h-10 bg-gray-200 rounded w-36" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['PO #', 'Supplier', 'Status', 'Date', 'Total', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                  <td className="px-4 py-4"><div className="h-5 bg-gray-200 rounded-full w-20" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
