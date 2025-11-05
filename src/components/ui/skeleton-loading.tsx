/**
 * Skeleton Loading Components
 * Professional loading states for better UX
 */

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
          <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      </div>
      <div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      </div>
      <div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-2" />
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      </div>
      <div className="flex gap-4">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
