import type { TransportMode } from '@/types/map'

export interface TransportRecommendation {
  mode: TransportMode
  reason: string
  estimatedCost: number
  estimatedDuration: number
  distance: number
  priority: number
}

export interface RecommendTransportRequest {
  origin: {
    name: string
    lat: number
    lng: number
  }
  destination: {
    name: string
    lat: number
    lng: number
  }
  budget?: number
  specialNeeds?: string[]
  travelersType?: string
  participants?: number
}

export interface RecommendTransportResponse {
  success: boolean
  distance: number
  recommendations: TransportRecommendation[]
  error?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function recommendTransport(
  request: RecommendTransportRequest
): Promise<RecommendTransportResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/recommend-transport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data as RecommendTransportResponse
  } catch (error) {
    console.error('推荐交通方式失败:', error)
    return {
      success: false,
      distance: 0,
      recommendations: [],
      error: error instanceof Error ? error.message : '推荐交通方式失败'
    }
  }
}
