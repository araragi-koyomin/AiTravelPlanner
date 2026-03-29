import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BudgetProgressBar } from './BudgetProgressBar'

describe('BudgetProgressBar', () => {
  describe('渲染测试', () => {
    it('应该正常渲染进度条', () => {
      render(<BudgetProgressBar percentage={50} status="safe" />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('应该显示正确的百分比', () => {
      render(<BudgetProgressBar percentage={50} status="safe" />)

      expect(screen.getByText('50.0%')).toBeInTheDocument()
    })

    it('应该显示百分比标签', () => {
      render(<BudgetProgressBar percentage={50} status="safe" showLabel />)

      expect(screen.getByText('预算使用')).toBeInTheDocument()
    })

    it('showLabel=false 时应该隐藏标签', () => {
      render(<BudgetProgressBar percentage={50} status="safe" showLabel={false} />)

      expect(screen.queryByText('预算使用')).not.toBeInTheDocument()
    })
  })

  describe('状态颜色测试', () => {
    it('safe 状态应该使用绿色', () => {
      render(<BudgetProgressBar percentage={50} status="safe" />)

      const percentageText = screen.getByText('50.0%')
      expect(percentageText).toHaveStyle({ color: '#10B981' })
    })

    it('warning 状态应该使用黄色', () => {
      render(<BudgetProgressBar percentage={75} status="warning" />)

      const percentageText = screen.getByText('75.0%')
      expect(percentageText).toHaveStyle({ color: '#F59E0B' })
    })

    it('danger 状态应该使用红色', () => {
      render(<BudgetProgressBar percentage={100} status="danger" />)

      const percentageText = screen.getByText('100.0%')
      expect(percentageText).toHaveStyle({ color: '#EF4444' })
    })
  })

  describe('进度值测试', () => {
    it('0% 时应该正确显示', () => {
      render(<BudgetProgressBar percentage={0} status="safe" />)

      expect(screen.getByText('0.0%')).toBeInTheDocument()
    })

    it('50% 时应该正确显示', () => {
      render(<BudgetProgressBar percentage={50} status="safe" />)

      expect(screen.getByText('50.0%')).toBeInTheDocument()
    })

    it('100% 时应该正确显示', () => {
      render(<BudgetProgressBar percentage={100} status="danger" />)

      expect(screen.getByText('100.0%')).toBeInTheDocument()
    })

    it('超过 100% 时应该限制为 100%', () => {
      render(<BudgetProgressBar percentage={150} status="danger" />)

      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '100')
    })

    it('百分比显示应该保留原始值', () => {
      render(<BudgetProgressBar percentage={150} status="danger" />)

      expect(screen.getByText('150.0%')).toBeInTheDocument()
    })
  })

  describe('动画测试', () => {
    it('animated=true 时应该有动画类', () => {
      const { container } = render(
        <BudgetProgressBar percentage={50} status="safe" animated />
      )

      const progressBar = container.querySelector('.h-full.rounded-full')
      expect(progressBar).toHaveClass('transition-all', 'duration-500', 'ease-out')
    })

    it('animated=false 时应该没有动画类', () => {
      const { container } = render(
        <BudgetProgressBar percentage={50} status="safe" animated={false} />
      )

      const progressBar = container.querySelector('.h-full.rounded-full')
      expect(progressBar).not.toHaveClass('duration-500')
    })
  })

  describe('可访问性测试', () => {
    it('应该有 role="progressbar"', () => {
      render(<BudgetProgressBar percentage={50} status="safe" />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('应该有 aria-valuenow 属性', () => {
      render(<BudgetProgressBar percentage={50} status="safe" />)

      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '50')
    })

    it('应该有 aria-valuemin 属性', () => {
      render(<BudgetProgressBar percentage={50} status="safe" />)

      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuemin', '0')
    })

    it('应该有 aria-valuemax 属性', () => {
      render(<BudgetProgressBar percentage={50} status="safe" />)

      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuemax', '100')
    })
  })

  describe('自定义类名测试', () => {
    it('应该支持自定义 className', () => {
      const { container } = render(
        <BudgetProgressBar percentage={50} status="safe" className="custom-class" />
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('custom-class')
    })
  })
})
