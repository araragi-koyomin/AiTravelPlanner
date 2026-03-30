import { format as formatDate } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { ExportFormat } from '@/types/export'
import type { Itinerary } from '@/services/itinerary'

export function generateFilename(itinerary: Itinerary, format: ExportFormat): string {
  const destination = sanitizeFilename(itinerary.destination)
  const dateStr = formatDate(new Date(), 'yyyyMMdd', { locale: zhCN })
  const ext = format === 'jpeg' ? 'jpg' : format
  
  return `${destination}_${dateStr}.${ext}`
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const startStr = formatDate(start, 'yyyy年MM月dd日', { locale: zhCN })
  const endStr = formatDate(end, 'MM月dd日', { locale: zhCN })
  
  return `${startStr} - ${endStr}`
}

export function formatDateForExport(dateStr: string): string {
  return formatDate(new Date(dateStr), 'yyyy年MM月dd日 EEEE', { locale: zhCN })
}

export function formatTimeForExport(time: string): string {
  return time
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN')}`
}

export function calculateImageScale(quality: 'standard' | 'high' | 'ultra'): number {
  const scaleMap = {
    standard: 1,
    high: 2,
    ultra: 3
  }
  return scaleMap[quality]
}

export function getMimeType(format: ExportFormat): string {
  const mimeMap: Record<ExportFormat, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpeg: 'image/jpeg'
  }
  return mimeMap[format]
}

export function getFileExtension(format: ExportFormat): string {
  return format === 'jpeg' ? 'jpg' : format
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

export function getActivityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    transport: '交通',
    accommodation: '住宿',
    attraction: '景点',
    restaurant: '餐饮',
    activity: '活动',
    shopping: '购物'
  }
  return labels[type] || type
}

export function getBudgetCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    transport: '交通',
    accommodation: '住宿',
    food: '餐饮',
    tickets: '门票',
    shopping: '购物',
    entertainment: '娱乐',
    other: '其他'
  }
  return labels[category] || category
}
