import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'
import { updatePassword } from '@/services/auth'

interface AccountSectionProps {
  userEmail: string | undefined
  userNickname?: string
}

export function AccountSection({ userEmail, userNickname }: AccountSectionProps) {
  const navigate = useNavigate()
  const { logout, isLoading: isAuthLoading } = useAuthStore()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChangePassword = async () => {
    setError(null)
    setSuccess(null)

    if (!newPassword.trim()) {
      setError('请输入新密码')
      return
    }

    if (newPassword.length < 6) {
      setError('密码至少需要 6 个字符')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setIsSaving(true)
    try {
      await updatePassword({ newPassword })
      setSuccess('密码修改成功')
      setIsChangingPassword(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '修改密码失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('登出失败:', err)
    }
  }

  const handleCancel = () => {
    setIsChangingPassword(false)
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">账户设置</h3>
      <p className="mt-1 text-sm text-gray-500">
        管理您的账户信息
      </p>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-600">
          {success}
        </div>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">邮箱</label>
          <p className="mt-1 text-gray-900">{userEmail || '未设置'}</p>
        </div>

        {userNickname && (
          <div>
            <label className="block text-sm font-medium text-gray-700">昵称</label>
            <p className="mt-1 text-gray-900">{userNickname}</p>
          </div>
        )}

        {isChangingPassword ? (
          <div className="space-y-3 rounded-md bg-gray-50 p-4">
            <h4 className="font-medium text-gray-900">修改密码</h4>
            <Input
              type="password"
              placeholder="请输入新密码"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSaving}
            />
            <Input
              type="password"
              placeholder="请再次输入新密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSaving}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleChangePassword} disabled={isSaving}>
                {isSaving ? '保存中...' : '确认修改'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving}>
                取消
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsChangingPassword(true)}
              disabled={isAuthLoading}
            >
              修改密码
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isAuthLoading}
            >
              {isAuthLoading ? '登出中...' : '退出登录'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
