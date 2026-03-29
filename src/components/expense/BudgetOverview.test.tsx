import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BudgetOverview } from './BudgetOverview'
import { createMockBudgetStatus } from '@/test/factories/expenseFactory'

describe('BudgetOverview', () => {
  describe('渲染测试', () => {
    it('应该正常渲染组件', () => {
      const budgetStatus = createMockBudgetStatus()
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText('预算概览')).toBeInTheDocument()
    })

    it('应该显示预算概览标题', () => {
      const budgetStatus = createMockBudgetStatus()
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText('预算概览')).toBeInTheDocument()
    })

    it('应该显示总预算金额', () => {
      const budgetStatus = createMockBudgetStatus({ budget: 10000 })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText('总预算')).toBeInTheDocument()
      expect(screen.getByText('¥10,000')).toBeInTheDocument()
    })

    it('应该显示已支出金额', () => {
      const budgetStatus = createMockBudgetStatus({ spent: 5000, remaining: 5000, budget: 10000 })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText('已支出')).toBeInTheDocument()
      const amounts = screen.getAllByText('¥5,000')
      expect(amounts.length).toBeGreaterThan(0)
    })

    it('应该显示剩余预算金额', () => {
      const budgetStatus = createMockBudgetStatus({ remaining: 5000 })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText('剩余预算')).toBeInTheDocument()
      const amounts = screen.getAllByText('¥5,000')
      expect(amounts.length).toBeGreaterThan(0)
    })
  })

  describe('预算状态测试', () => {
    it('预算充足时应该显示绿色状态', () => {
      const budgetStatus = createMockBudgetStatus({ status: 'safe' })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText('预算充足')).toBeInTheDocument()
    })

    it('预算紧张时应该显示黄色状态', () => {
      const budgetStatus = createMockBudgetStatus({ status: 'warning' })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText('预算紧张')).toBeInTheDocument()
    })

    it('预算超支时应该显示红色状态', () => {
      const budgetStatus = createMockBudgetStatus({ status: 'danger' })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText('预算超支')).toBeInTheDocument()
    })

    it('超支时应该显示超支标识', () => {
      const budgetStatus = createMockBudgetStatus({
        spent: 12000,
        remaining: -2000,
        status: 'danger'
      })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText('超支')).toBeInTheDocument()
    })

    it('超支时剩余预算区域应该有红色背景', () => {
      const budgetStatus = createMockBudgetStatus({
        remaining: -2000,
        status: 'danger'
      })
      const { container } = render(<BudgetOverview budgetStatus={budgetStatus} />)

      const redBackground = container.querySelector('.bg-red-50')
      expect(redBackground).toBeInTheDocument()
    })
  })

  describe('进度条测试', () => {
    it('应该渲染 BudgetProgressBar 组件', () => {
      const budgetStatus = createMockBudgetStatus()
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('应该传递正确的百分比', () => {
      const budgetStatus = createMockBudgetStatus({ percentage: 75 })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText('75.0%')).toBeInTheDocument()
    })

    it('应该传递正确的状态', () => {
      const budgetStatus = createMockBudgetStatus({ status: 'warning' })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText('预算紧张')).toBeInTheDocument()
    })
  })

  describe('详情显示测试', () => {
    it('showDetails=true 时应该显示详情', () => {
      const budgetStatus = createMockBudgetStatus({ status: 'safe' })
      render(<BudgetOverview budgetStatus={budgetStatus} showDetails />)

      expect(screen.getByText('预算充足')).toBeInTheDocument()
    })

    it('showDetails=false 时应该隐藏详情', () => {
      const budgetStatus = createMockBudgetStatus()
      render(<BudgetOverview budgetStatus={budgetStatus} showDetails={false} />)

      expect(screen.queryByText('预算充足')).not.toBeInTheDocument()
    })

    it('应该显示预算状态文字', () => {
      const budgetStatus = createMockBudgetStatus({ status: 'warning' })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText('预算紧张')).toBeInTheDocument()
    })

    it('未超支时应该显示剩余预算提示', () => {
      const budgetStatus = createMockBudgetStatus({
        remaining: 5000,
        status: 'safe'
      })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText(/还可支出/)).toBeInTheDocument()
    })

    it('超支时不应该显示剩余预算提示', () => {
      const budgetStatus = createMockBudgetStatus({
        remaining: -1000,
        status: 'danger'
      })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.queryByText(/还可支出/)).not.toBeInTheDocument()
    })
  })

  describe('边界情况测试', () => {
    it('预算为 0 时应该正确处理', () => {
      const budgetStatus = createMockBudgetStatus({
        budget: 0,
        spent: 0,
        remaining: 0,
        percentage: 0,
        status: 'safe'
      })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      const zeros = screen.getAllByText('¥0')
      expect(zeros.length).toBeGreaterThan(0)
    })

    it('支出为 0 时应该正确处理', () => {
      const budgetStatus = createMockBudgetStatus({
        spent: 0,
        remaining: 10000,
        percentage: 0,
        status: 'safe'
      })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText('预算充足')).toBeInTheDocument()
    })

    it('预算和支出都为 0 时应该正确处理', () => {
      const budgetStatus = createMockBudgetStatus({
        budget: 0,
        spent: 0,
        remaining: 0,
        percentage: 0,
        status: 'safe'
      })
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByText('预算概览')).toBeInTheDocument()
    })
  })

  describe('自定义货币符号测试', () => {
    it('应该支持自定义货币符号', () => {
      const budgetStatus = createMockBudgetStatus({ budget: 1000 })
      render(<BudgetOverview budgetStatus={budgetStatus} currency="$" />)

      expect(screen.getByText('$1,000')).toBeInTheDocument()
    })
  })

  describe('自定义类名测试', () => {
    it('应该支持自定义 className', () => {
      const budgetStatus = createMockBudgetStatus()
      const { container } = render(
        <BudgetOverview budgetStatus={budgetStatus} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('可访问性测试', () => {
    it('应该有正确的语义结构', () => {
      const budgetStatus = createMockBudgetStatus()
      render(<BudgetOverview budgetStatus={budgetStatus} />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })
})
