import { useMemo } from 'react'
import { RefreshCw, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { SyncStatus } from '@/types/sync'
import { SYNC_STATUS_INFO } from '@/types/sync'
import { useSyncStore } from '@/stores/syncStore'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface SyncStatusIndicatorProps {
  status?: SyncStatus
  lastSyncTime?: Date | null
  pendingCount?: number
  showLabel?: boolean
  showLastSync?: boolean
  className?: string
}

const iconMap = {
  sync: RefreshCw,
  check: Check,
  'alert-circle': AlertCircle
}

const colorMap = {
  blue: 'text-blue-500 bg-blue-50',
  green: 'text-green-500 bg-green-50',
  red: 'text-red-500 bg-red-50'
}

export function SyncStatusIndicator({
  status: propStatus,
  lastSyncTime: propLastSyncTime,
  showLabel = true,
  showLastSync = true,
  className
}: SyncStatusIndicatorProps) {
  const storeStatus = useSyncStore((state) => state.status)
  const storeLastSyncTime = useSyncStore((state) => state.lastSyncTime)

  const status = propStatus ?? storeStatus
  const lastSyncTime = propLastSyncTime ?? storeLastSyncTime

  const statusInfo = SYNC_STATUS_INFO[status]
  const IconComponent = iconMap[statusInfo.icon]
  const colorClasses = colorMap[statusInfo.color]

  const isSyncing = status === 'syncing'

  const lastSyncText = useMemo(() => {
    if (!showLastSync || !lastSyncTime) return null
    return formatDistanceToNow(lastSyncTime, {
      addSuffix: true,
      locale: zhCN
    })
  }, [lastSyncTime, showLastSync])

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full',
          colorClasses
        )}
        title={statusInfo.description}
      >
        <IconComponent
          className={cn('w-4 h-4', isSyncing && 'animate-spin')}
        />
      </div>

      <div className="flex flex-col">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {statusInfo.label}
          </span>
        )}
        {lastSyncText && status === 'synced' && (
          <span className="text-xs text-gray-500">
            上次同步: {lastSyncText}
          </span>
        )}
        {status === 'error' && (
          <span className="text-xs text-red-500">
            请检查网络连接
          </span>
        )}
      </div>
    </div>
  )
}

interface SyncStatusBadgeProps {
  status?: SyncStatus
  className?: string
}

export function SyncStatusBadge({
  status: propStatus,
  className
}: SyncStatusBadgeProps) {
  const storeStatus = useSyncStore((state) => state.status)
  const status = propStatus ?? storeStatus

  const statusInfo = SYNC_STATUS_INFO[status]
  const IconComponent = iconMap[statusInfo.icon]
  const colorClasses = colorMap[statusInfo.color]
  const isSyncing = status === 'syncing'

  return (
    <div
      className={cn(
        'flex items-center justify-center w-6 h-6 rounded-full',
        colorClasses,
        className
      )}
      title={statusInfo.description}
    >
      <IconComponent
        className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin')}
      />
    </div>
  )
}
