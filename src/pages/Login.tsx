import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { useAuthStore } from '@/stores/authStore'
import { validateEmail, validatePassword, sanitizeInput } from '@/utils/validation'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, error, isLoading, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = (location.state as { from?: string })?.from || '/'

  useEffect(() => {
    clearError()
  }, [clearError])

  const validateForm = (): boolean => {
    let isValid = true

    const emailResult = validateEmail(email)
    if (!emailResult.valid) {
      setEmailError(emailResult.errors[0])
      isValid = false
    } else {
      setEmailError(null)
    }

    const passwordResult = validatePassword(password)
    if (!passwordResult.valid) {
      setPasswordError(passwordResult.errors[0])
      isValid = false
    } else {
      setPasswordError(null)
    }

    return isValid
  }

  const handleEmailChange = (value: string) => {
    const sanitizedValue = sanitizeInput(value)
    setEmail(sanitizedValue)
    
    if (sanitizedValue.length > 0) {
      const result = validateEmail(sanitizedValue)
      setEmailError(result.valid ? null : result.errors[0])
    } else {
      setEmailError(null)
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    
    if (value.length > 0) {
      const result = validatePassword(value)
      setPasswordError(result.valid ? null : result.errors[0])
    } else {
      setPasswordError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await login({
        email: email.trim(),
        password
      })
      
      navigate(from, { replace: true })
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = email.length > 0 && 
                      password.length > 0 && 
                      !emailError && 
                      !passwordError

  return (
    <div className="container flex min-h-[calc(100vh-16rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">登录</CardTitle>
          <CardDescription>输入您的邮箱和密码登录账户</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                邮箱
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
                disabled={isLoading || isSubmitting}
                className={emailError ? 'border-red-500' : ''}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              {emailError && (
                <p id="email-error" className="text-sm text-red-500 mt-1">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                密码
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="•••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  disabled={isLoading || isSubmitting}
                  className={passwordError ? 'border-red-500 pr-10' : 'pr-10'}
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={isLoading || isSubmitting}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="text-sm text-red-500 mt-1">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading || isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="remember" className="text-sm text-gray-700">
                记住我
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <span className="flex items-center">
                  <Loading size="sm" className="mr-2" />
                  登录中...
                </span>
              ) : (
                '登录'
              )}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                忘记密码？
              </Link>
            </div>

            <p className="text-center text-sm text-gray-600">
              还没有账户？{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
                立即注册
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
