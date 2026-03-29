import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExpenseAnalysis } from './ExpenseAnalysis'
import { createMockExpenseAnalysisReport, createMockBudgetStatus } from '@/test/factories/expenseFactory'

describe('ExpenseAnalysis', () => {
  describe('渲染测试', () => {
    it('应该正常渲染分析报告', () => {
      const report = createMockExpenseAnalysisReport()
      render(<ExpenseAnalysis report={report} />)

      expect(screen.getByText('费用分析报告')).toBeInTheDocument()
    })

    it('应该显示报告标题', () => {
      const report = createMockExpenseAnalysisReport()
      render(<ExpenseAnalysis report={report} />)

      expect(screen.getByText('费用分析报告')).toBeInTheDocument()
    })
  })

  describe('统计卡片测试', () => {
    it('应该显示总支出', () => {
      const report = createMockExpenseAnalysisReport({ totalSpent: 5000 })
      render(<ExpenseAnalysis report={report} />)

      expect(screen.getByText('总支出')).toBeInTheDocument()
      expect(screen.getByText('¥5,000')).toBeInTheDocument()
    })

    it('应该显示日均支出', () => {
      const report = createMockExpenseAnalysisReport({ averageDaily: 1666.67 })
      render(<ExpenseAnalysis report={report} />)

      expect(screen.getByText('日均支出')).toBeInTheDocument()
      expect(screen.getByText('¥1,666.67')).toBeInTheDocument()
    })

    it('应该显示最高消费日', () => {
      const report = createMockExpenseAnalysisReport({
        highestDay: { date: '2024-03-03', amount: 1200 }
      })
      render(<ExpenseAnalysis report={report} />)

      expect(screen.getByText('最高消费日')).toBeInTheDocument()
      expect(screen.getByText('¥1,200')).toBeInTheDocument()
      expect(screen.getByText('2024-03-03')).toBeInTheDocument()
    })

    it('应该显示最高消费分类', () => {
      const report = createMockExpenseAnalysisReport({
        highestCategory: { category: 'transport', amount: 2000 }
      })
      render(<ExpenseAnalysis report={report} />)

      expect(screen.getByText('最高消费分类')).toBeInTheDocument()
      expect(screen.getByText('¥2,000')).toBeInTheDocument()
      expect(screen.getByText('交通')).toBeInTheDocument()
    })
  })

  describe('空数据处理测试', () => {
    it('highestDay 为 null 时应该显示暂无数据', () => {
      const report = createMockExpenseAnalysisReport({ highestDay: null })
      render(<ExpenseAnalysis report={report} />)

      const cards = screen.getAllByText('暂无数据')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('highestCategory 为 null 时应该显示暂无数据', () => {
      const report = createMockExpenseAnalysisReport({ highestCategory: null })
      render(<ExpenseAnalysis report={report} />)

      const cards = screen.getAllByText('暂无数据')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('highestDay 和 highestCategory 都为 null 时应该显示两个暂无数据', () => {
      const report = createMockExpenseAnalysisReport({
        highestDay: null,
        highestCategory: null
      })
      render(<ExpenseAnalysis report={report} />)

      const cards = screen.getAllByText('暂无数据')
      expect(cards).toHaveLength(2)
    })
  })

  describe('建议显示测试', () => {
    it('应该显示消费建议标题', () => {
      const report = createMockExpenseAnalysisReport()
      render(<ExpenseAnalysis report={report} />)

      expect(screen.getByText('消费建议')).toBeInTheDocument()
    })

    it('应该显示所有建议', () => {
      const recommendations = [
        '建议1：控制交通支出',
        '建议2：关注餐饮消费',
        '建议3：合理安排住宿'
      ]
      const report = createMockExpenseAnalysisReport({ recommendations })
      render(<ExpenseAnalysis report={report} />)

      expect(screen.getByText('建议1：控制交通支出')).toBeInTheDocument()
      expect(screen.getByText('建议2：关注餐饮消费')).toBeInTheDocument()
      expect(screen.getByText('建议3：合理安排住宿')).toBeInTheDocument()
    })

    it('建议应该有编号', () => {
      const recommendations = ['建议一', '建议二']
      const report = createMockExpenseAnalysisReport({ recommendations })
      render(<ExpenseAnalysis report={report} />)

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('预算状态测试', () => {
    it('status="danger" 时应该显示红色提示', () => {
      const report = createMockExpenseAnalysisReport({
        budgetStatus: createMockBudgetStatus({
          status: 'danger',
          remaining: -2000
        })
      })
      render(<ExpenseAnalysis report={report} />)

      expect(screen.getByText(/预算已超支/)).toBeInTheDocument()
    })

    it('status="warning" 时应该显示黄色提示', () => {
      const report = createMockExpenseAnalysisReport({
        budgetStatus: createMockBudgetStatus({
          status: 'warning',
          percentage: 75
        })
      })
      render(<ExpenseAnalysis report={report} />)

      expect(screen.getByText(/预算使用已达/)).toBeInTheDocument()
    })

    it('status="safe" 时不应该显示额外提示', () => {
      const report = createMockExpenseAnalysisReport({
        budgetStatus: createMockBudgetStatus({ status: 'safe' })
      })
      render(<ExpenseAnalysis report={report} />)

      expect(screen.queryByText(/预算已超支/)).not.toBeInTheDocument()
      expect(screen.queryByText(/预算使用已达/)).not.toBeInTheDocument()
    })
  })

  describe('自定义类名测试', () => {
    it('应该支持自定义 className', () => {
      const report = createMockExpenseAnalysisReport()
      const { container } = render(
        <ExpenseAnalysis report={report} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
