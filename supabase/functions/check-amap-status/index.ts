import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const amapKey = Deno.env.get('AMAP_WEB_API_KEY')

    if (!amapKey) {
      return new Response(
        JSON.stringify({
          success: false,
          status: 'not_configured',
          message: '高德地图 API Key 未配置'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch(
      `https://restapi.amap.com/v3/ip?key=${amapKey}`
    )

    const data = await response.json()

    if (data.status === '1') {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'available',
          message: '高德地图 API 可用'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          status: 'invalid_key',
          message: data.info || '高德地图 API Key 无效或已过期'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('检测高德地图状态失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        status: 'error',
        message: '检测高德地图 API 状态失败'
      }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }
})
