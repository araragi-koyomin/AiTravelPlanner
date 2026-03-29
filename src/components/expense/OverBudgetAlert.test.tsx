import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OverBudgetAlert, OverBudgetAlertList } from './OverBudgetAlert'
import { createMockBudgetStatus, createMockCategoryExpenses } from '@/test/factories/expenseFactory'

describe('OverBudgetAlert', () => {
  describe('渲染测试', () => {
    it('应该正常渲染提醒组件', () => {
      render(
        <OverBudgetAlert
          type="total"
          budget={10000}
          spent={12000}
        />
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('应该显示警告图标', () => {
      const { container } = render(
        <OverBudgetAlert
          type="total"
          budget={10000}
          spent={12000}
        />
      )

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('总预算超支测试', () => {
    it('type="total" 时应该显示总预算超支标题', () => {
      render(
        <OverBudgetAlert
          type="total"
          budget={10000}
          spent={12000}
        />
      )

      expect(screen.getByText('总预算超支提醒')).toBeInTheDocument()
    })

    it('应该显示超支金额', () => {
      render(
        <OverBudgetAlert
          type="total"
          budget={10000}
          spent={12000}
        />
      )

      expect(screen.getByText(/已超支 ¥2,000/)).toBeInTheDocument()
    })

    it('应该显示超支百分比', () => {
      render(
        <OverBudgetAlert
          type="total"
          budget={10000}
          spent={12000}
        />
      )

      expect(screen.getByText(/超支比例 20.0%/)).toBeInTheDocument()
    })

    it('应该显示预算和已支出金额', () => {
      render(
        <OverBudgetAlert
          type="total"
          budget={10000}
          spent={12000}
        />
      )

      expect(screen.getByText('预算: ¥10,000')).toBeInTheDocument()
      expect(screen.getByText('已支出: ¥12,000')).toBeInTheDocument()
    })
  })

  describe('分类超支测试', () => {
    it('type="category" 时应该显示分类超支标题', () => {
      render(
        <OverBudgetAlert
          type="category"
          budget={2000}
          spent={3000}
          category="transport"
        />
      )

      expect(screen.getByText('交通预算超支')).toBeInTheDocument()
    })

    it('应该显示分类名称', () => {
      render(
        <OverBudgetAlert
          type="category"
          budget={2000}
          spent={3000}
          category="food"
        />
      )

      expect(screen.getByText(/餐饮支出已超出预算/)).toBeInTheDocument()
    })

    it('应该显示分类超支金额', () => {
      render(
        <OverBudgetAlert
          type="category"
          budget={2000}
          spent={3000}
          category="transport"
        />
      )

      expect(screen.getByText(/超出预算 ¥1,000/)).toBeInTheDocument()
    })
  })

  describe('关闭功能测试', () => {
    it('有 onDismiss 时应该显示关闭按钮', () => {
      const onDismiss = vi.fn()
      render(
        <OverBudgetAlert
          type="total"
          budget={10000}
          spent={12000}
          onDismiss={onDismiss}
        />
      )

      expect(screen.getByLabelText('关闭提醒')).toBeInTheDocument()
    })

    it('没有 onDismiss 时不应该显示关闭按钮', () => {
      render(
        <OverBudgetAlert
          type="total"
          budget={10000}
          spent={12000}
        />
      )

      expect(screen.queryByLabelText('关闭提醒')).not.toBeInTheDocument()
    })

    it('点击关闭按钮应该调用 onDismiss', async () => {
      const user = userEvent.setup()
      const onDismiss = vi.fn()
      render(
        <OverBudgetAlert
          type="total"
          budget={10000}
          spent={12000}
          onDismiss={onDismiss}
        />
      )

      await user.click(screen.getByLabelText('关闭提醒'))
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })
  })

  describe('可访问性测试', () => {
    it('应该有 role="alert"', () => {
      render(
        <OverBudgetAlert
          type="total"
          budget={10000}
          spent={12000}
        />
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('关闭按钮应该有 aria-label', () => {
      const onDismiss = vi.fn()
      render(
        <OverBudgetAlert
          type="total"
          budget={10000}
          spent={12000}
          onDismiss={onDismiss}
        />
      )

      expect(screen.getByLabelText('关闭提醒')).toBeInTheDocument()
    })
  })

  describe('自定义类名测试', () => {
    it('应该支持自定义 className', () => {
      const { container } = render(
        <OverBudgetAlert
          type="total"
          budget={10000}
          spent={12000}
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})

describe('OverBudgetAlertList', () => {
  describe('渲染测试', () => {
    it('没有超支时不应该渲染', () => {
      const budgetStatus = createMockBudgetStatus({ status: 'safe' })
      const categoryBreakdown = createMockCategoryExpenses()

      const { container } = render(
        <OverBudgetAlertList
          budgetStatus={budgetStatus}
          categoryBreakdown={categoryBreakdown}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('总预算超支时应该渲染总预算提醒', () => {
      const budgetStatus = createMockBudgetStatus({
        status: 'danger',
        budget: 10000,
        spent: 12000
      })
      const categoryBreakdown = createMockCategoryExpenses()

      render(
        <OverBudgetAlertList
          budgetStatus={budgetStatus}
          categoryBreakdown={categoryBreakdown}
        />
      )

      expect(screen.getByText('总预算超支提醒')).toBeInTheDocument()
    })

    it('分类超支时应该渲染分类提醒', () => {
      const budgetStatus = createMockBudgetStatus({ status: 'safe' })
      const categoryBreakdown = [
        { category: 'transport' as const, amount: 3000, budget: 2000, isOverBudget: true }
      ]

      render(
        <OverBudgetAlertList
          budgetStatus={budgetStatus}
          categoryBreakdown={categoryBreakdown}
        />
      )

      expect(screen.getByText('交通预算超支')).toBeInTheDocument()
    })

    it('同时超支时应该渲染多个提醒', () => {
      const budgetStatus = createMockBudgetStatus({
        status: 'danger',
        budget: 10000,
        spent: 12000
      })
      const categoryBreakdown = [
        { category: 'transport' as const, amount: 3000, budget: 2000, isOverBudget: true }
      ]

      render(
        <OverBudgetAlertList
          budgetStatus={budgetStatus}
          categoryBreakdown={categoryBreakdown}
        />
      )

      expect(screen.getByText('总预算超支提醒')).toBeInTheDocument()
      expect(screen.getByText('交通预算超支')).toBeInTheDocument()
    })
  })

  describe('数据过滤测试', () => {
    it('应该只显示 isOverBudget=true 的分类', () => {
      const budgetStatus = createMockBudgetStatus({ status: 'safe' })
      const categoryBreakdown = [
        { category: 'transport' as const, amount: 3000, budget: 2000, isOverBudget: true },
        { category: 'food' as const, amount: 500, budget: 1000, isOverBudget: false }
      ]

      render(
        <OverBudgetAlertList
          budgetStatus={budgetStatus}
          categoryBreakdown={categoryBreakdown}
        />
      )

      expect(screen.getByText('交通预算超支')).toBeInTheDocument()
      expect(screen.queryByText('餐饮预算超支')).not.toBeInTheDocument()
    })

    it('应该只显示 status="danger" 的总预算提醒', () => {
      const budgetStatus = createMockBudgetStatus({
        status: 'warning',
        budget: 10000,
        spent: 8000
      })
      const categoryBreakdown = [
        { category: 'transport' as const, amount: 3000, budget: 2000, isOverBudget: true }
      ]

      render(
        <OverBudgetAlertList
          budgetStatus={budgetStatus}
          categoryBreakdown={categoryBreakdown}
        />
      )

      expect(screen.queryByText('总预算超支提醒')).not.toBeInTheDocument()
      expect(screen.getByText('交通预算超支')).toBeInTheDocument()
    })
  })

  describe('自定义类名测试', () => {
    it('应该支持自定义 className', () => {
      const budgetStatus = createMockBudgetStatus({ status: 'danger' })
      const categoryBreakdown: never[] = []

      const { container } = render(
        <OverBudgetAlertList
          budgetStatus={budgetStatus}
          categoryBreakdown={categoryBreakdown}
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
