import { describe, it, expect } from 'vitest'
import {
  parseVoiceToItinerary,
  parseVoiceToExpense,
  formatItineraryVoiceResult,
  formatExpenseVoiceResult
} from './voiceParser'
import type { ParsedItineraryVoice, ParsedExpenseVoice } from '../types/voice'

describe('voiceParser', () => {
  describe('parseVoiceToItinerary', () => {
    describe('目的地解析', () => {
      it('应该解析"去北京旅游"', () => {
        const result = parseVoiceToItinerary('去北京旅游')
        expect(result.destination).toBe('北京')
      })

      it('应该解析"到上海出差"', () => {
        const result = parseVoiceToItinerary('到上海出差')
        expect(result.destination).toBe('上海')
      })

      it('应该解析"前往广州"', () => {
        const result = parseVoiceToItinerary('前往广州')
        expect(result.destination).toBe('广州')
      })

      it('应该解析"目的地是杭州"', () => {
        const result = parseVoiceToItinerary('目的地是杭州')
        expect(result.destination).toBe('杭州')
      })

      it('应该解析"地点是成都"', () => {
        const result = parseVoiceToItinerary('地点是成都')
        expect(result.destination).toBe('成都')
      })

      it('应该解析"城市是西安"', () => {
        const result = parseVoiceToItinerary('城市是西安')
        expect(result.destination).toBe('西安')
      })

      it('应该正确处理带空格的目的地', () => {
        const result = parseVoiceToItinerary('去 三亚 度假')
        expect(result.destination).toBe('三亚')
      })

      it('应该返回 undefined 当无法解析目的地时', () => {
        const result = parseVoiceToItinerary('今天天气真好')
        expect(result.destination).toBeUndefined()
      })
    })

    describe('日期解析', () => {
      it('应该解析开始日期 "从2024年3月1日出发"', () => {
        const result = parseVoiceToItinerary('从2024年3月1日出发')
        expect(result.startDate).toBe('2024-03-01')
      })

      it('应该解析开始日期 "开始2024-03-01"', () => {
        const result = parseVoiceToItinerary('开始2024年3月1日')
        expect(result.startDate).toBe('2024-03-01')
      })

      it('应该解析结束日期 "到2024年3月5日返回"', () => {
        const result = parseVoiceToItinerary('到2024年3月5日返回')
        expect(result.endDate).toBe('2024-03-05')
      })

      it('应该解析结束日期 "结束2024-03-05"', () => {
        const result = parseVoiceToItinerary('结束2024年3月5日')
        expect(result.endDate).toBe('2024-03-05')
      })

      it('应该正确格式化日期（YYYY-MM-DD）', () => {
        const result = parseVoiceToItinerary('从2024年12月25日出发')
        expect(result.startDate).toBe('2024-12-25')
      })

      it('应该正确处理不同日期格式（年-月-日）', () => {
        const result = parseVoiceToItinerary('从2024-3-1出发')
        expect(result.startDate).toBe('2024-03-01')
      })

      it('应该正确处理不同日期格式（年/月/日）', () => {
        const result = parseVoiceToItinerary('从2024/3/1出发')
        expect(result.startDate).toBe('2024-03-01')
      })

      it('应该返回 undefined 当无法解析日期时', () => {
        const result = parseVoiceToItinerary('去北京玩几天')
        expect(result.startDate).toBeUndefined()
        expect(result.endDate).toBeUndefined()
      })
    })

    describe('预算解析', () => {
      it('应该解析 "预算5000元"', () => {
        const result = parseVoiceToItinerary('预算5000元')
        expect(result.budget).toBe(5000)
      })

      it('应该解析 "费用是3000块钱"', () => {
        const result = parseVoiceToItinerary('费用是3000块钱')
        expect(result.budget).toBe(3000)
      })

      it('应该解析 "大约1万元"', () => {
        const result = parseVoiceToItinerary('大约1万元')
        expect(result.budget).toBe(10000)
      })

      it('应该解析 "花费2千"', () => {
        const result = parseVoiceToItinerary('花费2千')
        expect(result.budget).toBe(2000)
      })

      it('应该解析 "500元左右的预算"', () => {
        const result = parseVoiceToItinerary('500元左右的预算')
        expect(result.budget).toBe(500)
      })

      it('应该正确转换万元为实际金额', () => {
        const result = parseVoiceToItinerary('预算1.5万元')
        expect(result.budget).toBe(15000)
      })

      it('应该正确转换千元为实际金额', () => {
        const result = parseVoiceToItinerary('预算3千元')
        expect(result.budget).toBe(3000)
      })

      it('应该正确转换百元为实际金额', () => {
        const result = parseVoiceToItinerary('预算5百元')
        expect(result.budget).toBe(500)
      })

      it('应该返回 undefined 当无法解析预算时', () => {
        const result = parseVoiceToItinerary('去北京玩')
        expect(result.budget).toBeUndefined()
      })
    })

    describe('参与人数解析', () => {
      it('应该解析 "3个人"', () => {
        const result = parseVoiceToItinerary('3个人')
        expect(result.participants).toBe(3)
      })

      it('应该解析 "一共5位"', () => {
        const result = parseVoiceToItinerary('一共5个人')
        expect(result.participants).toBe(5)
      })

      it('应该解析 "2人同行"', () => {
        const result = parseVoiceToItinerary('2人同行')
        expect(result.participants).toBe(2)
      })

      it('应该解析 "总共4个人参加"', () => {
        const result = parseVoiceToItinerary('总共4个人参加')
        expect(result.participants).toBe(4)
      })

      it('应该过滤不合理的数字（如超过100人）', () => {
        const result = parseVoiceToItinerary('200个人')
        expect(result.participants).toBeUndefined()
      })

      it('应该返回 undefined 当无法解析人数时', () => {
        const result = parseVoiceToItinerary('去北京玩')
        expect(result.participants).toBeUndefined()
      })
    })

    describe('特殊需求解析', () => {
      it('应该解析 "特殊要求是无辣不欢"', () => {
        const result = parseVoiceToItinerary('特殊要求是无辣不欢')
        expect(result.specialRequirements).toBe('无辣不欢')
      })

      it('应该解析 "需要注意海鲜过敏"', () => {
        const result = parseVoiceToItinerary('需要注意海鲜过敏')
        expect(result.specialRequirements).toBe('海鲜过敏')
      })

      it('应该解析 "希望有儿童友好设施"', () => {
        const result = parseVoiceToItinerary('希望有儿童友好设施')
        expect(result.specialRequirements).toBe('有儿童友好设施')
      })

      it('应该解析 "想要住海景房"', () => {
        const result = parseVoiceToItinerary('想要住海景房')
        expect(result.specialRequirements).toBe('住海景房')
      })

      it('应该去除前缀冒号和空格', () => {
        const result = parseVoiceToItinerary('特殊要求：无辣不欢')
        expect(result.specialRequirements).toBe('无辣不欢')
      })

      it('应该返回 undefined 当无法解析特殊需求时', () => {
        const result = parseVoiceToItinerary('去北京玩')
        expect(result.specialRequirements).toBeUndefined()
      })
    })

    describe('人员构成解析', () => {
      it('应该识别"情侣出游"', () => {
        const result = parseVoiceToItinerary('人员构成是情侣出游')
        expect(result.groupType).toBe('情侣出游')
      })

      it('应该识别"情侣"', () => {
        const result = parseVoiceToItinerary('我们是情侣')
        expect(result.groupType).toBe('情侣出游')
      })

      it('应该识别"家庭出游"', () => {
        const result = parseVoiceToItinerary('一家人去旅游')
        expect(result.groupType).toBe('家庭出游')
      })

      it('应该识别"朋友出游"', () => {
        const result = parseVoiceToItinerary('和朋友一起')
        expect(result.groupType).toBe('朋友出游')
      })
    })

    describe('住宿偏好解析', () => {
      it('应该识别"经济型"', () => {
        const result = parseVoiceToItinerary('住宿偏好是经济型')
        expect(result.accommodationPreference).toBe('经济型')
      })

      it('应该识别"豪华型"', () => {
        const result = parseVoiceToItinerary('想住豪华酒店')
        expect(result.accommodationPreference).toBe('豪华型')
      })

      it('应该识别"舒适型"', () => {
        const result = parseVoiceToItinerary('住舒适型酒店')
        expect(result.accommodationPreference).toBe('舒适型')
      })
    })

    describe('行程节奏解析', () => {
      it('应该识别"轻松"', () => {
        const result = parseVoiceToItinerary('行程节奏轻松')
        expect(result.pace).toBe('轻松')
      })

      it('应该识别"紧凑"', () => {
        const result = parseVoiceToItinerary('节奏紧凑')
        expect(result.pace).toBe('紧凑')
      })

      it('应该识别"适中"', () => {
        const result = parseVoiceToItinerary('节奏适中')
        expect(result.pace).toBe('适中')
      })
    })

    describe('旅行偏好解析', () => {
      it('应该识别单个偏好', () => {
        const result = parseVoiceToItinerary('旅行偏好为美食')
        expect(result.travelPreferences).toEqual(['美食'])
      })

      it('应该识别多个偏好', () => {
        const result = parseVoiceToItinerary('旅行偏好为美食和景点')
        expect(result.travelPreferences).toContain('美食')
        expect(result.travelPreferences).toContain('景点')
      })
    })

    describe('中文数字人数解析', () => {
      it('应该解析"两个人"', () => {
        const result = parseVoiceToItinerary('两个人去旅游')
        expect(result.participants).toBe(2)
      })

      it('应该解析"三个人"', () => {
        const result = parseVoiceToItinerary('三个人同行')
        expect(result.participants).toBe(3)
      })

      it('应该解析"五个人"', () => {
        const result = parseVoiceToItinerary('一共五个人')
        expect(result.participants).toBe(5)
      })
    })

    describe('组合解析', () => {
      it('应该解析完整的行程语音输入', () => {
        const result = parseVoiceToItinerary(
          '去北京旅游，从2024年3月1日出发，到2024年3月5日返回，预算5000元，3个人，需要注意海鲜过敏'
        )
        expect(result.destination).toBe('北京')
        expect(result.startDate).toBe('2024-03-01')
        expect(result.endDate).toBe('2024-03-05')
        expect(result.budget).toBe(5000)
        expect(result.participants).toBe(3)
        expect(result.specialRequirements).toBe('海鲜过敏')
      })

      it('应该解析部分字段的语音输入', () => {
        const result = parseVoiceToItinerary('去上海，预算3000元')
        expect(result.destination).toBe('上海')
        expect(result.budget).toBe(3000)
      })

      it('应该正确处理语音输入中的多余内容', () => {
        const result = parseVoiceToItinerary('我想去杭州玩，大概需要花多少钱呢？预算1万元吧')
        expect(result.destination).toBe('杭州')
        expect(result.budget).toBe(10000)
      })

      it('应该返回空对象当无法解析任何字段时', () => {
        const result = parseVoiceToItinerary('今天天气真好')
        expect(result).toEqual({})
      })
    })
  })

  describe('parseVoiceToExpense', () => {
    describe('金额解析', () => {
      it('应该解析 "花了100元"', () => {
        const result = parseVoiceToExpense('花了100元')
        expect(result.amount).toBe(100)
      })

      it('应该解析 "花费50块钱"', () => {
        const result = parseVoiceToExpense('花费50块钱')
        expect(result.amount).toBe(50)
      })

      it('应该解析 "消费200"', () => {
        const result = parseVoiceToExpense('消费200')
        expect(result.amount).toBe(200)
      })

      it('应该解析 "支出1000元"', () => {
        const result = parseVoiceToExpense('支出1000元')
        expect(result.amount).toBe(1000)
      })

      it('应该解析 "500元"', () => {
        const result = parseVoiceToExpense('500元')
        expect(result.amount).toBe(500)
      })

      it('应该正确转换万元为实际金额', () => {
        const result = parseVoiceToExpense('花了1万元')
        expect(result.amount).toBe(10000)
      })

      it('应该正确转换千元为实际金额', () => {
        const result = parseVoiceToExpense('花了2千元')
        expect(result.amount).toBe(2000)
      })

      it('应该返回 undefined 当无法解析金额时', () => {
        const result = parseVoiceToExpense('买了一些东西')
        expect(result.amount).toBeUndefined()
      })
    })

    describe('类别解析', () => {
      it('应该识别交通类别', () => {
        const transportKeywords = ['交通', '打车', '出租', '地铁', '公交', '火车', '高铁', '飞机', '机票', '车票']
        transportKeywords.forEach((keyword) => {
          const result = parseVoiceToExpense(`${keyword}花了100元`)
          expect(result.category).toBe('transport')
        })
      })

      it('应该识别住宿类别', () => {
        const accommodationKeywords = ['住宿', '酒店', '民宿', '宾馆', '房费']
        accommodationKeywords.forEach((keyword) => {
          const result = parseVoiceToExpense(`${keyword}花了500元`)
          expect(result.category).toBe('accommodation')
        })
      })

      it('应该识别餐饮类别', () => {
        const foodKeywords = ['餐饮', '吃饭', '午餐', '晚餐', '早餐', '小吃', '美食', '饮料', '咖啡']
        foodKeywords.forEach((keyword) => {
          const result = parseVoiceToExpense(`${keyword}花了50元`)
          expect(result.category).toBe('food')
        })
      })

      it('应该识别购物类别', () => {
        const shoppingKeywords = ['购物', '纪念品', '特产', '衣服', '商品']
        shoppingKeywords.forEach((keyword) => {
          const result = parseVoiceToExpense(`${keyword}花了200元`)
          expect(result.category).toBe('shopping')
        })
      })

      it('应该识别娱乐类别', () => {
        const entertainmentKeywords = ['娱乐', '门票', '景点', '游玩', '电影', '演出']
        entertainmentKeywords.forEach((keyword) => {
          const result = parseVoiceToExpense(`${keyword}花了150元`)
          expect(result.category).toBe('entertainment')
        })
      })

      it('应该识别其他类别', () => {
        const otherKeywords = ['其他', '杂费', '其他支出']
        otherKeywords.forEach((keyword) => {
          const result = parseVoiceToExpense(`${keyword}花了30元`)
          expect(result.category).toBe('other')
        })
      })

      it('应该返回第一个匹配的类别', () => {
        const result = parseVoiceToExpense('打车去酒店花了100元')
        expect(result.category).toBe('transport')
      })

      it('应该返回 undefined 当无法识别类别时', () => {
        const result = parseVoiceToExpense('花了100元')
        expect(result.category).toBeUndefined()
      })
    })

    describe('描述解析', () => {
      it('应该解析 "买了纪念品"', () => {
        const result = parseVoiceToExpense('买了纪念品')
        expect(result.description).toBe('纪念品')
      })

      it('应该解析 "购买门票"', () => {
        const result = parseVoiceToExpense('购买门票')
        expect(result.description).toBe('门票')
      })

      it('应该解析 "午餐花了"', () => {
        const result = parseVoiceToExpense('午餐花了')
        expect(result.description).toBe('午餐')
      })

      it('应该返回 undefined 当无法解析描述时', () => {
        const result = parseVoiceToExpense('100元')
        expect(result.description).toBeUndefined()
      })
    })

    describe('日期解析', () => {
      it('应该解析完整日期格式', () => {
        const result = parseVoiceToExpense('2024年3月1日午餐花了50元')
        expect(result.date).toBe('2024-03-01')
      })

      it('应该解析短日期格式', () => {
        const currentYear = new Date().getFullYear()
        const result = parseVoiceToExpense('3月1日午餐花了50元')
        expect(result.date).toBe(`${currentYear}-03-01`)
      })

      it('应该返回 undefined 当无法解析日期时', () => {
        const result = parseVoiceToExpense('午餐花了50元')
        expect(result.date).toBeUndefined()
      })
    })

    describe('组合解析', () => {
      it('应该解析完整的费用语音输入', () => {
        const result = parseVoiceToExpense('打车花了50元，2024年3月1日')
        expect(result.amount).toBe(50)
        expect(result.category).toBe('transport')
        expect(result.date).toBe('2024-03-01')
        expect(result.description).toBe('打车')
      })

      it('应该解析部分字段的语音输入', () => {
        const result = parseVoiceToExpense('午餐花了30元')
        expect(result.amount).toBe(30)
        expect(result.category).toBe('food')
        expect(result.description).toBe('午餐')
      })

      it('应该返回空对象当无法解析任何字段时', () => {
        const result = parseVoiceToExpense('今天天气真好')
        expect(result).toEqual({})
      })
    })
  })

  describe('formatItineraryVoiceResult', () => {
    it('应该格式化完整的行程解析结果', () => {
      const parsed: ParsedItineraryVoice = {
        destination: '北京',
        startDate: '2024-03-01',
        endDate: '2024-03-05',
        budget: 5000,
        participants: 3,
        specialRequirements: '海鲜过敏'
      }
      const result = formatItineraryVoiceResult(parsed)
      expect(result).toContain('目的地: 北京')
      expect(result).toContain('出发日期: 2024-03-01')
      expect(result).toContain('返回日期: 2024-03-05')
      expect(result).toContain('预算: ¥5,000')
      expect(result).toContain('人数: 3人')
      expect(result).toContain('特殊要求: 海鲜过敏')
    })

    it('应该格式化部分行程解析结果', () => {
      const parsed: ParsedItineraryVoice = {
        destination: '上海',
        budget: 3000
      }
      const result = formatItineraryVoiceResult(parsed)
      expect(result).toContain('目的地: 上海')
      expect(result).toContain('预算: ¥3,000')
      expect(result).not.toContain('出发日期')
    })

    it('应该返回提示信息当无法解析时', () => {
      const result = formatItineraryVoiceResult({})
      expect(result).toBe('未能解析出行程信息')
    })
  })

  describe('formatExpenseVoiceResult', () => {
    it('应该格式化完整的费用解析结果', () => {
      const parsed: ParsedExpenseVoice = {
        amount: 100,
        category: 'transport',
        description: '打车',
        date: '2024-03-01'
      }
      const result = formatExpenseVoiceResult(parsed)
      expect(result).toContain('金额: ¥100')
      expect(result).toContain('类别: transport')
      expect(result).toContain('描述: 打车')
      expect(result).toContain('日期: 2024-03-01')
    })

    it('应该格式化部分费用解析结果', () => {
      const parsed: ParsedExpenseVoice = {
        amount: 50,
        category: 'food'
      }
      const result = formatExpenseVoiceResult(parsed)
      expect(result).toContain('金额: ¥50')
      expect(result).toContain('类别: food')
      expect(result).not.toContain('描述')
    })

    it('应该返回提示信息当无法解析时', () => {
      const result = formatExpenseVoiceResult({})
      expect(result).toBe('未能解析出费用信息')
    })
  })

  describe('边界情况', () => {
    it('应该正确处理空字符串', () => {
      expect(parseVoiceToItinerary('')).toEqual({})
      expect(parseVoiceToExpense('')).toEqual({})
    })

    it('应该正确处理只有空格的字符串', () => {
      expect(parseVoiceToItinerary('   ')).toEqual({})
      expect(parseVoiceToExpense('   ')).toEqual({})
    })

    it('应该正确处理特殊字符', () => {
      const result = parseVoiceToItinerary('去@#$%北京')
      expect(result.destination).toBe('@#$%北京')
    })

    it('应该正确处理超长字符串', () => {
      const longText = '去北京旅游，'.repeat(100)
      const result = parseVoiceToItinerary(longText)
      expect(result.destination).toBe('北京')
    })

    it('应该正确处理混合语言输入', () => {
      const result = parseVoiceToItinerary('去Beijing旅游')
      expect(result.destination).toBe('Beijing')
    })
  })
})
