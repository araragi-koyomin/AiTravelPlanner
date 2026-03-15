import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { SupabaseTest as SupabaseTestClass, TestResult } from '@/utils/supabase-test'

interface TestSummary {
  total: number
  success: number
  error: number
  warning: number
  passRate: string
}

export function SupabaseTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [summary, setSummary] = useState<TestSummary | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [exportText, setExportText] = useState('')

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    setSummary(null)

    try {
      const tester = new SupabaseTestClass()
      const results = await tester.runAllTests()
      const testSummary = tester.getSummary()
      const exportData = tester.exportResults()

      setTestResults(results)
      setSummary(testSummary)
      setExportText(exportData)
    } catch (error: unknown) {
      console.error('测试执行失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setTestResults([{
        name: '测试执行',
        status: 'error',
        message: `测试执行失败: ${errorMessage}`,
        duration: 0
      }])
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return '❓'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportText)
    alert('测试报告已复制到剪贴板！')
  }

  const downloadReport = () => {
    const blob = new Blob([exportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `supabase-test-report-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Supabase 连接测试
          </h1>
          <p className="text-lg text-gray-600">
            测试 Supabase 数据库连接、CRUD 操作、RLS 策略和性能
          </p>
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>测试控制</CardTitle>
              <CardDescription>
                点击下方按钮开始测试所有功能
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  onClick={runTests}
                  disabled={isRunning}
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <Loading size="sm" className="mr-2" />
                      测试中...
                    </>
                  ) : (
                    '开始测试'
                  )}
                </Button>
                {exportText && (
                  <>
                    <Button
                      variant="outline"
                      onClick={copyToClipboard}
                      size="lg"
                    >
                      复制报告
                    </Button>
                    <Button
                      variant="outline"
                      onClick={downloadReport}
                      size="lg"
                    >
                      下载报告
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {summary && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>测试摘要</CardTitle>
                <CardDescription>
                  测试结果概览
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="text-sm text-blue-600">总测试数</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {summary.total}
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="text-sm text-green-600">通过</div>
                    <div className="text-2xl font-bold text-green-900">
                      {summary.success}
                    </div>
                  </div>
                  <div className="rounded-lg bg-red-50 p-4">
                    <div className="text-sm text-red-600">失败</div>
                    <div className="text-2xl font-bold text-red-900">
                      {summary.error}
                    </div>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-4">
                    <div className="text-sm text-yellow-600">警告</div>
                    <div className="text-2xl font-bold text-yellow-900">
                      {summary.warning}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600">通过率</div>
                  <div className={`text-3xl font-bold ${parseFloat(summary.passRate) >= 80 ? 'text-green-600' :
                    parseFloat(summary.passRate) >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                    {summary.passRate}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>测试结果</CardTitle>
                <CardDescription>
                  详细的测试结果
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-2xl">
                              {getStatusIcon(result.status)}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {result.name}
                            </h3>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(result.status)}`}
                            >
                              {result.status.toUpperCase()}
                            </span>
                          </div>
                          <p className={`mb-2 ${getStatusColor(result.status)}`}>
                            {result.message}
                          </p>
                          {result.duration && (
                            <div className="text-sm text-gray-600">
                              耗时: {result.duration.toFixed(2)}ms
                            </div>
                          )}
                          {result.data != null && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-sm font-medium text-blue-600">
                                查看详情
                              </summary>
                              <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                                {JSON.stringify(result.data as Record<string, unknown>, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>环境信息</CardTitle>
              <CardDescription>
                当前测试环境配置
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Supabase URL:</span>
                  <span className="font-mono text-sm">
                    {import.meta.env.VITE_SUPABASE_URL || '未配置'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Supabase Anon Key:</span>
                  <span className="font-mono text-sm">
                    {import.meta.env.VITE_SUPABASE_ANON_KEY
                      ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...`
                      : '未配置'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">测试时间:</span>
                  <span className="font-mono text-sm">
                    {new Date().toLocaleString('zh-CN')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>测试说明</CardTitle>
              <CardDescription>
                了解各项测试的含义
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">连接测试</h4>
                  <p className="text-sm text-gray-600">
                    测试 Supabase 客户端是否能够成功连接到数据库
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">CRUD 操作测试</h4>
                  <p className="text-sm text-gray-600">
                    测试基本的创建、读取、更新、删除操作是否正常工作
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">RLS 策略测试</h4>
                  <p className="text-sm text-gray-600">
                    测试 Row Level Security 策略是否正确配置，确保用户只能访问自己的数据
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">性能测试</h4>
                  <p className="text-sm text-gray-600">
                    测试查询和批量操作的性能，确保满足性能要求
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
