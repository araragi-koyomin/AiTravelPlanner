import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { ExportButton } from '@/components/export/ExportButton'
import type { Itinerary, DailyScheduleBuilt, BudgetBreakdown } from '@/services/itinerary'

vi.mock('@/services/export', () => ({
  exportToPdf: vi.fn().mockResolvedValue({
    success: true,
    filename: '北京_20240101.pdf',
    dataUrl: 'data:application/pdf;base64,test'
  }),
  exportFromElement: vi.fn().mockResolvedValue({
    success: true,
    filename: '北京_20240101.png',
    dataUrl: 'data:image/png;base64,test'
  })
}))

vi.mock('@/components/ui/Checkbox', () => ({
  Checkbox: vi.fn(({ checked, onCheckedChange }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      data-testid="checkbox"
    />
  ))
}))

const createMockItinerary = (overrides: Partial<Itinerary> = {}): Itinerary => ({
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
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

const createMockDailySchedule = (days: number = 3): DailyScheduleBuilt[] => {
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    date: `2024-01-0${i + 1}`,
    dayOfWeek: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i % 7],
    theme: `第${i + 1}天行程`,
    items: [
      {
        id: `item-${i}`,
        itinerary_id: 'test-id',
        day: i + 1,
        time: '09:00',
        type: 'attraction',
        name: `景点${i + 1}`,
        location: { address: '测试地址', lat: 0, lng: 0 },
        description: '测试描述',
        cost: 100,
        duration: 60,
        tips: null,
        image_url: null,
        order_idx: 0,
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
  }))
}

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

const getConfirmExportButton = () => screen.getAllByRole('button', { name: /导出/ })[1]

