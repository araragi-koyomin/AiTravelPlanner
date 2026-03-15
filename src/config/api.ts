export const apiConfig = {
  zhipu: {
    apiKey: import.meta.env.VITE_ZHIPU_API_KEY,
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4',
  },
  xunfei: {
    appId: import.meta.env.VITE_XUNFEI_APP_ID,
    apiKey: import.meta.env.VITE_XUNFEI_API_KEY,
    apiSecret: import.meta.env.VITE_XUNFEI_API_SECRET,
  },
  amap: {
    key: import.meta.env.VITE_AMAP_KEY,
    securityJsCode: import.meta.env.VITE_AMAP_SECURITY_JS_CODE,
  },
} as const
