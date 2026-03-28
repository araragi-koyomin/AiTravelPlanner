import type { ActivityType } from '@/services/supabase'

export type AMapLogLevel = 'off' | 'error' | 'warn' | 'info' | 'debug'

export type AMapLayerType = 'normal' | 'satellite' | 'traffic'

export type TransportMode = 'walking' | 'driving' | 'transit' | 'riding'

export interface AMapConfig {
  key: string
  version?: string
  plugins?: string[]
  AMapUI?: {
    version?: string
    plugins?: string[]
  }
  Loca?: {
    version?: string
  }
}

export interface AMapOptions {
  zoom?: number
  center?: [number, number]
  mapStyle?: string
  viewMode?: '2D' | '3D'
  pitch?: number
  rotation?: number
  features?: string[]
  layers?: AMapLayerType[]
  showLabel?: boolean
}

export interface AMapInstance {
  getCenter: () => { lng: number; lat: number }
  getZoom: () => number
  setCenter: (position: [number, number]) => void
  setZoom: (zoom: number) => void
  setBounds: (bounds: AMapBounds) => void
  getBounds: () => AMapBounds
  destroy: () => void
  on: (event: string, callback: (e: unknown) => void) => void
  off: (event: string, callback: (e: unknown) => void) => void
  add: (overlay: AMapOverlay) => void
  remove: (overlay: AMapOverlay) => void
  clearMap: () => void
  setMapStyle: (style: string) => void
  pixelToLngLat: (pixel: [number, number]) => { lng: number; lat: number }
  lngLatToPixel: (lngLat: [number, number]) => [number, number]
  panTo: (position: [number, number]) => void
  panBy: (x: number, y: number) => void
  setFitView: (overlays?: AMapOverlay[], immediately?: boolean, avoid?: [number, number, number, number], maxZoom?: number) => void
}

export interface AMapBounds {
  contains: (point: [number, number]) => boolean
  getCenter: () => { lng: number; lat: number }
  getNorthEast: () => { lng: number; lat: number }
  getSouthWest: () => { lng: number; lat: number }
  extend: (point: [number, number]) => void
}

export interface AMapOverlay {
  setMap: (map: AMapInstance | null) => void
  getMap: () => AMapInstance | null
  show: () => void
  hide: () => void
  on: (event: string, callback: (e: unknown) => void) => void
  off: (event: string, callback: (e: unknown) => void) => void
}

export interface AMapMarker extends AMapOverlay {
  setPosition: (position: [number, number]) => void
  getPosition: () => { lng: number; lat: number }
  setIcon: (icon: string | AMapIcon) => void
  setContent: (content: string | HTMLElement) => void
  setLabel: (label: { content: string; direction: string }) => void
  setTitle: (title: string) => void
  setOffset: (offset: [number, number]) => void
  setAnchor: (anchor: string) => void
  setAngle: (angle: number) => void
  setzIndex: (zIndex: number) => void
  setDraggable: (draggable: boolean) => void
  markOnAMAP: () => void
}

export interface AMapIcon {
  size: [number, number]
  imageOffset?: [number, number]
  image: string
  imageSize?: [number, number]
}

export interface AMapPolyline extends AMapOverlay {
  setPath: (path: [number, number][]) => void
  getPath: () => [number, number][]
  setOptions: (options: Record<string, unknown>) => void
  getOptions: () => Record<string, unknown>
  setLength: () => number
}

export interface AMapInfoWindow {
  open: (map: AMapInstance, position: [number, number]) => void
  close: () => void
  setContent: (content: string | HTMLElement) => void
  setPosition: (position: [number, number]) => void
  getPosition: () => { lng: number; lat: number }
  setOffset: (offset: [number, number]) => void
  setAnchor: (anchor: string) => void
  on: (event: string, callback: (e: unknown) => void) => void
  off: (event: string, callback: (e: unknown) => void) => void
}

export interface AMapGeolocation {
  getCurrentPosition: (
    callback: (status: string, result: AMapGeolocationResult) => void
  ) => void
  watchPosition: (
    callback: (status: string, result: AMapGeolocationResult) => void
  ) => void
  clearWatch: () => void
}

export interface AMapGeolocationResult {
  position: {
    lng: number
    lat: number
  }
  accuracy: number
  isConverted: boolean
  message: string
  location_type: string
  addressComponent: {
    country: string
    province: string
    city: string
    citycode: string
    district: string
    adcode: string
    street: string
    streetNumber: string
    township: string
  }
  formattedAddress: string
  roads: Array<{
    id: string
    name: string
    distance: number
    direction: string
    location: {
      lng: number
      lat: number
    }
  }>
  crosses: Array<{
    id: string
    name: string
    distance: number
    direction: string
    location: {
      lng: number
      lat: number
    }
  }>
  pois: Array<{
    id: string
    name: string
    type: string
    distance: number
    direction: string
    location: {
      lng: number
      lat: number
    }
  }>
}

export interface GeolocationResult {
  position: [number, number]
  accuracy: number
  isConverted?: boolean
  message?: string
}

export interface GeolocationError {
  type: 'permission_denied' | 'position_unavailable' | 'timeout' | 'unknown'
  message: string
}

export interface AMapDrivingResult {
  info: string
  origin: string
  destination: string
  routes: AMapRoute[]
}

export interface AMapRoute {
  distance: number
  time: number
  policy: string
  steps: AMapStep[]
  tolls: number
  tollDistance: number
  trafficLightCount: number
}

export interface AMapStep {
  instruction: string
  road: string
  distance: number
  time: number
  path: [number, number][]
  action: string
  assistant_action: string
  tolls: number
  tollDistance: number
  tollRoad: string
}

export interface AMapWalkingResult {
  info: string
  origin: string
  destination: string
  routes: AMapWalkingRoute[]
}

export interface AMapWalkingRoute {
  distance: number
  time: number
  steps: AMapStep[]
}

export interface AMapTransitResult {
  info: string
  origin: string
  destination: string
  routes: AMapTransitRoute[]
}

export interface AMapTransitRoute {
  distance: number
  time: number
  cost: number
  nightflag: boolean
  transit_distance: number
  walking_distance: number
  steps: AMapTransitStep[]
}

export interface AMapTransitStep {
  instruction: string
  distance: number
  time: number
  type: string
  transit_mode: string
  transit_distance: number
  walking_distance: number
  path: [number, number][]
  line: {
    name: string
    type: string
    via_stops: string[]
    departure_stop: {
      name: string
      location: [number, number]
    }
    arrival_stop: {
      name: string
      location: [number, number]
    }
  }
}

export interface AMapRidingResult {
  info: string
  origin: string
  destination: string
  routes: AMapRidingRoute[]
}

export interface AMapRidingRoute {
  distance: number
  time: number
  steps: AMapStep[]
}

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, { color: string; label: string }> = {
  attraction: { color: '#F59E0B', label: '景点' },
  restaurant: { color: '#EF4444', label: '餐厅' },
  accommodation: { color: '#8B5CF6', label: '住宿' },
  transport: { color: '#3B82F6', label: '交通' },
  activity: { color: '#10B981', label: '活动' },
  shopping: { color: '#EC4899', label: '购物' }
}

export const TRANSPORT_MODE_LABELS: Record<TransportMode, string> = {
  walking: '步行',
  driving: '驾车',
  transit: '公交/地铁',
  riding: '骑行'
}
