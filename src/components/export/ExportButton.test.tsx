import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExportButton } from './ExportButton'
import type { Itinerary, DailyScheduleBuilt, BudgetBreakdown } from '@/services/itinerary'

vi.mock('./ExportModal', () => ({
  ExportModal: vi.fn(({ isOpen, onClose }) => 
    isOpen ? (
      <div data-testid="export-modal">
        <button onClick={onClose}>关闭</button>
      </div>
    ) : null
  )
}))

const mockItinerary: Itinerary = {
  id: 'test-id',
  user_id: 'user-1',
  title: '测试行程',
  destination: '北京',
  start_date: '2024-01-01',
  end_date: '2024-01-03',
  budget: 5000,
  participants: 2,
  preferences: null,
  special_requirements: null,
  travelers_type: null,
  accommodation_pref: null,
  pace: null,
  is_favorite: false,
  status: 'draft',
  cover_image: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockDailySchedule: DailyScheduleBuilt[] = [
  {
    day: 1,
    date: '2024-01-01',
    dayOfWeek: '周一',
    theme: '探索之旅',
    items: []
  }
]

const mockBudgetBreakdown: BudgetBreakdown = {
  transport: 500,
  accommodation: 1200,
  food: 600,
  tickets: 200,
  shopping: 300,
  entertainment: 200,
  other: 100,
  total: 3100
}

describe('ExportButton', () => {
  const defaultProps = {
    itinerary: mockItinerary,
    dailySchedule: mockDailySchedule,
    budgetBreakdown: mockBudgetBreakdown,
    disabled: false
  }

  describe('渲染', () => {
    it('应该渲染导出按钮', () => {
      render(<ExportButton {...defaultProps} />)
      expect(screen.getByRole('button', { name: /导出/i })).toBeInTheDocument()
    })

    it('应该显示导出图标', () => {
      render(<ExportButton {...defaultProps} />)
      const button = screen.getByRole('button', { name: /导出/i })
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('应该显示导出文字', () => {
      render(<ExportButton {...defaultProps} />)
      expect(screen.getByText('导出')).toBeInTheDocument()
    })

    it('禁用状态应该正确显示', () => {
      render(<ExportButton {...defaultProps} disabled={true} />)
      const button = screen.getByRole('button', { name: /导出/i })
      expect(button).toBeDisabled()
    })
  })

  describe('交互', () => {
    it('点击应该打开弹窗', () => {
      render(<ExportButton {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /导出/i })
      fireEvent.click(button)
      
      expect(screen.getByTestId('export-modal')).toBeInTheDocument()
    })

    it('禁用时点击不应该打开弹窗', () => {
      render(<ExportButton {...defaultProps} disabled={true} />)
      
      const button = screen.getByRole('button', { name: /导出/i })
      fireEvent.click(button)
      
      expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument()
    })
  })

  describe('弹窗', () => {
    it('应该传递正确的 props 给 ExportModal', async () => {
      render(<ExportButton {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /导出/i })
      fireEvent.click(button)
      
      const { ExportModal } = await import('./ExportModal')
      expect(vi.mocked(ExportModal)).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
          itinerary: mockItinerary,
          dailySchedule: mockDailySchedule,
          budgetBreakdown: mockBudgetBreakdown
        }),
        expect.anything()
      )
    })
  })
})
