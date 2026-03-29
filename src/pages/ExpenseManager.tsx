import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mic, Plus, Trash2, Edit2, Save, X, ArrowLeft, BarChart3, List } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/Card'
import { VoiceInput } from '@/components/voice'
import {
  BudgetOverview,
  ExpensePieChart,
  ExpenseBarChart,
  OverBudgetAlertList,
  ExpenseAnalysis
} from '@/components/expense'
import { useAuthStore } from '@/stores/authStore'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  type Expense,
  type ExpenseStats
} from '@/services/expense'
import { getItineraryById } from '@/services/itinerary'
import { parseVoiceToExpense } from '@/utils/voiceParser'
import { calculateBudgetStatus, calculateCategoryExpenses, generateRecommendations } from '@/utils/expenseUtils'
import type { ExpenseCategory, PaymentMethod } from '@/services/supabase'
import { CATEGORY_LABELS, CATEGORY_COLORS, type BudgetStatus, type CategoryExpense } from '@/types/expense'

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: '现金',
  credit_card: '信用卡',
  debit_card: '借记卡',
  alipay: '支付宝',
  wechat: '微信支付',
  other: '其他'
}

interface ExpenseFormData {
  category: ExpenseCategory
  amount: string
  expense_date: string
  payment_method: PaymentMethod
  description: string
  notes: string
}

const DEFAULT_EXPENSE_FORM: ExpenseFormData = {
  category: 'other',
  amount: '',
  expense_date: new Date().toISOString().split('T')[0],
  payment_method: 'cash',
  description: '',
  notes: ''
}

type ViewMode = 'list' | 'chart'

