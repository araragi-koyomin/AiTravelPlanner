import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY

if (!ENCRYPTION_KEY) {
  throw new Error('Missing VITE_ENCRYPTION_KEY environment variable')
}

export function encrypt(text: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY)
    return encrypted.toString()
  } catch (error) {
    console.error('加密失败:', error)
    throw new Error('加密失败')
  }
}

export function decrypt(ciphertext: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)

    if (!decrypted) {
      throw new Error('解密失败：无效的密文')
    }

    return decrypted
  } catch (error) {
    console.error('解密失败:', error)
    throw new Error('解密失败')
  }
}

export function encryptApiKey(apiKey: string): string {
  if (!apiKey) {
    throw new Error('API Key 不能为空')
  }
  return encrypt(apiKey)
}

export function decryptApiKey(encryptedKey: string | null): string | null {
  if (!encryptedKey) {
    return null
  }
  return decrypt(encryptedKey)
}
