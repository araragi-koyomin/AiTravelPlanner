export interface ItineraryPromptParams {
  destination: string
  startDate: string
  endDate: string
  daysCount: number
  budget: number
  participants: number
  preferences: string[]
  specialRequirements?: string
  travelersType?: string
  accommodation?: string
  pace?: string
}

const preferenceLabels: Record<string, string> = {
  'food': '美食',
  'attraction': '景点',
  'shopping': '购物',
  'culture': '文化',
  'nature': '自然',
  'anime': '动漫',
  'history': '历史',
  'nightlife': '夜生活'
}

const preferenceRules: Record<string, string> = {
  'shopping': '【购物偏好】必须包含至少2个购物中心或商业街，如南京路步行街、淮海路、正大广场等。预算分配中购物项必须大于0。',
  'anime': '【动漫偏好】必须包含动漫相关地点，如动漫博物馆、动漫主题咖啡厅、手办店、秋叶原风格店铺。',
  'nightlife': '【夜生活偏好】必须安排夜间活动（19:00之后），如酒吧街、夜市、夜景景点。每天行程不能在18:00前结束，必须有晚餐或夜间活动安排。',
  'food': '【美食偏好】必须包含当地特色餐厅，每天至少安排1次特色餐饮体验，推荐当地知名餐厅和老字号。',
  'culture': '【文化偏好】必须包含文化场所，如博物馆、艺术馆、图书馆、文化街区。每天至少1个文化类景点。',
  'nature': '【自然偏好】必须包含自然景点，如公园、湖泊、山岳、植物园。每天至少1个自然类景点。',
  'history': '【历史偏好】必须包含历史景点，如古迹、纪念馆、历史街区、古建筑。每天至少1个历史类景点。',
  'attraction': '【景点偏好】重点安排知名景点，确保覆盖目的地最著名的地标性景点。'
}

const travelersTypeRules: Record<string, string> = {
  'family': '【亲子游】优先选择儿童友好景点（如科技馆、海洋馆、动物园、主题乐园），避免过于拥挤或需要长时间步行的场所，安排亲子互动项目，餐厅选择要有儿童餐，住宿选择家庭房。',
  'couple': '【情侣出游】优先选择浪漫景点（如江边散步、观景台、特色咖啡厅、夜景），安排有情调的餐厅，可以安排情侣主题活动，住宿选择有特色的精品酒店。',
  'friends': '【朋友结伴】可安排更多娱乐活动（如密室逃脱、桌游吧、特色酒吧、KTV），餐厅选择热闹有特色的，可以安排团队活动，住宿可以选择青年旅社或民宿。',
  'solo': '【独自旅行】注重安全性和便利性，选择交通方便的景点，避免过于偏僻的地方，餐厅选择适合一人用餐的，住宿选择市中心安全区域。',
  'business': '【商务出行】行程安排在市中心，预留商务时间，选择高端酒店，餐厅选择适合商务宴请的，交通选择便捷的方式。',
  'adult': '【成人出行】可以安排更多成人向活动，如品酒、高端餐厅、艺术展览等。'
}

const paceRules: Record<string, string> = {
  'relaxed': '【轻松节奏】每天安排2-3个活动，每个景点停留时间充裕，预留休息时间，不赶行程。',
  'moderate': '【适中节奏】每天安排3-4个活动，时间安排合理，有适当的休息时间。',
  'intense': '【紧凑节奏】每天安排4-5个活动，充分利用时间，可以安排更多景点。'
}

const timeRules = `
【时间安排规则 - 必须严格遵守】
1. 夜景景点（如外滩、东方明珠、观景台）必须安排在18:00之后
2. 博物馆、美术馆建议安排在上午（9:00-12:00），因为下午可能闭馆较早
3. 购物中心建议安排在下午或晚上（商场通常10:00-22:00营业）
4. 餐厅安排：
   - 午餐：11:30-13:00
   - 晚餐：17:30-19:00
5. 夜生活活动必须在19:00之后
6. 如果用户选择了夜生活偏好，每天行程必须延续到21:00以后
7. 景点开放时间要符合实际情况（大多数景点8:30-17:30）
8. 避免安排同一时间段的冲突活动`

