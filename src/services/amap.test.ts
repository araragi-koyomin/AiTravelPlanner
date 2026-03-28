import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { recommendTransport } from './amap'
import type { TransportMode } from '@/types/map'

describe('amap service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('recommendTransport', () => {
    it('should return successful response with recommendations', async () => {
      const mockResponse = {
        success: true,
        distance: 10,
        recommendations: [
          {
            mode: 'driving' as TransportMode,
            estimatedDuration: 30,
            estimatedCost: 15,
            distance: 10,
            reason: '最快路线',
            priority: 1
          }
        ]
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await recommendTransport({
        origin: { name: '起点', lat: 39.90923, lng: 116.397428 },
        destination: { name: '终点', lat: 40.0, lng: 116.5 }
      })

      expect(result.success).toBe(true)
      expect(result.recommendations).toHaveLength(1)
      expect(result.recommendations[0].mode).toBe('driving')
      expect(result.recommendations[0].estimatedDuration).toBe(30)
    })

    it('should return error response when fetch fails', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

      const result = await recommendTransport({
        origin: { name: '起点', lat: 39.90923, lng: 116.397428 },
        destination: { name: '终点', lat: 40.0, lng: 116.5 }
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
      expect(result.recommendations).toEqual([])
    })

    it('should return error response when API returns error', async () => {
      const mockResponse = {
        success: false,
        distance: 0,
        error: 'Invalid parameters',
        recommendations: []
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await recommendTransport({
        origin: { name: '起点', lat: 39.90923, lng: 116.397428 },
        destination: { name: '终点', lat: 40.0, lng: 116.5 }
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid parameters')
    })

    it('should handle HTTP errors', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const result = await recommendTransport({
        origin: { name: '起点', lat: 39.90923, lng: 116.397428 },
        destination: { name: '终点', lat: 40.0, lng: 116.5 }
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('HTTP error')
    })

    it('should call API with correct parameters', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, distance: 0, recommendations: [] })
      })
      global.fetch = mockFetch

      await recommendTransport({
        origin: { name: '起点', lat: 39.90923, lng: 116.397428 },
        destination: { name: '终点', lat: 40.0, lng: 116.5 }
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/recommend-transport'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('起点')
        })
      )
    })

    it('should handle multiple recommendations', async () => {
      const mockResponse = {
        success: true,
        distance: 10,
        recommendations: [
          {
            mode: 'driving' as TransportMode,
            estimatedDuration: 30,
            estimatedCost: 15,
            distance: 10,
            reason: '最快路线',
            priority: 1
          },
          {
            mode: 'transit' as TransportMode,
            estimatedDuration: 45,
            estimatedCost: 5,
            distance: 10,
            reason: '最经济路线',
            priority: 2
          },
          {
            mode: 'walking' as TransportMode,
            estimatedDuration: 120,
            estimatedCost: 0,
            distance: 10,
            reason: '最健康路线',
            priority: 3
          }
        ]
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await recommendTransport({
        origin: { name: '起点', lat: 39.90923, lng: 116.397428 },
        destination: { name: '终点', lat: 40.0, lng: 116.5 }
      })

      expect(result.success).toBe(true)
      expect(result.recommendations).toHaveLength(3)
      expect(result.recommendations[0].mode).toBe('driving')
      expect(result.recommendations[1].mode).toBe('transit')
      expect(result.recommendations[2].mode).toBe('walking')
    })

    it('should handle empty recommendations', async () => {
      const mockResponse = {
        success: true,
        distance: 0,
        recommendations: []
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await recommendTransport({
        origin: { name: '起点', lat: 39.90923, lng: 116.397428 },
        destination: { name: '终点', lat: 40.0, lng: 116.5 }
      })

      expect(result.success).toBe(true)
      expect(result.recommendations).toEqual([])
    })

    it('should handle invalid JSON response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        }
      })

      const result = await recommendTransport({
        origin: { name: '起点', lat: 39.90923, lng: 116.397428 },
        destination: { name: '终点', lat: 40.0, lng: 116.5 }
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid JSON')
    })
  })
})
