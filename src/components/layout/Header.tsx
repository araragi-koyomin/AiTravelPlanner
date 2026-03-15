import { Link } from 'react-router-dom'

export function Header() {
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
            <Link
              to="/itineraries"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
            >
              行程
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
            >
              关于
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </div>
    </header>
  )
}
