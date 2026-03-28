import { useState, useEffect, useCallback, useRef } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import type {
  AMapInstance,
  AMapConfig,
  AMapOptions,
  GeolocationResult,
  GeolocationError,
  AMapGeolocationResult
} from '@/types/map'

export interface UseAMapOptions {
  containerId: string
  config?: Partial<AMapConfig>
  mapOptions?: AMapOptions
  autoLoad?: boolean
}

export interface UseAMapReturn {
  map: AMapInstance | null
  loading: boolean
  error: Error | null
  initMap: () => Promise<void>
  destroyMap: () => void
  getCurrentPosition: () => Promise<GeolocationResult>
  setCenter: (lng: number, lat: number) => void
  setZoom: (zoom: number) => void
}

const defaultConfig: AMapConfig = {
  key: import.meta.env.VITE_AMAP_KEY || '',
  version: '2.0',
  plugins: [
    'AMap.Scale',
    'AMap.ToolBar',
    'AMap.Geolocation',
    'AMap.PlaceSearch',
    'AMap.Geocoder',
    'AMap.MarkerCluster'
  ],
  AMapUI: {
    version: '1.1',
    plugins: []
  }
}

const defaultMapOptions: AMapOptions = {
  zoom: 13,
  center: [116.397428, 39.90923],
  viewMode: '2D',
  showLabel: true
}

export function useAMap(options: UseAMapOptions): UseAMapReturn {
  const {
    containerId,
    config = {},
    mapOptions = {},
    autoLoad = true
  } = options

  const [map, setMap] = useState<AMapInstance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mapRef = useRef<AMapInstance | null>(null)
  const initializingRef = useRef(false)
  const containerIdRef = useRef(containerId)
  const configRef = useRef(config)
  const mapOptionsRef = useRef(mapOptions)

  containerIdRef.current = containerId
  configRef.current = config
  mapOptionsRef.current = mapOptions

  const initMap = useCallback(async () => {
    if (mapRef.current || initializingRef.current) {
      return
    }

    const amapKey = configRef.current.key || defaultConfig.key
    if (!amapKey) {
      setError(new Error('高德地图 API Key 未配置'))
      return
    }

    initializingRef.current = true
    setLoading(true)
    setError(null)

    const securityJsCode = import.meta.env.VITE_AMAP_SECURITY_JS_CODE || ''
    if (securityJsCode) {
      window._AMapSecurityConfig = {
        securityJsCode
      }
    }

    try {
      await AMapLoader.load({
        key: amapKey,
        version: configRef.current.version || defaultConfig.version || '2.0',
        plugins: configRef.current.plugins || defaultConfig.plugins,
        AMapUI: configRef.current.AMapUI || defaultConfig.AMapUI,
        Loca: configRef.current.Loca || defaultConfig.Loca
      })

      const container = document.getElementById(containerIdRef.current)
      if (!container) {
        throw new Error(`找不到地图容器元素: ${containerIdRef.current}`)
      }

      const mapInstance = new window.AMap.Map(containerIdRef.current, {
        ...defaultMapOptions,
        ...mapOptionsRef.current
      })

      mapRef.current = mapInstance
      setMap(mapInstance)

    } catch (err) {
      console.error('初始化地图失败:', err)
      setError(err instanceof Error ? err : new Error('初始化地图失败'))
      initializingRef.current = false
    } finally {
      setLoading(false)
    }
  }, [])

  const destroyMap = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.destroy()
      mapRef.current = null
      setMap(null)
    }
    initializingRef.current = false
  }, [])

  const getCurrentPosition = useCallback((): Promise<GeolocationResult> => {
    return new Promise((resolve, reject) => {
      if (!mapRef.current) {
        reject(new Error('地图未初始化'))
        return
      }

      const geolocation = new window.AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        convert: true,
        showButton: false,
        showMarker: false,
        showCircle: false,
        panToLocation: false,
        zoomToAccuracy: false
      })

      geolocation.getCurrentPosition(
        (status: string, result: AMapGeolocationResult) => {
          if (status === 'complete') {
            resolve({
              position: [result.position.lng, result.position.lat],
              accuracy: result.accuracy,
              isConverted: result.isConverted,
              message: result.message
            })
          } else {
            const geoError: GeolocationError = {
              type: 'unknown',
              message: '获取位置失败'
            }
            reject(geoError)
          }
        }
      )
    })
  }, [])

  const setCenter = useCallback((lng: number, lat: number) => {
    if (mapRef.current) {
      mapRef.current.setCenter([lng, lat])
    }
  }, [])

  const setZoom = useCallback((zoom: number) => {
    if (mapRef.current) {
      mapRef.current.setZoom(zoom)
    }
  }, [])

  useEffect(() => {
    if (!autoLoad) return

    initMap()

    return () => {
      destroyMap()
    }
  }, [autoLoad, initMap, destroyMap])

  return {
    map,
    loading,
    error,
    initMap,
    destroyMap,
    getCurrentPosition,
    setCenter,
    setZoom
  }
}
