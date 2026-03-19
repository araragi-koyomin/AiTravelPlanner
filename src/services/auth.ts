import { supabase } from './supabase'
import type { AuthUser, AuthSession, TablesRow, TablesInsert, TablesUpdate } from './supabase'
import { handleSupabaseError, SupabaseErrorClass } from './supabase'

export type UserProfile = TablesRow<'user_profiles'>
export type UserProfileInsert = TablesInsert<'user_profiles'>
export type UserProfileUpdate = TablesUpdate<'user_profiles'>

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  name?: string
}

export interface ResetPasswordCredentials {
  email: string
}

export interface UpdatePasswordCredentials {
  newPassword: string
}

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export async function signIn(credentials: SignInCredentials): Promise<AuthSession> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) {
      throw handleSupabaseError(error)
    }

    if (!data.session) {
      throw new SupabaseErrorClass('登录失败，请检查邮箱和密码')
    }

    return data.session
  } catch (error) {
    console.error('登录失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function signUp(credentials: SignUpCredentials): Promise<AuthSession> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name || ''
        }
      }
    })

    if (error) {
      throw handleSupabaseError(error)
    }

    if (!data.session) {
      throw new SupabaseErrorClass('注册成功，请检查邮箱验证')
    }

    return data.session
  } catch (error) {
    console.error('注册失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw handleSupabaseError(error)
    }
  } catch (error) {
    console.error('登出失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function resetPassword(credentials: ResetPasswordCredentials): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(credentials.email)

    if (error) {
      throw handleSupabaseError(error)
    }
  } catch (error) {
    console.error('重置密码失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function updatePassword(credentials: UpdatePasswordCredentials): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: credentials.newPassword
    })

    if (error) {
      throw handleSupabaseError(error)
    }
  } catch (error) {
    console.error('更新密码失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      throw handleSupabaseError(error)
    }

    return user
  } catch (error) {
    console.error('获取当前用户失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      throw handleSupabaseError(error)
    }

    return session
  } catch (error) {
    console.error('获取当前会话失败:', error)
    throw handleSupabaseError(error)
  }
}

export function onAuthStateChange(
  callback: (event: string, session: AuthSession | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session as AuthSession | null)
    }
  )

  return () => {
    subscription.unsubscribe()
  }
}

export async function checkAuthStatus(): Promise<boolean> {
  try {
    const session = await getCurrentSession()
    return session !== null
  } catch (error) {
    console.error('检查认证状态失败:', error)
    return false
  }
}

export function getAuthErrorMessage(error: unknown): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': '邮箱或密码错误',
    'User already registered': '该邮箱已被注册',
    'Email not confirmed': '请先验证邮箱',
    'Invalid email': '邮箱格式不正确',
    'Password should be at least 6 characters': '密码至少需要6个字符',
    'Network request failed': '网络连接失败，请检查网络',
    'API Key invalid': 'API Key 无效，请检查设置'
  }

  if (error instanceof SupabaseErrorClass) {
    return errorMap[error.message] || error.message
  }

  if ((error as { message?: string })?.message) {
    return errorMap[(error as { message: string }).message] || (error as { message: string }).message
  }

  return '操作失败，请稍后重试'
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw handleSupabaseError(error)
    }

    return data
  } catch (error) {
    console.error('获取用户资料失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function createUserProfile(profileData: UserProfileInsert): Promise<UserProfile> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    if (!data) {
      throw new SupabaseErrorClass('创建用户资料失败')
    }

    return data
  } catch (error) {
    console.error('创建用户资料失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function updateUserProfile(userId: string, profileData: UserProfileUpdate): Promise<UserProfile> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    if (!data) {
      throw new SupabaseErrorClass('更新用户资料失败')
    }

    return data
  } catch (error) {
    console.error('更新用户资料失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function upsertUserProfile(profileData: UserProfileInsert): Promise<UserProfile> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData)
      .select()
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    if (!data) {
      throw new SupabaseErrorClass('保存用户资料失败')
    }

    return data
  } catch (error) {
    console.error('保存用户资料失败:', error)
    throw handleSupabaseError(error)
  }
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return null
    }
    return await getUserProfile(user.id)
  } catch (error) {
    console.error('获取当前用户资料失败:', error)
    return null
  }
}
