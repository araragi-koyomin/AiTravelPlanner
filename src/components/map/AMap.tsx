import { memo, useEffect, useRef, useState, useId, useMemo } from 'react'
import { useAMap } from '@/hooks/useAMap'
import type { AMapOptions } from '@/types/map'
import { MapError } from './MapError'
import { MapLoading } from './MapLoading'

export interface AMapProps {
  containerId?: string
  className?: string
  style?: React.CSSProperties
  mapOptions?: AMapOptions
  children?: React.ReactNode
  onLoad?: (map: unknown) => void
  onError?: (error: Error) => void
}

function AMapComponent({
  containerId: propContainerId,
  className = '',
  style,
  mapOptions: propMapOptions,
  children,
  onLoad,
  onError
}: AMapProps) {
  const generatedId = useId()
  const containerId = useMemo(() => propContainerId || `amap-${generatedId.replace(/:/g, '-')}`, [propContainerId, generatedId])
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerReady, setContainerReady] = useState(false)

  const mapOptions = useMemo(() => propMapOptions || {}, [propMapOptions])

  const { map, loading, error } = useAMap({
    containerId,
    mapOptions,
    autoLoad: containerReady
  })

  useEffect(() => {
    if (containerReady) return

    const checkContainer = () => {
      if (containerRef.current) {
        setContainerReady(true)
      } else {
        requestAnimationFrame(checkContainer)
      }
    }

    const timer = requestAnimationFrame(checkContainer)
    return () => cancelAnimationFrame(timer)
  }, [containerReady])

  useEffect(() => {
    if (map && onLoad) {
      onLoad(map)
    }
  }, [map, onLoad])

  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  if (error) {
    return <MapError error={error} />
  }

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={style}
    >
      <div
        ref={containerRef}
        id={containerId}
        className="w-full h-full"
      />
      {loading && <MapLoading />}
      {map && children}
    </div>
  )
}

export const AMap = memo(AMapComponent)
