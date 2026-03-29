import { useState, useCallback } from 'react'
import { Mic, Loader2 } from 'lucide-react'
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition'
import { VoiceButton } from './VoiceButton'
import { VoiceVisualizer } from './VoiceVisualizer'
import { VoiceResult } from './VoiceResult'
import { cn } from '../../utils/cn'
import type { VoiceStatus } from '../../types/voice'

interface VoiceInputProps {
  onResult: (text: string) => void
  onError?: (error: string) => void
  maxDuration?: number
  placeholder?: string
  disabled?: boolean
  showPreview?: boolean
  className?: string
}

const statusText: Record<VoiceStatus, string> = {
  idle: '点击麦克风开始录音',
  recording: '正在录音，点击停止...',
  recognizing: '正在识别...',
  success: '识别完成',
  error: '识别失败'
}

export function VoiceInput({
  onResult,
  onError,
  maxDuration = 60000,
  placeholder,
  disabled = false,
  showPreview = true,
  className
}: VoiceInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [confirmedText, setConfirmedText] = useState('')

  const handleResult = useCallback(
    (text: string) => {
      setConfirmedText(text)
    },
    []
  )

  const handleError = useCallback(
    (error: string) => {
      onError?.(error)
    },
    [onError]
  )

  const {
    status,
    text,
    error,
    duration,
    volume,
    startRecording,
    stopRecording,
    reset,
    isSupported
  } = useVoiceRecognition({
    maxDuration,
    onResult: handleResult,
    onError: handleError
  })

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleConfirm = () => {
    setIsEditing(false)
    onResult(confirmedText || text)
    reset()
    setConfirmedText('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setConfirmedText(text)
  }

  const handleTextChange = (newText: string) => {
    setConfirmedText(newText)
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!isSupported) {
    return (
      <div className={cn('text-center text-gray-500 p-4', className)}>
        <Mic className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>当前浏览器不支持语音识别功能</p>
      </div>
    )
  }

  const displayText = confirmedText || text

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col items-center space-y-4">
        <VoiceVisualizer volume={volume} isActive={status === 'recording'} />

        <div className="flex items-center gap-4">
          <VoiceButton
            isRecording={status === 'recording'}
            disabled={disabled || status === 'recognizing'}
            onStart={startRecording}
            onStop={stopRecording}
            volume={volume}
          />

          {status === 'recording' && (
            <div className="text-lg font-mono text-gray-600">
              {formatDuration(duration)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          {status === 'recognizing' && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          <span>{statusText[status]}</span>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 px-3 py-1.5 rounded-md">
            {error}
          </div>
        )}

        {placeholder && status === 'idle' && !displayText && (
          <p className="text-sm text-gray-400">{placeholder}</p>
        )}
      </div>

      {showPreview && displayText && status !== 'recording' && (
        <VoiceResult
          text={displayText}
          isEditing={isEditing}
          onEdit={handleEdit}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onChangeText={handleTextChange}
        />
      )}
    </div>
  )
}
