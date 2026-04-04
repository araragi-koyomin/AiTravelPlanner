import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAMap } from './useAMap'

vi.mock('@amap/amap-jsapi-loader', () => ({
  default: {
    load: vi.fn()
  }
}))

vi.mock('@/config/api', () => ({
  getAmapConfigWithFallback: vi.fn().mockResolvedValue({
    key: 'test-amap-key',
    securityJsCode: ''
  })
}))

vi.mock('@/stores/authStore', () => {
  const state = {
    user: { id: 'test-user-id' },
    isAuthenticated: true,
    isInitializing: false
  }
  return {
    useAuthStore: vi.fn((selector?: any) =>
      selector ? selector(state) : state
    )
  }
})

import AMapLoader from '@amap/amap-jsapi-loader'
import { getAmapConfigWithFallback } from '@/config/api'
import * as authStore from '@/stores/authStore'

describe('useAMap', () => {
  let mockMapInstance: any
  let mockGeolocation: any
  let containerElement: HTMLDivElement

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(getAmapConfigWithFallback).mockResolvedValue({
      key: 'test-amap-key',
      securityJsCode: ''
    })

    mockGeolocation = {
      getCurrentPosition: vi.fn()
    }

    mockMapInstance = {
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      destroy: vi.fn(),
      setBounds: vi.fn(),
      setMapStyle: vi.fn(),
      getCenter: vi.fn(() => ({ lng: 116.397428, lat: 39.90923 })),
      getZoom: vi.fn(() => 13)
    }

    ;(window as any).AMap = {
      Map: vi.fn(() => mockMapInstance),
      Geolocation: vi.fn(() => mockGeolocation),
      Bounds: vi.fn(() => ({ contains: vi.fn() }))
    }

    ;(window as any)._AMapSecurityConfig = {}

    containerElement = document.createElement('div')
    containerElement.id = 'test-map'
    document.body.appendChild(containerElement)
  })

  afterEach(() => {
    document.body.removeChild(containerElement)
    delete (window as any).AMap
    delete (window as any)._AMapSecurityConfig
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize map successfully', async () => {
      ;(AMapLoader.load as any).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() =>
        useAMap({
          containerId: 'test-map',
          autoLoad: true
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 5000 })

      expect(result.current.map).toBe(mockMapInstance)
      expect(result.current.error).toBeNull()
    })

    it('should handle initialization error', async () => {
      const mockError = new Error('Failed to load AMap')
      ;(AMapLoader.load as any).mockRejectedValueOnce(mockError)

      const { result } = renderHook(() =>
        useAMap({
          containerId: 'test-map',
          autoLoad: true
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(mockError)
      expect(result.current.map).toBeNull()
    })

    it('should not auto load when autoLoad is false', () => {
      const { result } = renderHook(() =>
        useAMap({
          containerId: 'test-map',
          autoLoad: false
        })
      )

      expect(result.current.loading).toBe(false)
      expect(result.current.map).toBeNull()
      expect(AMapLoader.load).not.toHaveBeenCalled()
    })

    it('should configure security settings', async () => {
      const testSecurityCode = 'test-security-code'
      vi.mocked(getAmapConfigWithFallback).mockResolvedValueOnce({
        key: 'test-amap-key',
        securityJsCode: testSecurityCode
      })

      ;(AMapLoader.load as any).mockResolvedValueOnce(undefined)

      renderHook(() =>
        useAMap({
          containerId: 'test-map',
          autoLoad: true
        })
      )

      await waitFor(() => {
        expect((window as any)._AMapSecurityConfig.securityJsCode).toBe(testSecurityCode)
      })
    })
  })

  describe('map operations', () => {
    it('should set center correctly', async () => {
      (AMapLoader.load as any).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() =>
        useAMap({
          containerId: 'test-map',
          autoLoad: true
        })
      )

      await waitFor(() => {
        expect(result.current.map).toBe(mockMapInstance)
      })

      act(() => {
        result.current.setCenter(116.397428, 39.90923)
      })

      expect(mockMapInstance.setCenter).toHaveBeenCalledWith([116.397428, 39.90923])
    })

    it('should set zoom correctly', async () => {
      (AMapLoader.load as any).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() =>
        useAMap({
          containerId: 'test-map',
          autoLoad: true
        })
      )

      await waitFor(() => {
        expect(result.current.map).toBe(mockMapInstance)
      })

      act(() => {
        result.current.setZoom(15)
      })

      expect(mockMapInstance.setZoom).toHaveBeenCalledWith(15)
    })

    it('should not call map methods when map is null', () => {
      const { result } = renderHook(() =>
        useAMap({
          containerId: 'test-map',
          autoLoad: false
        })
      )

      act(() => {
        result.current.setCenter(116.397428, 39.90923)
        result.current.setZoom(15)
      })

      expect(mockMapInstance.setCenter).not.toHaveBeenCalled()
      expect(mockMapInstance.setZoom).not.toHaveBeenCalled()
    })
  })

  describe('geolocation', () => {
    it('should get current position successfully', async () => {
      (AMapLoader.load as any).mockResolvedValueOnce(undefined)

      const mockPosition = { lng: 116.397428, lat: 39.90923 }
      mockGeolocation.getCurrentPosition.mockImplementation((callback: any) => {
        callback('complete', { position: mockPosition, accuracy: 10, isConverted: true, message: 'success' })
      })

      const { result } = renderHook(() =>
        useAMap({
          containerId: 'test-map',
          autoLoad: true
        })
      )

      await waitFor(() => {
        expect(result.current.map).toBe(mockMapInstance)
      })

      let position: any
      await act(async () => {
        position = await result.current.getCurrentPosition()
      })

      expect(position.position).toEqual([mockPosition.lng, mockPosition.lat])
      expect(position.accuracy).toBe(10)
    })

    it('should handle geolocation error', async () => {
      (AMapLoader.load as any).mockResolvedValueOnce(undefined)

      mockGeolocation.getCurrentPosition.mockImplementation((callback: any) => {
        callback('error', {})
      })

      const { result } = renderHook(() =>
        useAMap({
          containerId: 'test-map',
          autoLoad: true
        })
      )

      await waitFor(() => {
        expect(result.current.map).toBe(mockMapInstance)
      })

      await expect(result.current.getCurrentPosition()).rejects.toEqual({
        type: 'unknown',
        message: '获取位置失败'
      })
    })

    it('should reject when map is not initialized', async () => {
      const { result } = renderHook(() =>
        useAMap({
          containerId: 'test-map',
          autoLoad: false
        })
      )

      await expect(result.current.getCurrentPosition()).rejects.toThrow('地图未初始化')
    })
  })

  describe('cleanup', () => {
    it('should destroy map on unmount', async () => {
      (AMapLoader.load as any).mockResolvedValueOnce(undefined)

      const { result, unmount } = renderHook(() =>
        useAMap({
          containerId: 'test-map',
          autoLoad: true
        })
      )

      await waitFor(() => {
        expect(result.current.map).toBe(mockMapInstance)
      })

      unmount()

      expect(mockMapInstance.destroy).toHaveBeenCalled()
    })

    it('should manually destroy map', async () => {
      (AMapLoader.load as any).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() =>
        useAMap({
          containerId: 'test-map',
          autoLoad: true
        })
      )

      await waitFor(() => {
        expect(result.current.map).toBe(mockMapInstance)
      })

      act(() => {
        result.current.destroyMap()
      })

      expect(mockMapInstance.destroy).toHaveBeenCalled()
      expect(result.current.map).toBeNull()
    })
  })

  describe('manual initialization', () => {
    it('should initialize map manually', async () => {
      (AMapLoader.load as any).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() =>
        useAMap({
          containerId: 'test-map',
          autoLoad: false
        })
      )

      expect(result.current.map).toBeNull()

      await act(async () => {
        await result.current.initMap()
      })

      expect(result.current.map).toBe(mockMapInstance)
    })

    it('should not initialize twice', async () => {
      (AMapLoader.load as any).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() =>
        useAMap({
          containerId: 'test-map',
          autoLoad: true
        })
      )

      await waitFor(() => {
        expect(result.current.map).toBe(mockMapInstance)
      })

      await act(async () => {
        await result.current.initMap()
      })

      expect(AMapLoader.load).toHaveBeenCalledTimes(1)
    })
  })
})
