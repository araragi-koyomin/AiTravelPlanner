import { memo } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { type ExpenseCategory, CATEGORY_LABELS } from '@/types/expense'
import { formatCurrency } from '@/utils/expenseUtils'
import { cn } from '@/utils/cn'

interface OverBudgetAlertProps {
  type: 'total' | 'category'
  budget: number
  spent: number
  category?: ExpenseCategory
  onDismiss?: () => void
  className?: string
}

export const OverBudgetAlert = memo(function OverBudgetAlert({
  type,
  budget,
  spent,
  category,
  onDismiss,
  className
}: OverBudgetAlertProps) {
  const overAmount = spent - budget
  const overPercentage = ((spent - budget) / budget) * 100

  const getTitle = () => {
    if (type === 'total') {
      return '总预算超支提醒'
    }
    return `${CATEGORY_LABELS[category!] || category}预算超支`
  }

  const getMessage = () => {
    if (type === 'total') {
      return `您的旅行总预算已超支 ${formatCurrency(overAmount)}，超支比例 ${overPercentage.toFixed(1)}%`
    }
    return `${CATEGORY_LABELS[category!] || category}支出已超出预算 ${formatCurrency(overAmount)}，建议控制后续支出`
  }

  return (
    <div
      className={cn(
        'bg-red-50 border border-red-200 rounded-lg p-4',
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-red-800">
            {getTitle()}
          </h4>
          <p className="mt-1 text-sm text-red-700">
            {getMessage()}
          </p>
          <div className="mt-2 flex items-center gap-4 text-xs text-red-600">
            <span>预算: {formatCurrency(budget)}</span>
            <span>已支出: {formatCurrency(spent)}</span>
          </div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-red-100 transition-colors"
            aria-label="关闭提醒"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>
    </div>
  )
})

interface OverBudgetAlertListProps {
  budgetStatus: {
    budget: number
    spent: number
    status: 'safe' | 'warning' | 'danger'
  }
  categoryBreakdown: Array<{
    category: ExpenseCategory
    amount: number
    budget?: number
    isOverBudget?: boolean
  }>
  onDismiss?: () => void
  className?: string
}

export const OverBudgetAlertList = memo(function OverBudgetAlertList({
  budgetStatus,
  categoryBreakdown,
  onDismiss,
  className
}: OverBudgetAlertListProps) {
  const hasTotalOverBudget = budgetStatus.status === 'danger'
  const overBudgetCategories = categoryBreakdown.filter(c => c.isOverBudget)

  if (!hasTotalOverBudget && overBudgetCategories.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      {hasTotalOverBudget && (
        <OverBudgetAlert
          type="total"
          budget={budgetStatus.budget}
          spent={budgetStatus.spent}
          onDismiss={onDismiss}
        />
      )}
      {overBudgetCategories.map(item => (
        <OverBudgetAlert
          key={item.category}
          type="category"
          budget={item.budget!}
          spent={item.amount}
          category={item.category}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
})
