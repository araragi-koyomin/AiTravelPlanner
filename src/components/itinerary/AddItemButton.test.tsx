import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddItemButton } from './AddItemButton'

describe('AddItemButton', () => {
  const defaultProps = {
    day: 1,
    onClick: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正常渲染组件', () => {
      render(<AddItemButton {...defaultProps} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('应该显示添加按钮文本', () => {
      render(<AddItemButton {...defaultProps} />)

      expect(screen.getByText('添加行程项')).toBeInTheDocument()
    })

    it('应该显示加号图标', () => {
      const { container } = render(<AddItemButton {...defaultProps} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('交互测试', () => {
    it('点击按钮应该调用 onClick', () => {
      const onClick = vi.fn()
      render(<AddItemButton {...defaultProps} onClick={onClick} />)

      fireEvent.click(screen.getByRole('button'))

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('应该传递正确的 day 参数', () => {
      const onClick = vi.fn()
      render(<AddItemButton day={3} onClick={onClick} />)

      fireEvent.click(screen.getByRole('button'))

      expect(onClick).toHaveBeenCalledWith(3)
    })
  })

  describe('禁用状态', () => {
    it('应该在 disabled 为 true 时禁用按钮', () => {
      render(<AddItemButton {...defaultProps} disabled={true} />)

      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('应该在 disabled 为 false 时启用按钮', () => {
      render(<AddItemButton {...defaultProps} disabled={false} />)

      expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('应该在禁用时不响应点击', () => {
      const onClick = vi.fn()
      render(<AddItemButton {...defaultProps} onClick={onClick} disabled={true} />)

      fireEvent.click(screen.getByRole('button'))

      expect(onClick).not.toHaveBeenCalled()
    })
  })
})
