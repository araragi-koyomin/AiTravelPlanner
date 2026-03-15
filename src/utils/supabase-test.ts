import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
  duration?: number
  data?: unknown
}

export class SupabaseTest {
  private supabase: SupabaseClient
  private results: TestResult[] = []

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL or Anon Key is missing')
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey)
  }

  async runAllTests(): Promise<TestResult[]> {
    this.results = []

    await this.testConnection()
    await this.testDatabaseOperations()
    await this.testRLSPolicies()
    await this.testPerformance()

    return this.results
  }

  async testConnection(): Promise<void> {
    const startTime = performance.now()

    try {
      const { data, error } = await this.supabase.from('users').select('count').limit(1)

      const duration = performance.now() - startTime

      if (error) {
        this.results.push({
          name: '数据库连接测试',
          status: 'error',
          message: `连接失败: ${error.message}`,
          duration
        })
      } else {
        this.results.push({
          name: '数据库连接测试',
          status: 'success',
          message: '数据库连接成功',
          duration,
          data: { count: data?.[0]?.count || 0 }
        })
      }
    } catch (error: unknown) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.results.push({
        name: '数据库连接测试',
        status: 'error',
        message: `连接异常: ${errorMessage}`,
        duration
      })
    }
  }

  async testDatabaseOperations(): Promise<void> {
    await this.testReadOperation()
    await this.testInsertOperation()
    await this.testUpdateOperation()
    await this.testDeleteOperation()
    await this.testTransaction()
  }

  async testReadOperation(): Promise<void> {
    const startTime = performance.now()

    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .limit(1)

      const duration = performance.now() - startTime

      if (error) {
        this.results.push({
          name: '读取操作测试',
          status: 'error',
          message: `读取失败: ${error.message}`,
          duration
        })
      } else {
        this.results.push({
          name: '读取操作测试',
          status: 'success',
          message: '读取操作成功',
          duration,
          data: { recordCount: data?.length || 0 }
        })
      }
    } catch (error: unknown) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.results.push({
        name: '读取操作测试',
        status: 'error',
        message: `读取异常: ${errorMessage}`,
        duration
      })
    }
  }

  async testInsertOperation(): Promise<void> {
    const startTime = performance.now()

    try {
      const testData = {
        email: `test-${Date.now()}@example.com`,
        password: 'test123',
        name: 'Test User'
      }

      const { data, error } = await this.supabase
        .from('users')
        .insert(testData)
        .select()
        .single()

      const duration = performance.now() - startTime

      if (error) {
        this.results.push({
          name: '插入操作测试',
          status: 'error',
          message: `插入失败: ${error.message}`,
          duration
        })
      } else {
        this.results.push({
          name: '插入操作测试',
          status: 'success',
          message: '插入操作成功',
          duration,
          data: { id: data?.id }
        })

        await this.supabase.from('users').delete().eq('id', data?.id)
      }
    } catch (error: unknown) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.results.push({
        name: '插入操作测试',
        status: 'error',
        message: `插入异常: ${errorMessage}`,
        duration
      })
    }
  }

  async testUpdateOperation(): Promise<void> {
    const startTime = performance.now()

    try {
      const testData = {
        email: `test-update-${Date.now()}@example.com`,
        password: 'test123',
        name: 'Test Update User'
      }

      const { data: insertData } = await this.supabase
        .from('users')
        .insert(testData)
        .select()
        .single()

      if (insertData) {
        const { data, error } = await this.supabase
          .from('users')
          .update({ name: 'Updated Name' })
          .eq('id', insertData.id)
          .select()
          .single()

        const duration = performance.now() - startTime

        if (error) {
          this.results.push({
            name: '更新操作测试',
            status: 'error',
            message: `更新失败: ${error.message}`,
            duration
          })
        } else {
          this.results.push({
            name: '更新操作测试',
            status: 'success',
            message: '更新操作成功',
            duration,
            data: { id: data?.id, name: data?.name }
          })

          await this.supabase.from('users').delete().eq('id', insertData.id)
        }
      }
    } catch (error: unknown) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.results.push({
        name: '更新操作测试',
        status: 'error',
        message: `更新异常: ${errorMessage}`,
        duration
      })
    }
  }

  async testDeleteOperation(): Promise<void> {
    const startTime = performance.now()

    try {
      const testData = {
        email: `test-delete-${Date.now()}@example.com`,
        password: 'test123',
        name: 'Test Delete User'
      }

      const { data: insertData } = await this.supabase
        .from('users')
        .insert(testData)
        .select()
        .single()

      if (insertData) {
        const { error } = await this.supabase
          .from('users')
          .delete()
          .eq('id', insertData.id)

        const duration = performance.now() - startTime

        if (error) {
          this.results.push({
            name: '删除操作测试',
            status: 'error',
            message: `删除失败: ${error.message}`,
            duration
          })
        } else {
          this.results.push({
            name: '删除操作测试',
            status: 'success',
            message: '删除操作成功',
            duration
          })
        }
      }
    } catch (error: unknown) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.results.push({
        name: '删除操作测试',
        status: 'error',
        message: `删除异常: ${errorMessage}`,
        duration
      })
    }
  }

  async testTransaction(): Promise<void> {
    const startTime = performance.now()

    try {
      const testData1 = {
        email: `test-tx-1-${Date.now()}@example.com`,
        password: 'test123',
        name: 'Test TX User 1'
      }

      const testData2 = {
        email: `test-tx-2-${Date.now()}@example.com`,
        password: 'test123',
        name: 'Test TX User 2'
      }

      const { data: data1 } = await this.supabase
        .from('users')
        .insert(testData1)
        .select()
        .single()

      const { data: data2 } = await this.supabase
        .from('users')
        .insert(testData2)
        .select()
        .single()

      const duration = performance.now() - startTime

      if (data1 && data2) {
        this.results.push({
          name: '事务操作测试',
          status: 'success',
          message: '事务操作成功（批量插入）',
          duration,
          data: { count: 2 }
        })

        await this.supabase.from('users').delete().in('id', [data1.id, data2.id])
      } else {
        this.results.push({
          name: '事务操作测试',
          status: 'error',
          message: '事务操作失败',
          duration
        })
      }
    } catch (error: unknown) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.results.push({
        name: '事务操作测试',
        status: 'error',
        message: `事务异常: ${errorMessage}`,
        duration
      })
    }
  }

  async testRLSPolicies(): Promise<void> {
    await this.testRLSReadAccess()
    await this.testRLSWriteAccess()
  }

  async testRLSReadAccess(): Promise<void> {
    const startTime = performance.now()

    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .limit(10)

      const duration = performance.now() - startTime

      if (error) {
        this.results.push({
          name: 'RLS 读取权限测试',
          status: 'warning',
          message: `RLS 策略检查失败: ${error.message}`,
          duration
        })
      } else {
        const message = data?.length === 0
          ? 'RLS 策略正常：未认证用户无法读取数据'
          : `RLS 策略正常：读取到 ${data?.length} 条记录`

        this.results.push({
          name: 'RLS 读取权限测试',
          status: 'success',
          message,
          duration,
          data: { recordCount: data?.length || 0 }
        })
      }
    } catch (error: unknown) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.results.push({
        name: 'RLS 读取权限测试',
        status: 'error',
        message: `RLS 测试异常: ${errorMessage}`,
        duration
      })
    }
  }

  async testRLSWriteAccess(): Promise<void> {
    const startTime = performance.now()

    try {
      const testData = {
        email: `test-rls-${Date.now()}@example.com`,
        password: 'test123',
        name: 'Test RLS User'
      }

      const { data, error } = await this.supabase
        .from('users')
        .insert(testData)
        .select()
        .single()

      const duration = performance.now() - startTime

      if (error) {
        this.results.push({
          name: 'RLS 写入权限测试',
          status: 'warning',
          message: `RLS 策略检查失败: ${error.message}`,
          duration
        })
      } else {
        this.results.push({
          name: 'RLS 写入权限测试',
          status: 'success',
          message: 'RLS 策略正常：允许插入数据',
          duration,
          data: { id: data?.id }
        })

        await this.supabase.from('users').delete().eq('id', data?.id)
      }
    } catch (error: unknown) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.results.push({
        name: 'RLS 写入权限测试',
        status: 'error',
        message: `RLS 测试异常: ${errorMessage}`,
        duration
      })
    }
  }

  async testPerformance(): Promise<void> {
    await this.testQueryPerformance()
    await this.testBatchOperationPerformance()
  }

  async testQueryPerformance(): Promise<void> {
    const iterations = 10
    const durations: number[] = []

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now()
      await this.supabase.from('users').select('count').limit(1)
      const duration = performance.now() - startTime
      durations.push(duration)
    }

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    const maxDuration = Math.max(...durations)
    const minDuration = Math.min(...durations)

    const threshold = 100
    const status = avgDuration < threshold ? 'good' : avgDuration < threshold * 2 ? 'warning' : 'poor'

    this.results.push({
      name: '查询性能测试',
      status: status === 'good' ? 'success' : status === 'warning' ? 'warning' : 'error',
      message: `平均查询时间: ${avgDuration.toFixed(2)}ms (最小: ${minDuration.toFixed(2)}ms, 最大: ${maxDuration.toFixed(2)}ms)`,
      duration: avgDuration,
      data: {
        iterations,
        avgDuration,
        maxDuration,
        minDuration,
        threshold
      }
    })
  }

  async testBatchOperationPerformance(): Promise<void> {
    const batchSize = 10
    const testData = Array.from({ length: batchSize }, (_, i) => ({
      email: `test-batch-${Date.now()}-${i}@example.com`,
      password: 'test123',
      name: `Test Batch User ${i}`
    }))

    const startTime = performance.now()

    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert(testData)
        .select()

      const duration = performance.now() - startTime

      if (error) {
        this.results.push({
          name: '批量操作性能测试',
          status: 'error',
          message: `批量操作失败: ${error.message}`,
          duration
        })
      } else {
        const threshold = 1000
        const status = duration < threshold ? 'good' : duration < threshold * 2 ? 'warning' : 'poor'

        this.results.push({
          name: '批量操作性能测试',
          status: status === 'good' ? 'success' : status === 'warning' ? 'warning' : 'error',
          message: `批量插入 ${data?.length || 0} 条记录，耗时: ${duration.toFixed(2)}ms`,
          duration,
          data: {
            batchSize,
            insertedCount: data?.length || 0,
            avgTimePerRecord: duration / (data?.length || 1),
            threshold
          }
        })

        if (data && data.length > 0) {
          const ids = data.map((item: { id: string }) => item.id)
          await this.supabase.from('users').delete().in('id', ids)
        }
      }
    } catch (error: unknown) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.results.push({
        name: '批量操作性能测试',
        status: 'error',
        message: `批量操作异常: ${errorMessage}`,
        duration
      })
    }
  }

  getResults(): TestResult[] {
    return this.results
  }

  getSummary() {
    const total = this.results.length
    const success = this.results.filter(r => r.status === 'success').length
    const error = this.results.filter(r => r.status === 'error').length
    const warning = this.results.filter(r => r.status === 'warning').length

    return {
      total,
      success,
      error,
      warning,
      passRate: ((success / total) * 100).toFixed(1)
    }
  }

  exportResults(): string {
    const summary = this.getSummary()
    const results = this.results.map(r => {
      const statusIcon = r.status === 'success' ? '✅' : r.status === 'error' ? '❌' : '⚠️'
      return `${statusIcon} ${r.name}: ${r.message} (${r.duration?.toFixed(2)}ms)`
    }).join('\n')

    return `
Supabase 连接测试报告
====================

测试摘要:
--------
总测试数: ${summary.total}
通过: ${summary.success}
失败: ${summary.error}
警告: ${summary.warning}
通过率: ${summary.passRate}%

测试结果:
--------
${results}

环境信息:
--------
Supabase URL: ${import.meta.env.VITE_SUPABASE_URL}
测试时间: ${new Date().toLocaleString('zh-CN')}
    `.trim()
  }
}

export default SupabaseTest
