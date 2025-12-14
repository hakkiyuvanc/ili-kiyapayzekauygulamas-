export function DashboardSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>
        <div className="h-10 w-24 bg-slate-200 rounded-xl" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-slate-50 rounded-xl">
            <div className="h-4 w-4 bg-slate-200 rounded mb-2" />
            <div className="h-6 w-12 bg-slate-200 rounded mb-1" />
            <div className="h-3 w-16 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* CTA Skeleton */}
      <div className="h-32 bg-slate-200 rounded-2xl mb-6" />

      {/* Recent Analyses Skeleton */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-6 w-12 bg-slate-200 rounded-full" />
            </div>
            <div className="h-3 w-full bg-slate-200 rounded mb-2" />
            <div className="h-3 w-3/4 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function InsightsSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-8 bg-slate-200 rounded-xl" />
        <div className="h-6 w-32 bg-slate-200 rounded-lg" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-slate-200 rounded-xl" />
          <div className="h-8 w-8 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* Score Card */}
      <div className="h-32 bg-slate-200 rounded-2xl mb-6" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 h-10 bg-slate-200 rounded-lg" />
        <div className="flex-1 h-10 bg-slate-200 rounded-lg" />
      </div>

      {/* Radar Chart */}
      <div className="h-64 bg-slate-100 rounded-2xl mb-6" />

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-slate-50 rounded-xl">
            <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
            <div className="h-6 w-16 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalysisFormSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 min-h-[600px] flex flex-col animate-pulse">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="h-10 w-10 bg-slate-200 rounded-xl mr-2" />
        <div className="space-y-2">
          <div className="h-6 w-32 bg-slate-200 rounded" />
          <div className="h-3 w-48 bg-slate-200 rounded" />
        </div>
      </div>

      {/* Form Fields */}
      <div className="flex-1 space-y-4">
        <div>
          <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
          <div className="h-12 bg-slate-100 rounded-xl" />
        </div>
        <div>
          <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </div>

      {/* Submit Button */}
      <div className="h-14 bg-slate-200 rounded-2xl mt-4" />
    </div>
  );
}
