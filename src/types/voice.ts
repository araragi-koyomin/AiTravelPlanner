export type VoiceStatus = 'idle' | 'recording' | 'recognizing' | 'success' | 'error'

export interface VoiceState {
  status: VoiceStatus
  text: string
  error: string | null
  duration: number
  volume: number
}

export interface VoiceRecognitionResult {
  text: string
  confidence: number
  isFinal: boolean
}

export interface VoiceInputProps {
  onResult: (text: string) => void
  onError?: (error: string) => void
  maxDuration?: number
  placeholder?: string
  disabled?: boolean
  showPreview?: boolean
}

export interface XunfeiConfig {
  appId: string
  apiKey: string
  apiSecret: string
}

export interface XunfeiWebSocketMessage {
  type: 'status' | 'result' | 'error'
  data: {
    status?: number
    result?: VoiceRecognitionResult
    error?: string
  }
}

export interface XunfeiFrame {
  common: {
    app_id: string
  }
  business: {
    language: string
    domain: string
    accent: string
    vad_eos: number
    dwa?: string
    ptt?: number
  }
  data: {
    status: number
    format: string
    encoding: string
    audio: string
  }
}

export interface XunfeiResponse {
  code: number
  message: string
  sid: string
  data?: {
    result?: XunfeiResult | XunfeiResult[]
    is_end?: boolean
    status?: number
  }
}

export interface XunfeiResult {
  rst?: string
  rg?: number[]
  ws?: Array<{
    bg?: number
    cw?: Array<{
      sc?: number
      w: string
    }>
  }>
  sn?: number
  ls?: boolean
  bg?: number
  ed?: number
  pgs?: 'rpl' | 'apd'
}

export interface ParsedItineraryVoice {
  destination?: string
  startDate?: string
  endDate?: string
  budget?: number
  participants?: number
  groupType?: string
  accommodationPreference?: string
  pace?: string
  travelPreferences?: string[]
  specialRequirements?: string
}

export interface ParsedExpenseVoice {
  amount?: number
  category?: string
  description?: string
  date?: string
}

export type VoiceInputMode = 'itinerary' | 'expense' | 'general'
