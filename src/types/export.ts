export type ExportFormat = 'pdf' | 'png' | 'jpeg'

export type ExportQuality = 'standard' | 'high' | 'ultra'

export type ExportOrientation = 'portrait' | 'landscape'

export interface ExportOptions {
  format: ExportFormat
  includeMap: boolean
  includeBudget: boolean
  includeStatistics: boolean
  quality: ExportQuality
  orientation: ExportOrientation
}

export interface ExportResult {
  success: boolean
  dataUrl?: string
  filename?: string
  error?: string
}

export interface ExportProgress {
  step: string
  progress: number
  total: number
}

export type ExportProgressCallback = (progress: ExportProgress) => void

export const QUALITY_SCALE_MAP: Record<ExportQuality, number> = {
  standard: 1,
  high: 2,
  ultra: 3
}

export const FORMAT_MIME_TYPE_MAP: Record<ExportFormat, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpeg: 'image/jpeg'
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'pdf',
  includeMap: false,
  includeBudget: true,
  includeStatistics: true,
  quality: 'high',
  orientation: 'portrait'
}

export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  pdf: 'PDF 文档',
  png: 'PNG 图片',
  jpeg: 'JPEG 图片'
}

export const EXPORT_QUALITY_LABELS: Record<ExportQuality, string> = {
  standard: '标准 (1x)',
  high: '高清 (2x)',
  ultra: '超清 (3x)'
}

export const EXPORT_ORIENTATION_LABELS: Record<ExportOrientation, string> = {
  portrait: '纵向',
  landscape: '横向'
}
