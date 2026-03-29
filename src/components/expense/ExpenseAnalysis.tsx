import { memo } from 'react'
import { TrendingUp, TrendingDown, Calendar, Tag, Lightbulb } from 'lucide-react'
import { type ExpenseAnalysisReport, CATEGORY_LABELS } from '@/types/expense'
import { formatCurrency } from '@/utils/expenseUtils'
import { cn } from '@/utils/cn'

interface ExpenseAnalysisProps {
  report: ExpenseAnalysisReport
  className?: string
}

export const ExpenseAnalysis = memo(function ExpenseAnalysis({
  report,
  className
}: ExpenseAnalysisProps) {
  const {
    totalSpent,
    averageDaily,
    highestDay,
    highestCategory,
    budgetStatus,
    recommendations
  } = report

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">费用分析报告</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-blue-600">总支出</span>
          </div>
          <p className="text-lg font-bold text-blue-700">
            {formatCurrency(totalSpent)}
          </p>
        </div>

        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-600">日均支出</span>
          </div>
          <p className="text-lg font-bold text-green-700">
            {formatCurrency(averageDaily)}
          </p>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-purple-600">最高消费日</span>
          </div>
          {highestDay ? (
            <>
              <p className="text-lg font-bold text-purple-700">
                {formatCurrency(highestDay.amount)}
              </p>
              <p className="text-xs text-purple-500">{highestDay.date}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">暂无数据</p>
          )}
        </div>

        <div className="p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-orange-600">最高消费分类</span>
          </div>
          {highestCategory ? (
            <>
              <p className="text-lg font-bold text-orange-700">
                {formatCurrency(highestCategory.amount)}
              </p>
              <p className="text-xs text-orange-500">
                {CATEGORY_LABELS[highestCategory.category]}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">暂无数据</p>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          <h4 className="text-sm font-medium text-gray-700">消费建议</h4>
        </div>
        <ul className="space-y-2">
          {recommendations.map((recommendation, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-gray-600"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                {index + 1}
              </span>
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {budgetStatus.status !== 'safe' && (
        <div
          className={cn(
            'mt-4 p-3 rounded-lg',
            budgetStatus.status === 'danger' ? 'bg-red-50' : 'bg-yellow-50'
          )}
        >
          <p
            className={cn(
              'text-sm font-medium',
              budgetStatus.status === 'danger' ? 'text-red-700' : 'text-yellow-700'
            )}
          >
            {budgetStatus.status === 'danger'
              ? `预算已超支 ${formatCurrency(Math.abs(budgetStatus.remaining))}`
              : `预算使用已达 ${budgetStatus.percentage.toFixed(0)}%`
            }
          </p>
        </div>
      )}
    </div>
  )
})
