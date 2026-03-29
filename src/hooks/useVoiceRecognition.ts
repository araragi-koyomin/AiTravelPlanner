import { useState, useCallback, useRef, useEffect } from 'react'
import type { VoiceStatus, VoiceRecognitionResult } from '../types/voice'
import { XunfeiVoiceService, createXunfeiServiceWithFallback } from '../services/xunfei'
import { useAuthStore } from '../stores/authStore'

interface UseVoiceRecognitionOptions {
  maxDuration?: number
  onResult?: (text: string) => void
  onError?: (error: string) => void
  onStatusChange?: (status: VoiceStatus) => void
}

interface UseVoiceRecognitionReturn {
  status: VoiceStatus
  text: string
  error: string | null
  duration: number
  volume: number
  startRecording: () => Promise<void>
  stopRecording: () => void
  reset: () => void
  isSupported: boolean
}

const DEFAULT_MAX_DURATION = 60000
const SAMPLE_RATE = 16000

export function useVoiceRecognition(
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn {
  const { maxDuration = DEFAULT_MAX_DURATION, onResult, onError, onStatusChange } = options
  
  const userId = useAuthStore((state) => state.user?.id)

  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0)

  const xunfeiServiceRef = useRef<XunfeiVoiceService | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const workletNodeRef = useRef<AudioWorkletNode | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const isSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  const updateStatus = useCallback(
    (newStatus: VoiceStatus) => {
      setStatus(newStatus)
      onStatusChange?.(newStatus)
    },
    [onStatusChange]
  )

  const handleError = useCallback(
    (errorMessage: string) => {
      setError(errorMessage)
      updateStatus('error')
      onError?.(errorMessage)
    },
    [onError, updateStatus]
  )

  const handleResult = useCallback(
    (result: VoiceRecognitionResult) => {
      setText(result.text)
      if (result.isFinal) {
        onResult?.(result.text)
      }
    },
    [onResult]
  )

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setText('')
      setDuration(0)
      setVolume(0)

      if (!isSupported) {
        throw new Error('当前浏览器不支持语音识别功能')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      mediaStreamRef.current = stream

      xunfeiServiceRef.current = await createXunfeiServiceWithFallback(userId)
      xunfeiServiceRef.current.onResult(handleResult)
      xunfeiServiceRef.current.onError(handleError)

      await xunfeiServiceRef.current.connect()

      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE })
      audioContextRef.current = audioContext

      await audioContext.audioWorklet.addModule('/audio-processor.js')
      
      const source = audioContext.createMediaStreamSource(stream)
      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor')
      workletNodeRef.current = workletNode

      workletNode.port.onmessage = (event) => {
        console.log('Worklet message:', event.data.type, event.data)
        if (event.data.type === 'audioData') {
          const audioData = event.data.buffer
          if (audioData && audioData.byteLength > 0 && xunfeiServiceRef.current?.isConnected()) {
            console.log('Sending audio data:', audioData.byteLength)
            xunfeiServiceRef.current.sendAudioData(audioData, 1)
          }
        } else if (event.data.type === 'volume') {
          setVolume(event.data.volume)
        }
      }

      source.connect(workletNode)
      workletNode.connect(audioContext.destination)

      updateStatus('recording')
      startTimeRef.current = Date.now()

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current
        setDuration(elapsed)

        if (elapsed >= maxDuration) {
          stopRecording()
        }
      }, 100)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '启动录音失败'
      handleError(errorMessage)
    }
  }, [isSupported, handleResult, handleError, updateStatus, maxDuration])

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect()
      workletNodeRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    if (xunfeiServiceRef.current) {
      xunfeiServiceRef.current.sendEndFrame()
      setTimeout(() => {
        xunfeiServiceRef.current?.disconnect()
        xunfeiServiceRef.current = null
      }, 500)
    }

    updateStatus('idle')
    setVolume(0)
  }, [updateStatus])

  const reset = useCallback(() => {
    stopRecording()
    setText('')
    setError(null)
    setDuration(0)
    setVolume(0)
    updateStatus('idle')
  }, [stopRecording, updateStatus])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (xunfeiServiceRef.current) {
        xunfeiServiceRef.current.disconnect()
      }
    }
  }, [])

  return {
    status,
    text,
    error,
    duration,
    volume,
    startRecording,
    stopRecording,
    reset,
    isSupported
  }
}
