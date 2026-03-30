import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { ExportOptions, ExportResult, ExportProgressCallback } from '@/types/export'
import type { Itinerary, DailyScheduleBuilt, BudgetBreakdown } from './itinerary'
import {
  generateFilename,
  calculateImageScale,
  formatDateRange,
  formatDateForExport,
  formatCurrency,
  getActivityTypeLabel
} from '@/utils/exportUtils'

const PDF_CONFIG = {
  pageWidth: 210,
  pageHeight: 297,
  margin: 15,
  lineHeight: 7,
  titleSize: 18,
  headingSize: 14,
  subHeadingSize: 12,
  bodySize: 10,
  smallSize: 8,
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    text: '#1F2937',
    lightGray: '#E5E7EB',
    white: '#FFFFFF',
    background: '#F9FAFB'
  }
}

export async function exportToPdf(
  itinerary: Itinerary,
  dailySchedule: DailyScheduleBuilt[],
  budgetBreakdown: BudgetBreakdown,
  options: ExportOptions,
  onProgress?: ExportProgressCallback
): Promise<ExportResult> {
  try {
    onProgress?.({ step: '初始化 PDF 文档', progress: 0, total: 100 })

    await document.fonts.ready

    const isLandscapeMode = options.orientation === 'landscape'
    const containerWidth = isLandscapeMode ? 1133 : 800

    const htmlContent = generatePdfHtml(itinerary, dailySchedule, budgetBreakdown, options, containerWidth)
    
    onProgress?.({ step: '创建临时容器', progress: 10, total: 100 })
    
    const container = document.createElement('div')
    container.setAttribute('data-export-container', 'true')
    container.innerHTML = htmlContent
    container.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: ${containerWidth}px;
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimHei', 'SimSun', sans-serif;
      z-index: -9999;
      opacity: 1;
      visibility: visible;
    `
    document.body.appendChild(container)

    await new Promise(resolve => setTimeout(resolve, 100))

    onProgress?.({ step: '生成截图', progress: 30, total: 100 })

    const scale = calculateImageScale(options.quality)
    
    const canvas = await html2canvas(container, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800,
      scrollX: 0,
      scrollY: 0,
      onclone: (_clonedDoc, clonedElement) => {
        clonedElement.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimHei', 'SimSun', sans-serif"
        const allElements = clonedElement.querySelectorAll('*')
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement
          htmlEl.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimHei', 'SimSun', sans-serif"
        })
      }
    })

    document.body.removeChild(container)

    onProgress?.({ step: '创建 PDF', progress: 60, total: 100 })

    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: 'a4'
    })

    const isLandscape = options.orientation === 'landscape'
    const pdfWidth = isLandscape ? PDF_CONFIG.pageHeight : PDF_CONFIG.pageWidth
    const pdfHeight = isLandscape ? PDF_CONFIG.pageWidth : PDF_CONFIG.pageHeight
    const margin = PDF_CONFIG.margin
    const contentWidth = pdfWidth - margin * 2
    const contentHeightPerPage = pdfHeight - margin * 2

    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = contentWidth / imgWidth
    const scaledHeight = imgHeight * ratio

    const totalPages = Math.ceil(scaledHeight / contentHeightPerPage)

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage()
      }

      const sourceY = page * (contentHeightPerPage / ratio)
      const sourceHeight = Math.min(contentHeightPerPage / ratio, imgHeight - sourceY)

      if (sourceHeight > 0) {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = imgWidth
        tempCanvas.height = sourceHeight

        const ctx = tempCanvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
          
          ctx.drawImage(
            canvas,
            0, sourceY,
            imgWidth, sourceHeight,
            0, 0,
            imgWidth, sourceHeight
          )

          const pageImgData = tempCanvas.toDataURL('image/png', 1.0)
          const pageHeight = sourceHeight * ratio
          pdf.addImage(pageImgData, 'PNG', margin, margin, contentWidth, pageHeight)
        }
      }

      pdf.setFontSize(8)
      pdf.setTextColor(107, 114, 128)
      pdf.text(
        `${page + 1} / ${totalPages}`,
        pdfWidth / 2,
        pdfHeight - 10,
        { align: 'center' }
      )
    }

    onProgress?.({ step: '生成文件', progress: 90, total: 100 })

    const filename = generateFilename(itinerary, 'pdf')
    const dataUrl = pdf.output('datauristring')

    onProgress?.({ step: '完成', progress: 100, total: 100 })

    pdf.save(filename)

    return {
      success: true,
      dataUrl,
      filename
    }
  } catch (error) {
    console.error('PDF 导出失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '导出失败，请重试'
    }
  }
}

export async function exportToImageAuto(
  itinerary: Itinerary,
  dailySchedule: DailyScheduleBuilt[],
  budgetBreakdown: BudgetBreakdown,
  options: ExportOptions,
  onProgress?: ExportProgressCallback
): Promise<ExportResult> {
  try {
    onProgress?.({ step: '初始化导出', progress: 0, total: 100 })

    await document.fonts.ready

    const isLandscapeMode = options.orientation === 'landscape'
    const containerWidth = isLandscapeMode ? 1133 : 800

    const htmlContent = generatePdfHtml(itinerary, dailySchedule, budgetBreakdown, options, containerWidth)

    onProgress?.({ step: '创建临时容器', progress: 10, total: 100 })

    const container = document.createElement('div')
    container.setAttribute('data-export-container', 'true')
    container.innerHTML = htmlContent
    container.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: ${containerWidth}px;
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimHei', 'SimSun', sans-serif;
      z-index: -9999;
      opacity: 1;
      visibility: visible;
    `
    document.body.appendChild(container)

    await new Promise(resolve => setTimeout(resolve, 100))

    onProgress?.({ step: '生成图片', progress: 30, total: 100 })

    const scale = calculateImageScale(options.quality)

    const canvas = await html2canvas(container, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: containerWidth,
      scrollX: 0,
      scrollY: 0,
      onclone: (_clonedDoc, clonedElement) => {
        clonedElement.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimHei', 'SimSun', sans-serif"
        const allElements = clonedElement.querySelectorAll('*')
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement
          htmlEl.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimHei', 'SimSun', sans-serif"
        })
      }
    })

    document.body.removeChild(container)

    onProgress?.({ step: '处理图片', progress: 70, total: 100 })

    const format = options.format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const quality = options.format === 'jpeg' ? 0.92 : 1
    const dataUrl = canvas.toDataURL(format, quality)

    onProgress?.({ step: '下载文件', progress: 90, total: 100 })

    const fileExt = options.format === 'jpeg' ? 'jpeg' : 'png'
    const filename = generateFilename(itinerary, fileExt)

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    onProgress?.({ step: '完成', progress: 100, total: 100 })

    return {
      success: true,
      dataUrl,
      filename
    }
  } catch (error) {
    console.error('图片导出失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '导出失败，请重试'
    }
  }
}

