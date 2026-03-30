import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExportModal } from './ExportModal'
import type { Itinerary, DailyScheduleBuilt, BudgetBreakdown } from '@/services/itinerary'

vi.mock('@/services/export', () => ({
  exportToPdf: vi.fn().mockResolvedValue({
    success: true,
    filename: 'test.pdf',
    dataUrl: 'data:application/pdf;base64,test'
  }),
  exportFromElement: vi.fn().mockResolvedValue({
    success: true,
    filename: 'test.pdf',
    dataUrl: 'data:application/pdf;base64,test'
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

describe('ExportModal', () => {
  const mockOnClose = vi.fn()
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    itinerary: mockItinerary,
    dailySchedule: mockDailySchedule,
    budgetBreakdown: mockBudgetBreakdown
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('渲染', () => {
    it('应该渲染弹窗标题', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByText('导出行程')).toBeInTheDocument()
    })

    it('应该渲染格式选择按钮', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByText('PDF 文档')).toBeInTheDocument()
      expect(screen.getByText('PNG 图片')).toBeInTheDocument()
      expect(screen.getByText('JPEG 图片')).toBeInTheDocument()
    })

    it('应该渲染质量选择按钮', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByText('标准 (1x)')).toBeInTheDocument()
      expect(screen.getByText('高清 (2x)')).toBeInTheDocument()
      expect(screen.getByText('超清 (3x)')).toBeInTheDocument()
    })

    it('应该渲染方向选择按钮（PDF 格式时）', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByText('纵向')).toBeInTheDocument()
      expect(screen.getByText('横向')).toBeInTheDocument()
    })

    it('应该渲染内容选项复选框', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByText('预算分解')).toBeInTheDocument()
      expect(screen.getByText('行程统计')).toBeInTheDocument()
    })

    it('应该渲染取消和导出按钮', () => {
      render(<ExportModal {...defaultProps} />)
      expect(screen.getByText('取消')).toBeInTheDocument()
      expect(screen.getByText('导出')).toBeInTheDocument()
    })

    it('isOpen 为 false 时不应该渲染', () => {
      render(<ExportModal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('导出行程')).not.toBeInTheDocument()
    })
  })

  describe('格式选择', () => {
    it('点击 PDF 应该更新选项', () => {
      render(<ExportModal {...defaultProps} />)
      
      const pngButton = screen.getByText('PNG 图片')
      fireEvent.click(pngButton)
      
      const pdfButton = screen.getByText('PDF 文档')
      fireEvent.click(pdfButton)
      
      expect(pdfButton.closest('button')).toHaveClass('bg-blue-600')
    })

    it('点击 PNG 应该更新选项', () => {
      render(<ExportModal {...defaultProps} />)
      
      const pngButton = screen.getByText('PNG 图片')
      fireEvent.click(pngButton)
      
      expect(pngButton.closest('button')).toHaveClass('bg-blue-600')
    })

    it('点击 JPEG 应该更新选项', () => {
      render(<ExportModal {...defaultProps} />)
      
      const jpegButton = screen.getByText('JPEG 图片')
      fireEvent.click(jpegButton)
      
      expect(jpegButton.closest('button')).toHaveClass('bg-blue-600')
    })

    it('当前选中格式应该高亮', () => {
      render(<ExportModal {...defaultProps} />)
      
      const pdfButton = screen.getByText('PDF 文档')
      expect(pdfButton.closest('button')).toHaveClass('bg-blue-600')
    })

    it('选择非 PDF 格式时应该隐藏方向选择', () => {
      render(<ExportModal {...defaultProps} />)
      
      const pngButton = screen.getByText('PNG 图片')
      fireEvent.click(pngButton)
      
      expect(screen.queryByText('纵向')).not.toBeInTheDocument()
      expect(screen.queryByText('横向')).not.toBeInTheDocument()
    })
  })

  describe('质量选择', () => {
    it('点击标准应该更新选项', () => {
      render(<ExportModal {...defaultProps} />)
      
      const standardButton = screen.getByText('标准 (1x)')
      fireEvent.click(standardButton)
      
      expect(standardButton.closest('button')).toHaveClass('bg-blue-600')
    })

    it('点击高清应该更新选项', () => {
      render(<ExportModal {...defaultProps} />)
      
      const highButton = screen.getByText('高清 (2x)')
      fireEvent.click(highButton)
      
      expect(highButton.closest('button')).toHaveClass('bg-blue-600')
    })

    it('点击超清应该更新选项', () => {
      render(<ExportModal {...defaultProps} />)
      
      const ultraButton = screen.getByText('超清 (3x)')
      fireEvent.click(ultraButton)
      
      expect(ultraButton.closest('button')).toHaveClass('bg-blue-600')
    })

    it('当前选中质量应该高亮', () => {
      render(<ExportModal {...defaultProps} />)
      
      const highButton = screen.getByText('高清 (2x)')
      expect(highButton.closest('button')).toHaveClass('bg-blue-600')
    })
  })

  describe('方向选择', () => {
    it('点击纵向应该更新选项', () => {
      render(<ExportModal {...defaultProps} />)
      
      const portraitButton = screen.getByText('纵向')
      fireEvent.click(portraitButton)
      
      expect(portraitButton.closest('button')).toHaveClass('bg-blue-600')
    })

    it('点击横向应该更新选项', () => {
      render(<ExportModal {...defaultProps} />)
      
      const landscapeButton = screen.getByText('横向')
      fireEvent.click(landscapeButton)
      
      expect(landscapeButton.closest('button')).toHaveClass('bg-blue-600')
    })

    it('当前选中方向应该高亮', () => {
      render(<ExportModal {...defaultProps} />)
      
      const portraitButton = screen.getByText('纵向')
      expect(portraitButton.closest('button')).toHaveClass('bg-blue-600')
    })
  })

  describe('内容选项', () => {
    it('点击复选框应该切换选项', () => {
      render(<ExportModal {...defaultProps} />)
      
      const checkboxes = screen.getAllByTestId('checkbox')
      const budgetCheckbox = checkboxes[0]
      
      fireEvent.click(budgetCheckbox)
      
      expect(budgetCheckbox).not.toBeChecked()
    })

    it('预算选项应该正确切换', () => {
      render(<ExportModal {...defaultProps} />)
      
      const checkboxes = screen.getAllByTestId('checkbox')
      const budgetCheckbox = checkboxes[0]
      
      expect(budgetCheckbox).toBeChecked()
      
      fireEvent.click(budgetCheckbox)
      expect(budgetCheckbox).not.toBeChecked()
    })

    it('统计选项应该正确切换', () => {
      render(<ExportModal {...defaultProps} />)
      
      const checkboxes = screen.getAllByTestId('checkbox')
      const statsCheckbox = checkboxes[1]
      
      expect(statsCheckbox).toBeChecked()
      
      fireEvent.click(statsCheckbox)
      expect(statsCheckbox).not.toBeChecked()
    })
  })

  describe('导出执行', () => {
    it('点击导出应该调用 exportToPdf', async () => {
      render(<ExportModal {...defaultProps} />)
      
      const exportButton = screen.getByText('导出')
      fireEvent.click(exportButton)
      
      const { exportToPdf } = await import('@/services/export')
      expect(vi.mocked(exportToPdf)).toHaveBeenCalled()
    })

    it('导出成功应该关闭弹窗', async () => {
      render(<ExportModal {...defaultProps} />)
      
      const exportButton = screen.getByText('导出')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('导出中应该禁用按钮', async () => {
      const { exportToPdf } = await import('@/services/export')
      vi.mocked(exportToPdf).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      )
      
      render(<ExportModal {...defaultProps} />)
      
      const exportButton = screen.getByText('导出')
      fireEvent.click(exportButton)
      
      const cancelButton = screen.getByText('取消')
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('错误处理', () => {
    it('导出失败应该显示错误', async () => {
      const { exportToPdf } = await import('@/services/export')
      vi.mocked(exportToPdf).mockResolvedValueOnce({
        success: false,
        error: '导出失败'
      })
      
      render(<ExportModal {...defaultProps} />)
      
      const exportButton = screen.getByText('导出')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(screen.getByText('导出失败')).toBeInTheDocument()
      })
    })

    it('显示错误后切换选项应该清除错误', async () => {
      const { exportToPdf } = await import('@/services/export')
      vi.mocked(exportToPdf).mockResolvedValueOnce({
        success: false,
        error: '导出失败'
      })
      
      render(<ExportModal {...defaultProps} />)
      
      const exportButton = screen.getByText('导出')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(screen.getByText('导出失败')).toBeInTheDocument()
      })
      
      const pngButton = screen.getByText('PNG 图片')
      fireEvent.click(pngButton)
      
      expect(screen.queryByText('导出失败')).not.toBeInTheDocument()
    })
  })

  describe('关闭弹窗', () => {
    it('点击取消应该关闭弹窗', () => {
      render(<ExportModal {...defaultProps} />)
      
      const cancelButton = screen.getByText('取消')
      fireEvent.click(cancelButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('点击背景遮罩应该关闭弹窗', () => {
      render(<ExportModal {...defaultProps} />)
      
      const overlay = document.querySelector('.bg-black\\/50')
      if (overlay) {
        fireEvent.click(overlay)
        expect(mockOnClose).toHaveBeenCalled()
      }
    })

    it('点击关闭按钮应该关闭弹窗', () => {
      render(<ExportModal {...defaultProps} />)
      
      const closeButton = screen.getByRole('button', { name: '' })
      fireEvent.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
