import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MapError } from './MapError'

describe('MapError', () => {
  it('should render error message', () => {
    const error = new Error('Test error message')
    render(<MapError error={error} />)

    expect(screen.getByText('地图加载失败')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('should render error icon', () => {
    const error = new Error('Test error')
    render(<MapError error={error} />)

    const icon = document.querySelector('.lucide-circle-alert')
    expect(icon).toBeInTheDocument()
  })

  it('should render retry button when onRetry is provided', () => {
    const error = new Error('Test error')
    const onRetry = vi.fn()
    render(<MapError error={error} onRetry={onRetry} />)

    expect(screen.getByText('重新加载')).toBeInTheDocument()
  })

  it('should not render retry button when onRetry is not provided', () => {
    const error = new Error('Test error')
    render(<MapError error={error} />)

    expect(screen.queryByText('重新加载')).not.toBeInTheDocument()
  })

  it('should call onRetry when retry button is clicked', () => {
    const error = new Error('Test error')
    const onRetry = vi.fn()
    render(<MapError error={error} onRetry={onRetry} />)

    const retryButton = screen.getByText('重新加载')
    retryButton.click()

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('should render with different error types', () => {
    const networkError = new Error('Network error')
    const { rerender } = render(<MapError error={networkError} />)

    expect(screen.getByText('Network error')).toBeInTheDocument()

    const authError = new Error('Authentication failed')
    rerender(<MapError error={authError} />)

    expect(screen.getByText('Authentication failed')).toBeInTheDocument()
  })

  it('should render default message when error has no message', () => {
    const error = new Error()
    render(<MapError error={error} />)

    expect(screen.getByText('无法加载地图，请检查网络连接或刷新页面重试')).toBeInTheDocument()
  })
})
