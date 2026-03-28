import { memo, useState, useCallback } from 'react'
import { ZoomIn, ZoomOut, Locate, Map, Satellite, Loader2 } from 'lucide-react'
import type { AMapLayerType } from '@/types/map'

export interface MapControlsProps {
  map: unknown
  onZoomIn?: () => void
  onZoomOut?: () => void
  onLocate?: () => Promise<void>
  onLayerChange?: (layer: AMapLayerType) => void
  showZoom?: boolean
  showLocate?: boolean
  showLayerSwitch?: boolean
  showScale?: boolean
}

interface AMapInstance {
  getZoom: () => number
  setZoom: (zoom: number) => void
  setCenter: (position: [number, number]) => void
  getCenter: () => { lng: number; lat: number }
}

function MapControlsComponent({
  map,
  onZoomIn,
  onZoomOut,
  onLocate,
  onLayerChange,
  showZoom = true,
  showLocate = true,
  showLayerSwitch = true,
  showScale = true
}: MapControlsProps) {
  const [locating, setLocating] = useState(false)
  const [currentLayer, setCurrentLayer] = useState<AMapLayerType>('normal')

  const handleZoomIn = useCallback(() => {
    if (!map) return
    const mapInstance = map as AMapInstance
    const currentZoom = mapInstance.getZoom()
    mapInstance.setZoom(currentZoom + 1)
    onZoomIn?.()
  }, [map, onZoomIn])

  const handleZoomOut = useCallback(() => {
    if (!map) return
    const mapInstance = map as AMapInstance
    const currentZoom = mapInstance.getZoom()
    mapInstance.setZoom(currentZoom - 1)
    onZoomOut?.()
  }, [map, onZoomOut])

  const handleLocate = useCallback(async () => {
    if (!map || locating) return
    setLocating(true)
    try {
      await onLocate?.()
    } finally {
      setLocating(false)
    }
  }, [map, locating, onLocate])

  const handleLayerChange = useCallback((layer: AMapLayerType) => {
    setCurrentLayer(layer)
    onLayerChange?.(layer)
  }, [onLayerChange])

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
      {showZoom && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors border-b border-gray-200"
            title="放大"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      )}

      {showLocate && (
        <button
          onClick={handleLocate}
          disabled={locating}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="定位"
        >
          {locating ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <Locate className="w-5 h-5 text-gray-700" />
          )}
        </button>
      )}

      {showLayerSwitch && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <button
            onClick={() => handleLayerChange('normal')}
            className={`w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors border-b border-gray-200 ${
              currentLayer === 'normal' ? 'bg-blue-50' : ''
            }`}
            title="标准地图"
          >
            <Map className={`w-5 h-5 ${currentLayer === 'normal' ? 'text-blue-500' : 'text-gray-700'}`} />
          </button>
          <button
            onClick={() => handleLayerChange('satellite')}
            className={`w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors ${
              currentLayer === 'satellite' ? 'bg-blue-50' : ''
            }`}
            title="卫星地图"
          >
            <Satellite className={`w-5 h-5 ${currentLayer === 'satellite' ? 'text-blue-500' : 'text-gray-700'}`} />
          </button>
        </div>
      )}

      {showScale && (
        <div className="bg-white/80 px-2 py-1 rounded text-xs text-gray-600 shadow-sm">
          比例尺
        </div>
      )}
    </div>
  )
}

export const MapControls = memo(MapControlsComponent)
