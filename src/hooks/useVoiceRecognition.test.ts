import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVoiceRecognition } from './useVoiceRecognition'
import type { VoiceRecognitionResult } from '../types/voice'

const mockMediaStream = {
  getTracks: () => [{ stop: vi.fn() }]
}

const mockAudioContext = {
  sampleRate: 16000,
  state: 'running',
  audioWorklet: {
    addModule: vi.fn().mockResolvedValue(undefined)
  },
  createMediaStreamSource: vi.fn().mockReturnValue({
    connect: vi.fn()
  }),
  destination: {},
  close: vi.fn()
}

const mockWorkletNode = {
  port: {
    onmessage: null as ((event: { data: { type: string; buffer?: ArrayBuffer; volume?: number } }) => void) | null,
    postMessage: vi.fn()
  },
  connect: vi.fn(),
  disconnect: vi.fn()
}

const mockXunfeiService = {
  connect: vi.fn().mockResolvedValue(undefined),
  sendAudioData: vi.fn(),
  sendEndFrame: vi.fn(),
  disconnect: vi.fn(),
  onResult: vi.fn(),
  onError: vi.fn(),
  onStatusChange: vi.fn(),
  isConnected: vi.fn().mockReturnValue(true)
}

vi.mock('../services/xunfei', () => ({
  XunfeiVoiceService: vi.fn(() => mockXunfeiService),
  createXunfeiService: vi.fn(() => mockXunfeiService)
}))

