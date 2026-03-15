export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container">
        <div className="py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="text-2xl">✈️</div>
                <span className="text-lg font-bold text-primary-600">AI Travel Planner</span>
              </div>
              <p className="text-sm text-gray-600">
                智能旅行规划，让每一次出行都更加精彩
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">快速链接</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-sm text-gray-600 transition-colors hover:text-primary-600">
                    首页
                  </a>
                </li>
                <li>
                  <a href="/itineraries" className="text-sm text-gray-600 transition-colors hover:text-primary-600">
                    我的行程
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-sm text-gray-600 transition-colors hover:text-primary-600">
                    关于我们
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">联系我们</h3>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600">邮箱: support@aitravelplanner.com</li>
                <li className="text-sm text-gray-600">电话: 400-123-4567</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center">
            <p className="text-sm text-gray-600">
              © 2026 AI Travel Planner. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