export async function exportToImage(
  element: HTMLElement,
  itinerary: Itinerary,
  options: ExportOptions,
  onProgress?: ExportProgressCallback
): Promise<ExportResult> {
  try {
    onProgress?.({ step: '准备截图区域', progress: 0, total: 100 })

    const scale = calculateImageScale(options.quality)

    onProgress?.({ step: '生成图片', progress: 30, total: 100 })

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.body.querySelector('[data-export-container]')
        if (clonedElement) {
          ;(clonedElement as HTMLElement).style.width = '100%'
        }
      }
    })

    onProgress?.({ step: '处理图片', progress: 70, total: 100 })

    const format = options.format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const quality = options.format === 'jpeg' ? 0.92 : 1
    const dataUrl = canvas.toDataURL(format, quality)

    onProgress?.({ step: '下载文件', progress: 90, total: 100 })

    const filename = generateFilename(itinerary, options.format === 'jpeg' ? 'jpeg' : 'png')

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    onProgress?.({ step: '完成', progress: 100, total: 100 })

    return {
      success: true,
      dataUrl,
      filename
    }
  } catch (error) {
    console.error('图片导出失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '导出失败，请重试'
    }
  }
}

export async function exportFromElement(
  element: HTMLElement,
  itinerary: Itinerary,
  options: ExportOptions,
  onProgress?: ExportProgressCallback
): Promise<ExportResult> {
  if (options.format === 'pdf') {
    return exportElementToPdf(element, itinerary, options, onProgress)
  } else {
    return exportToImage(element, itinerary, options, onProgress)
  }
}

