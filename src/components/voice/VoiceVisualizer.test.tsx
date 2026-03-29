import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { VoiceVisualizer } from './VoiceVisualizer'

describe('VoiceVisualizer', () => {
  describe('渲染测试', () => {
    it('应该渲染可视化容器', () => {
      const { container } = render(<VoiceVisualizer volume={0} isActive={false} />)

      const visualizer = container.querySelector('.flex.items-end.justify-center')
      expect(visualizer).toBeInTheDocument()
    })

    it('应该渲染5个音频条', () => {
      const { container } = render(<VoiceVisualizer volume={0} isActive={false} />)

      const bars = container.querySelectorAll('.w-2.rounded-full')
      expect(bars.length).toBe(5)
    })
  })

  describe('样式测试', () => {
    it('非激活状态应该有默认样式', () => {
      const { container } = render(<VoiceVisualizer volume={0} isActive={false} />)

      const visualizer = container.querySelector('.flex.items-end.justify-center')
      expect(visualizer?.className).toContain('opacity-30')
    })

    it('激活状态应该有激活样式', () => {
      const { container } = render(<VoiceVisualizer volume={0} isActive={true} />)

      const visualizer = container.querySelector('.flex.items-end.justify-center')
      expect(visualizer?.className).toContain('opacity-100')
    })

    it('非激活状态音频条应该有灰色样式', () => {
      const { container } = render(<VoiceVisualizer volume={0} isActive={false} />)

      const bars = container.querySelectorAll('.w-2.rounded-full')
      bars.forEach(bar => {
        expect(bar.className).toContain('bg-gray-300')
      })
    })

    it('激活状态音频条应该有主题色样式', () => {
      const { container } = render(<VoiceVisualizer volume={0} isActive={true} />)

      const bars = container.querySelectorAll('.w-2.rounded-full')
      bars.forEach(bar => {
        expect(bar.className).toContain('bg-primary')
      })
    })

    it('应该支持自定义 className', () => {
      const { container } = render(<VoiceVisualizer volume={0} isActive={false} className="custom-class" />)

      const visualizer = container.querySelector('.custom-class')
      expect(visualizer).toBeInTheDocument()
    })
  })

  describe('音量可视化测试', () => {
    it('音量为 0 时音频条应该有最小高度', () => {
      const { container } = render(<VoiceVisualizer volume={0} isActive={true} />)

      const bars = container.querySelectorAll('.w-2.rounded-full')
      bars.forEach(bar => {
        const height = bar.getAttribute('style')
        expect(height).toMatch(/height: [\d.]+px/)
      })
    })

    it('激活状态音频条应该有过渡动画', () => {
      const { container } = render(<VoiceVisualizer volume={0.5} isActive={true} />)

      const bars = container.querySelectorAll('.w-2.rounded-full')
      bars.forEach(bar => {
        expect(bar.className).toContain('transition-all')
      })
    })

    it('音频条应该有持续时间设置', () => {
      const { container } = render(<VoiceVisualizer volume={0.5} isActive={true} />)

      const bars = container.querySelectorAll('.w-2.rounded-full')
      bars.forEach(bar => {
        expect(bar.className).toContain('duration-75')
      })
    })
  })

  describe('边界情况测试', () => {
    it('音量超过 1 时应该正常渲染', () => {
      const { container } = render(<VoiceVisualizer volume={1.5} isActive={true} />)

      const visualizer = container.querySelector('.flex.items-end.justify-center')
      expect(visualizer).toBeInTheDocument()
    })

    it('音量为负数时应该正常渲染', () => {
      const { container } = render(<VoiceVisualizer volume={-0.5} isActive={true} />)

      const visualizer = container.querySelector('.flex.items-end.justify-center')
      expect(visualizer).toBeInTheDocument()
    })
  })
})
