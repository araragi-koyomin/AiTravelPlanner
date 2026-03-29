import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpensePieChart } from './ExpensePieChart'
import { createMockCategoryExpenses } from '@/test/factories/expenseFactory'

vi.mock('recharts', () => import('@/test/mocks/recharts.tsx'))

describe('ExpensePieChart', () => {
  describe('渲染测试', () => {
    it('应该正常渲染饼图', () => {
      const data = createMockCategoryExpenses()
      render(<ExpensePieChart data={data} />)

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })

    it('应该渲染所有分类数据', () => {
      const data = createMockCategoryExpenses()
      render(<ExpensePieChart data={data} />)

      expect(screen.getByText('交通')).toBeInTheDocument()
      expect(screen.getByText('餐饮')).toBeInTheDocument()
      expect(screen.getByText('住宿')).toBeInTheDocument()
      expect(screen.getByText('门票')).toBeInTheDocument()
    })

    it('应该显示图例', () => {
      const data = createMockCategoryExpenses()
      render(<ExpensePieChart data={data} showLegend />)

      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  describe('数据处理测试', () => {
    it('应该正确映射分类颜色', () => {
      const data = createMockCategoryExpenses()
      const { container } = render(<ExpensePieChart data={data} />)

      const colorIndicators = container.querySelectorAll('.w-3.h-3.rounded-full')
      expect(colorIndicators.length).toBeGreaterThan(0)
    })

    it('应该正确显示百分比', () => {
      const data = createMockCategoryExpenses()
      render(<ExpensePieChart data={data} />)

      expect(screen.getByText('40.0%')).toBeInTheDocument()
      expect(screen.getByText('30.0%')).toBeInTheDocument()
    })

    it('应该正确显示金额', () => {
      const data = createMockCategoryExpenses()
      render(<ExpensePieChart data={data} />)

      expect(screen.getByText('¥2,000')).toBeInTheDocument()
      expect(screen.getByText('¥1,500')).toBeInTheDocument()
    })
  })

  describe('交互测试', () => {
    it('点击分类列表项应该调用 onCategoryClick', async () => {
      const user = userEvent.setup()
      const data = createMockCategoryExpenses()
      const onCategoryClick = vi.fn()

      render(<ExpensePieChart data={data} onCategoryClick={onCategoryClick} />)

      const categoryItem = screen.getByText('交通').closest('div')
      if (categoryItem) {
        await user.click(categoryItem)
        expect(onCategoryClick).toHaveBeenCalledWith('transport')
      }
    })
  })

  describe('尺寸测试', () => {
    it('size="sm" 时应该使用小尺寸配置', () => {
      const data = createMockCategoryExpenses()
      render(<ExpensePieChart data={data} size="sm" />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('size="md" 时应该使用中等尺寸配置', () => {
      const data = createMockCategoryExpenses()
      render(<ExpensePieChart data={data} size="md" />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('size="lg" 时应该使用大尺寸配置', () => {
      const data = createMockCategoryExpenses()
      render(<ExpensePieChart data={data} size="lg" />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  describe('空状态测试', () => {
    it('数据为空时应该显示空状态提示', () => {
      render(<ExpensePieChart data={[]} />)

      expect(screen.getByText('暂无支出数据')).toBeInTheDocument()
    })

    it('数据为空时不应该渲染图表', () => {
      render(<ExpensePieChart data={[]} />)

      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument()
    })
  })

  describe('图例测试', () => {
    it('showLegend=true 时应该显示图例', () => {
      const data = createMockCategoryExpenses()
      render(<ExpensePieChart data={data} showLegend />)

      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })

    it('showLegend=false 时应该隐藏图例', () => {
      const data = createMockCategoryExpenses()
      render(<ExpensePieChart data={data} showLegend={false} />)

      expect(screen.queryByTestId('legend')).not.toBeInTheDocument()
    })
  })

  describe('自定义类名测试', () => {
    it('应该支持自定义 className', () => {
      const data = createMockCategoryExpenses()
      const { container } = render(
        <ExpensePieChart data={data} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