describe('Export Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  describe('完整导出流程', () => {
    it('应该完成 PDF 导出流程', async () => {
      const itinerary = createMockItinerary()
      const dailySchedule = createMockDailySchedule()

      render(
        <ExportButton
          itinerary={itinerary}
          dailySchedule={dailySchedule}
          budgetBreakdown={mockBudgetBreakdown}
        />
      )

      const exportButton = screen.getByRole('button', { name: /导出/i })
      expect(exportButton).toBeInTheDocument()

      fireEvent.click(exportButton)

      expect(screen.getByText('导出行程')).toBeInTheDocument()

      const pdfButton = screen.getByText('PDF 文档')
      expect(pdfButton.closest('button')).toHaveClass('bg-blue-600')

      fireEvent.click(getConfirmExportButton())

      const { exportToPdf } = await import('@/services/export')
      await waitFor(() => {
        expect(vi.mocked(exportToPdf)).toHaveBeenCalledWith(
          itinerary,
          dailySchedule,
          mockBudgetBreakdown,
          expect.objectContaining({
            format: 'pdf'
          }),
          expect.any(Function)
        )
      })
    })

    it('应该完成图片导出流程', async () => {
      const itinerary = createMockItinerary()
      const dailySchedule = createMockDailySchedule()

      render(
        <ExportButton
          itinerary={itinerary}
          dailySchedule={dailySchedule}
          budgetBreakdown={mockBudgetBreakdown}
        />
      )

      const exportButton = screen.getByRole('button', { name: /导出/i })
      fireEvent.click(exportButton)

      const pngButton = screen.getByText('PNG 图片')
      fireEvent.click(pngButton)

      const ultraButton = screen.getByText('超清 (3x)')
      fireEvent.click(ultraButton)

      fireEvent.click(getConfirmExportButton())

      const { exportToPdf } = await import('@/services/export')
      await waitFor(() => {
        expect(vi.mocked(exportToPdf)).toHaveBeenCalled()
      })
    })

    it('应该正确处理导出选项', async () => {
      const itinerary = createMockItinerary()
      const dailySchedule = createMockDailySchedule()

      render(
        <ExportButton
          itinerary={itinerary}
          dailySchedule={dailySchedule}
          budgetBreakdown={mockBudgetBreakdown}
        />
      )

      const exportButton = screen.getByRole('button', { name: /导出/i })
      fireEvent.click(exportButton)

      const checkboxes = screen.getAllByTestId('checkbox')
      const budgetCheckbox = checkboxes[0]
      fireEvent.click(budgetCheckbox)

      fireEvent.click(getConfirmExportButton())

      const { exportToPdf } = await import('@/services/export')
      await waitFor(() => {
        const callArgs = vi.mocked(exportToPdf).mock.calls[0]
        expect(callArgs[3].includeBudget).toBe(false)
      })
    })
  })

  describe('错误恢复流程', () => {
    it('应该处理导出失败并允许重试', async () => {
      const { exportToPdf } = await import('@/services/export')
      vi.mocked(exportToPdf)
        .mockResolvedValueOnce({
          success: false,
          error: '导出失败'
        })
        .mockResolvedValueOnce({
          success: true,
          filename: 'test.pdf',
          dataUrl: 'data:application/pdf;base64,test'
        })

      const itinerary = createMockItinerary()
      const dailySchedule = createMockDailySchedule()

      render(
        <ExportButton
          itinerary={itinerary}
          dailySchedule={dailySchedule}
          budgetBreakdown={mockBudgetBreakdown}
        />
      )

      const exportButton = screen.getByRole('button', { name: /导出/i })
      fireEvent.click(exportButton)

      fireEvent.click(getConfirmExportButton())

      await waitFor(() => {
        expect(screen.getByText('导出失败')).toBeInTheDocument()
      })

      fireEvent.click(getConfirmExportButton())

      await waitFor(() => {
        expect(vi.mocked(exportToPdf)).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('边界情况', () => {
    it('应该处理超长标题', async () => {
      const longTitle = '这是一个非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的标题'
      const itinerary = createMockItinerary({ title: longTitle })
      const dailySchedule = createMockDailySchedule()

      render(
        <ExportButton
          itinerary={itinerary}
          dailySchedule={dailySchedule}
          budgetBreakdown={mockBudgetBreakdown}
        />
      )

      const exportButton = screen.getByRole('button', { name: /导出/i })
      fireEvent.click(exportButton)

      fireEvent.click(getConfirmExportButton())

      const { exportToPdf } = await import('@/services/export')
      await waitFor(() => {
        expect(vi.mocked(exportToPdf)).toHaveBeenCalled()
      })
    })

    it('应该处理特殊字符目的地', async () => {
      const itinerary = createMockItinerary({ destination: '北<京>上:海' })
      const dailySchedule = createMockDailySchedule()

      render(
        <ExportButton
          itinerary={itinerary}
          dailySchedule={dailySchedule}
          budgetBreakdown={mockBudgetBreakdown}
        />
      )

      const exportButton = screen.getByRole('button', { name: /导出/i })
      fireEvent.click(exportButton)

      fireEvent.click(getConfirmExportButton())

      const { exportToPdf } = await import('@/services/export')
      await waitFor(() => {
        expect(vi.mocked(exportToPdf)).toHaveBeenCalled()
      })
    })

    it('应该处理大量行程项', async () => {
      const itinerary = createMockItinerary()
      const dailySchedule = createMockDailySchedule(10)

      render(
        <ExportButton
          itinerary={itinerary}
          dailySchedule={dailySchedule}
          budgetBreakdown={mockBudgetBreakdown}
        />
      )

      const exportButton = screen.getByRole('button', { name: /导出/i })
      fireEvent.click(exportButton)

      fireEvent.click(getConfirmExportButton())

      const { exportToPdf } = await import('@/services/export')
      await waitFor(() => {
        expect(vi.mocked(exportToPdf)).toHaveBeenCalledWith(
          itinerary,
          dailySchedule,
          mockBudgetBreakdown,
          expect.any(Object),
          expect.any(Function)
        )
      })
    })

    it('应该处理空行程项', async () => {
      const itinerary = createMockItinerary()
      const emptySchedule: DailyScheduleBuilt[] = [
        { day: 1, date: '2024-01-01', dayOfWeek: '周一', theme: '探索之旅', items: [] }
      ]

      render(
        <ExportButton
          itinerary={itinerary}
          dailySchedule={emptySchedule}
          budgetBreakdown={mockBudgetBreakdown}
        />
      )

      const exportButton = screen.getByRole('button', { name: /导出/i })
      fireEvent.click(exportButton)

      fireEvent.click(getConfirmExportButton())

      const { exportToPdf } = await import('@/services/export')
      await waitFor(() => {
        expect(vi.mocked(exportToPdf)).toHaveBeenCalled()
      })
    })
  })

  describe('用户交互', () => {
    it('点击取消应该关闭弹窗', async () => {
      const itinerary = createMockItinerary()
      const dailySchedule = createMockDailySchedule()

      render(
        <ExportButton
          itinerary={itinerary}
          dailySchedule={dailySchedule}
          budgetBreakdown={mockBudgetBreakdown}
        />
      )

      const exportButton = screen.getByRole('button', { name: /导出/i })
      fireEvent.click(exportButton)

      expect(screen.getByText('导出行程')).toBeInTheDocument()

      const cancelButton = screen.getByText('取消')
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('导出行程')).not.toBeInTheDocument()
      })
    })

    it('禁用状态不应该打开弹窗', async () => {
      const itinerary = createMockItinerary()
      const dailySchedule = createMockDailySchedule()

      render(
        <ExportButton
          itinerary={itinerary}
          dailySchedule={dailySchedule}
          budgetBreakdown={mockBudgetBreakdown}
          disabled={true}
        />
      )

      const exportButton = screen.getByRole('button', { name: /导出/i })
      expect(exportButton).toBeDisabled()

      fireEvent.click(exportButton)

      expect(screen.queryByText('导出行程')).not.toBeInTheDocument()
    })
  })
})
