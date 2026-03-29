import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useSettings } from '@/hooks/useSettings'
import {
  ApiKeySection,
  ThemeSection,
  LanguageSection,
  NotificationSection,
  AccountSection
} from '@/components/settings'
import { Loading } from '@/components/ui/Loading'
import type { ApiKeyType } from '@/types/settings'

export function Settings() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isInitializing } = useAuthStore()
  const {
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
    clearError
  } = useSettings(user?.id)

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate('/login')
    }
  }, [isInitializing, isAuthenticated, navigate])

  if (isInitializing || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading size="lg" text="加载设置..." />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleUpdateApiKey = async (type: ApiKeyType, values: Record<string, string>) => {
    switch (type) {
      case 'zhipu':
        await updateApiKey(type, values.apiKey || '')
        break
      case 'xunfei':
        await updateXunfeiCredentials({
          appId: values.appId || '',
          apiKey: values.apiKey || '',
          apiSecret: values.apiSecret || ''
        })
        break
      case 'amap':
        await updateAmapCredentials({
          key: values.key || '',
          securityJsCode: values.securityJsCode
        })
        break
    }
  }

  const handleDeleteApiKey = async (type: ApiKeyType) => {
    await deleteApiKey(type)
  }

  const handleShowApiKey = async (type: ApiKeyType, field: string): Promise<string | null> => {
    switch (type) {
      case 'zhipu':
        return await getDecryptedApiKey(type)
      case 'xunfei': {
        const creds = await getDecryptedXunfeiCredentials()
        if (!creds) return null
        switch (field) {
          case 'appId': return creds.appId
          case 'apiKey': return creds.apiKey
          case 'apiSecret': return creds.apiSecret
          default: return null
        }
      }
      case 'amap': {
        const creds = await getDecryptedAmapCredentials()
        if (!creds) return null
        switch (field) {
          case 'key': return creds.key
          case 'securityJsCode': return creds.securityJsCode || null
          default: return null
        }
      }
      default:
        return null
    }
  }

  const handleThemeChange = async (theme: 'light' | 'dark') => {
    await updateTheme(theme)
  }

  const handleLanguageChange = async (language: 'zh' | 'en') => {
    await updateLanguage(language)
  }

  const handleNotificationsChange = async (enabled: boolean) => {
    await updateNotifications(enabled)
  }

  const userName = (user.user_metadata?.name as string | undefined) || user.email?.split('@')[0] || '用户'

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">设置</h1>
        <p className="mt-1 text-sm text-gray-500">
          管理您的账户设置和偏好
        </p>

        {error && (
          <div className="mt-4 flex items-center justify-between rounded-md bg-red-50 p-4">
            <span className="text-sm text-red-600">{error}</span>
            <button
              onClick={clearError}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              关闭
            </button>
          </div>
        )}

        <div className="mt-6 space-y-6">
          <ApiKeySection
            settings={settings}
            onUpdateKey={handleUpdateApiKey}
            onDeleteKey={handleDeleteApiKey}
            onShowKey={handleShowApiKey}
            isLoading={isLoading}
          />

          <ThemeSection
            currentTheme={settings?.theme || 'light'}
            onThemeChange={handleThemeChange}
            isLoading={isLoading}
          />

          <LanguageSection
            currentLanguage={settings?.language || 'zh'}
            onLanguageChange={handleLanguageChange}
            isLoading={isLoading}
          />

          <NotificationSection
            notifications={settings?.notifications ?? true}
            onNotificationsChange={handleNotificationsChange}
            isLoading={isLoading}
          />

          <AccountSection
            userEmail={user.email}
            userNickname={userName}
          />
        </div>
      </div>
    </div>
  )
}

export default Settings
