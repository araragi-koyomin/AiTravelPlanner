import { supabase, TablesInsert, TablesUpdate, TablesRow, SupabaseErrorClass } from './supabase'
import { encryptApiKey, decryptApiKey } from '@/utils/crypto'

export type UserSettings = TablesRow<'user_settings'>
export type UserSettingsInsert = TablesInsert<'user_settings'>
export type UserSettingsUpdate = TablesUpdate<'user_settings'>

export type ApiKeyType = 'zhipu' | 'xunfei' | 'amap'

const DEFAULT_SETTINGS: Omit<UserSettingsInsert, 'user_id'> = {
  zhipu_api_key: null,
  xunfei_api_key: null,
  amap_api_key: null,
  theme: 'light',
  language: 'zh',
  notifications: true
}

export async function getUserSettings(
  userId: string
): Promise<UserSettings | null> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new SupabaseErrorClass(`获取用户设置失败: ${error.message}`, error.code)
    }

    return data
  } catch (error) {
    console.error('获取用户设置失败:', error)
    if (error instanceof SupabaseErrorClass) {
      throw error
    }
    return null
  }
}

export async function createUserSettings(
  userId: string,
  settingsData: Partial<UserSettingsInsert>
): Promise<UserSettings> {
  try {
    const settings: UserSettingsInsert = {
      user_id: userId,
      ...DEFAULT_SETTINGS,
      ...settingsData
    }

    const { data, error } = await supabase
      .from('user_settings')
      .insert(settings)
      .select()
      .single()

    if (error) {
      throw new SupabaseErrorClass(`创建用户设置失败: ${error.message}`, error.code)
    }

    if (!data) {
      throw new SupabaseErrorClass('创建用户设置失败')
    }

    return data
  } catch (error) {
    console.error('创建用户设置失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('创建用户设置失败')
  }
}

export async function updateUserSettings(
  userId: string,
  settingsData: UserSettingsUpdate
): Promise<UserSettings> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        ...settingsData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new SupabaseErrorClass(`更新用户设置失败: ${error.message}`, error.code)
    }

    if (!data) {
      throw new SupabaseErrorClass('更新用户设置失败')
    }

    return data
  } catch (error) {
    console.error('更新用户设置失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('更新用户设置失败')
  }
}

export async function updateApiKey(
  userId: string,
  keyType: ApiKeyType,
  apiKey: string
): Promise<UserSettings> {
  try {
    if (!apiKey) {
      throw new SupabaseErrorClass('API Key 不能为空')
    }

    const encryptedKey = encryptApiKey(apiKey)

    const updateData: UserSettingsUpdate = {}

    switch (keyType) {
      case 'zhipu':
        updateData.zhipu_api_key = encryptedKey
        break
      case 'xunfei':
        updateData.xunfei_api_key = encryptedKey
        break
      case 'amap':
        updateData.amap_api_key = encryptedKey
        break
      default:
        throw new SupabaseErrorClass('无效的 API Key 类型')
    }

    return await updateUserSettings(userId, updateData)
  } catch (error) {
    console.error('更新 API Key 失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('更新 API Key 失败')
  }
}

export async function getApiKey(
  userId: string,
  keyType: ApiKeyType
): Promise<string | null> {
  try {
    const settings = await getUserSettings(userId)

    if (!settings) {
      return null
    }

    let encryptedKey: string | null = null

    switch (keyType) {
      case 'zhipu':
        encryptedKey = settings.zhipu_api_key
        break
      case 'xunfei':
        encryptedKey = settings.xunfei_api_key
        break
      case 'amap':
        encryptedKey = settings.amap_api_key
        break
      default:
        throw new SupabaseErrorClass('无效的 API Key 类型')
    }

    return decryptApiKey(encryptedKey)
  } catch (error) {
    console.error('获取 API Key 失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('获取 API Key 失败')
  }
}

export async function deleteApiKey(
  userId: string,
  keyType: ApiKeyType
): Promise<UserSettings> {
  try {
    const updateData: UserSettingsUpdate = {}

    switch (keyType) {
      case 'zhipu':
        updateData.zhipu_api_key = null
        break
      case 'xunfei':
        updateData.xunfei_api_key = null
        break
      case 'amap':
        updateData.amap_api_key = null
        break
      default:
        throw new SupabaseErrorClass('无效的 API Key 类型')
    }

    return await updateUserSettings(userId, updateData)
  } catch (error) {
    console.error('删除 API Key 失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('删除 API Key 失败')
  }
}

export async function updateTheme(
  userId: string,
  theme: 'light' | 'dark'
): Promise<UserSettings> {
  try {
    return await updateUserSettings(userId, { theme })
  } catch (error) {
    console.error('更新主题设置失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('更新主题设置失败')
  }
}

export async function updateLanguage(
  userId: string,
  language: 'zh' | 'en'
): Promise<UserSettings> {
  try {
    return await updateUserSettings(userId, { language })
  } catch (error) {
    console.error('更新语言设置失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('更新语言设置失败')
  }
}

export async function updateNotifications(
  userId: string,
  notifications: boolean
): Promise<UserSettings> {
  try {
    return await updateUserSettings(userId, { notifications })
  } catch (error) {
    console.error('更新通知设置失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('更新通知设置失败')
  }
}

export async function getOrCreateUserSettings(
  userId: string
): Promise<UserSettings> {
  try {
    let settings = await getUserSettings(userId)

    if (!settings) {
      settings = await createUserSettings(userId, {})
    }

    return settings
  } catch (error) {
    console.error('获取或创建用户设置失败:', error)
    throw error instanceof SupabaseErrorClass ? error : new SupabaseErrorClass('获取或创建用户设置失败')
  }
}
