import { memo, useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { type CategoryExpense, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/expense'
import { formatCurrency } from '@/utils/expenseUtils'
import type { ExpenseCategory } from '@/services/supabase'

interface ExpensePieChartProps {
  data: CategoryExpense[]
  onCategoryClick?: (category: ExpenseCategory) => void
  showLegend?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CONFIG = {
  sm: { height: 200, outerRadius: 60, innerRadius: 30 },
  md: { height: 280, outerRadius: 100, innerRadius: 60 },
  lg: { height: 350, outerRadius: 120, innerRadius: 80 }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: CategoryExpense & { fill: string }
  }>
}

const CustomTooltip = memo(function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) return null

  const data = payload[0].payload
  const label = CATEGORY_LABELS[data.category] || data.category

  return (
    <div className="bg-white px-3 py-2 shadow-lg rounded-lg border">
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">
        金额: {formatCurrency(data.amount)}
      </p>
      <p className="text-sm text-gray-600">
        占比: {data.percentage.toFixed(1)}%
      </p>
    </div>
  )
})

interface LegendContentProps {
  payload?: Array<{
    value: string
    color: string
    payload: {
      strokeDasharray: string
      fill: string
    }
  }>
}

const CustomLegend = memo(function LegendContent({ payload }: LegendContentProps) {
  if (!payload) return null

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-2">
      {payload.map((entry, index) => (
        <div
          key={`legend-${index}`}
          className="flex items-center gap-1.5 text-sm"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  )
})

export const ExpensePieChart = memo(function ExpensePieChart({
  data,
  onCategoryClick,
  showLegend = true,
  size = 'md',
  className
}: ExpensePieChartProps) {
  const config = SIZE_CONFIG[size]

  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      fill: CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other,
      label: CATEGORY_LABELS[item.category] || item.category
    }))
  }, [data])

  if (data.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-48 text-gray-400">
          暂无支出数据
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={config.height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={config.innerRadius}
            outerRadius={config.outerRadius}
            paddingAngle={2}
            dataKey="amount"
            nameKey="label"
            className="cursor-pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                stroke="white"
                strokeWidth={2}
                onClick={() => onCategoryClick?.(entry.category)}
                className="cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              content={<CustomLegend />}
              formatter={(value: string) => value}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {data.map(item => (
          <div
            key={item.category}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onCategoryClick?.(item.category)}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
              />
              <span className="text-sm text-gray-700">
                {CATEGORY_LABELS[item.category]}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(item.amount)}
              </span>
              <span className="text-xs text-gray-500 w-12 text-right">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
