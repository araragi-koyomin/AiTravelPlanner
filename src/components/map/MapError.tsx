import { memo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export interface MapErrorProps {
  error: Error
  onRetry?: () => void
}

function MapErrorComponent({ error, onRetry }: MapErrorProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg p-8">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">地图加载失败</h3>
      <p className="text-sm text-gray-600 mb-4 text-center max-w-md">
        {error.message || '无法加载地图，请检查网络连接或刷新页面重试'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重新加载
        </button>
      )}
    </div>
  )
}

export const MapError = memo(MapErrorComponent)
