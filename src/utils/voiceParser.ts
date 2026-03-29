import type { ParsedItineraryVoice, ParsedExpenseVoice } from '../types/voice'
import { 
  TravelPreference,
  type TravelersType, 
  type AccommodationPreference, 
  type PaceType 
} from '../types/itinerary'

const DESTINATION_PATTERNS = [
  /(?:去|到|前往|目的地是?)\s*([^\s，。！？,，]+)/,
  /(?:目的地|地点|城市)\s*[是为]?\s*([^\s，。！？,，]+)/
]

const DESTINATION_SUFFIXES = ['旅游', '旅行', '玩', '游玩', '出差']

const BUDGET_PATTERNS = [
  /(?:预算|费用|花费|大约|大概)\s*[是为]?\s*(\d+(?:\.\d+)?(?:万|千|百)?)(?:元|块|块钱)?/,
  /(\d+(?:\.\d+)?(?:万|千|百)?)(?:元|块|块钱)(?:左右)?(?:的)?(?:预算|费用)?/
]

const PARTICIPANTS_PATTERNS = [
  /(?:一共|总共|有)?\s*(\d+|[一二两三四五六七八九十]+)\s*(?:个)?人/,
  /(\d+|[一二两三四五六七八九十]+)\s*(?:个)?人(?:同行|参加|去)?/,
  /同行\s*(\d+|[一二两三四五六七八九十]+)\s*(?:个)?人/,
  /(两|二)\s*个人/
]

const GROUP_TYPE_KEYWORDS: Record<string, string[]> = {
  '情侣出游': ['情侣', '两个人', '二人', '情侣出游'],
  '家庭出游': ['家庭', '全家', '一家人', '亲子'],
  '朋友出游': ['朋友', '好友', '闺蜜', '兄弟'],
  '独自旅行': ['独自', '一个人', '自己'],
  '团队出游': ['团队', '公司', '团建']
}

const GROUP_TYPE_TO_TRAVELERS_TYPE: Record<string, TravelersType> = {
  '情侣出游': 'couple',
  '家庭出游': 'family',
  '朋友出游': 'friends',
  '独自旅行': 'solo',
  '团队出游': 'business'
}

const ACCOMMODATION_KEYWORDS: Record<string, string[]> = {
  '豪华型': ['豪华', '五星级', '五星', '高档'],
  '舒适型': ['舒适', '四星级', '四星', '中档'],
  '经济型': ['经济', '实惠', '便宜', '快捷', '民宿'],
  '特色民宿': ['民宿', '特色', '客栈']
}

const ACCOMMODATION_TO_PREFERENCE: Record<string, AccommodationPreference> = {
  '豪华型': 'luxury',
  '舒适型': 'comfort',
  '经济型': 'budget',
  '特色民宿': 'budget'
}

const PACE_KEYWORDS: Record<string, string[]> = {
  '轻松': ['轻松', '休闲', '悠闲', '慢节奏'],
  '适中': ['适中', '正常', '一般'],
  '紧凑': ['紧凑', '赶', '快节奏', '充实']
}

const PACE_TO_TYPE: Record<string, PaceType> = {
  '轻松': 'relaxed',
  '适中': 'moderate',
  '紧凑': 'intense'
}

const TRAVEL_PREFERENCE_KEYWORDS: Record<string, string[]> = {
  '美食': ['美食', '吃', '小吃', '餐饮'],
  '景点': ['景点', '名胜', '打卡', '地标'],
  '购物': ['购物', '逛街', '买'],
  '文化': ['文化', '历史', '博物馆', '古迹'],
  '自然': ['自然', '风景', '山水', '户外'],
  '娱乐': ['娱乐', '游玩', '主题公园', '乐园']
}

const PREFERENCE_TO_TRAVEL_PREFERENCE: Record<string, TravelPreference> = {
  '美食': TravelPreference.FOOD,
  '景点': TravelPreference.ATTRACTION,
  '购物': TravelPreference.SHOPPING,
  '文化': TravelPreference.CULTURE,
  '自然': TravelPreference.NATURE,
  '娱乐': TravelPreference.ATTRACTION
}

const EXPENSE_AMOUNT_PATTERNS = [
  /(?:花了|花费|消费|支出)\s*(\d+(?:\.\d+)?(?:万|千|百)?)(?:元|块|块钱)?/,
  /(\d+(?:\.\d+)?(?:万|千|百)?)(?:元|块|块钱)/
]

const EXPENSE_CATEGORY_KEYWORDS: Record<string, string[]> = {
  transport: ['交通', '打车', '出租', '地铁', '公交', '火车', '高铁', '飞机', '机票', '车票'],
  accommodation: ['住宿', '酒店', '民宿', '宾馆', '房费'],
  food: ['餐饮', '吃饭', '午餐', '晚餐', '早餐', '小吃', '美食', '饮料', '咖啡'],
  shopping: ['购物', '买', '纪念品', '特产', '衣服', '商品'],
  entertainment: ['娱乐', '门票', '景点', '游玩', '电影', '演出'],
  other: ['其他', '杂费', '其他支出']
}

