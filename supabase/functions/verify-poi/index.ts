import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface POISearchRequest {
  keywords: string
  city?: string
  citylimit?: boolean
  types?: string
}

interface POI {
  id: string
  name: string
  type: string
  address: string
  location: string
  pname: string
  cityname: string
  adname: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const contentType = req.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ success: false, error: '请求 Content-Type 必须是 application/json' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const bodyText = await req.text()
    if (!bodyText || bodyText.trim() === '') {
      return new Response(
        JSON.stringify({ success: false, error: '请求体不能为空' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let data: POISearchRequest
    try {
      data = JSON.parse(bodyText)
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: '请求体 JSON 格式无效' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { keywords, city, citylimit = true, types } = data

    if (!keywords) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少关键词' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const amapKey = Deno.env.get('AMAP_WEB_API_KEY')
    if (!amapKey) {
      return new Response(
        JSON.stringify({ success: false, error: '高德地图 API Key 未配置' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const params = new URLSearchParams({
      key: amapKey,
      keywords: keywords,
      offset: '5',
      page: '1',
      extensions: 'all',
    })

    if (city) {
      params.set('city', city)
      params.set('citylimit', citylimit.toString())
    }

    if (types) {
      params.set('types', types)
    }

    const response = await fetch(
      `https://restapi.amap.com/v3/place/text?${params.toString()}`
    )

    const result = await response.json()

    if (result.status !== '1') {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.info || 'POI搜索失败'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const pois: POI[] = result.pois || []

    const results = pois.map((poi: POI) => {
      const [lng, lat] = poi.location.split(',').map(Number)
      return {
        poi_id: poi.id,
        name: poi.name,
        address: poi.address || '',
        lat,
        lng,
        city: poi.cityname || '',
        district: poi.adname || '',
        type: poi.type || ''
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        count: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('POI搜索失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'POI搜索失败'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
