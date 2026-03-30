import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateFilename,
  sanitizeFilename,
  formatDateRange,
  formatDateForExport,
  formatTimeForExport,
  formatCurrency,
  calculateImageScale,
  getMimeType,
  getFileExtension,
  downloadDataUrl,
  truncateText,
  getActivityTypeLabel,
  getBudgetCategoryLabel
} from './exportUtils'
import type { Itinerary } from '@/services/itinerary'

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

describe('exportUtils', () => {
  describe('generateFilename', () => {
    it('应该生成正确的文件名格式', () => {
      const filename = generateFilename(mockItinerary, 'pdf')
      expect(filename).toMatch(/^北京_\d{8}\.pdf$/)
    })

    it('应该处理特殊字符', () => {
      const specialItinerary = {
        ...mockItinerary,
        destination: '北<京>上:海"广/州\\深|圳?*'
      }
      const filename = generateFilename(specialItinerary, 'pdf')
      expect(filename).not.toMatch(/[<>:"/\\|?*]/)
    })

    it('应该处理不同导出格式', () => {
      const pdfFilename = generateFilename(mockItinerary, 'pdf')
      const pngFilename = generateFilename(mockItinerary, 'png')
      const jpegFilename = generateFilename(mockItinerary, 'jpeg')

      expect(pdfFilename).toMatch(/\.pdf$/)
      expect(pngFilename).toMatch(/\.png$/)
      expect(jpegFilename).toMatch(/\.jpg$/)
    })

    it('jpeg 格式应该生成 .jpg 扩展名', () => {
      const filename = generateFilename(mockItinerary, 'jpeg')
      expect(filename).toMatch(/\.jpg$/)
    })

    it('应该处理空格', () => {
      const spaceItinerary = {
        ...mockItinerary,
        destination: '北 京'
      }
      const filename = generateFilename(spaceItinerary, 'pdf')
      expect(filename).toContain('北_京')
    })
  })

  describe('sanitizeFilename', () => {
    it('应该移除非法字符', () => {
      expect(sanitizeFilename('test<file>name')).toBe('testfilename')
    })

    it('应该将空格替换为下划线', () => {
      expect(sanitizeFilename('test file name')).toBe('test_file_name')
    })

    it('应该截断过长的文件名', () => {
      const longName = 'a'.repeat(100)
      expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(50)
    })

    it('应该处理空字符串', () => {
      expect(sanitizeFilename('')).toBe('')
    })

    it('应该处理包含路径分隔符的字符串', () => {
      expect(sanitizeFilename('path/to/file')).toBe('pathtofile')
    })
  })

  describe('formatDateRange', () => {
    it('应该正确格式化日期范围', () => {
      const result = formatDateRange('2024-01-01', '2024-01-03')
      expect(result).toContain('2024年01月01日')
      expect(result).toContain('01月03日')
      expect(result).toContain(' - ')
    })

    it('应该用 - 分隔日期', () => {
      const result = formatDateRange('2024-01-01', '2024-01-03')
      expect(result).toMatch(/\d{4}年\d{2}月\d{2}日\s*-\s*\d{2}月\d{2}日/)
    })

    it('应该处理同一天', () => {
      const result = formatDateRange('2024-01-01', '2024-01-01')
      expect(result).toContain('2024年01月01日')
    })
  })

  describe('formatDateForExport', () => {
    it('应该正确格式化日期字符串', () => {
      const result = formatDateForExport('2024-01-01')
      expect(result).toContain('2024年')
      expect(result).toContain('01月')
      expect(result).toContain('01日')
    })

    it('应该包含星期', () => {
      const result = formatDateForExport('2024-01-01')
      expect(result).toMatch(/星期[一二三四五六日]/)
    })
  })

  describe('formatTimeForExport', () => {
    it('应该返回原始时间字符串', () => {
      expect(formatTimeForExport('09:00')).toBe('09:00')
      expect(formatTimeForExport('14:30')).toBe('14:30')
    })
  })

  describe('formatCurrency', () => {
    it('应该正确格式化整数金额', () => {
      expect(formatCurrency(1000)).toBe('¥1,000')
    })

    it('应该正确格式化小数金额', () => {
      expect(formatCurrency(1234.56)).toBe('¥1,234.56')
    })

    it('应该添加人民币符号', () => {
      const result = formatCurrency(100)
      expect(result.startsWith('¥')).toBe(true)
    })

    it('应该处理 0', () => {
      expect(formatCurrency(0)).toBe('¥0')
    })

    it('应该处理大额数字', () => {
      expect(formatCurrency(1000000)).toBe('¥1,000,000')
    })
  })

  describe('calculateImageScale', () => {
    it('standard 应该返回 1', () => {
      expect(calculateImageScale('standard')).toBe(1)
    })

    it('high 应该返回 2', () => {
      expect(calculateImageScale('high')).toBe(2)
    })

    it('ultra 应该返回 3', () => {
      expect(calculateImageScale('ultra')).toBe(3)
    })
  })

  describe('getMimeType', () => {
    it('pdf 应该返回 application/pdf', () => {
      expect(getMimeType('pdf')).toBe('application/pdf')
    })

    it('png 应该返回 image/png', () => {
      expect(getMimeType('png')).toBe('image/png')
    })

    it('jpeg 应该返回 image/jpeg', () => {
      expect(getMimeType('jpeg')).toBe('image/jpeg')
    })
  })

  describe('getFileExtension', () => {
    it('pdf 应该返回 pdf', () => {
      expect(getFileExtension('pdf')).toBe('pdf')
    })

    it('png 应该返回 png', () => {
      expect(getFileExtension('png')).toBe('png')
    })

    it('jpeg 应该返回 jpg', () => {
      expect(getFileExtension('jpeg')).toBe('jpg')
    })
  })

  describe('downloadDataUrl', () => {
    let mockLink: HTMLAnchorElement

    beforeEach(() => {
      mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      } as unknown as HTMLAnchorElement

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('应该创建下载链接', () => {
      downloadDataUrl('data:image/png;base64,test', 'test.png')
      expect(document.createElement).toHaveBeenCalledWith('a')
    })

    it('应该设置正确的 href 和 download', () => {
      downloadDataUrl('data:image/png;base64,test', 'test.png')
      expect(mockLink.href).toBe('data:image/png;base64,test')
      expect(mockLink.download).toBe('test.png')
    })

    it('应该触发点击事件', () => {
      downloadDataUrl('data:image/png;base64,test', 'test.png')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('应该清理 DOM', () => {
      downloadDataUrl('data:image/png;base64,test', 'test.png')
      expect(document.body.appendChild).toHaveBeenCalled()
      expect(document.body.removeChild).toHaveBeenCalled()
    })
  })

  describe('truncateText', () => {
    it('不应该截断短文本', () => {
      expect(truncateText('short text', 20)).toBe('short text')
    })

    it('应该截断长文本并添加省略号', () => {
      const result = truncateText('this is a very long text that needs to be truncated', 20)
      expect(result.length).toBe(20)
      expect(result.endsWith('...')).toBe(true)
    })

    it('应该处理等于最大长度的文本', () => {
      expect(truncateText('exact length', 12)).toBe('exact length')
    })

    it('应该处理空字符串', () => {
      expect(truncateText('', 10)).toBe('')
    })
  })

  describe('getActivityTypeLabel', () => {
    it('应该返回正确的活动类型标签', () => {
      expect(getActivityTypeLabel('transport')).toBe('交通')
      expect(getActivityTypeLabel('accommodation')).toBe('住宿')
      expect(getActivityTypeLabel('attraction')).toBe('景点')
      expect(getActivityTypeLabel('restaurant')).toBe('餐饮')
      expect(getActivityTypeLabel('activity')).toBe('活动')
      expect(getActivityTypeLabel('shopping')).toBe('购物')
    })

    it('未知类型应该返回原值', () => {
      expect(getActivityTypeLabel('unknown')).toBe('unknown')
    })
  })

  describe('getBudgetCategoryLabel', () => {
    it('应该返回正确的费用分类标签', () => {
      expect(getBudgetCategoryLabel('transport')).toBe('交通')
      expect(getBudgetCategoryLabel('accommodation')).toBe('住宿')
      expect(getBudgetCategoryLabel('food')).toBe('餐饮')
      expect(getBudgetCategoryLabel('tickets')).toBe('门票')
      expect(getBudgetCategoryLabel('shopping')).toBe('购物')
      expect(getBudgetCategoryLabel('entertainment')).toBe('娱乐')
      expect(getBudgetCategoryLabel('other')).toBe('其他')
    })

    it('未知类型应该返回原值', () => {
      expect(getBudgetCategoryLabel('unknown')).toBe('unknown')
    })
  })
})
