import { memo } from 'react'
import { Wallet, TrendingDown, TrendingUp } from 'lucide-react'
import { BudgetProgressBar } from './BudgetProgressBar'
import { type BudgetStatus, STATUS_COLORS } from '@/types/expense'
import { formatCurrency, getBudgetStatusText } from '@/utils/expenseUtils'
import { cn } from '@/utils/cn'

interface BudgetOverviewProps {
  budgetStatus: BudgetStatus
  currency?: string
  showDetails?: boolean
  className?: string
}

export const BudgetOverview = memo(function BudgetOverview({
  budgetStatus,
  currency = '¥',
  showDetails = true,
  className
}: BudgetOverviewProps) {
  const { budget, spent, remaining, percentage, status } = budgetStatus
  const statusColor = STATUS_COLORS[status]
  const isOverBudget = remaining < 0

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border p-6', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">预算概览</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">总预算</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(budget, currency)}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">已支出</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(spent, currency)}
          </p>
        </div>

        <div
          className={cn(
            'p-4 rounded-lg',
            isOverBudget ? 'bg-red-50' : 'bg-gray-50'
          )}
        >
          <div className="flex items-center gap-1">
            <p className="text-sm text-gray-500 mb-1">剩余预算</p>
            {isOverBudget && (
              <TrendingUp className="w-4 h-4 text-red-500" />
            )}
          </div>
          <p
            className={cn(
              'text-2xl font-bold',
              isOverBudget ? 'text-red-600' : 'text-gray-900'
            )}
          >
            {formatCurrency(Math.abs(remaining), currency)}
            {isOverBudget && <span className="text-sm ml-1">超支</span>}
          </p>
        </div>
      </div>

      <BudgetProgressBar
        percentage={percentage}
        status={status}
        showLabel={true}
      />

      {showDetails && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: statusColor }}
            >
              {getBudgetStatusText(status)}
            </span>
          </div>

          {!isOverBudget && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <TrendingDown className="w-4 h-4 text-green-500" />
              <span>还可支出 {formatCurrency(remaining, currency)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
})
