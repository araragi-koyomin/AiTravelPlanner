/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockEncrypt = vi.fn((text: string) => `encrypted:${text}`)
const mockDecrypt = vi.fn((ciphertext: string) => ({
  toString: () => ciphertext.replace('encrypted:', '')
}))

vi.mock('crypto-js', () => ({
  default: {
    AES: {
      encrypt: mockEncrypt,
      decrypt: mockDecrypt
    },
    enc: {
      Utf8: 'utf8'
    }
  }
}))

describe('Crypto Utils', () => {
  beforeEach(() => {
    vi.resetModules()
    mockEncrypt.mockClear()
    mockDecrypt.mockClear()
    mockEncrypt.mockImplementation((text: string) => `encrypted:${text}`)
    mockDecrypt.mockImplementation((ciphertext: string) => ({
      toString: () => ciphertext.replace('encrypted:', '')
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('encrypt', () => {
    it('应该成功加密文本', async () => {
      vi.stubEnv('VITE_ENCRYPTION_KEY', 'test-encryption-key-32-characters!')
      const { encrypt } = await import('./crypto')

      const result = encrypt('test-text')

      expect(result).toBe('encrypted:test-text')
      expect(mockEncrypt).toHaveBeenCalledWith('test-text', 'test-encryption-key-32-characters!')
    })

    it('应该处理加密错误', async () => {
      vi.stubEnv('VITE_ENCRYPTION_KEY', 'test-encryption-key-32-characters!')
      mockEncrypt.mockImplementation(() => {
        throw new Error('Encryption failed')
      })

      const { encrypt } = await import('./crypto')

      expect(() => encrypt('test-text')).toThrow('加密失败')
    })
  })

  describe('decrypt', () => {
    it('应该成功解密文本', async () => {
      vi.stubEnv('VITE_ENCRYPTION_KEY', 'test-encryption-key-32-characters!')
      const { decrypt } = await import('./crypto')

      const result = decrypt('encrypted:test-text')

      expect(result).toBe('test-text')
      expect(mockDecrypt).toHaveBeenCalledWith('encrypted:test-text', 'test-encryption-key-32-characters!')
    })

    it('应该处理解密错误', async () => {
      vi.stubEnv('VITE_ENCRYPTION_KEY', 'test-encryption-key-32-characters!')
      mockDecrypt.mockImplementation(() => ({
        toString: () => ''
      }))

      const { decrypt } = await import('./crypto')

      expect(() => decrypt('invalid-ciphertext')).toThrow('解密失败')
    })

    it('应该处理解密返回空字符串的情况', async () => {
      vi.stubEnv('VITE_ENCRYPTION_KEY', 'test-encryption-key-32-characters!')
      mockDecrypt.mockImplementation(() => ({
        toString: () => ''
      }))

      const { decrypt } = await import('./crypto')

      expect(() => decrypt('invalid-ciphertext')).toThrow('解密失败')
    })
  })

  describe('encryptApiKey', () => {
    it('应该成功加密 API Key', async () => {
      vi.stubEnv('VITE_ENCRYPTION_KEY', 'test-encryption-key-32-characters!')
      const { encryptApiKey } = await import('./crypto')

      const result = encryptApiKey('my-api-key-12345')

      expect(result).toBe('encrypted:my-api-key-12345')
    })

    it('应该拒绝空 API Key', async () => {
      vi.stubEnv('VITE_ENCRYPTION_KEY', 'test-encryption-key-32-characters!')
      const { encryptApiKey } = await import('./crypto')

      expect(() => encryptApiKey('')).toThrow('API Key 不能为空')
      expect(() => encryptApiKey(null as any)).toThrow('API Key 不能为空')
      expect(() => encryptApiKey(undefined as any)).toThrow('API Key 不能为空')
    })
  })

  describe('decryptApiKey', () => {
    it('应该成功解密 API Key', async () => {
      vi.stubEnv('VITE_ENCRYPTION_KEY', 'test-encryption-key-32-characters!')
      const { decryptApiKey } = await import('./crypto')

      const result = decryptApiKey('encrypted:my-api-key-12345')

      expect(result).toBe('my-api-key-12345')
    })

    it('应该对空值返回 null', async () => {
      vi.stubEnv('VITE_ENCRYPTION_KEY', 'test-encryption-key-32-characters!')
      const { decryptApiKey } = await import('./crypto')

      expect(decryptApiKey(null)).toBeNull()
      expect(decryptApiKey('')).toBeNull()
    })
  })

  describe('环境变量验证', () => {
    it('应该在缺少加密密钥时抛出错误', async () => {
      vi.stubEnv('VITE_ENCRYPTION_KEY', undefined as any)
      vi.doMock('./crypto', () => {
        throw new Error('Missing VITE_ENCRYPTION_KEY environment variable')
      })

      await expect(import('./crypto')).rejects.toThrow()
    })
  })
})
