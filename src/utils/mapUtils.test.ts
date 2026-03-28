import { describe, it, expect } from 'vitest'
import {
  formatDistance,
  formatDuration,
  calculateCenter,
  calculateDistance,
  isValidLocation,
  groupItemsByDay,
  sortItemsByOrder,
  suggestTransportMode,
  getBoundsFromLocations,
  getActivityIcon,
  getTransportModeLabel
} from './mapUtils'
import type { LocationData } from '@/services/supabase'

describe('mapUtils', () => {
  describe('formatDistance', () => {
    it('should format distance in meters when less than 1000', () => {
      expect(formatDistance(500)).toBe('500米')
      expect(formatDistance(999)).toBe('999米')
      expect(formatDistance(0)).toBe('0米')
    })

    it('should format distance in kilometers when >= 1000', () => {
      expect(formatDistance(1000)).toBe('1.0公里')
      expect(formatDistance(1500)).toBe('1.5公里')
      expect(formatDistance(10000)).toBe('10.0公里')
    })

    it('should handle decimal values correctly', () => {
      expect(formatDistance(1234)).toBe('1.2公里')
      expect(formatDistance(5678)).toBe('5.7公里')
    })

    it('should handle edge cases', () => {
      expect(formatDistance(-100)).toBe('-100米')
      expect(formatDistance(0.5)).toBe('1米')
    })
  })

  describe('formatDuration', () => {
    it('should format duration in minutes when less than 60', () => {
      expect(formatDuration(30)).toBe('30分钟')
      expect(formatDuration(59)).toBe('59分钟')
      expect(formatDuration(1)).toBe('1分钟')
    })

    it('should format duration in hours and minutes when >= 60', () => {
      expect(formatDuration(60)).toBe('1小时')
      expect(formatDuration(90)).toBe('1小时30分钟')
      expect(formatDuration(120)).toBe('2小时')
      expect(formatDuration(150)).toBe('2小时30分钟')
    })

    it('should handle edge cases', () => {
      expect(formatDuration(0)).toBe('0分钟')
      expect(formatDuration(45)).toBe('45分钟')
      expect(formatDuration(180)).toBe('3小时')
    })
  })

  describe('calculateCenter', () => {
    it('should calculate center of single location', () => {
      const locations: LocationData[] = [
        { lat: 39.90923, lng: 116.397428, address: 'Beijing' }
      ]
      const center = calculateCenter(locations)
      expect(center).toEqual([116.397428, 39.90923])
    })

    it('should calculate center of multiple locations', () => {
      const locations: LocationData[] = [
        { lat: 39.90923, lng: 116.397428, address: 'Location 1' },
        { lat: 40.0, lng: 116.5, address: 'Location 2' }
      ]
      const center = calculateCenter(locations)
      expect(center).not.toBeNull()
      expect(center![0]).toBeCloseTo(116.448714, 5)
      expect(center![1]).toBeCloseTo(39.954615, 5)
    })

    it('should return null for empty array', () => {
      const center = calculateCenter([])
      expect(center).toBeNull()
    })

    it('should handle locations with same coordinates', () => {
      const locations: LocationData[] = [
        { lat: 39.90923, lng: 116.397428, address: 'Location 1' },
        { lat: 39.90923, lng: 116.397428, address: 'Location 2' }
      ]
      const center = calculateCenter(locations)
      expect(center).toEqual([116.397428, 39.90923])
    })

    it('should handle negative coordinates', () => {
      const locations: LocationData[] = [
        { lat: -33.8688, lng: 151.2093, address: 'Sydney' },
        { lat: -37.8136, lng: 144.9631, address: 'Melbourne' }
      ]
      const center = calculateCenter(locations)
      expect(center).not.toBeNull()
      expect(center![0]).toBeCloseTo(148.0862, 4)
      expect(center![1]).toBeCloseTo(-35.8412, 4)
    })
  })

  describe('isValidLocation', () => {
    it('should return true for valid location', () => {
      const location: LocationData = { lat: 39.90923, lng: 116.397428, address: 'Beijing' }
      expect(isValidLocation(location)).toBe(true)
    })

    it('should return false for location with zero coordinates', () => {
      const location: LocationData = { lat: 0, lng: 0, address: 'Invalid' }
      expect(isValidLocation(location)).toBe(false)
    })

    it('should return false for location with missing lat', () => {
      const location = { lng: 116.397428, address: 'Invalid' } as LocationData
      expect(isValidLocation(location)).toBe(false)
    })

    it('should return false for location with missing lng', () => {
      const location = { lat: 39.90923, address: 'Invalid' } as LocationData
      expect(isValidLocation(location)).toBe(false)
    })

    it('should return false for null or undefined', () => {
      expect(isValidLocation(null as unknown as LocationData)).toBe(false)
      expect(isValidLocation(undefined as unknown as LocationData)).toBe(false)
    })

    it('should handle extreme coordinates', () => {
      const validLocation1: LocationData = { lat: 90, lng: 180, address: 'North Pole' }
      const validLocation2: LocationData = { lat: -90, lng: -180, address: 'South Pole' }
      expect(isValidLocation(validLocation1)).toBe(true)
      expect(isValidLocation(validLocation2)).toBe(true)
    })
  })

  describe('groupItemsByDay', () => {
    interface TestItem {
      id: string
      day: number
      name: string
    }

    it('should group items by day', () => {
      const items: TestItem[] = [
        { id: '1', day: 1, name: 'Item 1' },
        { id: '2', day: 1, name: 'Item 2' },
        { id: '3', day: 2, name: 'Item 3' },
        { id: '4', day: 2, name: 'Item 4' },
        { id: '5', day: 3, name: 'Item 5' }
      ]

      const grouped = groupItemsByDay(items)
      expect(grouped.size).toBe(3)
      expect(grouped.get(1)).toHaveLength(2)
      expect(grouped.get(2)).toHaveLength(2)
      expect(grouped.get(3)).toHaveLength(1)
    })

    it('should return empty map for empty array', () => {
      const grouped = groupItemsByDay([])
      expect(grouped.size).toBe(0)
    })

    it('should handle single day', () => {
      const items: TestItem[] = [
        { id: '1', day: 1, name: 'Item 1' },
        { id: '2', day: 1, name: 'Item 2' }
      ]

      const grouped = groupItemsByDay(items)
      expect(grouped.size).toBe(1)
      expect(grouped.get(1)).toHaveLength(2)
    })

    it('should handle non-consecutive days', () => {
      const items: TestItem[] = [
        { id: '1', day: 1, name: 'Item 1' },
        { id: '2', day: 5, name: 'Item 2' },
        { id: '3', day: 10, name: 'Item 3' }
      ]

      const grouped = groupItemsByDay(items)
      expect(grouped.size).toBe(3)
      expect(grouped.has(1)).toBe(true)
      expect(grouped.has(5)).toBe(true)
      expect(grouped.has(10)).toBe(true)
    })
  })

  describe('sortItemsByOrder', () => {
    interface TestItem {
      id: string
      order_idx: number
      name: string
    }

    it('should sort items by order_idx', () => {
      const items: TestItem[] = [
        { id: '1', order_idx: 3, name: 'Item 1' },
        { id: '2', order_idx: 1, name: 'Item 2' },
        { id: '3', order_idx: 2, name: 'Item 3' }
      ]

      const sorted = sortItemsByOrder(items)
      expect(sorted[0].order_idx).toBe(1)
      expect(sorted[1].order_idx).toBe(2)
      expect(sorted[2].order_idx).toBe(3)
    })

    it('should return empty array for empty input', () => {
      const sorted = sortItemsByOrder([])
      expect(sorted).toEqual([])
    })

    it('should handle single item', () => {
      const items: TestItem[] = [
        { id: '1', order_idx: 1, name: 'Item 1' }
      ]

      const sorted = sortItemsByOrder(items)
      expect(sorted).toHaveLength(1)
      expect(sorted[0].order_idx).toBe(1)
    })

    it('should handle items with same order_idx', () => {
      const items: TestItem[] = [
        { id: '1', order_idx: 1, name: 'Item 1' },
        { id: '2', order_idx: 1, name: 'Item 2' },
        { id: '3', order_idx: 1, name: 'Item 3' }
      ]

      const sorted = sortItemsByOrder(items)
      expect(sorted).toHaveLength(3)
      expect(sorted.every(item => item.order_idx === 1)).toBe(true)
    })

    it('should not modify original array', () => {
      const items: TestItem[] = [
        { id: '1', order_idx: 3, name: 'Item 1' },
        { id: '2', order_idx: 1, name: 'Item 2' }
      ]

      const sorted = sortItemsByOrder(items)
      expect(items[0].order_idx).toBe(3)
      expect(sorted[0].order_idx).toBe(1)
    })
  })

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const distance = calculateDistance(39.90923, 116.397428, 40.0, 116.5)
      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeLessThan(20000)
    })

    it('should return 0 for same point', () => {
      const distance = calculateDistance(39.90923, 116.397428, 39.90923, 116.397428)
      expect(distance).toBe(0)
    })

    it('should handle negative coordinates', () => {
      const distance = calculateDistance(-33.8688, 151.2093, -37.8136, 144.9631)
      expect(distance).toBeGreaterThan(0)
    })

    it('should calculate distance in meters', () => {
      const distance = calculateDistance(39.90923, 116.397428, 39.9163, 116.3972)
      expect(distance).toBeGreaterThan(500)
      expect(distance).toBeLessThan(1500)
    })
  })

  describe('suggestTransportMode', () => {
    it('should suggest walking for short distances', () => {
      expect(suggestTransportMode(500)).toBe('walking')
      expect(suggestTransportMode(1000)).toBe('walking')
    })

    it('should suggest riding for medium distances', () => {
      expect(suggestTransportMode(1500)).toBe('riding')
      expect(suggestTransportMode(3000)).toBe('riding')
    })

    it('should suggest transit for longer distances', () => {
      expect(suggestTransportMode(5000)).toBe('transit')
      expect(suggestTransportMode(10000)).toBe('transit')
    })

    it('should suggest driving for very long distances', () => {
      expect(suggestTransportMode(15000)).toBe('driving')
      expect(suggestTransportMode(50000)).toBe('driving')
    })
  })

  describe('getBoundsFromLocations', () => {
    it('should return bounds for multiple locations', () => {
      const locations: LocationData[] = [
        { lat: 39.90923, lng: 116.397428, address: 'Location 1' },
        { lat: 40.0, lng: 116.5, address: 'Location 2' }
      ]
      const bounds = getBoundsFromLocations(locations)
      expect(bounds).not.toBeNull()
      expect(bounds!.minLat).toBe(39.90923)
      expect(bounds!.maxLat).toBe(40.0)
      expect(bounds!.minLng).toBe(116.397428)
      expect(bounds!.maxLng).toBe(116.5)
    })

    it('should return null for empty array', () => {
      const bounds = getBoundsFromLocations([])
      expect(bounds).toBeNull()
    })

    it('should handle single location', () => {
      const locations: LocationData[] = [
        { lat: 39.90923, lng: 116.397428, address: 'Location 1' }
      ]
      const bounds = getBoundsFromLocations(locations)
      expect(bounds).not.toBeNull()
      expect(bounds!.minLat).toBe(39.90923)
      expect(bounds!.maxLat).toBe(39.90923)
    })
  })

  describe('getActivityIcon', () => {
    it('should return correct icon for attraction', () => {
      const icon = getActivityIcon('attraction')
      expect(icon.color).toBe('#F59E0B')
      expect(icon.label).toBe('景点')
    })

    it('should return correct icon for restaurant', () => {
      const icon = getActivityIcon('restaurant')
      expect(icon.color).toBe('#EF4444')
      expect(icon.label).toBe('餐厅')
    })

    it('should return correct icon for accommodation', () => {
      const icon = getActivityIcon('accommodation')
      expect(icon.color).toBe('#8B5CF6')
      expect(icon.label).toBe('住宿')
    })

    it('should return default for unknown type', () => {
      const icon = getActivityIcon('unknown' as any)
      expect(icon.color).toBe('#6B7280')
      expect(icon.label).toBe('其他')
    })
  })

  describe('getTransportModeLabel', () => {
    it('should return correct label for walking', () => {
      expect(getTransportModeLabel('walking')).toBe('步行')
    })

    it('should return correct label for driving', () => {
      expect(getTransportModeLabel('driving')).toBe('驾车')
    })

    it('should return correct label for transit', () => {
      expect(getTransportModeLabel('transit')).toBe('公交/地铁')
    })

    it('should return correct label for riding', () => {
      expect(getTransportModeLabel('riding')).toBe('骑行')
    })

    it('should return the mode itself for unknown mode', () => {
      expect(getTransportModeLabel('unknown' as any)).toBe('unknown')
    })
  })
})
