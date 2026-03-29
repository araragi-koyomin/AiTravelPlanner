import { useState } from 'react'

interface NotificationSectionProps {
  notifications: boolean
  onNotificationsChange: (enabled: boolean) => Promise<void>
  isLoading?: boolean
}

export function NotificationSection({ notifications, onNotificationsChange, isLoading }: NotificationSectionProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async () => {
    setIsUpdating(true)
    try {
      await onNotificationsChange(!notifications)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">通知设置</h3>
      <p className="mt-1 text-sm text-gray-500">
        管理应用通知偏好
      </p>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">启用通知</p>
          <p className="text-sm text-gray-500">接收行程提醒和系统通知</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={notifications}
          onClick={handleToggle}
          disabled={isLoading || isUpdating}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 ${
            notifications ? 'bg-primary-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              notifications ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
