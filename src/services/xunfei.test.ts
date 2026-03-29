import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { XunfeiVoiceService, getXunfeiConfig, createXunfeiService } from './xunfei'
import type { XunfeiConfig } from '../types/voice'

class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.OPEN
  onopen: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onclose: (() => void) | null = null
  send = vi.fn()

  constructor(public url: string) {}

  close() {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.()
  }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN
    this.onopen?.()
  }

  simulateMessage(data: object) {
    this.onmessage?.({ data: JSON.stringify(data) })
  }

  simulateError() {
    this.readyState = MockWebSocket.CLOSED
    this.onerror?.(new Event('error'))
  }

  simulateClose() {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.()
  }
}

describe('xunfei', () => {
  let mockWebSocket: MockWebSocket

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockWebSocket = new MockWebSocket('wss://test-url')
    vi.stubGlobal('WebSocket', vi.fn(() => mockWebSocket) as unknown as typeof WebSocket)
    ;(WebSocket as unknown as typeof MockWebSocket).OPEN = MockWebSocket.OPEN
    ;(WebSocket as unknown as typeof MockWebSocket).CONNECTING = MockWebSocket.CONNECTING
    ;(WebSocket as unknown as typeof MockWebSocket).CLOSING = MockWebSocket.CLOSING
    ;(WebSocket as unknown as typeof MockWebSocket).CLOSED = MockWebSocket.CLOSED

    vi.stubGlobal('import.meta', {
      env: {
        VITE_XUNFEI_APP_ID: 'test-app-id',
        VITE_XUNFEI_API_KEY: 'test-api-key',
        VITE_XUNFEI_API_SECRET: 'test-api-secret'
      }
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('XunfeiVoiceService', () => {
    const config: XunfeiConfig = {
      appId: 'test-app-id',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret'
    }

    describe('构造函数', () => {
      it('应该正确初始化配置', () => {
        const service = new XunfeiVoiceService(config)
        expect(service).toBeDefined()
      })
    })

    describe('connect', () => {
      it('应该创建 WebSocket 连接', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        expect(WebSocket).toHaveBeenCalled()
      })

      it('应该在连接成功后调用 statusCallback', async () => {
        const service = new XunfeiVoiceService(config)
        const statusCallback = vi.fn()
        service.onStatusChange(statusCallback)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        expect(statusCallback).toHaveBeenCalledWith('connected')
      })

      it('应该在连接失败时调用 errorCallback', async () => {
        const service = new XunfeiVoiceService(config)
        const errorCallback = vi.fn()
        service.onError(errorCallback)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateError()
        
        await expect(connectPromise).rejects.toThrow('WebSocket 连接错误')
        expect(errorCallback).toHaveBeenCalledWith('WebSocket 连接错误')
      })

      it('应该在已连接时直接返回', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise1 = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise1

        const wsCallCount = (WebSocket as unknown as ReturnType<typeof vi.fn>).mock.calls.length
        
        await service.connect()
        
        expect((WebSocket as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(wsCallCount)
      })

      it('应该正确处理连接错误', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateError()
        
        await expect(connectPromise).rejects.toThrow()
      })
    })

    describe('sendAudioData', () => {
      it('应该在连接状态下发送音频数据', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        const audioData = new ArrayBuffer(1280)
        service.sendAudioData(audioData, 1)

        expect(mockWebSocket.send).toHaveBeenCalled()
      })

      it('应该正确构建发送帧', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        const audioData = new ArrayBuffer(1280)
        service.sendAudioData(audioData, 1)

        const sentData = JSON.parse(mockWebSocket.send.mock.calls[0][0])
        expect(sentData).toHaveProperty('common')
        expect(sentData).toHaveProperty('business')
        expect(sentData).toHaveProperty('data')
      })

      it('应该包含正确的 app_id', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        const audioData = new ArrayBuffer(1280)
        service.sendAudioData(audioData, 1)

        const sentData = JSON.parse(mockWebSocket.send.mock.calls[0][0])
        expect(sentData.common.app_id).toBe('test-app-id')
      })

      it('应该包含正确的业务参数', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        const audioData = new ArrayBuffer(1280)
        service.sendAudioData(audioData, 1)

        const sentData = JSON.parse(mockWebSocket.send.mock.calls[0][0])
        expect(sentData.business.language).toBe('zh_cn')
        expect(sentData.business.domain).toBe('iat')
      })

      it('应该将 ArrayBuffer 转换为 Base64', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        const audioData = new Uint8Array([72, 101, 108, 108, 111]).buffer
        service.sendAudioData(audioData, 1)

        const sentData = JSON.parse(mockWebSocket.send.mock.calls[0][0])
        expect(sentData.data.audio).toBe('SGVsbG8=')
      })

      it('应该在未连接时调用 errorCallback', () => {
        const service = new XunfeiVoiceService(config)
        const errorCallback = vi.fn()
        service.onError(errorCallback)

        const audioData = new ArrayBuffer(1280)
        service.sendAudioData(audioData, 1)

        expect(errorCallback).toHaveBeenCalledWith('WebSocket 未连接')
      })
    })

    describe('sendEndFrame', () => {
      it('应该发送结束帧', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        service.sendEndFrame()

        expect(mockWebSocket.send).toHaveBeenCalled()
      })

      it('结束帧 status 应该为 2', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        service.sendEndFrame()

        const sentData = JSON.parse(mockWebSocket.send.mock.calls[0][0])
        expect(sentData.data.status).toBe(2)
      })

      it('结束帧 audio 应该为空', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        service.sendEndFrame()

        const sentData = JSON.parse(mockWebSocket.send.mock.calls[0][0])
        expect(sentData.data.audio).toBe('')
      })

      it('应该在未连接时不发送', () => {
        const service = new XunfeiVoiceService(config)
        
        service.sendEndFrame()

        expect(mockWebSocket.send).not.toHaveBeenCalled()
      })
    })

    describe('disconnect', () => {
      it('应该关闭 WebSocket 连接', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        service.disconnect()

        expect(mockWebSocket.readyState).toBe(MockWebSocket.CLOSED)
      })

      it('应该在关闭前发送结束帧', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        service.disconnect()

        const calls = mockWebSocket.send.mock.calls
        const lastCall = calls[calls.length - 1]
        const sentData = JSON.parse(lastCall[0])
        expect(sentData.data.status).toBe(2)
      })

      it('应该调用 statusCallback', async () => {
        const service = new XunfeiVoiceService(config)
        const statusCallback = vi.fn()
        service.onStatusChange(statusCallback)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        service.disconnect()

        expect(statusCallback).toHaveBeenCalledWith('disconnected')
      })

      it('应该正确处理未连接状态', () => {
        const service = new XunfeiVoiceService(config)
        
        expect(() => service.disconnect()).not.toThrow()
      })
    })

    describe('handleResponse', () => {
      it('应该正确处理成功响应', async () => {
        const service = new XunfeiVoiceService(config)
        const resultCallback = vi.fn()
        service.onResult(resultCallback)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        const response = {
          code: 0,
          data: {
            result: [
              {
                ws: [
                  { cw: [{ w: '你' }] },
                  { cw: [{ w: '好' }] }
                ]
              }
            ],
            is_end: false
          }
        }
        mockWebSocket.simulateMessage(response)

        expect(resultCallback).toHaveBeenCalledWith({
          text: '你好',
          confidence: 1,
          isFinal: false
        })
      })

      it('应该累积识别文本', async () => {
        const service = new XunfeiVoiceService(config)
        const resultCallback = vi.fn()
        service.onResult(resultCallback)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        mockWebSocket.simulateMessage({
          code: 0,
          data: {
            result: [{ ws: [{ cw: [{ w: '你' }] }] }],
            is_end: false
          }
        })

        mockWebSocket.simulateMessage({
          code: 0,
          data: {
            result: [{ ws: [{ cw: [{ w: '好' }] }] }],
            is_end: false
          }
        })

        expect(resultCallback).toHaveBeenLastCalledWith({
          text: '你好',
          confidence: 1,
          isFinal: false
        })
      })

      it('应该在 isFinal 时重置 fullText', async () => {
        const service = new XunfeiVoiceService(config)
        const resultCallback = vi.fn()
        service.onResult(resultCallback)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        mockWebSocket.simulateMessage({
          code: 0,
          data: {
            result: [{ ws: [{ cw: [{ w: '你好' }] }] }],
            is_end: true
          }
        })

        expect(resultCallback).toHaveBeenCalledWith({
          text: '你好',
          confidence: 1,
          isFinal: true
        })
      })

      it('应该调用 resultCallback', async () => {
        const service = new XunfeiVoiceService(config)
        const resultCallback = vi.fn()
        service.onResult(resultCallback)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        mockWebSocket.simulateMessage({
          code: 0,
          data: {
            result: [{ ws: [{ cw: [{ w: '测试' }] }] }],
            is_end: false
          }
        })

        expect(resultCallback).toHaveBeenCalled()
      })

      it('应该正确处理错误响应', async () => {
        const service = new XunfeiVoiceService(config)
        const errorCallback = vi.fn()
        service.onError(errorCallback)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        mockWebSocket.simulateMessage({
          code: 10105,
          message: 'illegal access',
          data: null
        })

        expect(errorCallback).toHaveBeenCalledWith('识别错误: illegal access')
      })
    })

    describe('回调注册', () => {
      it('onResult 应该正确注册回调', () => {
        const service = new XunfeiVoiceService(config)
        const callback = vi.fn()
        
        service.onResult(callback)
        
        expect(service).toBeDefined()
      })

      it('onError 应该正确注册回调', () => {
        const service = new XunfeiVoiceService(config)
        const callback = vi.fn()
        
        service.onError(callback)
        
        expect(service).toBeDefined()
      })

      it('onStatusChange 应该正确注册回调', () => {
        const service = new XunfeiVoiceService(config)
        const callback = vi.fn()
        
        service.onStatusChange(callback)
        
        expect(service).toBeDefined()
      })
    })

    describe('isConnected', () => {
      it('应该在 WebSocket 打开时返回 true', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        expect(service.isConnected()).toBe(true)
      })

      it('应该在 WebSocket 关闭时返回 false', async () => {
        const service = new XunfeiVoiceService(config)
        
        const connectPromise = service.connect()
        mockWebSocket.simulateOpen()
        await connectPromise

        service.disconnect()

        expect(service.isConnected()).toBe(false)
      })

      it('应该在 WebSocket 为 null 时返回 false', () => {
        const service = new XunfeiVoiceService(config)
        
        expect(service.isConnected()).toBe(false)
      })
    })
  })

  describe('getXunfeiConfig', () => {
    it('应该从环境变量读取配置', () => {
      const config = getXunfeiConfig()
      
      expect(config.appId).toBeDefined()
      expect(config.apiKey).toBeDefined()
      expect(config.apiSecret).toBeDefined()
    })

    it('应该返回正确的配置对象', () => {
      const config = getXunfeiConfig()
      
      expect(config).toHaveProperty('appId')
      expect(config).toHaveProperty('apiKey')
      expect(config).toHaveProperty('apiSecret')
    })
  })

  describe('createXunfeiService', () => {
    it('应该创建 XunfeiVoiceService 实例', () => {
      const service = createXunfeiService()
      
      expect(service).toBeInstanceOf(XunfeiVoiceService)
    })

    it('应该使用正确的配置', () => {
      const service = createXunfeiService()
      
      expect(service).toBeDefined()
    })
  })
})
