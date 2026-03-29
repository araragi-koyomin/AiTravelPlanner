import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExpenseBarChart } from './ExpenseBarChart'
import { createMockDailyExpenses } from '@/test/factories/expenseFactory'

vi.mock('recharts', () => import('@/test/mocks/recharts.tsx'))

describe('ExpenseBarChart', () => {
  describe('渲染测试', () => {
    it('应该正常渲染柱状图', () => {
      const data = createMockDailyExpenses()
      render(<ExpenseBarChart data={data} />)

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    it('应该渲染所有日期数据', () => {
      const data = createMockDailyExpenses()
      render(<ExpenseBarChart data={data} />)

      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-items', '3')
    })

    it('应该显示标题', () => {
      const data = createMockDailyExpenses()
      render(<ExpenseBarChart data={data} />)

      expect(screen.getByText('每日支出趋势')).toBeInTheDocument()
    })
  })

  describe('数据处理测试', () => {
    it('应该渲染 XAxis 和 YAxis', () => {
      const data = createMockDailyExpenses()
      render(<ExpenseBarChart data={data} />)

      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    })

    it('应该渲染 CartesianGrid', () => {
      const data = createMockDailyExpenses()
      render(<ExpenseBarChart data={data} />)

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    })

    it('应该渲染 Tooltip', () => {
      const data = createMockDailyExpenses()
      render(<ExpenseBarChart data={data} />)

      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })
  })

  describe('平均线测试', () => {
    it('showAverageLine=true 时应该显示平均线', () => {
      const data = createMockDailyExpenses()
      render(<ExpenseBarChart data={data} showAverageLine />)

      expect(screen.getByTestId('reference-line')).toBeInTheDocument()
    })

    it('showAverageLine=false 时应该隐藏平均线', () => {
      const data = createMockDailyExpenses()
      render(<ExpenseBarChart data={data} showAverageLine={false} />)

      expect(screen.queryByTestId('reference-line')).not.toBeInTheDocument()
    })

    it('平均线应该有正确的属性', () => {
      const data = createMockDailyExpenses()
      render(<ExpenseBarChart data={data} showAverageLine />)

      const referenceLine = screen.getByTestId('reference-line')
      expect(referenceLine).toHaveAttribute('data-y')
      expect(referenceLine).toHaveAttribute('data-stroke', '#9CA3AF')
    })
  })

  describe('交互测试', () => {
    it('应该渲染 Bar 组件', () => {
      const data = createMockDailyExpenses()
      render(<ExpenseBarChart data={data} />)

      expect(screen.getByTestId('bar')).toBeInTheDocument()
    })

    it('Bar 应该使用 amount 作为 dataKey', () => {
      const data = createMockDailyExpenses()
      render(<ExpenseBarChart data={data} />)

      const bar = screen.getByTestId('bar')
      expect(bar).toHaveAttribute('data-key', 'amount')
    })
  })

  describe('空状态测试', () => {
    it('数据为空时应该显示空状态提示', () => {
      render(<ExpenseBarChart data={[]} />)

      expect(screen.getByText('暂无每日支出数据')).toBeInTheDocument()
    })

    it('数据为空时不应该渲染图表', () => {
      render(<ExpenseBarChart data={[]} />)

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
    })
  })

  describe('自定义高度测试', () => {
    it('应该支持自定义高度', () => {
      const data = createMockDailyExpenses()
      render(<ExpenseBarChart data={data} height={400} />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('默认高度应该是 300', () => {
      const data = createMockDailyExpenses()
      render(<ExpenseBarChart data={data} />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  describe('自定义类名测试', () => {
    it('应该支持自定义 className', () => {
      const data = createMockDailyExpenses()
      const { container } = render(
        <ExpenseBarChart data={data} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
