import { memo, useEffect, useRef } from 'react'
import type { ActivityType, LocationData } from '@/services/supabase'
import { ACTIVITY_TYPE_ICONS } from '@/types/map'
import type { MapInfoWindowInstance } from '@/types/amap'

export interface MapInfoWindowProps {
  map: unknown
  position: [number, number]
  type: ActivityType
  name: string
  time?: string
  description?: string | null
  cost?: number | null
  duration?: number | null
  tips?: string | null
  location: LocationData
  visible: boolean
  onClose?: () => void
}

function MapInfoWindowComponent({
  map,
  position,
  type,
  name,
  time,
  description,
  cost,
  duration,
  tips,
  location,
  visible,
  onClose
}: MapInfoWindowProps) {
  const infoWindowRef = useRef<MapInfoWindowInstance | null>(null)

  useEffect(() => {
    if (!map || !window.AMap) return

    const iconConfig = ACTIVITY_TYPE_ICONS[type]

    const formatDuration = (minutes: number): string => {
      if (minutes < 60) {
        return `${minutes}分钟`
      }
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
    }

    const formatCost = (amount: number): string => {
      return `¥${amount.toFixed(2)}`
    }

    const content = `
      <div class="map-info-window" style="
        min-width: 200px;
        max-width: 300px;
        padding: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="
              width: 8px;
              height: 8px;
              background-color: ${iconConfig.color};
              border-radius: 50%;
            "></span>
            <span style="
              font-size: 12px;
              color: #666;
            ">${iconConfig.label}</span>
          </div>
          <button class="info-window-close" style="
            border: none;
            background: none;
            cursor: pointer;
            padding: 4px;
            font-size: 16px;
            color: #999;
          ">×</button>
        </div>
        
        <h3 style="
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        ">${name}</h3>
        
        ${time ? `
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
            <span style="font-size: 12px; color: #666;">时间:</span>
            <span style="font-size: 12px; color: #333;">${time}</span>
          </div>
        ` : ''}
        
        ${duration ? `
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
            <span style="font-size: 12px; color: #666;">时长:</span>
            <span style="font-size: 12px; color: #333;">${formatDuration(duration)}</span>
          </div>
        ` : ''}
        
        ${cost !== null && cost !== undefined ? `
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
            <span style="font-size: 12px; color: #666;">费用:</span>
            <span style="font-size: 12px; color: #F59E0B; font-weight: 500;">${formatCost(cost)}</span>
          </div>
        ` : ''}
        
        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
          <span style="font-size: 12px; color: #666;">地址:</span>
          <span style="font-size: 12px; color: #333;">${location.address}</span>
        </div>
        
        ${description ? `
          <p style="
            font-size: 12px;
            color: #666;
            margin: 0 0 8px 0;
            line-height: 1.5;
          ">${description}</p>
        ` : ''}
        
        ${tips ? `
          <div style="
            background-color: #FEF3C7;
            padding: 8px;
            border-radius: 4px;
            margin-top: 8px;
          ">
            <span style="font-size: 11px; color: #92400E;">💡 ${tips}</span>
          </div>
        ` : ''}
      </div>
    `

    const infoWindow: MapInfoWindowInstance = new window.AMap.InfoWindow({
      isCustom: true,
      content,
      offset: [0, -40]
    })

    infoWindowRef.current = infoWindow

    return () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close()
        infoWindowRef.current = null
      }
    }
  }, [map, type, name, time, description, cost, duration, tips, location])

  useEffect(() => {
    if (!infoWindowRef.current || !map) return

    if (visible) {
      infoWindowRef.current.open(map, position)
    } else {
      infoWindowRef.current.close()
    }
  }, [visible, map, position])

  useEffect(() => {
    if (!infoWindowRef.current || !visible) return

    const handleCloseClick = () => {
      if (onClose) {
        onClose()
      }
    }

    const closeBtn = document.querySelector('.info-window-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', handleCloseClick)
    }

    return () => {
      if (closeBtn) {
        closeBtn.removeEventListener('click', handleCloseClick)
      }
    }
  }, [visible, onClose])

  return null
}

export const MapInfoWindow = memo(MapInfoWindowComponent)
