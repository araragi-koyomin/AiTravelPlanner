import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationSection } from './NotificationSection'

const mockOnNotificationsChange = vi.fn()

describe('NotificationSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOnNotificationsChange.mockResolvedValue(undefined)
  })

  describe('rendering', () => {
    it('should render title and description', () => {
      render(
        <NotificationSection notifications={true} onNotificationsChange={mockOnNotificationsChange} />
      )

      expect(screen.getByText('通知设置')).toBeInTheDocument()
      expect(screen.getByText('管理应用通知偏好')).toBeInTheDocument()
    })

    it('should display switch component', () => {
      render(
        <NotificationSection notifications={true} onNotificationsChange={mockOnNotificationsChange} />
      )

      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('should reflect notifications enabled state', () => {
      render(
        <NotificationSection notifications={true} onNotificationsChange={mockOnNotificationsChange} />
      )

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
      expect(switchElement).toHaveClass('bg-primary-600')
    })

    it('should reflect notifications disabled state', () => {
      render(
        <NotificationSection notifications={false} onNotificationsChange={mockOnNotificationsChange} />
      )

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')
      expect(switchElement).toHaveClass('bg-gray-200')
    })

    it('should have correct aria attributes', () => {
      render(
        <NotificationSection notifications={true} onNotificationsChange={mockOnNotificationsChange} />
      )

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('role', 'switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('should display enable notifications label', () => {
      render(
        <NotificationSection notifications={true} onNotificationsChange={mockOnNotificationsChange} />
      )

      expect(screen.getByText('启用通知')).toBeInTheDocument()
      expect(screen.getByText('接收行程提醒和系统通知')).toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    it('should toggle state when clicking switch', async () => {
      render(
        <NotificationSection notifications={true} onNotificationsChange={mockOnNotificationsChange} />
      )

      fireEvent.click(screen.getByRole('switch'))

      expect(mockOnNotificationsChange).toHaveBeenCalledWith(false)
    })

    it('should call onNotificationsChange with true when enabling', async () => {
      render(
        <NotificationSection notifications={false} onNotificationsChange={mockOnNotificationsChange} />
      )

      fireEvent.click(screen.getByRole('switch'))

      expect(mockOnNotificationsChange).toHaveBeenCalledWith(true)
    })

    it('should disable switch when loading', () => {
      render(
        <NotificationSection
          notifications={true}
          onNotificationsChange={mockOnNotificationsChange}
          isLoading={true}
        />
      )

      expect(screen.getByRole('switch')).toBeDisabled()
    })

    it('should disable switch while updating', async () => {
      let resolvePromise: () => void
      mockOnNotificationsChange.mockImplementation(
        () => new Promise<void>((resolve) => {
          resolvePromise = resolve
        })
      )

      render(
        <NotificationSection notifications={true} onNotificationsChange={mockOnNotificationsChange} />
      )

      fireEvent.click(screen.getByRole('switch'))

      expect(screen.getByRole('switch')).toBeDisabled()

      resolvePromise!()
      await waitFor(() => {
        expect(screen.getByRole('switch')).not.toBeDisabled()
      })
    })
  })

  describe('accessibility', () => {
    it('should be focusable', () => {
      render(
        <NotificationSection notifications={true} onNotificationsChange={mockOnNotificationsChange} />
      )

      const switchElement = screen.getByRole('switch')
      switchElement.focus()
      expect(switchElement).toHaveFocus()
    })

    it('should have correct aria-checked when toggled', async () => {
      const { rerender } = render(
        <NotificationSection notifications={true} onNotificationsChange={mockOnNotificationsChange} />
      )

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'true')

      fireEvent.click(switchElement)

      rerender(
        <NotificationSection notifications={false} onNotificationsChange={mockOnNotificationsChange} />
      )

      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
    })
  })
})
