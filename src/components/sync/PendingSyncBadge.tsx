import { Cloud } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useSyncStore } from '@/stores/syncStore'

interface PendingSyncBadgeProps {
  className?: string
}

export function PendingSyncBadge({ className }: PendingSyncBadgeProps) {
  const pendingOperations = useSyncStore((state) => state.pendingOperations)

  if (pendingOperations.length === 0) return null

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700',
        className
      )}
    >
      <Cloud className="w-3 h-3" />
      <span>{pendingOperations.length} 个操作待同步</span>
    </div>
  )
}

interface SyncQueueStatusProps {
  className?: string
}

export function SyncQueueStatus({ className }: SyncQueueStatusProps) {
  const pendingOperations = useSyncStore((state) => state.pendingOperations)

  if (pendingOperations.length === 0) return null

  const groupedOperations = pendingOperations.reduce((acc, op) => {
    const key = `${op.table}:${op.type}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const operationLabels: Record<string, string> = {
    'itineraries:create': '新建行程',
    'itineraries:update': '更新行程',
    'itineraries:delete': '删除行程',
    'itinerary_items:create': '新建行程项',
    'itinerary_items:update': '更新行程项',
    'itinerary_items:delete': '删除行程项',
    'expenses:create': '新建费用',
    'expenses:update': '更新费用',
    'expenses:delete': '删除费用'
  }

  return (
    <div
      className={cn(
        'p-3 rounded-lg border bg-blue-50 border-blue-200',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Cloud className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium">
          待同步操作 ({pendingOperations.length})
        </span>
      </div>
      <ul className="space-y-1">
        {Object.entries(groupedOperations).map(([key, count]) => (
          <li
            key={key}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-gray-600">
              {operationLabels[key] || key}
            </span>
            <span className="font-medium">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
