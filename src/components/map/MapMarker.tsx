import { memo, useEffect, useRef } from 'react'
import type { ActivityType, LocationData } from '@/services/supabase'
import { ACTIVITY_TYPE_ICONS } from '@/types/map'
import type { MapMarkerInstance } from '@/types/amap'

export interface MapMarkerProps {
  map: unknown
  position: [number, number]
  type: ActivityType
  name: string
  location: LocationData
  index: number
  onClick?: () => void
}

function MapMarkerComponent({
  map,
  position,
  type,
  name,
  index
}: MapMarkerProps) {
  const markerRef = useRef<MapMarkerInstance | null>(null)

  useEffect(() => {
    if (!map || !window.AMap) return

    const iconConfig = ACTIVITY_TYPE_ICONS[type]

    const content = `
      <div class="map-marker" style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background-color: ${iconConfig.color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <span style="
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">${index + 1}</span>
      </div>
    `

    const marker: MapMarkerInstance = new window.AMap.Marker({
      position,
      content,
      offset: [-16, -16],
      zIndex: 100
    })

    marker.setMap(map)
    markerRef.current = marker

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
    }
  }, [map, position, type, index])

  useEffect(() => {
    if (!markerRef.current) return

    const handleClick = () => {
      console.log('Marker clicked:', name)
    }

    markerRef.current.on('click', handleClick)

    return () => {
      if (markerRef.current) {
        markerRef.current.off('click', handleClick)
      }
    }
  }, [name])

  return null
}

export const MapMarker = memo(MapMarkerComponent)
