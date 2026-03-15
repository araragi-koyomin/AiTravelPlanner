import { format, differenceInDays, parseISO, formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function formatDate(date: string | Date, formatStr: string = 'yyyy-MM-dd'): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, formatStr, { locale: zhCN })
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss')
}

export function formatRelativeTime(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(parsedDate, { addSuffix: true, locale: zhCN })
}

export function getDaysBetween(startDate: string | Date, endDate: string | Date): number {
  const parsedStart = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const parsedEnd = typeof endDate === 'string' ? parseISO(endDate) : endDate
  return differenceInDays(parsedEnd, parsedStart)
}