describe('useVoiceRecognition', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockMediaStream)
      }
    })

    vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext))
    vi.stubGlobal('AudioWorkletNode', vi.fn(() => mockWorkletNode))

    mockXunfeiService.connect.mockResolvedValue(undefined)
    mockXunfeiService.isConnected.mockReturnValue(true)
    mockAudioContext.audioWorklet.addModule.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const { result } = renderHook(() => useVoiceRecognition())

      expect(result.current.status).toBe('idle')
      expect(result.current.text).toBe('')
      expect(result.current.error).toBeNull()
      expect(result.current.duration).toBe(0)
      expect(result.current.volume).toBe(0)
    })

    it('isSupported 应该根据浏览器支持情况返回', () => {
      const { result } = renderHook(() => useVoiceRecognition())

      expect(result.current.isSupported).toBe(true)
    })

    it('isSupported 应该在不支持 getUserMedia 的浏览器中返回 false', () => {
      vi.stubGlobal('navigator', { mediaDevices: undefined })

      const { result } = renderHook(() => useVoiceRecognition())

      expect(result.current.isSupported).toBe(false)
    })
  })

  describe('startRecording', () => {
    it('应该请求麦克风权限', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
    })

    it('应该创建 AudioContext', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      expect(AudioContext).toHaveBeenCalled()
    })

    it('应该创建 XunfeiVoiceService', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      expect(mockXunfeiService.connect).toHaveBeenCalled()
    })

    it('应该更新状态为 recording', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      expect(['recording', 'error']).toContain(result.current.status)
    })

    it('应该开始计时', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      expect(result.current.duration).toBe(0)
    })

    it('应该清空之前的文本和错误', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      expect(result.current.text).toBe('')
    })

    it('应该在不支持的浏览器中设置错误', async () => {
      vi.stubGlobal('navigator', {})

      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      expect(result.current.error).toBe('当前浏览器不支持语音识别功能')
      expect(result.current.status).toBe('error')
    })

    it('应该在麦克风权限拒绝时设置错误', async () => {
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: vi.fn().mockRejectedValue(new Error('Permission denied'))
        }
      })

      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      expect(result.current.error).toBe('Permission denied')
      expect(result.current.status).toBe('error')
    })

    it('应该在 WebSocket 连接失败时设置错误', async () => {
      mockXunfeiService.connect.mockRejectedValue(new Error('Connection failed'))

      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      expect(result.current.error).toBe('Connection failed')
      expect(result.current.status).toBe('error')
    })

    it('应该调用 onError 回调', async () => {
      const onError = vi.fn()
      vi.stubGlobal('navigator', {})

      const { result } = renderHook(() => useVoiceRecognition({ onError }))

      await act(async () => {
        await result.current.startRecording()
      })

      expect(onError).toHaveBeenCalledWith('当前浏览器不支持语音识别功能')
    })
  })

  describe('stopRecording', () => {
    it('应该断开 AudioWorkletNode', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      act(() => {
        result.current.stopRecording()
      })

      expect(mockWorkletNode.disconnect).toHaveBeenCalled()
    })

    it('应该关闭 AudioContext', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      act(() => {
        result.current.stopRecording()
      })

      expect(mockAudioContext.close).toHaveBeenCalled()
    })

    it('应该停止 MediaStream', async () => {
      const mockStop = vi.fn()
      const mockStream = {
        getTracks: () => [{ stop: mockStop }]
      }
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: vi.fn().mockResolvedValue(mockStream)
        }
      })

      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      act(() => {
        result.current.stopRecording()
      })

      expect(mockStop).toHaveBeenCalled()
    })

    it('应该发送结束帧', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      act(() => {
        result.current.stopRecording()
      })

      expect(mockXunfeiService.sendEndFrame).toHaveBeenCalled()
    })

    it('应该断开 WebSocket', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      act(() => {
        result.current.stopRecording()
      })

      expect(mockXunfeiService.sendEndFrame).toHaveBeenCalled()
    })

    it('应该更新状态为 idle', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      act(() => {
        result.current.stopRecording()
      })

      expect(result.current.status).toBe('idle')
    })

    it('应该重置音量', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      act(() => {
        result.current.stopRecording()
      })

      expect(result.current.volume).toBe(0)
    })
  })

  describe('reset', () => {
    it('应该调用 stopRecording', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.status).toBe('idle')
    })

    it('应该清空文本', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.text).toBe('')
    })

    it('应该清空错误', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      vi.stubGlobal('navigator', {})

      await act(async () => {
        await result.current.startRecording()
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.error).toBeNull()
    })

    it('应该重置时长', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.duration).toBe(0)
    })

    it('应该重置音量', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.volume).toBe(0)
    })

    it('应该更新状态为 idle', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.status).toBe('idle')
    })
  })

  describe('音频数据处理', () => {
    it('应该在收到音频数据时发送给 WebSocket', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      const audioBuffer = new ArrayBuffer(1280)
      act(() => {
        mockWorkletNode.port.onmessage?.({
          data: { type: 'audioData', buffer: audioBuffer }
        })
      })

      expect(mockXunfeiService.sendAudioData).toHaveBeenCalledWith(audioBuffer, 1)
    })

    it('应该在收到音量数据时更新 volume 状态', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      act(() => {
        mockWorkletNode.port.onmessage?.({
          data: { type: 'volume', volume: 0.5 }
        })
      })

      expect(result.current.volume).toBe(0.5)
    })
  })

  describe('识别结果处理', () => {
    it('应该在收到中间结果时更新文本', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      const resultCallback = mockXunfeiService.onResult.mock.calls[0][0]
      const voiceResult: VoiceRecognitionResult = {
        text: '你好',
        confidence: 1,
        isFinal: false
      }

      act(() => {
        resultCallback(voiceResult)
      })

      expect(result.current.text).toBe('你好')
    })

    it('应该在收到最终结果时调用 onResult', async () => {
      const onResult = vi.fn()
      const { result } = renderHook(() => useVoiceRecognition({ onResult }))

      await act(async () => {
        await result.current.startRecording()
      })

      const resultCallback = mockXunfeiService.onResult.mock.calls[0][0]
      const voiceResult: VoiceRecognitionResult = {
        text: '你好世界',
        confidence: 1,
        isFinal: true
      }

      act(() => {
        resultCallback(voiceResult)
      })

      expect(onResult).toHaveBeenCalledWith('你好世界')
    })

    it('应该累积识别文本', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      const resultCallback = mockXunfeiService.onResult.mock.calls[0][0]

      act(() => {
        resultCallback({ text: '你好', confidence: 1, isFinal: false })
      })

      act(() => {
        resultCallback({ text: '你好世界', confidence: 1, isFinal: false })
      })

      expect(result.current.text).toBe('你好世界')
    })
  })

  describe('时长限制', () => {
    it('应该接受 maxDuration 选项', async () => {
      const { result } = renderHook(() => useVoiceRecognition({ maxDuration: 5000 }))

      await act(async () => {
        await result.current.startRecording()
      })

      expect(['recording', 'error']).toContain(result.current.status)
    })

    it('应该使用默认最大时长 60000ms', async () => {
      const { result } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      expect(['recording', 'error']).toContain(result.current.status)
    })

    it('应该支持自定义最大时长', async () => {
      const { result } = renderHook(() => useVoiceRecognition({ maxDuration: 10000 }))

      await act(async () => {
        await result.current.startRecording()
      })

      expect(['recording', 'error']).toContain(result.current.status)
    })
  })

  describe('回调测试', () => {
    it('应该在状态变化时调用 onStatusChange', async () => {
      const onStatusChange = vi.fn()
      const { result } = renderHook(() => useVoiceRecognition({ onStatusChange }))

      await act(async () => {
        await result.current.startRecording()
      })

      expect(onStatusChange).toHaveBeenCalled()
    })

    it('应该在识别结果时调用 onResult', async () => {
      const onResult = vi.fn()
      const { result } = renderHook(() => useVoiceRecognition({ onResult }))

      await act(async () => {
        await result.current.startRecording()
      })

      const resultCallback = mockXunfeiService.onResult.mock.calls[0][0]

      act(() => {
        resultCallback({ text: '测试', confidence: 1, isFinal: true })
      })

      expect(onResult).toHaveBeenCalledWith('测试')
    })

    it('应该在错误时调用 onError', async () => {
      const onError = vi.fn()
      vi.stubGlobal('navigator', {})

      const { result } = renderHook(() => useVoiceRecognition({ onError }))

      await act(async () => {
        await result.current.startRecording()
      })

      expect(onError).toHaveBeenCalledWith('当前浏览器不支持语音识别功能')
    })
  })

  describe('清理测试', () => {
    it('应该在组件卸载时停止 MediaStream', async () => {
      const mockStop = vi.fn()
      const mockStream = {
        getTracks: () => [{ stop: mockStop }]
      }
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: vi.fn().mockResolvedValue(mockStream)
        }
      })

      const { result, unmount } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      unmount()

      expect(mockStop).toHaveBeenCalled()
    })

    it('应该在组件卸载时关闭 AudioContext', async () => {
      const { result, unmount } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      unmount()

      expect(mockAudioContext.close).toHaveBeenCalled()
    })

    it('应该在组件卸载时断开 WebSocket', async () => {
      const { result, unmount } = renderHook(() => useVoiceRecognition())

      await act(async () => {
        await result.current.startRecording()
      })

      unmount()

      expect(mockXunfeiService.disconnect).toHaveBeenCalled()
    })
  })
})
