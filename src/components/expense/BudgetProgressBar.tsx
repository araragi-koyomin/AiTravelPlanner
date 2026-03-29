import { memo } from 'react'
import { type BudgetStatusType, STATUS_COLORS } from '@/types/expense'
import { cn } from '@/utils/cn'

interface BudgetProgressBarProps {
  percentage: number
  status: BudgetStatusType
  showLabel?: boolean
  animated?: boolean
  className?: string
}

export const BudgetProgressBar = memo(function BudgetProgressBar({
  percentage,
  status,
  showLabel = true,
  animated = true,
  className
}: BudgetProgressBarProps) {
  const bgColor = STATUS_COLORS[status]
  const displayPercentage = Math.min(percentage, 100)

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            预算使用
          </span>
        )}
        <span
          className="text-sm font-medium"
          style={{ color: bgColor }}
        >
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div
        className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"
        role="progressbar"
        aria-valuenow={displayPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all',
            animated && 'transition-all duration-500 ease-out'
          )}
          style={{
            width: `${displayPercentage}%`,
            backgroundColor: bgColor
          }}
        />
      </div>
    </div>
  )
})
