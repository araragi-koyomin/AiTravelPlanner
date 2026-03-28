import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter
} from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { AlertCircle } from 'lucide-react'

interface UnsavedChangesModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  onDiscard: () => void
  isSaving?: boolean
}

export function UnsavedChangesModal({
  isOpen,
  onClose,
  onSave,
  onDiscard,
  isSaving = false
}: UnsavedChangesModalProps) {
  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <ModalTitle>有未保存的更改</ModalTitle>
        </ModalHeader>
        <ModalDescription className="mt-3">
          您有未保存的更改，是否保存后再退出？
        </ModalDescription>
        <ModalFooter className="mt-4 flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onDiscard}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            放弃更改
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            继续编辑
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? '保存中...' : '保存并退出'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
