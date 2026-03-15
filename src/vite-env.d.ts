/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ENCRYPTION_KEY: string
  readonly VITE_ZHIPU_API_KEY: string
  readonly VITE_XUNFEI_APP_ID: string
  readonly VITE_XUNFEI_API_KEY: string
  readonly VITE_XUNFEI_API_SECRET: string
  readonly VITE_AMAP_KEY: string
  readonly VITE_AMAP_SECURITY_JS_CODE: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
