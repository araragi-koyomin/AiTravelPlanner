import { memo } from 'react'
import { MapPin } from 'lucide-react'

function MapLoadingComponent() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
      <div className="relative">
        <MapPin className="w-12 h-12 text-blue-500 animate-bounce" />
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-gray-300 rounded-full animate-pulse" />
      </div>
      <p className="mt-4 text-sm text-gray-600">正在加载地图...</p>
    </div>
  )
}

export const MapLoading = memo(MapLoadingComponent)
