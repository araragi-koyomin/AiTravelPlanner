import CryptoJS from 'crypto-js'
import type { XunfeiConfig, XunfeiFrame, XunfeiResponse, VoiceRecognitionResult } from '../types/voice'

const XUNFEI_HOST = 'iat-api.xfyun.cn'
const XUNFEI_PATH = '/v2/iat'

export class XunfeiVoiceService {
  private ws: WebSocket | null = null
  private config: XunfeiConfig
  private resultCallback: ((result: VoiceRecognitionResult) => void) | null = null
  private errorCallback: ((error: string) => void) | null = null
  private statusCallback: ((status: 'connected' | 'disconnected' | 'error') => void) | null = null
  private fullText: string = ''
  private segments: string[] = []
  private isConnecting: boolean = false

  constructor(config: XunfeiConfig) {
    this.config = config
  }

  private generateAuthUrl(): string {
    const date = new Date().toUTCString()
    
    const signatureOrigin = `host: ${XUNFEI_HOST}\ndate: ${date}\nGET ${XUNFEI_PATH} HTTP/1.1`
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.config.apiSecret)
    const signature = CryptoJS.enc.Base64.stringify(signatureSha)
    
    const authorizationOrigin = `api_key="${this.config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
    const authorization = btoa(authorizationOrigin)
    
    return `wss://${XUNFEI_HOST}${XUNFEI_PATH}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${XUNFEI_HOST}`
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true
        const url = this.generateAuthUrl()
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          this.isConnecting = false
          this.statusCallback?.('connected')
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const response: XunfeiResponse = JSON.parse(event.data)
            this.handleResponse(response)
          } catch (e) {
            console.error('Failed to parse response:', e)
          }
        }

        this.ws.onerror = () => {
          this.isConnecting = false
          this.statusCallback?.('error')
          this.errorCallback?.('WebSocket 连接错误')
          reject(new Error('WebSocket 连接错误'))
        }

        this.ws.onclose = () => {
          this.isConnecting = false
          this.statusCallback?.('disconnected')
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private handleResponse(response: XunfeiResponse): void {
    if (response.code !== 0) {
      this.errorCallback?.(`识别错误: ${response.message} (code: ${response.code})`)
      return
    }

    if (!response.data) {
      return
    }

    const result = response.data.result
    if (!result) {
      return
    }

    let text = ''
    try {
      if (Array.isArray(result)) {
        for (const item of result) {
          if (item.ws && Array.isArray(item.ws)) {
            for (const ws of item.ws) {
              if (ws.cw && Array.isArray(ws.cw)) {
                for (const cw of ws.cw) {
                  if (cw.w) {
                    text += cw.w
                  }
                }
              }
            }
          }
        }
      } else if (result.ws && Array.isArray(result.ws)) {
        for (const ws of result.ws) {
          if (ws.cw && Array.isArray(ws.cw)) {
            for (const cw of ws.cw) {
              if (cw.w) {
                text += cw.w
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Error parsing result:', e)
      return
    }

    if (!text) {
      return
    }

    const resultObj = Array.isArray(result) ? null : result
    const pgs = resultObj?.pgs
    const rg = resultObj?.rg
    const sn = resultObj?.sn

    if (pgs === 'rpl' && rg && rg.length >= 2) {
      const [start, end] = rg
      while (this.segments.length < end) {
        this.segments.push('')
      }
      for (let i = start; i <= end && i < this.segments.length; i++) {
        this.segments[i] = ''
      }
      if (sn !== undefined) {
        while (this.segments.length <= sn) {
          this.segments.push('')
        }
        this.segments[sn] = text
      }
    } else if (sn !== undefined) {
      while (this.segments.length <= sn) {
        this.segments.push('')
      }
      this.segments[sn] = text
    } else {
      this.segments.push(text)
    }

    this.fullText = this.segments.join('')

    const isFinal = (resultObj?.ls === true) || (response.data.is_end === true)
    
    this.resultCallback?.({
      text: this.fullText,
      confidence: 1,
      isFinal
    })

    if (isFinal) {
      this.fullText = ''
      this.segments = []
    }
  }

  sendAudioData(audioData: ArrayBuffer, status: number = 1): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.errorCallback?.('WebSocket 未连接')
      return
    }

    const frame: XunfeiFrame = {
      common: {
        app_id: this.config.appId
      },
      business: {
        language: 'zh_cn',
        domain: 'iat',
        accent: 'mandarin',
        vad_eos: 2000,
        dwa: 'wpgs',
        ptt: 1
      },
      data: {
        status,
        format: 'audio/L16;rate=16000',
        encoding: 'raw',
        audio: this.arrayBufferToBase64(audioData)
      }
    }

    this.ws.send(JSON.stringify(frame))
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode.apply(null, Array.from(chunk))
    }
    return btoa(binary)
  }

  sendEndFrame(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return
    }

    const frame: XunfeiFrame = {
      common: {
        app_id: this.config.appId
      },
      business: {
        language: 'zh_cn',
        domain: 'iat',
        accent: 'mandarin',
        vad_eos: 2000
      },
      data: {
        status: 2,
        format: 'audio/L16;rate=16000',
        encoding: 'raw',
        audio: ''
      }
    }

    this.ws.send(JSON.stringify(frame))
  }

  disconnect(): void {
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.sendEndFrame()
      }
      this.ws.close()
      this.ws = null
    }
    this.fullText = ''
    this.segments = []
    this.statusCallback?.('disconnected')
  }

  onResult(callback: (result: VoiceRecognitionResult) => void): void {
    this.resultCallback = callback
  }

  onError(callback: (error: string) => void): void {
    this.errorCallback = callback
  }

  onStatusChange(callback: (status: 'connected' | 'disconnected' | 'error') => void): void {
    this.statusCallback = callback
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

export function getXunfeiConfig(): XunfeiConfig {
  const appId = import.meta.env.VITE_XUNFEI_APP_ID
  const apiKey = import.meta.env.VITE_XUNFEI_API_KEY
  const apiSecret = import.meta.env.VITE_XUNFEI_API_SECRET

  if (!appId || !apiKey || !apiSecret) {
    throw new Error('科大讯飞 API 配置缺失，请检查环境变量')
  }

  return { appId, apiKey, apiSecret }
}

export function createXunfeiService(): XunfeiVoiceService {
  const config = getXunfeiConfig()
  return new XunfeiVoiceService(config)
}
