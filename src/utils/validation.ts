export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface PasswordStrength {
  level: 'weak' | 'medium' | 'strong'
  score: number
  requirements: {
    length: boolean
    letter: boolean
    number: boolean
    special: boolean
  }
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []

  if (!email || email.trim().length === 0) {
    errors.push('邮箱不能为空')
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push('邮箱格式不正确')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  if (!password || password.length === 0) {
    errors.push('密码不能为空')
  } else {
    if (password.length < 8) {
      errors.push('密码至少需要8个字符')
    }

    if (!/[a-zA-Z]/.test(password)) {
      errors.push('密码必须包含字母')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('密码必须包含数字')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
  const errors: string[] = []

  if (!confirmPassword || confirmPassword.length === 0) {
    errors.push('确认密码不能为空')
  } else if (password !== confirmPassword) {
    errors.push('两次输入的密码不一致')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateUsername(username: string): ValidationResult {
  const errors: string[] = []

  if (!username || username.trim().length === 0) {
    errors.push('用户名不能为空')
  } else {
    if (username.length < 2) {
      errors.push('用户名至少需要2个字符')
    }

    if (username.length > 20) {
      errors.push('用户名不能超过20个字符')
    }

    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
      errors.push('用户名只能包含字母、数字、下划线和中文')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0
  const requirements = {
    length: false,
    letter: false,
    number: false,
    special: false
  }

  if (!password || password.length === 0) {
    return {
      level: 'weak',
      score: 0,
      requirements
    }
  }

  if (password.length >= 8) {
    score += 1
    requirements.length = true
  }

  if (password.length >= 12) {
    score += 1
  }

  if (/[a-z]/.test(password)) {
    score += 1
    requirements.letter = true
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  }

  if (/[0-9]/.test(password)) {
    score += 1
    requirements.number = true
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1
    requirements.special = true
  }

  let level: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 4) {
    level = 'strong'
  } else if (score >= 2) {
    level = 'medium'
  }

  return {
    level,
    score,
    requirements
  }
}

export function getStrengthColor(level: 'weak' | 'medium' | 'strong'): string {
  const colorMap: Record<'weak' | 'medium' | 'strong', string> = {
    weak: 'text-red-500',
    medium: 'text-yellow-500',
    strong: 'text-green-500'
  }

  return colorMap[level]
}

export function getStrengthText(level: 'weak' | 'medium' | 'strong'): string {
  const textMap: Record<'weak' | 'medium' | 'strong', string> = {
    weak: '弱',
    medium: '中',
    strong: '强'
  }

  return textMap[level]
}

export function sanitizeInput(input: string): string {
  if (!input) {
    return ''
  }

  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  const errors: string[] = []

  if (!value || value.trim().length === 0) {
    errors.push(`${fieldName}不能为空`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
  const errors: string[] = []

  if (!value || value.length < minLength) {
    errors.push(`${fieldName}至少需要${minLength}个字符`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationResult {
  const errors: string[] = []

  if (value && value.length > maxLength) {
    errors.push(`${fieldName}不能超过${maxLength}个字符`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
