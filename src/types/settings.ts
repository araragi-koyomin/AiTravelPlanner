import type { ApiKeyType } from '@/services/settings'

export type { ApiKeyType } from '@/services/settings'

export type Theme = 'light' | 'dark'
export type Language = 'zh' | 'en'

export interface ApiKeyField {
  key: string
  label: string
  placeholder: string
  required: boolean
}

export interface ApiKeyConfig {
  type: ApiKeyType
  label: string
  description: string
  docsUrl: string
  fields: ApiKeyField[]
}

export const API_KEY_CONFIGS: ApiKeyConfig[] = [
  {
    type: 'zhipu',
    label: '智谱AI',
    description: '用于 AI 行程生成功能',
    docsUrl: 'https://open.bigmodel.cn/overview',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: '请输入智谱AI API Key',
        required: true
      }
    ]
  },
  {
    type: 'xunfei',
    label: '科大讯飞',
    description: '用于语音识别功能',
    docsUrl: 'https://www.xfyun.cn/doc/',
    fields: [
      {
        key: 'appId',
        label: 'APP ID',
        placeholder: '请输入科大讯飞 APP ID',
        required: true
      },
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: '请输入科大讯飞 API Key',
        required: true
      },
      {
        key: 'apiSecret',
        label: 'API Secret',
        placeholder: '请输入科大讯飞 API Secret',
        required: true
      }
    ]
  },
  {
    type: 'amap',
    label: '高德地图',
    description: '用于地图展示和路线规划',
    docsUrl: 'https://lbs.amap.com/api/javascript-api/summary',
    fields: [
      {
        key: 'key',
        label: 'API Key',
        placeholder: '请输入高德地图 API Key',
        required: true
      },
      {
        key: 'securityJsCode',
        label: '安全密钥',
        placeholder: '请输入高德地图安全密钥（可选）',
        required: false
      }
    ]
  }
]

export const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' }
]

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' }
]

export function maskApiKey(apiKey: string | null): string {
  if (!apiKey) return ''
  if (apiKey.length <= 8) return '****'
  return `${apiKey.slice(0, 4)}****${apiKey.slice(-4)}`
}

export function hasApiKey(encryptedKey: string | null | undefined): boolean {
  return encryptedKey !== null && encryptedKey !== undefined && encryptedKey.length > 0
}
