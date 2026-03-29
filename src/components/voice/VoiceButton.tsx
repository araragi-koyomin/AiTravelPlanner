import { Mic, Square } from 'lucide-react'
import { cn } from '../../utils/cn'

interface VoiceButtonProps {
  isRecording: boolean
  disabled?: boolean
  onStart: () => void
  onStop: () => void
  volume?: number
  className?: string
}

export function VoiceButton({
  isRecording,
  disabled = false,
  onStart,
  onStop,
  volume = 0,
  className
}: VoiceButtonProps) {
  const handleClick = () => {
    if (isRecording) {
      onStop()
    } else {
      onStart()
    }
  }

  const scale = 1 + volume * 0.3

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative flex items-center justify-center',
        'w-14 h-14 rounded-full transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'shadow-lg border-2',
        isRecording
          ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500 border-red-400'
          : 'bg-primary hover:bg-primary-600 focus:ring-primary border-primary-400',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={isRecording ? '停止录音' : '开始录音'}
    >
      {isRecording && (
        <div
          className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping"
          style={{ transform: `scale(${scale})` }}
        />
      )}
      {isRecording ? (
        <Square className="w-6 h-6 text-white" />
      ) : (
        <Mic className="w-6 h-6 text-white" />
      )}
    </button>
  )
}
