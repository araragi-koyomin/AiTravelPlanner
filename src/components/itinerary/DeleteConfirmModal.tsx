import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter
} from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string
  isDeleting?: boolean
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isDeleting = false
}: DeleteConfirmModalProps) {
  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <ModalTitle>确认删除</ModalTitle>
          </div>
          <ModalDescription className="mt-3">
            确定要删除行程项「<span className="font-medium text-gray-900">{itemName}</span>」吗？
          </ModalDescription>
        </ModalHeader>
        <ModalFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? '删除中...' : '确认删除'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
