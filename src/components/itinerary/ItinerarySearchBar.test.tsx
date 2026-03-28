import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ItinerarySearchBar } from './ItinerarySearchBar'

describe('ItinerarySearchBar', () => {
  const mockOnChange = vi.fn()
  const mockOnClear = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
    mockOnClear.mockClear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('组件渲染测试', () => {
    it('应该正常渲染组件', () => {
      render(
        <ItinerarySearchBar
          value=""
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('应该显示搜索图标', () => {
      render(
        <ItinerarySearchBar
          value=""
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      const searchIcon = document.querySelector('.lucide-search')
      expect(searchIcon).toBeInTheDocument()
    })

    it('应该显示输入框', () => {
      render(
        <ItinerarySearchBar
          value=""
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('应该显示占位符文本', () => {
      render(
        <ItinerarySearchBar
          value=""
          onChange={mockOnChange}
          onClear={mockOnClear}
          placeholder="搜索行程..."
        />
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder', '搜索行程...')
    })

    it('应该不显示清空按钮当输入为空时', () => {
      render(
        <ItinerarySearchBar
          value=""
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      const clearButton = screen.queryByRole('button', { name: /清空搜索/i })
      expect(clearButton).not.toBeInTheDocument()
    })
  })

  describe('输入功能测试', () => {
    it('应该正确显示传入的 value', () => {
      render(
        <ItinerarySearchBar
          value="北京"
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('北京')
    })

    it('应该正确更新本地输入值', () => {
      render(
        <ItinerarySearchBar
          value=""
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '上海' } })
      expect(input).toHaveValue('上海')
    })

    it('应该在防抖延迟后调用 onChange', async () => {
      render(
        <ItinerarySearchBar
          value=""
          onChange={mockOnChange}
          onClear={mockOnClear}
          debounceMs={300}
        />
      )
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '广州' } })

      expect(mockOnChange).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(mockOnChange).toHaveBeenCalledWith('广州')
    })

    it('应该使用默认防抖延迟 300ms', async () => {
      render(
        <ItinerarySearchBar
          value=""
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '深圳' } })

      act(() => {
        vi.advanceTimersByTime(299)
      })
      expect(mockOnChange).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(mockOnChange).toHaveBeenCalledWith('深圳')
    })

    it('应该支持自定义防抖延迟', async () => {
      render(
        <ItinerarySearchBar
          value=""
          onChange={mockOnChange}
          onClear={mockOnClear}
          debounceMs={500}
        />
      )
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '杭州' } })

      act(() => {
        vi.advanceTimersByTime(499)
      })
      expect(mockOnChange).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(mockOnChange).toHaveBeenCalledWith('杭州')
    })
  })

  describe('清空功能测试', () => {
    it('应该显示清空按钮当有输入时', () => {
      render(
        <ItinerarySearchBar
          value="北京"
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      const clearButton = screen.getByRole('button', { name: /清空搜索/i })
      expect(clearButton).toBeInTheDocument()
    })

    it('点击清空按钮应该调用 onClear', () => {
      render(
        <ItinerarySearchBar
          value="北京"
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      const clearButton = screen.getByRole('button', { name: /清空搜索/i })
      fireEvent.click(clearButton)
      expect(mockOnClear).toHaveBeenCalledTimes(1)
    })

    it('点击清空按钮应该清空本地输入值', () => {
      render(
        <ItinerarySearchBar
          value="北京"
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      const input = screen.getByRole('textbox')
      const clearButton = screen.getByRole('button', { name: /清空搜索/i })
      fireEvent.click(clearButton)
      expect(input).toHaveValue('')
    })

    it('按 Escape 键应该清空输入', () => {
      render(
        <ItinerarySearchBar
          value=""
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '测试' } })
      fireEvent.keyDown(input, { key: 'Escape' })
      expect(mockOnClear).toHaveBeenCalledTimes(1)
      expect(input).toHaveValue('')
    })
  })

  describe('同步测试', () => {
    it('应该在 value prop 变化时同步本地输入值', () => {
      const { rerender } = render(
        <ItinerarySearchBar
          value=""
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('')

      rerender(
        <ItinerarySearchBar
          value="新搜索词"
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      expect(input).toHaveValue('新搜索词')
    })

    it('应该不触发 onChange 当本地值与 prop 值相同时', () => {
      render(
        <ItinerarySearchBar
          value="北京"
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '北京' } })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('可访问性测试', () => {
    it('输入框应该有 aria-label', () => {
      render(
        <ItinerarySearchBar
          value=""
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-label', '搜索行程')
    })

    it('清空按钮应该有 aria-label', () => {
      render(
        <ItinerarySearchBar
          value="北京"
          onChange={mockOnChange}
          onClear={mockOnClear}
        />
      )
      const clearButton = screen.getByRole('button', { name: /清空搜索/i })
      expect(clearButton).toHaveAttribute('aria-label', '清空搜索')
    })
  })
})
