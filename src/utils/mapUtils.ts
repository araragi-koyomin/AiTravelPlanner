import type { LocationData, ActivityType } from '@/services/supabase'
import type { TransportMode } from '@/types/map'
import { ACTIVITY_TYPE_ICONS, TRANSPORT_MODE_LABELS } from '@/types/map'

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}米`
  }
  return `${(meters / 1000).toFixed(1)}公里`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (mins === 0) {
    return `${hours}小时`
  }
  return `${hours}小时${mins}分钟`
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function getActivityIcon(type: ActivityType): { color: string; label: string } {
  return ACTIVITY_TYPE_ICONS[type] || { color: '#6B7280', label: '其他' }
}

export function getTransportModeLabel(mode: TransportMode): string {
  return TRANSPORT_MODE_LABELS[mode] || mode
}

export function suggestTransportMode(distance: number): TransportMode {
  if (distance <= 1000) {
    return 'walking'
  } else if (distance <= 3000) {
    return 'riding'
  } else if (distance <= 10000) {
    return 'transit'
  } else {
    return 'driving'
  }
}

export function getBoundsFromLocations(locations: LocationData[]): {
  minLng: number
  maxLng: number
  minLat: number
  maxLat: number
} | null {
  if (locations.length === 0) return null

  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  for (const loc of locations) {
    if (loc.lng < minLng) minLng = loc.lng
    if (loc.lng > maxLng) maxLng = loc.lng
    if (loc.lat < minLat) minLat = loc.lat
    if (loc.lat > maxLat) maxLat = loc.lat
  }

  return { minLng, maxLng, minLat, maxLat }
}

export function calculateCenter(locations: LocationData[]): [number, number] | null {
  if (locations.length === 0) return null

  let sumLng = 0
  let sumLat = 0

  for (const loc of locations) {
    sumLng += loc.lng
    sumLat += loc.lat
  }

  return [sumLng / locations.length, sumLat / locations.length]
}

export function isValidLocation(location: LocationData | null | undefined): boolean {
  if (!location) return false
  return (
    typeof location.lat === 'number' &&
    typeof location.lng === 'number' &&
    !isNaN(location.lat) &&
    !isNaN(location.lng) &&
    location.lat !== 0 &&
    location.lng !== 0
  )
}

export function groupItemsByDay<T extends { day: number }>(
  items: T[]
): Map<number, T[]> {
  const grouped = new Map<number, T[]>()

  for (const item of items) {
    const dayItems = grouped.get(item.day) || []
    dayItems.push(item)
    grouped.set(item.day, dayItems)
  }

  return grouped
}

export function sortItemsByOrder<T extends { order_idx: number }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => a.order_idx - b.order_idx)
}
