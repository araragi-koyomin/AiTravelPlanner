export const appConfig = {
  name: import.meta.env.VITE_APP_NAME || 'AI Travel Planner',
  version: import.meta.env.VITE_APP_VERSION || '0.1.0',
  apiBaseUrl: '/api',
} as const
