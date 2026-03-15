import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateUsername,
  checkPasswordStrength,
  getStrengthColor,
  getStrengthText,
  sanitizeInput,
  validateRequired,
  validateMinLength,
  validateMaxLength
} from '@/utils/validation'

describe('validateEmail', () => {
  it('应该验证有效的邮箱地址', () => {
    const result = validateEmail('test@example.com')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('应该验证带子域的邮箱地址', () => {
    const result = validateEmail('test@mail.example.com')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('应该拒绝无效的邮箱地址', () => {
    const result = validateEmail('invalid-email')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('邮箱格式不正确')
  })

  it('应该拒绝缺少 @ 符号的邮箱', () => {
    const result = validateEmail('testexample.com')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('邮箱格式不正确')
  })

  it('应该拒绝空邮箱', () => {
    const result = validateEmail('')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('邮箱不能为空')
  })

  it('应该拒绝只有空格的邮箱', () => {
    const result = validateEmail('   ')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('邮箱不能为空')
  })
})

describe('validatePassword', () => {
  it('应该验证有效的密码（8位以上，包含字母和数字）', () => {
    const result = validatePassword('Test1234')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('应该拒绝少于8位的密码', () => {
    const result = validatePassword('Test12')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('密码至少需要8个字符')
  })

  it('应该拒绝没有字母的密码', () => {
    const result = validatePassword('12345678')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('密码必须包含字母')
  })

  it('应该拒绝没有数字的密码', () => {
    const result = validatePassword('TestTest')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('密码必须包含数字')
  })

  it('应该拒绝空密码', () => {
    const result = validatePassword('')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('密码不能为空')
  })
})

describe('validateConfirmPassword', () => {
  it('应该验证匹配的密码', () => {
    const result = validateConfirmPassword('Test1234', 'Test1234')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('应该拒绝不匹配的密码', () => {
    const result = validateConfirmPassword('Test1234', 'Test5678')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('两次输入的密码不一致')
  })

  it('应该拒绝空的确认密码', () => {
    const result = validateConfirmPassword('Test1234', '')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('确认密码不能为空')
  })
})

describe('validateUsername', () => {
  it('应该验证有效的用户名', () => {
    const result = validateUsername('testuser')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('应该验证中文用户名', () => {
    const result = validateUsername('测试用户')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('应该拒绝少于2个字符的用户名', () => {
    const result = validateUsername('a')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('用户名至少需要2个字符')
  })

  it('应该拒绝超过20个字符的用户名', () => {
    const result = validateUsername('a'.repeat(21))
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('用户名不能超过20个字符')
  })

  it('应该拒绝包含特殊字符的用户名', () => {
    const result = validateUsername('test@user')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('用户名只能包含字母、数字、下划线和中文')
  })

  it('应该拒绝空用户名', () => {
    const result = validateUsername('')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('用户名不能为空')
  })
})

describe('checkPasswordStrength', () => {
  it('应该返回弱密码', () => {
    const result = checkPasswordStrength('T')
    expect(result.level).toBe('weak')
    expect(result.score).toBeLessThan(2)
  })

  it('应该返回中等强度密码', () => {
    const result = checkPasswordStrength('Test123')
    expect(result.level).toBe('medium')
    expect(result.score).toBeGreaterThanOrEqual(2)
    expect(result.score).toBeLessThan(4)
  })

  it('应该返回强密码', () => {
    const result = checkPasswordStrength('Test1234!@#')
    expect(result.level).toBe('strong')
    expect(result.score).toBeGreaterThanOrEqual(4)
  })

  it('应该正确检测长度要求', () => {
    const result = checkPasswordStrength('Test1234')
    expect(result.requirements.length).toBe(true)
  })

  it('应该正确检测字母要求', () => {
    const result = checkPasswordStrength('Test1234')
    expect(result.requirements.letter).toBe(true)
  })

  it('应该正确检测数字要求', () => {
    const result = checkPasswordStrength('Test1234')
    expect(result.requirements.number).toBe(true)
  })

  it('应该正确检测特殊字符要求', () => {
    const result = checkPasswordStrength('Test1234!')
    expect(result.requirements.special).toBe(true)
  })

  it('应该处理空密码', () => {
    const result = checkPasswordStrength('')
    expect(result.level).toBe('weak')
    expect(result.score).toBe(0)
    expect(result.requirements.length).toBe(false)
    expect(result.requirements.letter).toBe(false)
    expect(result.requirements.number).toBe(false)
    expect(result.requirements.special).toBe(false)
  })
})

describe('getStrengthColor', () => {
  it('应该返回弱密码的颜色', () => {
    const color = getStrengthColor('weak')
    expect(color).toBe('text-red-500')
  })

  it('应该返回中等强度密码的颜色', () => {
    const color = getStrengthColor('medium')
    expect(color).toBe('text-yellow-500')
  })

  it('应该返回强密码的颜色', () => {
    const color = getStrengthColor('strong')
    expect(color).toBe('text-green-500')
  })
})

describe('getStrengthText', () => {
  it('应该返回弱密码的文本', () => {
    const text = getStrengthText('weak')
    expect(text).toBe('弱')
  })

  it('应该返回中等强度密码的文本', () => {
    const text = getStrengthText('medium')
    expect(text).toBe('中')
  })

  it('应该返回强密码的文本', () => {
    const text = getStrengthText('strong')
    expect(text).toBe('强')
  })
})

describe('sanitizeInput', () => {
  it('应该去除前后空格', () => {
    const result = sanitizeInput('  test  ')
    expect(result).toBe('test')
  })

  it('应该移除 < 和 > 字符', () => {
    const result = sanitizeInput('test<script>alert("xss")</script>')
    expect(result).toBe('testscriptalert("xss")/script')
  })

  it('应该移除 javascript: 协议', () => {
    const result = sanitizeInput('javascript:alert("xss")')
    expect(result).toBe('alert("xss")')
  })

  it('应该处理空字符串', () => {
    const result = sanitizeInput('')
    expect(result).toBe('')
  })

  it('应该处理 undefined', () => {
    const result = sanitizeInput(undefined as unknown as string)
    expect(result).toBe('')
  })
})

describe('validateRequired', () => {
  it('应该验证非空值', () => {
    const result = validateRequired('test', '测试字段')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('应该拒绝空字符串', () => {
    const result = validateRequired('', '测试字段')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('测试字段不能为空')
  })

  it('应该拒绝只有空格的字符串', () => {
    const result = validateRequired('   ', '测试字段')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('测试字段不能为空')
  })
})

describe('validateMinLength', () => {
  it('应该验证符合最小长度的值', () => {
    const result = validateMinLength('test', 3, '测试字段')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('应该拒绝小于最小长度的值', () => {
    const result = validateMinLength('te', 3, '测试字段')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('测试字段至少需要3个字符')
  })

  it('应该接受等于最小长度的值', () => {
    const result = validateMinLength('tes', 3, '测试字段')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })
})

describe('validateMaxLength', () => {
  it('应该验证符合最大长度的值', () => {
    const result = validateMaxLength('test', 10, '测试字段')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('应该拒绝超过最大长度的值', () => {
    const result = validateMaxLength('testtesttest', 10, '测试字段')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('测试字段不能超过10个字符')
  })

  it('应该接受等于最大长度的值', () => {
    const result = validateMaxLength('testtestte', 10, '测试字段')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('应该接受空值', () => {
    const result = validateMaxLength('', 10, '测试字段')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })
})
