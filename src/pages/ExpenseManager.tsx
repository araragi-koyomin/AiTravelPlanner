import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mic, Plus, Trash2, Edit2, Save, X } from 'lucide-react'
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
import { useAuthStore } from '@/stores/authStore'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getExpenseSummary,
  type Expense,
  type ExpenseStats,
  type ExpenseSummary
} from '@/services/expense'
import { parseVoiceToExpense } from '@/utils/voiceParser'
import type { ExpenseCategory, PaymentMethod } from '@/services/supabase'

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  transport: '交通',
  accommodation: '住宿',
  food: '餐饮',
  ticket: '门票',
  shopping: '购物',
  entertainment: '娱乐',
  other: '其他'
}

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

export function ExpenseManager() {
  const { itineraryId } = useParams<{ itineraryId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState<ExpenseStats | null>(null)
  const [summary, setSummary] = useState<ExpenseSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ExpenseFormData>(DEFAULT_EXPENSE_FORM)

  const fetchData = useCallback(async () => {
    if (!itineraryId) return

    setIsLoading(true)
    setError(null)

    try {
      const [expensesData, statsData, summaryData] = await Promise.all([
        getExpenses(itineraryId),
        getExpenseStats(itineraryId),
        getExpenseSummary(itineraryId)
      ])

      setExpenses(expensesData)
      setStats(statsData)
      setSummary(summaryData)
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

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">费用管理</CardTitle>
          <CardDescription>
            记录和管理您的旅行费用
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">总支出</p>
                <p className="text-2xl font-bold text-blue-700">
                  ¥{stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">日均支出</p>
                <p className="text-2xl font-bold text-green-700">
                  ¥{stats.averageDailyAmount.toLocaleString(undefined, {
                    maximumFractionDigits: 0
                  })}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600">记录数</p>
                <p className="text-2xl font-bold text-purple-700">
                  {expenses.length} 条
                </p>
              </div>
            </div>
          )}

          {summary.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                支出分布
              </h3>
              <div className="space-y-2">
                {summary.map((item) => (
                  <div key={item.category} className="flex items-center gap-3">
                    <span className="w-16 text-sm text-gray-600">
                      {CATEGORY_LABELS[item.category as ExpenseCategory] || item.category}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="w-24 text-sm text-gray-600 text-right">
                      ¥{item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <Button
              type="button"
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
              onClick={() => setShowVoiceInput(!showVoiceInput)}
              className="flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              {showVoiceInput ? '关闭语音' : '语音输入'}
            </Button>
          </div>

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

          {expenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>暂无费用记录</p>
              <p className="text-sm mt-2">点击上方按钮添加费用</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 text-xs bg-primary/10 text-primary-700 rounded">
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
