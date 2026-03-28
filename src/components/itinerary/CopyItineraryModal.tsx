import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface CopyItineraryModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newTitle: string) => void
  originalTitle: string
  isLoading?: boolean
}

export function CopyItineraryModal({
  isOpen,
  onClose,
  onConfirm,
  originalTitle,
  isLoading = false
}: CopyItineraryModalProps) {
  const [newTitle, setNewTitle] = useState(`${originalTitle} (副本)`)

  const handleConfirm = useCallback(() => {
    if (newTitle.trim()) {
      onConfirm(newTitle.trim())
    }
  }, [newTitle, onConfirm])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        handleConfirm()
      }
    },
    [handleConfirm, isLoading]
  )

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose()
      }
    },
    [onClose]
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>复制行程</DialogTitle>
          <DialogDescription>为复制的行程设置一个新标题</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入新标题"
            disabled={isLoading}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!newTitle.trim() || isLoading}>
            {isLoading ? '复制中...' : '确认复制'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
