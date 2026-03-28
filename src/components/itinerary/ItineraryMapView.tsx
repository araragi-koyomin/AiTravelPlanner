import { memo, useState, useCallback, useMemo, useEffect } from 'react'
import { AMap, MapMarker, MapInfoWindow, MapRoute, MapControls } from '@/components/map'
import type { ItineraryItem } from '@/services/itinerary'
import type { TransportMode, AMapInstance } from '@/types/map'
import { calculateCenter, isValidLocation, groupItemsByDay, sortItemsByOrder } from '@/utils/mapUtils'
import { recommendTransport, type TransportRecommendation } from '@/services/amap'
import { Loader2, ChevronRight } from 'lucide-react'

export interface ItineraryMapViewProps {
  items: ItineraryItem[]
  className?: string
}

function ItineraryMapViewComponent({ items, className = '' }: ItineraryMapViewProps) {
  const [map, setMap] = useState<AMapInstance | null>(null)
  const [selectedItem, setSelectedItem] = useState<ItineraryItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [routeInfo, setRouteInfo] = useState<{
    origin: ItineraryItem
    destination: ItineraryItem
    mode: TransportMode
  } | null>(null)
  const [transportRecommendations, setTransportRecommendations] = useState<TransportRecommendation[]>([])
  const [showTransportPanel, setShowTransportPanel] = useState(false)

  const validItems = useMemo(() => {
    return items.filter(item => isValidLocation(item.location))
  }, [items])

  const center = useMemo(() => {
    if (validItems.length === 0) return null
    return calculateCenter(validItems.map(item => item.location))
  }, [validItems])

  const itemsByDay = useMemo(() => {
    return groupItemsByDay(validItems)
  }, [validItems])

  const sortedDays = useMemo(() => {
    return Array.from(itemsByDay.keys()).sort((a, b) => a - b)
  }, [itemsByDay])

  const handleMapLoad = useCallback((mapInstance: unknown) => {
    setMap(mapInstance as AMapInstance)
  }, [])

  const handleMapError = useCallback((err: Error) => {
    console.error('地图加载失败:', err)
  }, [])

  const handleMarkerClick = useCallback((item: ItineraryItem) => {
    setSelectedItem(item)
  }, [])

  const handleInfoWindowClose = useCallback(() => {
    setSelectedItem(null)
  }, [])

  const handleLocate = useCallback(async () => {
    if (!map) return

    try {
      const position = await new Promise<{ lng: number; lat: number }>((resolve, reject) => {
        if (!window.AMap) {
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

        geolocation.getCurrentPosition((status: string, result: { position: { lng: number; lat: number } }) => {
          if (status === 'complete') {
            resolve(result.position)
          } else {
            reject(new Error('定位失败'))
          }
        })
      })

      map.setCenter([position.lng, position.lat])
    } catch (err) {
      console.error('定位失败:', err)
    }
  }, [map])

  const handleLayerChange = useCallback((layer: 'normal' | 'satellite' | 'traffic') => {
    if (!map) return

    if (layer === 'satellite') {
      map.setMapStyle('amap://styles/satellite')
    } else {
      map.setMapStyle('amap://styles/normal')
    }
  }, [map])

  const handleRouteComplete = useCallback(() => {
    setLoading(false)
  }, [])

  const handleRouteError = useCallback((err: Error) => {
    setLoading(false)
    console.error('路线规划失败:', err)
  }, [])

  const handleShowRoute = useCallback(async (origin: ItineraryItem, destination: ItineraryItem) => {
    setLoading(true)
    setRouteInfo({
      origin,
      destination,
      mode: 'driving'
    })

    try {
      const response = await recommendTransport({
        origin: {
          name: origin.name,
          lat: origin.location.lat,
          lng: origin.location.lng
        },
        destination: {
          name: destination.name,
          lat: destination.location.lat,
          lng: destination.location.lng
        }
      })

      if (response.success && response.recommendations.length > 0) {
        setTransportRecommendations(response.recommendations)
        setShowTransportPanel(true)

        const bestRecommendation = response.recommendations[0]
        setRouteInfo({
          origin,
          destination,
          mode: bestRecommendation.mode
        })
      }
    } catch (err) {
      console.error('获取交通推荐失败:', err)
    }
  }, [])

  const handleTransportModeChange = useCallback((mode: TransportMode) => {
    if (!routeInfo) return
    setRouteInfo({
      ...routeInfo,
      mode
    })
  }, [routeInfo])

  useEffect(() => {
    if (map && validItems.length > 0) {
      const bounds = validItems.map(item => [item.location.lng, item.location.lat] as [number, number])
      if (bounds.length > 0) {
        const minLng = Math.min(...bounds.map(b => b[0]))
        const maxLng = Math.max(...bounds.map(b => b[0]))
        const minLat = Math.min(...bounds.map(b => b[1]))
        const maxLat = Math.max(...bounds.map(b => b[1]))

        const padding = 0.01
        const sw: [number, number] = [minLng - padding, minLat - padding]
        const ne: [number, number] = [maxLng + padding, maxLat + padding]

        if (window.AMap) {
          const boundsObj = new window.AMap.Bounds(sw, ne)
          map.setBounds(boundsObj)
        }
      }
    }
  }, [map, validItems])

  return (
    <div className={`relative ${className}`}>
      <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
        <AMap
          containerId="itinerary-map"
          mapOptions={{
            zoom: 13,
            center: center || [116.397428, 39.90923]
          }}
          onLoad={handleMapLoad}
          onError={handleMapError}
        >
          {map && validItems.map((item, index) => (
            <MapMarker
              key={item.id}
              map={map}
              position={[item.location.lng, item.location.lat]}
              type={item.type}
              name={item.name}
              location={item.location}
              index={index}
              onClick={() => handleMarkerClick(item)}
            />
          ))}

          {map && selectedItem && (
            <MapInfoWindow
              map={map}
              position={[selectedItem.location.lng, selectedItem.location.lat]}
              type={selectedItem.type}
              name={selectedItem.name}
              time={selectedItem.time}
              description={selectedItem.description}
              cost={selectedItem.cost}
              duration={selectedItem.duration}
              tips={selectedItem.tips}
              location={selectedItem.location}
              visible={true}
              onClose={handleInfoWindowClose}
            />
          )}

          {map && routeInfo && (
            <MapRoute
              map={map}
              origin={[routeInfo.origin.location.lng, routeInfo.origin.location.lat]}
              destination={[routeInfo.destination.location.lng, routeInfo.destination.location.lat]}
              mode={routeInfo.mode}
              onRouteComplete={handleRouteComplete}
              onError={handleRouteError}
            />
          )}

          {map && (
            <MapControls
              map={map}
              onLocate={handleLocate}
              onLayerChange={handleLayerChange}
            />
          )}
        </AMap>
      </div>

      {showTransportPanel && transportRecommendations.length > 0 && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">交通推荐</h3>
            <button
              onClick={() => setShowTransportPanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            {transportRecommendations.map((rec) => (
              <button
                key={rec.mode}
                onClick={() => handleTransportModeChange(rec.mode)}
                className={`w-full text-left p-2 rounded border transition-colors ${routeInfo?.mode === rec.mode
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{getTransportLabel(rec.mode)}</span>
                  <span className="text-sm text-gray-500">{rec.estimatedDuration}分钟</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{rec.reason}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-30">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-semibold text-gray-900 mb-2">行程路线</h3>
        <div className="space-y-2">
          {sortedDays.map(day => {
            const dayItems = sortItemsByOrder(itemsByDay.get(day) || [])
            return (
              <div key={day} className="border rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-2">第 {day} 天</div>
                <div className="flex flex-wrap gap-2">
                  {dayItems.map((item, index) => (
                    <div key={item.id} className="flex items-center">
                      <button
                        onClick={() => handleMarkerClick(item)}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        {item.name}
                      </button>
                      {index < dayItems.length - 1 && (
                        <button
                          onClick={() => handleShowRoute(item, dayItems[index + 1])}
                          className="mx-1 p-1 text-gray-400 hover:text-blue-500 transition-colors"
                          title="查看路线"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function getTransportLabel(mode: TransportMode): string {
  const labels: Record<TransportMode, string> = {
    walking: '步行',
    driving: '驾车',
    transit: '公交/地铁',
    riding: '骑行'
  }
  return labels[mode] || mode
}

export const ItineraryMapView = memo(ItineraryMapViewComponent)
