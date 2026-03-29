import { memo, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts'
import { type DailyExpense, STATUS_COLORS } from '@/types/expense'
import { formatCurrency } from '@/utils/expenseUtils'
import { cn } from '@/utils/cn'

interface ExpenseBarChartProps {
  data: DailyExpense[]
  onBarClick?: (date: string) => void
  showAverageLine?: boolean
  height?: number
  className?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: DailyExpense
  }>
  label?: string
}

const CustomTooltip = memo(function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) return null

  const data = payload[0].payload

  return (
    <div className="bg-white px-3 py-2 shadow-lg rounded-lg border">
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">
        支出: {formatCurrency(data.amount)}
      </p>
      <p className="text-sm text-gray-600">
        记录数: {data.count} 笔
      </p>
    </div>
  )
})

export const ExpenseBarChart = memo(function ExpenseBarChart({
  data,
  onBarClick,
  showAverageLine = true,
  height = 300,
  className
}: ExpenseBarChartProps) {
  const averageAmount = useMemo(() => {
    if (data.length === 0) return 0
    const total = data.reduce((sum, item) => sum + item.amount, 0)
    return total / data.length
  }, [data])

  const maxAmount = useMemo(() => {
    if (data.length === 0) return 0
    return Math.max(...data.map(d => d.amount))
  }, [data])

  const getBarColor = (amount: number) => {
    if (maxAmount === 0) return STATUS_COLORS.safe
    const ratio = amount / maxAmount
    if (ratio > 0.7) return STATUS_COLORS.danger
    if (ratio > 0.4) return STATUS_COLORS.warning
    return STATUS_COLORS.safe
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  if (data.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-48 text-gray-400">
          暂无每日支出数据
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border p-4', className)}>
      <h4 className="text-sm font-medium text-gray-700 mb-4">每日支出趋势</h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `¥${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          {showAverageLine && averageAmount > 0 && (
            <ReferenceLine
              y={averageAmount}
              stroke="#9CA3AF"
              strokeDasharray="5 5"
              label={{
                value: `日均 ¥${averageAmount.toFixed(0)}`,
                position: 'right',
                fill: '#6b7280',
                fontSize: 11
              }}
            />
          )}
          <Bar
            dataKey="amount"
            radius={[4, 4, 0, 0]}
            className="cursor-pointer"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.amount)}
                onClick={() => onBarClick?.(entry.date)}
                className="cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
})
