import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'

interface VoiceVisualizerProps {
  volume: number
  isActive: boolean
  className?: string
}

export function VoiceVisualizer({ volume, isActive, className }: VoiceVisualizerProps) {
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setAnimationPhase((prev) => prev + 1)
    }, 50)

    return () => clearInterval(interval)
  }, [isActive])

  const bars = 5
  const heights = Array.from({ length: bars }, (_, i) => {
    if (!isActive) return 20
    const baseHeight = 20
    const maxExtraHeight = 60
    const phase = (i / bars) * Math.PI * 2
    const wave = Math.sin(phase + animationPhase * 0.2) * 0.5 + 0.5
    return baseHeight + wave * maxExtraHeight * Math.max(volume, 0.1)
  })

  return (
    <div
      className={cn(
        'flex items-end justify-center gap-1 h-20 transition-opacity duration-300',
        isActive ? 'opacity-100' : 'opacity-30',
        className
      )}
      aria-hidden="true"
    >
      {heights.map((height, index) => (
        <div
          key={index}
          className={cn(
            'w-2 rounded-full transition-all duration-75',
            isActive ? 'bg-primary' : 'bg-gray-300'
          )}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  )
}
