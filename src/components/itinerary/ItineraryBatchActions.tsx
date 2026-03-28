import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Trash2, Heart, X, CheckSquare } from 'lucide-react'

interface ItineraryBatchActionsProps {
  selectedCount: number
  totalCount: number
  isBatchMode: boolean
  onEnterBatchMode: () => void
  onExitBatchMode: () => void
  onSelectAll: () => void
  onClearSelection: () => void
  onBatchDelete: () => void
  onBatchFavorite: (isFavorite: boolean) => void
  isLoading?: boolean
}

export const ItineraryBatchActions = memo(function ItineraryBatchActions({
  selectedCount,
  totalCount,
  isBatchMode,
  onEnterBatchMode,
  onExitBatchMode,
  onSelectAll,
  onClearSelection,
  onBatchDelete,
  onBatchFavorite,
  isLoading = false
}: ItineraryBatchActionsProps) {
  const handleSelectAll = useCallback(() => {
    onSelectAll()
  }, [onSelectAll])

  const handleBatchDelete = useCallback(() => {
    if (selectedCount > 0) {
      onBatchDelete()
    }
  }, [selectedCount, onBatchDelete])

  const handleBatchFavorite = useCallback(() => {
    if (selectedCount > 0) {
      onBatchFavorite(true)
    }
  }, [selectedCount, onBatchFavorite])

  const handleBatchUnfavorite = useCallback(() => {
    if (selectedCount > 0) {
      onBatchFavorite(false)
    }
  }, [selectedCount, onBatchFavorite])

  if (!isBatchMode) {
    return (
      <Button variant="outline" size="sm" onClick={onEnterBatchMode} className="gap-1">
        <CheckSquare className="h-4 w-4" />
        <span className="hidden sm:inline">批量管理</span>
      </Button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onExitBatchMode}>
              <X className="h-4 w-4 mr-1" />
              取消
            </Button>

            <div className="text-sm text-gray-600">
              已选择 <span className="font-medium text-primary">{selectedCount}</span> / {totalCount} 项
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={selectedCount === totalCount}>
                全选
              </Button>
              <Button variant="outline" size="sm" onClick={onClearSelection} disabled={selectedCount === 0}>
                取消选择
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchFavorite}
              disabled={selectedCount === 0 || isLoading}
              className="gap-1"
            >
              <Heart className="h-4 w-4" />
              收藏
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchUnfavorite}
              disabled={selectedCount === 0 || isLoading}
              className="gap-1"
            >
              <Heart className="h-4 w-4" />
              取消收藏
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
              disabled={selectedCount === 0 || isLoading}
              className="gap-1"
            >
              <Trash2 className="h-4 w-4" />
              删除 ({selectedCount})
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})
