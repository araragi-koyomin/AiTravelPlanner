import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-gray-900">
            欢迎使用 AI 旅行规划师
          </h1>
          <p className="text-xl text-gray-600">
            智能规划您的下一次旅行，让每一次出行都更加精彩
          </p>
        </div>

        <div className="mb-12 flex justify-center gap-4">
          <Button size="lg">
            <Link to="/itineraries/create">创建新行程</Link>
          </Button>
          <Button variant="outline" size="lg">
            <Link to="/login">登录</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>智能行程规划</CardTitle>
              <CardDescription>
                AI 驱动的智能行程规划，根据您的偏好生成个性化旅行计划
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl">🤖</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>语音输入</CardTitle>
              <CardDescription>
                支持语音输入，快速记录您的旅行需求和想法
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl">🎤</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>地图展示</CardTitle>
              <CardDescription>
                集成高德地图，直观展示您的行程路线和景点位置
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl">🗺️</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">最近行程</h2>
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">暂无行程，开始创建您的第一个旅行计划吧！</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