async function exportElementToPdf(
  element: HTMLElement,
  itinerary: Itinerary,
  options: ExportOptions,
  onProgress?: ExportProgressCallback
): Promise<ExportResult> {
  try {
    onProgress?.({ step: '准备截图区域', progress: 0, total: 100 })

    await document.fonts.ready

    const scale = calculateImageScale(options.quality)

    onProgress?.({ step: '生成截图', progress: 30, total: 100 })

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (_clonedDoc, clonedElement) => {
        clonedElement.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimHei', 'SimSun', sans-serif"
        const allElements = clonedElement.querySelectorAll('*')
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement
          htmlEl.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimHei', 'SimSun', sans-serif"
        })
      }
    })

    onProgress?.({ step: '创建 PDF', progress: 60, total: 100 })

    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: 'a4'
    })

    const isLandscape = options.orientation === 'landscape'
    const pdfWidth = isLandscape ? PDF_CONFIG.pageHeight : PDF_CONFIG.pageWidth
    const pdfHeight = isLandscape ? PDF_CONFIG.pageWidth : PDF_CONFIG.pageHeight
    const margin = PDF_CONFIG.margin
    const contentWidth = pdfWidth - margin * 2
    const contentHeightPerPage = pdfHeight - margin * 2

    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = contentWidth / imgWidth
    const scaledHeight = imgHeight * ratio

    const totalPages = Math.ceil(scaledHeight / contentHeightPerPage)

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage()
      }

      const sourceY = page * (contentHeightPerPage / ratio)
      const sourceHeight = Math.min(contentHeightPerPage / ratio, imgHeight - sourceY)

      if (sourceHeight > 0) {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = imgWidth
        tempCanvas.height = sourceHeight

        const ctx = tempCanvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
          
          ctx.drawImage(
            canvas,
            0, sourceY,
            imgWidth, sourceHeight,
            0, 0,
            imgWidth, sourceHeight
          )

          const pageImgData = tempCanvas.toDataURL('image/png', 1.0)
          const pageHeight = sourceHeight * ratio
          pdf.addImage(pageImgData, 'PNG', margin, margin, contentWidth, pageHeight)
        }
      }

      pdf.setFontSize(8)
      pdf.setTextColor(107, 114, 128)
      pdf.text(
        `${page + 1} / ${totalPages}`,
        pdfWidth / 2,
        pdfHeight - 10,
        { align: 'center' }
      )
    }

    onProgress?.({ step: '下载文件', progress: 90, total: 100 })

    const filename = generateFilename(itinerary, 'pdf')
    const dataUrl = pdf.output('datauristring')

    pdf.save(filename)

    onProgress?.({ step: '完成', progress: 100, total: 100 })

    return {
      success: true,
      dataUrl,
      filename
    }
  } catch (error) {
    console.error('PDF 导出失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '导出失败，请重试'
    }
  }
}

