import { Button } from '@/components/ui/Button'
import { Edit3, Save, X, Undo2, Redo2, Check } from 'lucide-react'

interface EditToolbarProps {
  isEditMode: boolean
  hasUnsavedChanges: boolean
  canUndo: boolean
  canRedo: boolean
  isSaving?: boolean
  onEnterEdit: () => void
  onExitEdit: () => void
  onSave: () => void
  onUndo: () => void
  onRedo: () => void
}

export function EditToolbar({
  isEditMode,
  hasUnsavedChanges,
  canUndo,
  canRedo,
  isSaving = false,
  onEnterEdit,
  onExitEdit,
  onSave,
  onUndo,
  onRedo
}: EditToolbarProps) {
  if (!isEditMode) {
    return (
      <Button
        variant="outline"
        onClick={onEnterEdit}
        className="flex items-center gap-2"
      >
        <Edit3 className="h-4 w-4" />
        编辑行程
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-1 text-sm text-blue-700 font-medium">
        <Check className="h-4 w-4" />
        编辑模式
      </div>

      <div className="h-4 w-px bg-blue-200 mx-2" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo || isSaving}
          title="撤销 (Ctrl+Z)"
          className="h-8 px-2"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo || isSaving}
          title="重做 (Ctrl+Y)"
          className="h-8 px-2"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-4 w-px bg-blue-200 mx-2" />

      <div className="flex items-center gap-2 ml-auto">
        {hasUnsavedChanges && (
          <span className="text-xs text-amber-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            有未保存的更改
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onExitEdit}
          disabled={isSaving}
          className="h-8"
        >
          <X className="h-4 w-4 mr-1" />
          取消
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          disabled={!hasUnsavedChanges || isSaving}
          className="h-8"
        >
          {isSaving ? (
            <>
              <span className="animate-spin mr-1">⏳</span>
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              保存
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
