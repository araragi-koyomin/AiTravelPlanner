import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'

export function Header() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, isLoading } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const userName = (user?.user_metadata?.name as string | undefined) || (user?.email?.split('@')[0] as string | undefined) || '用户'

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl">✈️</div>
            <span className="text-xl font-bold text-primary-600">AI Travel Planner</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
            >
              首页
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/itineraries"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
                >
                  行程
                </Link>
                <Link
                  to="/settings"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
                >
                  设置
                </Link>
              </>
            )}
            <Link
              to="/about"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
            >
              关于
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                    <span className="text-sm font-medium">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {userName}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  {isLoading ? '登出中...' : '登出'}
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
