import { supabase } from './supabase'

export interface POIResult {
  poi_id: string
  name: string
  address: string
  lat: number
  lng: number
  city: string
  district: string
  type: string
}

export interface POISearchResponse {
  success: boolean
  count: number
  results: POIResult[]
  error?: string
}

export interface POISearchRequest {
  keywords: string
  city?: string
  citylimit?: boolean
  types?: string
}

export async function searchPOI(request: POISearchRequest): Promise<POISearchResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('verify-poi', {
      method: 'POST',
      body: request
    })

    if (error) {
      console.error('POI搜索失败:', error)
      return {
        success: false,
        count: 0,
        results: [],
        error: error.message || 'POI搜索失败'
      }
    }

    return data as POISearchResponse
  } catch (error) {
    console.error('POI搜索失败:', error)
    return {
      success: false,
      count: 0,
      results: [],
      error: error instanceof Error ? error.message : 'POI搜索失败'
    }
  }
}

export async function searchSinglePOI(
  keywords: string,
  city?: string
): Promise<POIResult | null> {
  const response = await searchPOI({ keywords, city, citylimit: true })

  if (response.success && response.results.length > 0) {
    return response.results[0]
  }

  return null
}
