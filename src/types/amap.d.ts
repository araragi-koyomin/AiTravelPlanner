import type { AMapOptions, AMapInstance, AMapGeolocation, AMapGeolocationResult, AMapBounds } from './map'

export type { AMapInstance } from './map'

export {}

declare global {
  interface Window {
    _AMapSecurityConfig: {
      securityJsCode: string
    }
    AMap: {
      Map: new (container: string | HTMLElement, options?: AMapOptions) => AMapInstance
      Geolocation: new (options?: Record<string, unknown>) => AMapGeolocation
      Bounds: new (southWest: [number, number], northEast: [number, number]) => AMapBounds
      Marker: new (options?: Record<string, unknown>) => MapMarkerInstance
      Polyline: new (options?: Record<string, unknown>) => MapPolylineInstance
      InfoWindow: new (options?: Record<string, unknown>) => MapInfoWindowInstance
      Scale: new () => unknown
      ToolBar: new () => unknown
      Driving: new (options?: Record<string, unknown>) => AMapDriving
      Walking: new (options?: Record<string, unknown>) => AMapWalking
      Transfer: new (options?: Record<string, unknown>) => AMapTransit
      Riding: new (options?: Record<string, unknown>) => AMapRiding
    }
  }
}

export interface MapMarkerInstance {
  setMap: (map: unknown) => void
  on: (event: string, callback: () => void) => void
  off: (event: string, callback: () => void) => void
  setPosition: (position: [number, number]) => void
  setContent: (content: string) => void
  setOffset: (offset: [number, number]) => void
  setzIndex: (zIndex: number) => void
  setTitle: (title: string) => void
  hide: () => void
  show: () => void
}

export interface MapPolylineInstance {
  setMap: (map: unknown) => void
  setPath: (path: Array<[number, number]>) => void
  setOptions: (options: Record<string, unknown>) => void
  hide: () => void
  show: () => void
}

export interface MapInfoWindowInstance {
  open: (map: unknown, position: [number, number]) => void
  close: () => void
  setContent: (content: string) => void
  setPosition: (position: [number, number]) => void
  on: (event: string, callback: () => void) => void
  off: (event: string, callback: () => void) => void
}

export interface AMapDriving {
  search: (
    origin: [number, number],
    destination: [number, number],
    callback: (status: string, result: AMapRouteResult) => void
  ) => void
  clear: () => void
}

export interface AMapWalking {
  search: (
    origin: [number, number],
    destination: [number, number],
    callback: (status: string, result: AMapRouteResult) => void
  ) => void
  clear: () => void
}

export interface AMapTransit {
  search: (
    origin: [number, number],
    destination: [number, number],
    callback: (status: string, result: AMapRouteResult) => void
  ) => void
  clear: () => void
}

export interface AMapRiding {
  search: (
    origin: [number, number],
    destination: [number, number],
    callback: (status: string, result: AMapRouteResult) => void
  ) => void
  clear: () => void
}

export interface AMapRouteResult {
  info: string
  routes: Array<{
    distance: number
    time: number
    steps?: Array<{
      instruction: string
      road: string
      distance: number
      time: number
      path: Array<[number, number]>
    }>
  }>
}