export function ExpenseManager() {
  const { itineraryId } = useParams<{ itineraryId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [budget, setBudget] = useState<number>(0)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState<ExpenseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ExpenseFormData>(DEFAULT_EXPENSE_FORM)
  const [viewMode, setViewMode] = useState<ViewMode>('chart')
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null)
  const [dismissedAlerts, setDismissedAlerts] = useState(false)

  const fetchData = useCallback(async () => {
    if (!itineraryId) return

    setIsLoading(true)
    setError(null)

    try {
      const [itinerary, expensesData, statsData] = await Promise.all([
        getItineraryById(itineraryId),
        getExpenses(itineraryId),
        getExpenseStats(itineraryId)
      ])

      setBudget(itinerary?.budget || 0)
      setExpenses(expensesData)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载费用数据失败')
    } finally {
      setIsLoading(false)
    }
  }, [itineraryId])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchData()
  }, [isAuthenticated, navigate, fetchData])

  const budgetStatus: BudgetStatus = useMemo(() => {
    return calculateBudgetStatus(budget, stats?.totalAmount || 0)
  }, [budget, stats?.totalAmount])

  const categoryBreakdown: CategoryExpense[] = useMemo(() => {
    if (!stats) return []
    return calculateCategoryExpenses(stats.amountByCategory, stats.totalAmount)
  }, [stats])

  const dailyBreakdown = useMemo(() => {
    if (!stats) return []
    return Object.entries(stats.amountByDate)
      .map(([date, amount]) => ({ date, amount, count: 1 }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [stats])

  const recommendations = useMemo(() => {
    return generateRecommendations(budgetStatus, categoryBreakdown, dailyBreakdown)
  }, [budgetStatus, categoryBreakdown, dailyBreakdown])

  const filteredExpenses = useMemo(() => {
    if (!selectedCategory) return expenses
    return expenses.filter(e => e.category === selectedCategory)
  }, [expenses, selectedCategory])

  const handleVoiceResult = useCallback((text: string) => {
    const parsed = parseVoiceToExpense(text)

    setFormData((prev) => ({
      ...prev,
      category: (parsed.category as ExpenseCategory) || prev.category,
      amount: parsed.amount?.toString() || prev.amount,
      expense_date: parsed.date || prev.expense_date,
      description: parsed.description || prev.description
    }))

    setShowVoiceInput(false)
    setShowAddForm(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!itineraryId) return

    try {
      if (editingId) {
        await updateExpense(editingId, {
          category: formData.category,
          amount: Number(formData.amount),
          expense_date: formData.expense_date,
          payment_method: formData.payment_method,
          description: formData.description || null,
          notes: formData.notes || null
        })
      } else {
        await createExpense({
          itinerary_id: itineraryId,
          category: formData.category,
          amount: Number(formData.amount),
          expense_date: formData.expense_date,
          payment_method: formData.payment_method,
          description: formData.description || null,
          notes: formData.notes || null
        })
      }

      setFormData(DEFAULT_EXPENSE_FORM)
      setShowAddForm(false)
      setEditingId(null)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存费用失败')
    }
  }

  const handleEdit = (expense: Expense) => {
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      expense_date: expense.expense_date,
      payment_method: expense.payment_method || 'cash',
      description: expense.description || '',
      notes: expense.notes || ''
    })
    setEditingId(expense.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条费用记录吗？')) return

    try {
      await deleteExpense(id)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除费用失败')
    }
  }

  const handleCancel = () => {
    setFormData(DEFAULT_EXPENSE_FORM)
    setShowAddForm(false)
    setEditingId(null)
  }

  const handleCategoryClick = (category: ExpenseCategory) => {
    setSelectedCategory(prev => prev === category ? null : category)
  }

  const handleDismissAlerts = () => {
    setDismissedAlerts(true)
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">费用管理</h1>
            <p className="text-sm text-gray-500">记录和管理您的旅行费用</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={viewMode === 'chart' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('chart')}
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {!dismissedAlerts && budgetStatus.status !== 'safe' && (
        <div className="mb-6">
          <OverBudgetAlertList
            budgetStatus={budgetStatus}
            categoryBreakdown={categoryBreakdown}
            onDismiss={handleDismissAlerts}
          />
        </div>
      )}

      {viewMode === 'chart' && (
        <div className="space-y-6">
          <BudgetOverview budgetStatus={budgetStatus} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">支出分类</CardTitle>
                <CardDescription>按类别查看支出分布</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpensePieChart
                  data={categoryBreakdown}
                  onCategoryClick={handleCategoryClick}
                  size="md"
                />
              </CardContent>
            </Card>

            <ExpenseBarChart
              data={dailyBreakdown}
              height={280}
              className="lg:mt-0"
            />
          </div>

          <ExpenseAnalysis
            report={{
              totalSpent: stats?.totalAmount || 0,
              averageDaily: stats?.averageDailyAmount || 0,
              highestDay: dailyBreakdown.length > 0
                ? dailyBreakdown.reduce((max, curr) => curr.amount > max.amount ? curr : max)
                : null,
              highestCategory: categoryBreakdown.length > 0
                ? { category: categoryBreakdown[0].category, amount: categoryBreakdown[0].amount }
                : null,
              budgetStatus,
              categoryBreakdown,
              dailyBreakdown,
              recommendations
            }}
          />
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {viewMode === 'chart' ? '费用记录' : '全部费用'}
              </CardTitle>
              {selectedCategory && (
                <CardDescription>
                  筛选: {CATEGORY_LABELS[selectedCategory]}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="ml-2 text-primary hover:underline"
                  >
                    清除
                  </button>
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setShowAddForm(!showAddForm)
                  setEditingId(null)
                  setFormData(DEFAULT_EXPENSE_FORM)
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加费用
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowVoiceInput(!showVoiceInput)}
                className="flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                {showVoiceInput ? '关闭' : '语音'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showVoiceInput && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                语音输入费用
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                例如："今天打车花了50元" 或 "午餐消费100元"
              </p>
              <VoiceInput
                onResult={handleVoiceResult}
                onError={(err) => setError(err)}
                placeholder="点击麦克风开始说话..."
                maxDuration={30000}
              />
            </div>
          )}

          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingId ? '编辑费用' : '添加费用'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        类别
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: e.target.value as ExpenseCategory
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        金额（元）<span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            amount: e.target.value
                          }))
                        }
                        placeholder="请输入金额"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        日期 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.expense_date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            expense_date: e.target.value
                          }))
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        支付方式
                      </label>
                      <select
                        value={formData.payment_method}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            payment_method: e.target.value as PaymentMethod
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      描述
                    </label>
                    <Input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value
                        }))
                      }
                      placeholder="简短描述（如：打车去机场）"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      备注
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notes: e.target.value
                        }))
                      }
                      placeholder="其他备注信息"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      保存
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      取消
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>{selectedCategory ? '该分类暂无费用记录' : '暂无费用记录'}</p>
              <p className="text-sm mt-2">点击上方按钮添加费用</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2 py-1 text-xs rounded"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[expense.category]}20`,
                          color: CATEGORY_COLORS[expense.category]
                        }}
                      >
                        {CATEGORY_LABELS[expense.category]}
                      </span>
                      <span className="font-medium">
                        ¥{expense.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {expense.description || '无描述'}
                      <span className="mx-2">·</span>
                      {expense.expense_date}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(expense)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
