import { supabase } from './supabase'

export interface AMapStatusResult {
  success: boolean
  status: 'available' | 'not_configured' | 'invalid_key' | 'error'
  message: string
}

export async function checkAMapStatus(): Promise<AMapStatusResult> {
  try {
    const { data, error } = await supabase.functions.invoke('check-amap-status', {
      method: 'GET'
    })

    if (error) {
      console.error('检测高德地图状态失败:', error)
      return {
        success: false,
        status: 'error',
        message: error.message || '检测高德地图状态失败'
      }
    }

    return data as AMapStatusResult
  } catch (error) {
    console.error('检测高德地图状态失败:', error)
    return {
      success: false,
      status: 'error',
      message: error instanceof Error ? error.message : '无法连接到服务'
    }
  }
}
