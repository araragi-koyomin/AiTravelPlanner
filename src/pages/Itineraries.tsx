import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

export function Itineraries() {
  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">我的行程</h1>
        <p className="mt-2 text-gray-600">管理您的旅行计划</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>创建新行程</CardTitle>
          <CardDescription>开始规划您的下一次旅行</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 text-6xl">✈️</div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                还没有行程
              </h3>
              <p className="mb-6 text-gray-600">
                创建您的第一个旅行计划，让 AI 帮助您规划完美的行程
              </p>
              <Link to="/itineraries/new">
                <Button>创建行程</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