export function buildItineraryPrompt(params: ItineraryPromptParams): string {
  const {
    destination, startDate, endDate, daysCount, budget, participants,
    preferences, specialRequirements, travelersType, accommodation, pace
  } = params

  const preferenceText = preferences.length > 0
    ? preferences.map(p => preferenceLabels[p] || p).join('、')
    : '无特别偏好'

  const preferenceConstraintText = preferences.length > 0
    ? '\n' + preferences.map(p => preferenceRules[p] || '').filter(Boolean).join('\n')
    : ''

  const travelersTypeConstraintText = travelersType && travelersTypeRules[travelersType]
    ? '\n' + travelersTypeRules[travelersType]
    : ''

  const budgetRules = `
【预算规则 - 必须严格遵守】
1. budget_breakdown中的各项预算总和必须等于total_estimated_cost
2. 每个活动的cost字段必须填写真实价格（门票、餐饮人均消费等）
3. transportation预算必须大于0，包含往返交通和当地交通
4. 如果行程中有购物点，shopping预算必须大于0
5. tickets预算 = 所有景点门票费用之和
6. food预算 = 所有餐饮费用之和（按总人数计算）
7. accommodation预算 = 住宿费用之和（总天数-1晚）
8. 预算分配要合理，总和应接近用户预算${budget}元`

  const paceConstraintText = pace && paceRules[pace]
    ? '\n' + paceRules[pace]
    : ''

  const accommodationText = accommodation === 'budget'
    ? '经济型酒店（如如家、汉庭、锦江之星）'
    : accommodation === 'luxury'
      ? '豪华型酒店（如五星级酒店、高端连锁）'
      : '舒适型酒店（如全季、亚朵、希尔顿欢朋）'

  return `你是一位经验丰富的旅行规划师，擅长根据用户需求定制个性化旅行方案。你必须严格按照用户的偏好和约束条件生成行程。

## 用户需求
- 目的地: ${destination}
- 出发日期: ${startDate}
- 返程日期: ${endDate}
- 旅行天数: ${daysCount}天
- 总预算: ${budget}元
- 同行人数: ${participants}人
- 人员构成: ${travelersType || '成人'}
- 旅行偏好: ${preferenceText}
- 住宿偏好: ${accommodationText}
- 行程节奏: ${pace || '适中'}
- 特殊需求: ${specialRequirements || '无'}

## 偏好约束条件（必须严格遵守）
${preferenceConstraintText || '无特别偏好约束'}

## 出行类型约束（必须严格遵守）
${travelersTypeConstraintText || '无特别出行类型约束'}

## 行程节奏约束（必须严格遵守）
${paceConstraintText || '无特别节奏约束'}
${timeRules}
${budgetRules}

## 任务要求

请生成一份详细的旅行计划，必须满足以上所有约束条件。

### 1. 每日行程安排
- 按时间顺序列出每天的活动
- 包含景点、餐厅、住宿
- 时间安排必须符合上述时间规则
- 路线规划必须避免走回头路，按地理位置就近安排

### 2. 景点推荐
- 必须符合用户偏好约束
- 包含景点简介、开放时间、门票价格
- 预估游玩时长
- 游玩建议和注意事项

### 3. 餐饮推荐
- 当地特色餐厅
- 菜系类型和人均消费
- 推荐菜品

### 4. 住宿建议
- 符合预算和偏好的酒店
- 位置便利性说明
- 价格区间和特色

### 5. 预算分配
- 详细列出各项费用
- 确保总费用不超过预算
- 预算分配必须反映用户偏好（如购物偏好则购物预算必须大于0）

## 输出格式

请严格按照以下 JSON 格式输出，不要包含任何额外的解释文字：

\`\`\`json
{
  "trip_title": "行程标题（必须反映用户偏好，如：${preferenceText ? preferenceText + '主题' : ''}${destination}${daysCount}日游）",
  "summary": "行程简介（100字以内，必须说明如何满足用户偏好）",
  "highlights": ["亮点1", "亮点2", "亮点3"],
  "total_days": ${daysCount},
  "daily_itinerary": [
    {
      "day": 1,
      "theme": "当日主题（必须与用户偏好相关）",
      "items": [
        {
          "time": "09:00",
          "type": "attraction",
          "title": "景点名称（必须是真实存在的知名景点）",
          "description": "景点简介（100字以内）",
          "duration": "2小时",
          "cost": 60,
          "ticket_info": "门票信息",
          "opening_hours": "开放时间",
          "tips": "游玩建议"
        },
        {
          "time": "12:00",
          "type": "restaurant",
          "title": "餐厅名称（必须是真实存在的知名餐厅或当地特色餐厅）",
          "description": "餐厅特色（50字以内）",
          "cuisine": "菜系",
          "cost": 150,
          "recommended_dishes": ["菜品1", "菜品2"]
        }
      ]
    }
  ],
  "accommodation": [
    {
      "day": 1,
      "hotel_name": "酒店名称（必须是真实存在的知名酒店）",
      "price_range": "300-500元/晚",
      "rating": "4.5",
      "features": ["特点1", "特点2"],
      "booking_tips": "预订建议"
    }
  ],
  "transportation": {
    "to_destination": {
      "method": "高铁/飞机/自驾",
      "details": "具体方案",
      "estimated_cost": 1000,
      "duration": "3小时"
    },
    "local_transport": {
      "recommendation": "地铁为主，配合打车",
      "daily_cost": 50,
      "tips": "交通建议"
    },
    "return": {
      "method": "返程方式",
      "estimated_cost": 1000
    }
  },
  "budget_breakdown": {
    "transportation": 2000,
    "accommodation": 2000,
    "food": 2500,
    "tickets": 1000,
    "shopping": 1500,
    "entertainment": 500,
    "other": 1000
  },
  "total_estimated_cost": 10000,
  "packing_list": ["必带物品1", "必带物品2"],
  "travel_tips": ["旅行建议1", "旅行建议2"],
  "emergency_contacts": {
    "police": "110",
    "hospital": "120",
    "tourist_hotline": "12301"
  }
}
\`\`\`

## 注意事项

1. 所有价格为人民币，精确到小数点后两位
2. 时间格式统一为 HH:mm
3. day 字段从 1 开始，表示行程的第几天
4. 确保 JSON 格式完全正确，可被解析
5. 行程安排要符合实际情况，避免不合理的时间安排
6. 预算分配要合理，总和应接近用户预算
7. 考虑目的地的实际情况（气候、节假日、特殊事件等）
8. 必须生成 ${daysCount} 天的完整行程
9. 每天的 items 数组必须包含 3-5 个活动
10. 【重要】所有景点、餐厅、酒店名称必须是真实存在的知名场所，不要编造不存在的地点
11. 【重要】优先推荐目的地最著名、最受欢迎的景点和餐厅
12. 【重要】如果不确定某个地点是否存在，请选择更知名的替代地点
13. 【重要】必须严格遵守上述所有偏好约束条件，如果用户选择了某个偏好，行程中必须有对应的安排
14. 【重要】行程标题和主题必须反映用户的偏好选择`
}

export const SYSTEM_PROMPT = '你是旅行规划师，只返回纯JSON格式结果。确保JSON格式完全正确，所有字符串用双引号包裹，不要在JSON中使用注释或额外文字。所有地点名称必须是真实存在的知名场所。你必须严格遵守用户的所有偏好约束条件。'
