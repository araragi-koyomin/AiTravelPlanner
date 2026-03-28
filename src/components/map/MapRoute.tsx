import { memo, useEffect, useRef } from 'react'
import type { TransportMode } from '@/types/map'
import type {
  MapPolylineInstance,
  AMapDriving,
  AMapWalking,
  AMapTransit,
  AMapRiding,
  AMapRouteResult
} from '@/types/amap'

export interface MapRouteProps {
  map: unknown
  origin: [number, number]
  destination: [number, number]
  mode: TransportMode
  onRouteComplete?: (result: { distance: number; duration: number }) => void
  onError?: (error: Error) => void
}

const ROUTE_COLORS: Record<TransportMode, string> = {
  walking: '#10B981',
  driving: '#3B82F6',
  transit: '#8B5CF6',
  riding: '#F59E0B'
}

function MapRouteComponent({
  map,
  origin,
  destination,
  mode,
  onRouteComplete,
  onError
}: MapRouteProps) {
  const polylineRef = useRef<MapPolylineInstance | null>(null)
  const routeServiceRef = useRef<AMapDriving | AMapWalking | AMapTransit | AMapRiding | null>(null)

  useEffect(() => {
    if (!map || !window.AMap) return

    const clearRoute = () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null)
        polylineRef.current = null
      }
      if (routeServiceRef.current) {
        routeServiceRef.current.clear()
        routeServiceRef.current = null
      }
    }

    clearRoute()

    const routeOptions = {
      policy: 'LEAST_TIME'
    }

    let routeService: AMapDriving | AMapWalking | AMapTransit | AMapRiding

    switch (mode) {
      case 'walking':
        routeService = new window.AMap.Walking(routeOptions)
        break
      case 'transit':
        routeService = new window.AMap.Transfer(routeOptions)
        break
      case 'riding':
        routeService = new window.AMap.Riding(routeOptions)
        break
      case 'driving':
      default:
        routeService = new window.AMap.Driving(routeOptions)
        break
    }

    routeServiceRef.current = routeService

    routeService.search(origin, destination, (status: string, result: AMapRouteResult) => {
      if (status === 'complete' && result.routes && result.routes.length > 0) {
        const route = result.routes[0]
        const path: Array<[number, number]> = []

        if (route.steps) {
          route.steps.forEach(step => {
            if (step.path) {
              path.push(...step.path)
            }
          })
        }

        if (path.length > 0) {
          const polyline: MapPolylineInstance = new window.AMap.Polyline({
            path,
            strokeColor: ROUTE_COLORS[mode],
            strokeWeight: 6,
            strokeOpacity: 0.8,
            lineJoin: 'round',
            lineCap: 'round',
            zIndex: 50
          })

          polyline.setMap(map)
          polylineRef.current = polyline

          if (onRouteComplete) {
            onRouteComplete({
              distance: route.distance,
              duration: route.time
            })
          }
        }
      } else {
        if (onError) {
          onError(new Error('路线规划失败'))
        }
      }
    })

    return clearRoute
  }, [map, origin, destination, mode, onRouteComplete, onError])

  return null
}

export const MapRoute = memo(MapRouteComponent)
