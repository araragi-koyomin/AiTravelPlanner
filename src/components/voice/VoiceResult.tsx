import { useState, useEffect } from 'react'
import { Check, X, Edit2 } from 'lucide-react'
import { cn } from '../../utils/cn'

interface VoiceResultProps {
  text: string
  isEditing: boolean
  onEdit: () => void
  onConfirm: () => void
  onCancel: () => void
  onChangeText: (text: string) => void
  className?: string
}

export function VoiceResult({
  text,
  isEditing,
  onEdit,
  onConfirm,
  onCancel,
  onChangeText,
  className
}: VoiceResultProps) {
  const [editText, setEditText] = useState(text)

  useEffect(() => {
    setEditText(text)
  }, [text])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value)
    onChangeText(e.target.value)
  }

  const handleConfirm = () => {
    onChangeText(editText)
    onConfirm()
  }

  if (!text && !isEditing) {
    return null
  }

  return (
    <div className={cn('border rounded-lg p-4 bg-gray-50', className)}>
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={handleTextChange}
            className="w-full min-h-[80px] p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="编辑识别结果..."
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
              取消
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              <Check className="w-4 h-4" />
              确认
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-800 whitespace-pre-wrap">{text}</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              编辑
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              <Check className="w-4 h-4" />
              使用
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
