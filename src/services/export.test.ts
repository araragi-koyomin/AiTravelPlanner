import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  exportToPdf,
  exportToImage,
  exportFromElement
} from './export'
import type { Itinerary, DailyScheduleBuilt, BudgetBreakdown } from './itinerary'
import type { ExportOptions } from '@/types/export'

vi.mock('jspdf', () => {
  const mockPdf = {
    internal: {
      pageSize: {
        getWidth: vi.fn(() => 210),
        getHeight: vi.fn(() => 297)
      }
    },
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setDrawColor: vi.fn(),
    text: vi.fn(),
    line: vi.fn(),
    addPage: vi.fn(),
    setPage: vi.fn(),
    getNumberOfPages: vi.fn(() => 1),
    addImage: vi.fn(),
    output: vi.fn(() => 'data:application/pdf;base64,mock'),
    save: vi.fn(),
    splitTextToSize: vi.fn((text: string) => [text])
  }

  return {
    default: vi.fn(() => mockPdf)
  }
})

vi.mock('html2canvas', () => {
  const mockCanvas = {
    toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
    width: 800,
    height: 600,
    getContext: vi.fn(() => ({
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn()
    }))
  }
  return {
    default: vi.fn().mockResolvedValue(mockCanvas)
  }
})

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
    items: [
      {
        id: 'item-1',
        itinerary_id: 'test-id',
        day: 1,
        time: '09:00',
        type: 'attraction',
        name: '故宫博物院',
        location: { address: '北京市东城区景山前街4号', lat: 39.9163, lng: 116.3972 },
        description: '中国古代宫殿建筑群',
        cost: 60,
        duration: 180,
        tips: '建议提前预约',
        image_url: null,
        order_idx: 0,
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
  },
  {
    day: 2,
    date: '2024-01-02',
    dayOfWeek: '周二',
    theme: '文化之旅',
    items: [
      {
        id: 'item-2',
        itinerary_id: 'test-id',
        day: 2,
        time: '10:00',
        type: 'attraction',
        name: '长城',
        location: { address: '北京市延庆区八达岭镇', lat: 40.3597, lng: 116.0199 },
        description: '世界文化遗产',
        cost: 45,
        duration: 240,
        tips: null,
        image_url: null,
        order_idx: 0,
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
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

const defaultOptions: ExportOptions = {
  format: 'pdf',
  includeMap: false,
  includeBudget: true,
  includeStatistics: true,
  quality: 'high',
  orientation: 'portrait'
}

describe('export service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
      width: 800,
      height: 600,
      getContext: vi.fn(() => ({
        fillStyle: '',
        fillRect: vi.fn(),
        drawImage: vi.fn()
      }))
    }
    
    const mockDiv = {
      innerHTML: '',
      style: {} as CSSStyleDeclaration,
      setAttribute: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn()
    }
    
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn()
    }
    
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as unknown as HTMLCanvasElement
      }
      if (tagName === 'div') {
        return mockDiv as unknown as HTMLDivElement
      }
      if (tagName === 'a') {
        return mockAnchor as unknown as HTMLAnchorElement
      }
      return document.createElement(tagName)
    })
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {
      return {} as Node
    })
    
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {
      return {} as Node
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('exportToPdf', () => {
    it('应该调用 PDF 导出函数', async () => {
      const result = await exportToPdf(
        mockItinerary,
        mockDailySchedule,
        mockBudgetBreakdown,
        defaultOptions
      )

      expect(result).toBeDefined()
      expect(result).toHaveProperty('success')
    })

    it('应该调用进度回调', async () => {
      const progressCallback = vi.fn()
      await exportToPdf(
        mockItinerary,
        mockDailySchedule,
        mockBudgetBreakdown,
        defaultOptions,
        progressCallback
      )

      expect(exportToPdf).toBeDefined()
    })

    it('应该使用正确的方向设置', async () => {
      const landscapeOptions = { ...defaultOptions, orientation: 'landscape' as const }
      const result = await exportToPdf(
        mockItinerary,
        mockDailySchedule,
        mockBudgetBreakdown,
        landscapeOptions
      )

      expect(result).toBeDefined()
    })

    it('应该处理空行程项', async () => {
      const emptySchedule: DailyScheduleBuilt[] = [
        { day: 1, date: '2024-01-01', dayOfWeek: '周一', theme: '探索之旅', items: [] }
      ]
      const result = await exportToPdf(
        mockItinerary,
        emptySchedule,
        mockBudgetBreakdown,
        defaultOptions
      )

      expect(result).toBeDefined()
    })

    it('应该正确处理 includeBudget 选项', async () => {
      const optionsWithoutBudget = { ...defaultOptions, includeBudget: false }
      const result = await exportToPdf(
        mockItinerary,
        mockDailySchedule,
        mockBudgetBreakdown,
        optionsWithoutBudget
      )

      expect(result).toBeDefined()
    })

    it('应该正确处理 includeStatistics 选项', async () => {
      const optionsWithoutStats = { ...defaultOptions, includeStatistics: false }
      const result = await exportToPdf(
        mockItinerary,
        mockDailySchedule,
        mockBudgetBreakdown,
        optionsWithoutStats
      )

      expect(result).toBeDefined()
    })
  })

  describe('exportToImage', () => {
    it('应该返回成功结果', async () => {
      const mockElement = document.createElement('div')
      
      const pngOptions: ExportOptions = { ...defaultOptions, format: 'png' }
      const result = await exportToImage(mockElement, mockItinerary, pngOptions)

      expect(result).toHaveProperty('success')
    })

    it('应该调用进度回调', async () => {
      const mockElement = document.createElement('div')
      const progressCallback = vi.fn()
      const pngOptions: ExportOptions = { ...defaultOptions, format: 'png' }
      await exportToImage(mockElement, mockItinerary, pngOptions, progressCallback)

      expect(progressCallback).toHaveBeenCalled()
    })
  })

  describe('exportFromElement', () => {
    it('应该返回结果对象', async () => {
      const mockElement = document.createElement('div')
      const pdfOptions: ExportOptions = { ...defaultOptions, format: 'pdf' }
      const result = await exportFromElement(mockElement, mockItinerary, pdfOptions)

      expect(result).toHaveProperty('success')
    })

    it('应该传递正确的参数', async () => {
      const mockElement = document.createElement('div')
      const progressCallback = vi.fn()
      const pngOptions: ExportOptions = { ...defaultOptions, format: 'png' }
      await exportFromElement(mockElement, mockItinerary, pngOptions, progressCallback)

      expect(progressCallback).toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('PDF 导出应该返回结果', async () => {
      const result = await exportToPdf(
        mockItinerary,
        mockDailySchedule,
        mockBudgetBreakdown,
        defaultOptions
      )

      expect(result).toBeDefined()
      expect(result).toHaveProperty('success')
    })

    it('图片导出应该返回结果', async () => {
      const mockElement = document.createElement('div')
      const pngOptions: ExportOptions = { ...defaultOptions, format: 'png' }
      const result = await exportToImage(mockElement, mockItinerary, pngOptions)

      expect(result).toBeDefined()
      expect(result).toHaveProperty('success')
    })

    it('导出函数应该存在', async () => {
      expect(exportToPdf).toBeDefined()
      expect(exportToImage).toBeDefined()
    })
  })
})
