import { describe, it, expect } from 'vitest'
import {
  DEFAULT_EXPORT_OPTIONS,
  EXPORT_FORMAT_LABELS,
  EXPORT_QUALITY_LABELS,
  EXPORT_ORIENTATION_LABELS,
  QUALITY_SCALE_MAP,
  FORMAT_MIME_TYPE_MAP,
  type ExportFormat,
  type ExportQuality,
  type ExportOrientation
} from './export'

describe('export types', () => {
  describe('DEFAULT_EXPORT_OPTIONS', () => {
    it('应该有正确的默认值', () => {
      expect(DEFAULT_EXPORT_OPTIONS).toBeDefined()
      expect(DEFAULT_EXPORT_OPTIONS).toEqual({
        format: 'pdf',
        includeMap: false,
        includeBudget: true,
        includeStatistics: true,
        quality: 'high',
        orientation: 'portrait'
      })
    })

    it('format 应该是 pdf', () => {
      expect(DEFAULT_EXPORT_OPTIONS.format).toBe('pdf')
    })

    it('quality 应该是 high', () => {
      expect(DEFAULT_EXPORT_OPTIONS.quality).toBe('high')
    })

    it('orientation 应该是 portrait', () => {
      expect(DEFAULT_EXPORT_OPTIONS.orientation).toBe('portrait')
    })

    it('includeBudget 默认为 true', () => {
      expect(DEFAULT_EXPORT_OPTIONS.includeBudget).toBe(true)
    })

    it('includeStatistics 默认为 true', () => {
      expect(DEFAULT_EXPORT_OPTIONS.includeStatistics).toBe(true)
    })

    it('includeMap 默认为 false', () => {
      expect(DEFAULT_EXPORT_OPTIONS.includeMap).toBe(false)
    })
  })

  describe('EXPORT_FORMAT_LABELS', () => {
    it('应该包含 pdf、png、jpeg 标签', () => {
      expect(EXPORT_FORMAT_LABELS).toHaveProperty('pdf')
      expect(EXPORT_FORMAT_LABELS).toHaveProperty('png')
      expect(EXPORT_FORMAT_LABELS).toHaveProperty('jpeg')
    })

    it('标签应该是中文', () => {
      expect(EXPORT_FORMAT_LABELS.pdf).toBe('PDF 文档')
      expect(EXPORT_FORMAT_LABELS.png).toBe('PNG 图片')
      expect(EXPORT_FORMAT_LABELS.jpeg).toBe('JPEG 图片')
    })

    it('应该包含所有格式类型', () => {
      const formats: ExportFormat[] = ['pdf', 'png', 'jpeg']
      formats.forEach(format => {
        expect(EXPORT_FORMAT_LABELS[format]).toBeDefined()
      })
    })
  })

  describe('EXPORT_QUALITY_LABELS', () => {
    it('应该包含 standard、high、ultra 标签', () => {
      expect(EXPORT_QUALITY_LABELS).toHaveProperty('standard')
      expect(EXPORT_QUALITY_LABELS).toHaveProperty('high')
      expect(EXPORT_QUALITY_LABELS).toHaveProperty('ultra')
    })

    it('标签应该包含倍数信息', () => {
      expect(EXPORT_QUALITY_LABELS.standard).toBe('标准 (1x)')
      expect(EXPORT_QUALITY_LABELS.high).toBe('高清 (2x)')
      expect(EXPORT_QUALITY_LABELS.ultra).toBe('超清 (3x)')
    })

    it('应该包含所有质量类型', () => {
      const qualities: ExportQuality[] = ['standard', 'high', 'ultra']
      qualities.forEach(quality => {
        expect(EXPORT_QUALITY_LABELS[quality]).toBeDefined()
      })
    })
  })

  describe('EXPORT_ORIENTATION_LABELS', () => {
    it('应该包含 portrait、landscape 标签', () => {
      expect(EXPORT_ORIENTATION_LABELS).toHaveProperty('portrait')
      expect(EXPORT_ORIENTATION_LABELS).toHaveProperty('landscape')
    })

    it('标签应该是中文', () => {
      expect(EXPORT_ORIENTATION_LABELS.portrait).toBe('纵向')
      expect(EXPORT_ORIENTATION_LABELS.landscape).toBe('横向')
    })

    it('应该包含所有方向类型', () => {
      const orientations: ExportOrientation[] = ['portrait', 'landscape']
      orientations.forEach(orientation => {
        expect(EXPORT_ORIENTATION_LABELS[orientation]).toBeDefined()
      })
    })
  })

  describe('QUALITY_SCALE_MAP', () => {
    it('standard 应该返回 1', () => {
      expect(QUALITY_SCALE_MAP.standard).toBe(1)
    })

    it('high 应该返回 2', () => {
      expect(QUALITY_SCALE_MAP.high).toBe(2)
    })

    it('ultra 应该返回 3', () => {
      expect(QUALITY_SCALE_MAP.ultra).toBe(3)
    })

    it('应该包含所有质量类型', () => {
      expect(Object.keys(QUALITY_SCALE_MAP)).toHaveLength(3)
    })
  })

  describe('FORMAT_MIME_TYPE_MAP', () => {
    it('pdf 应该返回 application/pdf', () => {
      expect(FORMAT_MIME_TYPE_MAP.pdf).toBe('application/pdf')
    })

    it('png 应该返回 image/png', () => {
      expect(FORMAT_MIME_TYPE_MAP.png).toBe('image/png')
    })

    it('jpeg 应该返回 image/jpeg', () => {
      expect(FORMAT_MIME_TYPE_MAP.jpeg).toBe('image/jpeg')
    })

    it('应该包含所有格式类型', () => {
      expect(Object.keys(FORMAT_MIME_TYPE_MAP)).toHaveLength(3)
    })
  })
})
