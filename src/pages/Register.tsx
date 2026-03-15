import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { useAuthStore } from '@/stores/authStore'
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  checkPasswordStrength,
  getStrengthColor,
  getStrengthText,
  sanitizeInput
} from '@/utils/validation'

export function Register() {
  const navigate = useNavigate()
  const { register, error, isLoading, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(checkPasswordStrength(''))
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    clearError()
  }, [clearError])

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password))
  }, [password])

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

    const confirmPasswordResult = validateConfirmPassword(password, confirmPassword)
    if (!confirmPasswordResult.valid) {
      setConfirmPasswordError(confirmPasswordResult.errors[0])
      isValid = false
    } else {
      setConfirmPasswordError(null)
    }

    if (name.length > 0 && name.length < 2) {
      setNameError('用户名至少需要2个字符')
      isValid = false
    } else {
      setNameError(null)
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

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    
    if (value.length > 0) {
      const result = validateConfirmPassword(password, value)
      setConfirmPasswordError(result.valid ? null : result.errors[0])
    } else {
      setConfirmPasswordError(null)
    }
  }

  const handleNameChange = (value: string) => {
    const sanitizedValue = sanitizeInput(value)
    setName(sanitizedValue)
    
    if (sanitizedValue.length > 0 && sanitizedValue.length < 2) {
      setNameError('用户名至少需要2个字符')
    } else {
      setNameError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        email: email.trim(),
        password,
        name: name.trim() || undefined
      })
      
      navigate('/')
    } catch (error) {
      console.error('注册失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = email.length > 0 && 
                      password.length > 0 && 
                      confirmPassword.length > 0 && 
                      !emailError && 
                      !passwordError && 
                      !confirmPasswordError && 
                      !nameError &&
                      passwordStrength.level !== 'weak'

  return (
    <div className="container flex min-h-[calc(100vh-16rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">注册</CardTitle>
          <CardDescription>创建一个新账户开始使用</CardDescription>
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
              <label htmlFor="name" className="text-sm font-medium">
                用户名（可选）
              </label>
              <Input
                id="name"
                type="text"
                placeholder="您的用户名"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isLoading || isSubmitting}
                className={nameError ? 'border-red-500' : ''}
                aria-invalid={!!nameError}
                aria-describedby={nameError ? 'name-error' : undefined}
              />
              {nameError && (
                <p id="name-error" className="text-sm text-red-500 mt-1">
                  {nameError}
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
                  placeholder="••••••••"
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
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">密码强度：</span>
                    <span className={`font-medium ${getStrengthColor(passwordStrength.level)}`}>
                      {getStrengthText(passwordStrength.level)}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-xs">
                      <span className={`w-4 mr-2 ${passwordStrength.requirements.length ? 'text-green-500' : 'text-gray-400'}`}>
                        {passwordStrength.requirements.length ? '✓' : '○'}
                      </span>
                      <span className="text-gray-600">至少8个字符</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={`w-4 mr-2 ${passwordStrength.requirements.letter ? 'text-green-500' : 'text-gray-400'}`}>
                        {passwordStrength.requirements.letter ? '✓' : '○'}
                      </span>
                      <span className="text-gray-600">包含字母</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={`w-4 mr-2 ${passwordStrength.requirements.number ? 'text-green-500' : 'text-gray-400'}`}>
                        {passwordStrength.requirements.number ? '✓' : '○'}
                      </span>
                      <span className="text-gray-600">包含数字</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={`w-4 mr-2 ${passwordStrength.requirements.special ? 'text-green-500' : 'text-gray-400'}`}>
                        {passwordStrength.requirements.special ? '✓' : '○'}
                      </span>
                      <span className="text-gray-600">包含特殊字符</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                确认密码
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  required
                  disabled={isLoading || isSubmitting}
                  className={confirmPasswordError ? 'border-red-500 pr-10' : 'pr-10'}
                  aria-invalid={!!confirmPasswordError}
                  aria-describedby={confirmPasswordError ? 'confirm-password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={isLoading || isSubmitting}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {confirmPasswordError && (
                <p id="confirm-password-error" className="text-sm text-red-500 mt-1">
                  {confirmPasswordError}
                </p>
              )}
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
                  注册中...
                </span>
              ) : (
                '注册'
              )}
            </Button>

            <p className="text-center text-sm text-gray-600">
              已有账户？{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
                立即登录
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
