import { useState, useEffect, useCallback } from 'react'
import type { UserSettings } from '@/services/types'
import {
  getOrCreateUserSettings,
  updateApiKey as updateApiKeyService,
  updateXunfeiCredentials as updateXunfeiCredentialsService,
  updateAmapCredentials as updateAmapCredentialsService,
  deleteApiKey as deleteApiKeyService,
  updateTheme as updateThemeService,
  updateLanguage as updateLanguageService,
  updateNotifications as updateNotificationsService,
  getApiKey,
  getXunfeiCredentials,
  getAmapCredentials,
  type XunfeiCredentials,
  type AmapCredentials
} from '@/services/settings'
import type { ApiKeyType } from '@/types/settings'
import type { Theme, Language } from '@/types/settings'

export interface UseSettingsReturn {
  settings: UserSettings | null
  isLoading: boolean
  error: string | null
  updateApiKey: (type: ApiKeyType, key: string) => Promise<void>
  updateXunfeiCredentials: (credentials: XunfeiCredentials) => Promise<void>
  updateAmapCredentials: (credentials: AmapCredentials) => Promise<void>
  deleteApiKey: (type: ApiKeyType) => Promise<void>
  getDecryptedApiKey: (type: ApiKeyType) => Promise<string | null>
  getDecryptedXunfeiCredentials: () => Promise<XunfeiCredentials | null>
  getDecryptedAmapCredentials: () => Promise<AmapCredentials | null>
  updateTheme: (theme: Theme) => Promise<void>
  updateLanguage: (language: Language) => Promise<void>
  updateNotifications: (enabled: boolean) => Promise<void>
  refreshSettings: () => Promise<void>
  clearError: () => void
}

export function useSettings(userId: string | undefined): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await getOrCreateUserSettings(userId)
      setSettings(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取设置失败'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateApiKey = useCallback(async (type: ApiKeyType, key: string): Promise<void> => {
    if (!userId) {
      throw new Error('用户未登录')
    }

    try {
      setError(null)
      const updated = await updateApiKeyService(userId, type, key)
      setSettings(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新 API Key 失败'
      setError(message)
      throw err
    }
  }, [userId])

  const updateXunfeiCredentials = useCallback(async (credentials: XunfeiCredentials): Promise<void> => {
    if (!userId) {
      throw new Error('用户未登录')
    }

    try {
      setError(null)
      const updated = await updateXunfeiCredentialsService(userId, credentials)
      setSettings(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新科大讯飞凭证失败'
      setError(message)
      throw err
    }
  }, [userId])

  const updateAmapCredentials = useCallback(async (credentials: AmapCredentials): Promise<void> => {
    if (!userId) {
      throw new Error('用户未登录')
    }

    try {
      setError(null)
      const updated = await updateAmapCredentialsService(userId, credentials)
      setSettings(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新高德地图凭证失败'
      setError(message)
      throw err
    }
  }, [userId])

  const deleteApiKey = useCallback(async (type: ApiKeyType): Promise<void> => {
    if (!userId) {
      throw new Error('用户未登录')
    }

    try {
      setError(null)
      const updated = await deleteApiKeyService(userId, type)
      setSettings(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除 API Key 失败'
      setError(message)
      throw err
    }
  }, [userId])

  const getDecryptedApiKey = useCallback(async (type: ApiKeyType): Promise<string | null> => {
    if (!userId) {
      return null
    }

    try {
      return await getApiKey(userId, type)
    } catch (err) {
      console.error('获取 API Key 失败:', err)
      return null
    }
  }, [userId])

  const getDecryptedXunfeiCredentials = useCallback(async (): Promise<XunfeiCredentials | null> => {
    if (!userId) {
      return null
    }

    try {
      return await getXunfeiCredentials(userId)
    } catch (err) {
      console.error('获取科大讯飞凭证失败:', err)
      return null
    }
  }, [userId])

  const getDecryptedAmapCredentials = useCallback(async (): Promise<AmapCredentials | null> => {
    if (!userId) {
      return null
    }

    try {
      return await getAmapCredentials(userId)
    } catch (err) {
      console.error('获取高德地图凭证失败:', err)
      return null
    }
  }, [userId])

  const updateTheme = useCallback(async (theme: Theme): Promise<void> => {
    if (!userId) {
      throw new Error('用户未登录')
    }

    try {
      setError(null)
      const updated = await updateThemeService(userId, theme)
      setSettings(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新主题失败'
      setError(message)
      throw err
    }
  }, [userId])

  const updateLanguage = useCallback(async (language: Language): Promise<void> => {
    if (!userId) {
      throw new Error('用户未登录')
    }

    try {
      setError(null)
      const updated = await updateLanguageService(userId, language)
      setSettings(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新语言失败'
      setError(message)
      throw err
    }
  }, [userId])

  const updateNotifications = useCallback(async (enabled: boolean): Promise<void> => {
    if (!userId) {
      throw new Error('用户未登录')
    }

    try {
      setError(null)
      const updated = await updateNotificationsService(userId, enabled)
      setSettings(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新通知设置失败'
      setError(message)
      throw err
    }
  }, [userId])

  const refreshSettings = useCallback(async (): Promise<void> => {
    await fetchSettings()
  }, [fetchSettings])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    settings,
    isLoading,
    error,
    updateApiKey,
    updateXunfeiCredentials,
    updateAmapCredentials,
    deleteApiKey,
    getDecryptedApiKey,
    getDecryptedXunfeiCredentials,
    getDecryptedAmapCredentials,
    updateTheme,
    updateLanguage,
    updateNotifications,
    refreshSettings,
    clearError
  }
}