function generatePdfHtml(
  itinerary: Itinerary,
  dailySchedule: DailyScheduleBuilt[],
  budgetBreakdown: BudgetBreakdown,
  options: ExportOptions,
  containerWidth: number
): string {
  const dateRange = formatDateRange(itinerary.start_date, itinerary.end_date)
  
  let dailyScheduleHtml = ''
  dailySchedule.forEach((day) => {
    let itemsHtml = ''
    if (day.items.length === 0) {
      itemsHtml = `
        <div style="padding: 10px 0; color: ${PDF_CONFIG.colors.secondary};">
          暂无行程安排
        </div>
      `
    } else {
      day.items.forEach((item) => {
        const typeLabel = getActivityTypeLabel(item.type)
        const costStr = item.cost ? ` | ${formatCurrency(item.cost)}` : ''
        const durationStr = item.duration ? ` | ${item.duration}分钟` : ''
        
        itemsHtml += `
          <div style="padding: 8px 0; border-bottom: 1px solid ${PDF_CONFIG.colors.lightGray};">
            <div style="font-size: 14px; color: ${PDF_CONFIG.colors.text}; font-weight: 500;">
              ${item.time}  ${item.name}
            </div>
            <div style="font-size: 12px; color: ${PDF_CONFIG.colors.secondary}; margin-top: 4px;">
              ${typeLabel}${costStr}${durationStr}
            </div>
            ${item.description ? `
              <div style="font-size: 12px; color: ${PDF_CONFIG.colors.secondary}; margin-top: 4px; line-height: 1.5;">
                ${item.description}
              </div>
            ` : ''}
            ${item.tips ? `
              <div style="font-size: 12px; color: #F59E0B; margin-top: 4px; line-height: 1.5;">
                💡 ${item.tips}
              </div>
            ` : ''}
          </div>
        `
      })
    }
    
    dailyScheduleHtml += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: 600; color: ${PDF_CONFIG.colors.primary}; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid ${PDF_CONFIG.colors.primary};">
          Day ${day.day} - ${formatDateForExport(day.date)}
        </div>
        ${itemsHtml}
      </div>
    `
  })

  let budgetHtml = ''
  if (options.includeBudget) {
    const categories = [
      { key: 'transport', label: '交通' },
      { key: 'accommodation', label: '住宿' },
      { key: 'food', label: '餐饮' },
      { key: 'tickets', label: '门票' },
      { key: 'shopping', label: '购物' },
      { key: 'entertainment', label: '娱乐' },
      { key: 'other', label: '其他' }
    ]
    
    let budgetItemsHtml = ''
    categories.forEach(({ key, label }) => {
      const amount = budgetBreakdown[key as keyof BudgetBreakdown] as number
      if (amount > 0) {
        budgetItemsHtml += `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid ${PDF_CONFIG.colors.lightGray};">
            <span style="color: ${PDF_CONFIG.colors.text};">${label}</span>
            <span style="color: ${PDF_CONFIG.colors.text}; font-weight: 500;">${formatCurrency(amount)}</span>
          </div>
        `
      }
    })
    
    budgetHtml = `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: 600; color: ${PDF_CONFIG.colors.text}; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid ${PDF_CONFIG.colors.primary};">
          预算分解
        </div>
        ${budgetItemsHtml}
        <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 5px; border-top: 2px solid ${PDF_CONFIG.colors.primary};">
          <span style="color: ${PDF_CONFIG.colors.primary}; font-weight: 600;">总计</span>
          <span style="color: ${PDF_CONFIG.colors.primary}; font-weight: 600; font-size: 16px;">${formatCurrency(budgetBreakdown.total)}</span>
        </div>
      </div>
    `
  }

  let statisticsHtml = ''
  if (options.includeStatistics) {
    const totalDays = dailySchedule.length
    const totalItems = dailySchedule.reduce((sum, day) => sum + day.items.length, 0)
    const avgDailyCost = totalDays > 0 ? Math.round(budgetBreakdown.total / totalDays) : 0

    statisticsHtml = `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: 600; color: ${PDF_CONFIG.colors.text}; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid ${PDF_CONFIG.colors.primary};">
          行程统计
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <div style="padding: 12px; background: ${PDF_CONFIG.colors.background}; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 600; color: ${PDF_CONFIG.colors.primary};">${totalDays}</div>
            <div style="font-size: 12px; color: ${PDF_CONFIG.colors.secondary};">行程天数</div>
          </div>
          <div style="padding: 12px; background: ${PDF_CONFIG.colors.background}; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 600; color: ${PDF_CONFIG.colors.primary};">${totalItems}</div>
            <div style="font-size: 12px; color: ${PDF_CONFIG.colors.secondary};">活动数量</div>
          </div>
          <div style="padding: 12px; background: ${PDF_CONFIG.colors.background}; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 600; color: ${PDF_CONFIG.colors.primary};">${formatCurrency(budgetBreakdown.total)}</div>
            <div style="font-size: 12px; color: ${PDF_CONFIG.colors.secondary};">预估花费</div>
          </div>
          <div style="padding: 12px; background: ${PDF_CONFIG.colors.background}; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 600; color: ${PDF_CONFIG.colors.primary};">${formatCurrency(avgDailyCost)}</div>
            <div style="font-size: 12px; color: ${PDF_CONFIG.colors.secondary};">日均花费</div>
          </div>
        </div>
      </div>
    `
  }

  return `
    <div style="width: ${containerWidth}px; padding: 30px; background: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimHei', 'SimSun', sans-serif;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid ${PDF_CONFIG.colors.primary};">
        <div style="font-size: 24px; font-weight: 700; color: ${PDF_CONFIG.colors.primary};">
          AI 旅行规划师
        </div>
        <div style="font-size: 12px; color: ${PDF_CONFIG.colors.secondary};">
          ${dateRange}
        </div>
      </div>
      
      <div style="margin-bottom: 25px;">
        <div style="font-size: 20px; font-weight: 600; color: ${PDF_CONFIG.colors.text}; margin-bottom: 15px;">
          ${itinerary.title}
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <div style="padding: 10px; background: ${PDF_CONFIG.colors.background}; border-radius: 8px;">
            <div style="font-size: 12px; color: ${PDF_CONFIG.colors.secondary};">目的地</div>
            <div style="font-size: 14px; color: ${PDF_CONFIG.colors.text}; font-weight: 500;">${itinerary.destination}</div>
          </div>
          <div style="padding: 10px; background: ${PDF_CONFIG.colors.background}; border-radius: 8px;">
            <div style="font-size: 12px; color: ${PDF_CONFIG.colors.secondary};">日期</div>
            <div style="font-size: 14px; color: ${PDF_CONFIG.colors.text}; font-weight: 500;">${dateRange}</div>
          </div>
          <div style="padding: 10px; background: ${PDF_CONFIG.colors.background}; border-radius: 8px;">
            <div style="font-size: 12px; color: ${PDF_CONFIG.colors.secondary};">同行人数</div>
            <div style="font-size: 14px; color: ${PDF_CONFIG.colors.text}; font-weight: 500;">${itinerary.participants} 人</div>
          </div>
          <div style="padding: 10px; background: ${PDF_CONFIG.colors.background}; border-radius: 8px;">
            <div style="font-size: 12px; color: ${PDF_CONFIG.colors.secondary};">预算</div>
            <div style="font-size: 14px; color: ${PDF_CONFIG.colors.text}; font-weight: 500;">${formatCurrency(itinerary.budget)}</div>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: 600; color: ${PDF_CONFIG.colors.text}; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid ${PDF_CONFIG.colors.primary};">
          每日行程
        </div>
        ${dailyScheduleHtml}
      </div>
      
      ${budgetHtml}
      ${statisticsHtml}
      
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid ${PDF_CONFIG.colors.lightGray}; text-align: center; color: ${PDF_CONFIG.colors.secondary}; font-size: 12px;">
        由 AI 旅行规划师生成
      </div>
    </div>
  `
}