const CHINESE_NUMBERS: Record<string, number> = {
  '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5,
  '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15,
  '十六': 16, '十七': 17, '十八': 18, '十九': 19, '二十': 20
}

function chineseToNumber(str: string): number | undefined {
  if (CHINESE_NUMBERS[str]) {
    return CHINESE_NUMBERS[str]
  }
  const num = parseInt(str, 10)
  if (!isNaN(num)) {
    return num
  }
  return undefined
}

function normalizeDate(dateStr: string): string | undefined {
  const now = new Date()
  const currentYear = now.getFullYear()

  const fullDateMatch = dateStr.match(/(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})/)
  if (fullDateMatch) {
    const [, year, month, day] = fullDateMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const shortDateMatch = dateStr.match(/(\d{1,2})[月\-\/](\d{1,2})/)
  if (shortDateMatch) {
    const [, month, day] = shortDateMatch
    return `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  return undefined
}

function normalizeBudget(amountStr: string): number | undefined {
  const amount = parseFloat(amountStr)
  if (isNaN(amount)) return undefined

  if (amountStr.includes('万')) {
    return amount * 10000
  } else if (amountStr.includes('千')) {
    return amount * 1000
  } else if (amountStr.includes('百')) {
    return amount * 100
  }
  
  return amount
}

export function parseVoiceToItinerary(text: string): ParsedItineraryVoice {
  const result: ParsedItineraryVoice = {}

  for (const pattern of DESTINATION_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      let destination = match[1].trim()
      for (const suffix of DESTINATION_SUFFIXES) {
        if (destination.endsWith(suffix) && destination.length > suffix.length) {
          destination = destination.slice(0, -suffix.length)
          break
        }
      }
      result.destination = destination
      break
    }
  }

  const startDateMatch = text.match(/(?:从|开始|出发)[是为]?\s*(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日号]?)/)
  if (startDateMatch) {
    result.startDate = normalizeDate(startDateMatch[1])
  }

  const endDateMatch = text.match(/(?:到|至|结束|返回)[是为]?\s*(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日号]?)/)
  if (endDateMatch) {
    result.endDate = normalizeDate(endDateMatch[1])
  }

  if (!result.endDate) {
    const shortEndDateMatch = text.match(/(?:到|至)\s*(\d{1,2}[月\-\/]\d{1,2}[日号]?)/)
    if (shortEndDateMatch && result.startDate) {
      const startYear = result.startDate.split('-')[0]
      const monthDay = shortEndDateMatch[1]
      const monthMatch = monthDay.match(/(\d{1,2})[月\-\/](\d{1,2})/)
      if (monthMatch) {
        result.endDate = `${startYear}-${monthMatch[1].padStart(2, '0')}-${monthMatch[2].padStart(2, '0')}`
      }
    }
  }

  for (const pattern of BUDGET_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const budget = normalizeBudget(match[1])
      if (budget) {
        result.budget = budget
        break
      }
    }
  }

  for (const pattern of PARTICIPANTS_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const participants = chineseToNumber(match[1])
      if (participants && participants > 0 && participants < 100) {
        result.participants = participants
        break
      }
    }
  }

  for (const [groupType, keywords] of Object.entries(GROUP_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        result.groupType = groupType
        break
      }
    }
    if (result.groupType) break
  }

  for (const [accommodation, keywords] of Object.entries(ACCOMMODATION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        result.accommodationPreference = accommodation
        break
      }
    }
    if (result.accommodationPreference) break
  }

  for (const [pace, keywords] of Object.entries(PACE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        result.pace = pace
        break
      }
    }
    if (result.pace) break
  }

  const preferences: string[] = []
  for (const [preference, keywords] of Object.entries(TRAVEL_PREFERENCE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword) && !preferences.includes(preference)) {
        preferences.push(preference)
        break
      }
    }
  }
  if (preferences.length > 0) {
    result.travelPreferences = preferences
  }

  const specialKeywords = ['特殊要求', '注意', '需要', '希望', '想要']
  for (const keyword of specialKeywords) {
    const index = text.indexOf(keyword)
    if (index !== -1) {
      const remaining = text.slice(index + keyword.length).trim()
      if (remaining) {
        result.specialRequirements = remaining.replace(/^[是为：:]\s*/, '')
        break
      }
    }
  }

  return result
}

export function parseVoiceToExpense(text: string): ParsedExpenseVoice {
  const result: ParsedExpenseVoice = {}

  for (const pattern of EXPENSE_AMOUNT_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const amount = normalizeBudget(match[1])
      if (amount) {
        result.amount = amount
        break
      }
    }
  }

  for (const [category, keywords] of Object.entries(EXPENSE_CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        result.category = category
        break
      }
    }
    if (result.category) break
  }

  const descriptionPatterns = [
    /(?:买了|购买|消费|支出)\s*([^\d，。！？,]+)/,
    /([^\d，。！？,]+?)\s*(?:花了|花费)/
  ]
  
  for (const pattern of descriptionPatterns) {
    const match = text.match(pattern)
    if (match) {
      result.description = match[1].trim()
      break
    }
  }

  const dateMatch = text.match(/(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2}[日号]?)|(\d{1,2}[月\-\/]\d{1,2}[日号]?)/)
  if (dateMatch) {
    result.date = normalizeDate(dateMatch[0])
  }

  return result
}

export function formatItineraryVoiceResult(parsed: ParsedItineraryVoice): string {
  const parts: string[] = []
  
  if (parsed.destination) {
    parts.push(`目的地: ${parsed.destination}`)
  }
  if (parsed.startDate) {
    parts.push(`出发日期: ${parsed.startDate}`)
  }
  if (parsed.endDate) {
    parts.push(`返回日期: ${parsed.endDate}`)
  }
  if (parsed.budget) {
    parts.push(`预算: ¥${parsed.budget.toLocaleString()}`)
  }
  if (parsed.participants) {
    parts.push(`人数: ${parsed.participants}人`)
  }
  if (parsed.groupType) {
    parts.push(`人员构成: ${parsed.groupType}`)
  }
  if (parsed.accommodationPreference) {
    parts.push(`住宿偏好: ${parsed.accommodationPreference}`)
  }
  if (parsed.pace) {
    parts.push(`行程节奏: ${parsed.pace}`)
  }
  if (parsed.travelPreferences && parsed.travelPreferences.length > 0) {
    parts.push(`旅行偏好: ${parsed.travelPreferences.join('、')}`)
  }
  if (parsed.specialRequirements) {
    parts.push(`特殊要求: ${parsed.specialRequirements}`)
  }
  
  return parts.length > 0 ? parts.join('\n') : '未能解析出行程信息'
}

export function formatExpenseVoiceResult(parsed: ParsedExpenseVoice): string {
  const parts: string[] = []
  
  if (parsed.amount) {
    parts.push(`金额: ¥${parsed.amount.toLocaleString()}`)
  }
  if (parsed.category) {
    parts.push(`类别: ${parsed.category}`)
  }
  if (parsed.description) {
    parts.push(`描述: ${parsed.description}`)
  }
  if (parsed.date) {
    parts.push(`日期: ${parsed.date}`)
  }
  
  return parts.length > 0 ? parts.join('\n') : '未能解析出费用信息'
}

export interface ItineraryFormUpdate {
  destination?: string
  startDate?: string
  endDate?: string
  budget?: string
  participants?: string
  preferences?: TravelPreference[]
  specialRequirements?: string
  travelersType?: TravelersType
  accommodation?: AccommodationPreference
  pace?: PaceType
}

export function mapParsedToFormData(parsed: ParsedItineraryVoice): ItineraryFormUpdate {
  const result: ItineraryFormUpdate = {}

  if (parsed.destination) {
    result.destination = parsed.destination
  }
  if (parsed.startDate) {
    result.startDate = parsed.startDate
  }
  if (parsed.endDate) {
    result.endDate = parsed.endDate
  }
  if (parsed.budget !== undefined) {
    result.budget = parsed.budget.toString()
  }
  if (parsed.participants !== undefined) {
    result.participants = parsed.participants.toString()
  }
  if (parsed.specialRequirements) {
    result.specialRequirements = parsed.specialRequirements
  }

  if (parsed.groupType && GROUP_TYPE_TO_TRAVELERS_TYPE[parsed.groupType]) {
    result.travelersType = GROUP_TYPE_TO_TRAVELERS_TYPE[parsed.groupType]
  }

  if (parsed.accommodationPreference && ACCOMMODATION_TO_PREFERENCE[parsed.accommodationPreference]) {
    result.accommodation = ACCOMMODATION_TO_PREFERENCE[parsed.accommodationPreference]
  }

  if (parsed.pace && PACE_TO_TYPE[parsed.pace]) {
    result.pace = PACE_TO_TYPE[parsed.pace]
  }

  if (parsed.travelPreferences && parsed.travelPreferences.length > 0) {
    const preferences: TravelPreference[] = []
    for (const pref of parsed.travelPreferences) {
      const mapped = PREFERENCE_TO_TRAVEL_PREFERENCE[pref]
      if (mapped && !preferences.includes(mapped)) {
        preferences.push(mapped)
      }
    }
    if (preferences.length > 0) {
      result.preferences = preferences
    }
  }

  return result
}
