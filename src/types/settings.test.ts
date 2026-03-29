import { describe, it, expect } from 'vitest'
import { maskApiKey, hasApiKey, API_KEY_CONFIGS, THEME_OPTIONS, LANGUAGE_OPTIONS } from './settings'

describe('settings types and utils', () => {
  describe('maskApiKey', () => {
    it('should correctly mask long API Key', () => {
      expect(maskApiKey('sk-1234567890abcdef')).toBe('sk-1****cdef')
    })

    it('should handle short API Key (<= 8 characters)', () => {
      expect(maskApiKey('sk-1234')).toBe('****')
      expect(maskApiKey('12345678')).toBe('****')
    })

    it('should return empty string when API Key is null', () => {
      expect(maskApiKey(null)).toBe('')
    })

    it('should handle empty string', () => {
      expect(maskApiKey('')).toBe('')
    })

    it('should mask exactly 9 characters key', () => {
      expect(maskApiKey('123456789')).toBe('1234****6789')
    })
  })

  describe('hasApiKey', () => {
    it('should return true when has encrypted Key', () => {
      expect(hasApiKey('encrypted-key')).toBe(true)
    })

    it('should return false when Key is null', () => {
      expect(hasApiKey(null)).toBe(false)
    })

    it('should return false when Key is undefined', () => {
      expect(hasApiKey(undefined)).toBe(false)
    })

    it('should return false when Key is empty string', () => {
      expect(hasApiKey('')).toBe(false)
    })

    it('should return true for any non-empty string', () => {
      expect(hasApiKey('a')).toBe(true)
    })
  })

  describe('API_KEY_CONFIGS', () => {
    it('should contain three API Key configurations', () => {
      expect(API_KEY_CONFIGS).toHaveLength(3)
    })

    it('each config should have necessary fields', () => {
      API_KEY_CONFIGS.forEach((config) => {
        expect(config).toHaveProperty('type')
        expect(config).toHaveProperty('label')
        expect(config).toHaveProperty('fields')
        expect(config).toHaveProperty('description')
        expect(config).toHaveProperty('docsUrl')
        expect(typeof config.type).toBe('string')
        expect(typeof config.label).toBe('string')
        expect(Array.isArray(config.fields)).toBe(true)
        expect(typeof config.description).toBe('string')
        expect(typeof config.docsUrl).toBe('string')
      })
    })

    it('each field should have necessary properties', () => {
      API_KEY_CONFIGS.forEach((config) => {
        config.fields.forEach((field) => {
          expect(field).toHaveProperty('key')
          expect(field).toHaveProperty('label')
          expect(field).toHaveProperty('placeholder')
          expect(field).toHaveProperty('required')
          expect(typeof field.key).toBe('string')
          expect(typeof field.label).toBe('string')
          expect(typeof field.placeholder).toBe('string')
          expect(typeof field.required).toBe('boolean')
        })
      })
    })

    it('should have correct API Key types', () => {
      const types = API_KEY_CONFIGS.map((c) => c.type)
      expect(types).toContain('zhipu')
      expect(types).toContain('xunfei')
      expect(types).toContain('amap')
    })

    it('should have valid docs URLs', () => {
      API_KEY_CONFIGS.forEach((config) => {
        expect(config.docsUrl).toMatch(/^https?:\/\//)
      })
    })

    it('zhipu should have single apiKey field', () => {
      const zhipuConfig = API_KEY_CONFIGS.find((c) => c.type === 'zhipu')
      expect(zhipuConfig).toBeDefined()
      expect(zhipuConfig?.fields).toHaveLength(1)
      expect(zhipuConfig?.fields[0].key).toBe('apiKey')
    })

    it('xunfei should have three fields', () => {
      const xunfeiConfig = API_KEY_CONFIGS.find((c) => c.type === 'xunfei')
      expect(xunfeiConfig).toBeDefined()
      expect(xunfeiConfig?.fields).toHaveLength(3)
      const fieldKeys = xunfeiConfig?.fields.map((f) => f.key) || []
      expect(fieldKeys).toContain('appId')
      expect(fieldKeys).toContain('apiKey')
      expect(fieldKeys).toContain('apiSecret')
    })

    it('amap should have key and securityJsCode fields', () => {
      const amapConfig = API_KEY_CONFIGS.find((c) => c.type === 'amap')
      expect(amapConfig).toBeDefined()
      expect(amapConfig?.fields).toHaveLength(2)
      const fieldKeys = amapConfig?.fields.map((f) => f.key) || []
      expect(fieldKeys).toContain('key')
      expect(fieldKeys).toContain('securityJsCode')
    })
  })

  describe('THEME_OPTIONS', () => {
    it('should contain light and dark options', () => {
      expect(THEME_OPTIONS).toHaveLength(2)
      expect(THEME_OPTIONS[0]).toEqual({ value: 'light', label: '浅色' })
      expect(THEME_OPTIONS[1]).toEqual({ value: 'dark', label: '深色' })
    })

    it('each option should have value and label', () => {
      THEME_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty('value')
        expect(option).toHaveProperty('label')
        expect(['light', 'dark']).toContain(option.value)
      })
    })
  })

  describe('LANGUAGE_OPTIONS', () => {
    it('should contain Chinese and English options', () => {
      expect(LANGUAGE_OPTIONS).toHaveLength(2)
      expect(LANGUAGE_OPTIONS[0]).toEqual({ value: 'zh', label: '中文' })
      expect(LANGUAGE_OPTIONS[1]).toEqual({ value: 'en', label: 'English' })
    })

    it('each option should have value and label', () => {
      LANGUAGE_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty('value')
        expect(option).toHaveProperty('label')
        expect(['zh', 'en']).toContain(option.value)
      })
    })
  })
})
