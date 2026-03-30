import { useState } from 'react'
import { X, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { exportToPdf, exportFromElement, exportToImageAuto } from '@/services/export'
import type { ExportOptions, ExportResult, ExportProgress } from '@/types/export'
import type { Itinerary, DailyScheduleBuilt, BudgetBreakdown } from '@/services/itinerary'
import {
  DEFAULT_EXPORT_OPTIONS,
  EXPORT_FORMAT_LABELS,
  EXPORT_QUALITY_LABELS,
  EXPORT_ORIENTATION_LABELS
} from '@/types/export'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  itinerary: Itinerary
  dailySchedule: DailyScheduleBuilt[]
  budgetBreakdown: BudgetBreakdown
  containerRef?: React.RefObject<HTMLElement | null>
}

export function ExportModal({
  isOpen,
  onClose,
  itinerary,
  dailySchedule,
  budgetBreakdown,
  containerRef
}: ExportModalProps) {
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS)
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleOptionChange = <K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }))
    setError(null)
  }

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)
    setProgress({ step: '准备导出...', progress: 0, total: 100 })

    try {
      let result: ExportResult

      if (containerRef?.current) {
        result = await exportFromElement(
          containerRef.current,
          itinerary,
          options,
          setProgress
        )
      } else if (options.format === 'pdf') {
        result = await exportToPdf(
          itinerary,
          dailySchedule,
          budgetBreakdown,
          options,
          setProgress
        )
      } else {
        result = await exportToImageAuto(
          itinerary,
          dailySchedule,
          budgetBreakdown,
          options,
          setProgress
        )
      }

      if (result.success) {
        onClose()
      } else {
        setError(result.error || '导出失败，请重试')
      }
    } catch (err) {
      console.error('导出失败:', err)
      setError(err instanceof Error ? err.message : '导出失败，请重试')
    } finally {
      setIsExporting(false)
      setProgress(null)
    }
  }

  const handleClose = () => {
    if (!isExporting) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">导出行程</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={isExporting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              导出格式
            </label>
            <div className="flex gap-2">
              {(Object.keys(EXPORT_FORMAT_LABELS) as Array<keyof typeof EXPORT_FORMAT_LABELS>).map(
                (format) => (
                  <button
                    key={format}
                    onClick={() => handleOptionChange('format', format)}
                    disabled={isExporting}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      options.format === format
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {EXPORT_FORMAT_LABELS[format]}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              导出质量
            </label>
            <div className="flex gap-2">
              {(Object.keys(EXPORT_QUALITY_LABELS) as Array<keyof typeof EXPORT_QUALITY_LABELS>).map(
                (quality) => (
                  <button
                    key={quality}
                    onClick={() => handleOptionChange('quality', quality)}
                    disabled={isExporting}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      options.quality === quality
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {EXPORT_QUALITY_LABELS[quality]}
                  </button>
                )
              )}
            </div>
          </div>

          {options.format === 'pdf' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                页面方向
              </label>
              <div className="flex gap-2">
                {(Object.keys(EXPORT_ORIENTATION_LABELS) as Array<keyof typeof EXPORT_ORIENTATION_LABELS>).map(
                  (orientation) => (
                    <button
                      key={orientation}
                      onClick={() => handleOptionChange('orientation', orientation)}
                      disabled={isExporting}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        options.orientation === orientation
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {EXPORT_ORIENTATION_LABELS[orientation]}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              导出内容
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={options.includeBudget}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeBudget', checked === true)
                  }
                />
                <span className="text-sm text-gray-700">预算分解</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={options.includeStatistics}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeStatistics', checked === true)
                  }
                />
                <span className="text-sm text-gray-700">行程统计</span>
              </label>
            </div>
          </div>

          {isExporting && progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{progress.step}</span>
                <span className="text-gray-500">{progress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isExporting}
          >
            取消
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="min-w-[100px]"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                导出
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
