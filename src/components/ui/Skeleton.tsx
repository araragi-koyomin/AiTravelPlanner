import { cn } from '@/utils/cn'

export interface SkeletonProps {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  )
}

function ItineraryCardSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-4 w-1/2" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  )
}

function ItineraryDetailSkeleton() {
  return (
    <div className="container py-12">
      <Skeleton className="mb-4 h-9 w-20" />
      <Skeleton className="mb-2 h-9 w-1/3" />
      <Skeleton className="mb-8 h-5 w-1/4" />

      <div className="mb-8 rounded-lg border bg-white p-6">
        <Skeleton className="mb-4 h-6 w-24" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-7 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-lg border bg-white p-6">
            <Skeleton className="mb-4 h-6 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ItinerariesPageSkeleton() {
  return (
    <div className="container py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="mt-2 h-5 w-40" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <ItineraryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export { Skeleton, ItineraryCardSkeleton, ItineraryDetailSkeleton, ItinerariesPageSkeleton }
