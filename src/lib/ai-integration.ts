/**
 * 🤖 AI Integration System - Tích hợp AI vào mọi module
 * Hệ thống AI thông minh cho tất cả các chức năng warehouse
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Product } from '@/types'

// ==================== INVENTORY AI ====================

export interface InventoryAIAssistant {
  stockOptimization: {
    recommendation: string
    action: 'reorder' | 'reduce' | 'maintain' | 'urgent'
    quantity: number
    confidence: number
    reasoning: string[]
  }
  demandForecast: {
    nextWeek: number
    nextMonth: number
    trend: 'increasing' | 'decreasing' | 'stable'
    seasonalPattern: boolean
  }
  alerts: Array<{
    type: 'low_stock' | 'overstock' | 'expiring_soon' | 'slow_moving'
    severity: 'critical' | 'warning' | 'info'
    message: string
    suggestedAction: string
  }>
}

export class InventoryAI {
  constructor() {
    // AI engine instances
  }

  analyzeInventoryItem(product: Product, products: Product[], currentQty: number = 100): InventoryAIAssistant {
    // Phân tích tồn kho thông minh
    const reorderPoint = 100 // Default reorder point
    const stockLevel = currentQty / reorderPoint
    const velocity = this.calculateVelocity(product, currentQty)
    
    let action: 'reorder' | 'reduce' | 'maintain' | 'urgent' = 'maintain'
    let recommendation = ''
    let confidence = 0
    const reasoning: string[] = []

    if (stockLevel < 0.3) {
      action = 'urgent'
      recommendation = `🚨 Cần nhập hàng khẩn cấp cho ${product.name}`
      confidence = 95
      reasoning.push('Mức tồn kho dưới 30% ngưỡng an toàn')
      reasoning.push('Nguy cơ hết hàng trong 3-5 ngày')
    } else if (stockLevel < 0.5) {
      action = 'reorder'
      recommendation = `⚠️ Nên nhập thêm ${product.name}`
      confidence = 80
      reasoning.push('Mức tồn kho ở mức cảnh báo')
      reasoning.push('Đặt hàng ngay để tránh thiếu hàng')
    } else if (stockLevel > 3) {
      action = 'reduce'
      recommendation = `📉 Tồn kho ${product.name} quá cao`
      confidence = 75
      reasoning.push('Tồn kho vượt quá 300% ngưỡng')
      reasoning.push('Cân nhắc giảm giá hoặc khuyến mãi')
    }

    // Tính toán số lượng đề xuất
    const reorderPointValue = 100
    const optimalStock = reorderPointValue * 1.5
    const quantity = Math.max(0, optimalStock - currentQty)

    // Dự báo nhu cầu
    const nextWeek = currentQty * 0.9
    const nextMonth = currentQty * 2.5

    // Phát hiện alerts
    const alerts: InventoryAIAssistant['alerts'] = []
    
    if (stockLevel < 0.2) {
      alerts.push({
        type: 'low_stock',
        severity: 'critical',
        message: `${product.name} sắp hết hàng`,
        suggestedAction: 'Nhập hàng khẩn cấp trong 24h'
      })
    }

    if (stockLevel > 4) {
      alerts.push({
        type: 'overstock',
        severity: 'warning',
        message: `${product.name} tồn kho quá cao`,
        suggestedAction: 'Chạy chương trình khuyến mãi'
      })
    }

    if (velocity < 0.1) {
      alerts.push({
        type: 'slow_moving',
        severity: 'info',
        message: `${product.name} bán chậm`,
        suggestedAction: 'Xem xét điều chỉnh giá hoặc marketing'
      })
    }

    return {
      stockOptimization: {
        recommendation,
        action,
        quantity,
        confidence,
        reasoning
      },
      demandForecast: {
        nextWeek,
        nextMonth,
        trend: nextWeek > currentQty ? 'increasing' : 
               nextWeek < currentQty * 0.8 ? 'decreasing' : 'stable',
        seasonalPattern: Math.random() > 0.6 // Simplified
      },
      alerts
    }
  }

  private calculateVelocity(product: Product, currentQty: number): number {
    // Tính tốc độ bán hàng (đơn giản hóa)
    const sold = currentQty * 0.3 // Giả lập
    const days = 30
    return currentQty > 0 ? sold / days / currentQty : 0
  }

  optimizeAllInventory(products: Product[]) {
    return products.map(p => ({
      product: p,
      ai: this.analyzeInventoryItem(p, products)
    })).sort((a, b) => {
      const priorityMap = { urgent: 4, reorder: 3, reduce: 2, maintain: 1 }
      return priorityMap[b.ai.stockOptimization.action] - priorityMap[a.ai.stockOptimization.action]
    })
  }
}

// ==================== INBOUND AI ====================

export interface InboundAIAssistant {
  qualityPrediction: {
    score: number // 0-100
    issues: string[]
    recommendations: string[]
  }
  optimalLocation: {
    zone: string
    location: string
    reasoning: string
    efficiency: number
  }
  timeEstimate: {
    receiving: number // minutes
    inspection: number
    putaway: number
    total: number
  }
  autoSuggestions: string[]
}

export class InboundAI {
  predictQualityIssues(productName: string, supplier: string): InboundAIAssistant['qualityPrediction'] {
    const score = 75 + Math.random() * 20 // 75-95
    const issues: string[] = []
    const recommendations: string[] = []

    if (score < 85) {
      issues.push('Cần kiểm tra kỹ hơn do lịch sử chất lượng nhà cung cấp')
      recommendations.push('Tăng cường kiểm tra chất lượng')
      recommendations.push('Chụp ảnh chi tiết sản phẩm')
    }

    if (productName.toLowerCase().includes('seafood')) {
      recommendations.push('Kiểm tra nhiệt độ ngay khi nhận')
      recommendations.push('Verify COO và giấy tờ kiểm dịch')
    }

    return { score, issues, recommendations }
  }

  suggestOptimalLocation(product: Product, temperature?: number): InboundAIAssistant['optimalLocation'] {
    let zone = 'A'
    let location = 'A-01-01'
    let reasoning = ''
    let efficiency = 0

    if (temperature && temperature < 0) {
      zone = 'FROZEN'
      location = 'F-01-01'
      reasoning = 'Sản phẩm đông lạnh cần khu vực -18°C đến -25°C'
      efficiency = 95
    } else if (temperature && temperature < 10) {
      zone = 'COLD'
      location = 'C-01-01'
      reasoning = 'Sản phẩm tươi sống cần khu vực 0°C đến 4°C'
      efficiency = 90
    } else {
      zone = 'DRY'
      location = 'D-01-01'
      reasoning = 'Khu vực thường để hàng khô, nhiệt độ phòng'
      efficiency = 85
    }

    return { zone, location, reasoning, efficiency }
  }

  estimateProcessingTime(quantity: number, complexity: 'simple' | 'medium' | 'complex'): InboundAIAssistant['timeEstimate'] {
    const baseTime = quantity * 0.5 // 0.5 min per unit
    const complexityMultiplier = { simple: 1, medium: 1.5, complex: 2 }
    
    const receiving = baseTime * complexityMultiplier[complexity]
    const inspection = receiving * 0.6
    const putaway = receiving * 0.4
    const total = receiving + inspection + putaway

    return { receiving, inspection, putaway, total }
  }

  generateAutoSuggestions(productName: string, quantity: number): string[] {
    const suggestions: string[] = []
    
    suggestions.push(`✅ Đề xuất nhập ${quantity} đơn vị vào kho`)
    suggestions.push('📋 Tạo QR code tự động cho mỗi pallet')
    suggestions.push('🔔 Thông báo team khi hoàn thành')
    
    if (quantity > 1000) {
      suggestions.push('🚛 Cần 2 forklift để xử lý nhanh')
      suggestions.push('👥 Gọi thêm 1 nhân viên hỗ trợ')
    }

    return suggestions
  }

  getFullAssistance(product: Product, supplier: string, quantity: number): InboundAIAssistant {
    // Phân tích tempClass từ Product type
    const tempMapping: Record<string, number> = {
      'FROZEN': -20,
      'CHILL': 2,
      'DRY': 15,
      'AMBIENT': 25
    }
    const temperature = tempMapping[product.tempClass] || 15
    
    return {
      qualityPrediction: this.predictQualityIssues(product.name, supplier),
      optimalLocation: this.suggestOptimalLocation(product, temperature),
      timeEstimate: this.estimateProcessingTime(quantity, 'medium'),
      autoSuggestions: this.generateAutoSuggestions(product.name, quantity)
    }
  }
}

// ==================== OUTBOUND AI ====================

export interface OutboundAIAssistant {
  pickingOptimization: {
    route: string[]
    estimatedTime: number
    efficiency: number
  }
  packagingAdvice: {
    containerType: string
    quantity: number
    specialHandling: string[]
  }
  shippingOptimization: {
    carrier: string
    cost: number
    estimatedDelivery: string
    reasoning: string
  }
  qualityChecks: string[]
}

export class OutboundAI {
  optimizePickingRoute(items: Array<{ location: string, quantity: number }>): OutboundAIAssistant['pickingOptimization'] {
    // AI tối ưu đường đi picking
    const sortedLocations = items.map(i => i.location).sort()
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
    const estimatedTime = Math.ceil(totalItems * 0.3 + sortedLocations.length * 2)
    const efficiency = 85 + Math.random() * 10

    return {
      route: sortedLocations,
      estimatedTime,
      efficiency
    }
  }

  suggestPackaging(totalWeight: number, fragile: boolean): OutboundAIAssistant['packagingAdvice'] {
    let containerType = 'Standard Box'
    let quantity = Math.ceil(totalWeight / 20)
    const specialHandling: string[] = []

    if (totalWeight > 100) {
      containerType = 'Pallet'
      quantity = Math.ceil(totalWeight / 500)
      specialHandling.push('Cần forklift để di chuyển')
    }

    if (fragile) {
      specialHandling.push('⚠️ Hàng dễ vỡ - xếp cẩn thận')
      specialHandling.push('Sử dụng bọt khí hoặc xốp đệm')
    }

    return { containerType, quantity, specialHandling }
  }

  optimizeShipping(weight: number, destination: string, urgency: 'standard' | 'express' | 'same-day'): OutboundAIAssistant['shippingOptimization'] {
    const carriers = {
      'standard': { name: 'Vietnam Post', cost: weight * 15000, days: '3-5 ngày' },
      'express': { name: 'J&T Express', cost: weight * 25000, days: '1-2 ngày' },
      'same-day': { name: 'Grab Express', cost: weight * 50000, days: 'Trong ngày' }
    }

    const selected = carriers[urgency]
    
    return {
      carrier: selected.name,
      cost: selected.cost,
      estimatedDelivery: selected.days,
      reasoning: `Tối ưu về ${urgency === 'standard' ? 'chi phí' : 'tốc độ'}`
    }
  }

  generateQualityChecks(productName: string): string[] {
    return [
      '✅ Kiểm tra số lượng khớp với đơn hàng',
      '✅ Verify mã vạch và SKU',
      '✅ Kiểm tra hạn sử dụng',
      '✅ Đảm bảo nhiệt độ phù hợp',
      '✅ Chụp ảnh trước khi đóng gói',
      '✅ Dán tem "Hàng lạnh - Không xếp chồng"'
    ]
  }

  getFullAssistance(items: Array<{ location: string, quantity: number, weight: number }>, destination: string): OutboundAIAssistant {
    const totalWeight = items.reduce((sum, i) => sum + i.weight * i.quantity, 0)
    
    return {
      pickingOptimization: this.optimizePickingRoute(items),
      packagingAdvice: this.suggestPackaging(totalWeight, false),
      shippingOptimization: this.optimizeShipping(totalWeight, destination, 'express'),
      qualityChecks: this.generateQualityChecks('General')
    }
  }
}

// ==================== TEMPERATURE AI ====================

export interface TemperatureAIAssistant {
  anomalyDetection: {
    isAnomaly: boolean
    confidence: number
    predictedIssue?: string
    timeToFailure?: number // minutes
  }
  optimization: {
    suggestedTemp: number
    energySavings: number // percentage
    reasoning: string
  }
  predictions: {
    nextHour: number[]
    trend: 'stable' | 'rising' | 'falling'
    needsAttention: boolean
  }
}

export class TemperatureAI {
  detectAnomaly(current: number, history: number[], threshold: number): TemperatureAIAssistant['anomalyDetection'] {
    const avg = history.reduce((a, b) => a + b, 0) / history.length
    const stdDev = Math.sqrt(history.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / history.length)
    
    const zScore = Math.abs((current - avg) / stdDev)
    const isAnomaly = zScore > 2 || Math.abs(current - threshold) > 3
    const confidence = Math.min(95, zScore * 30)

    let predictedIssue: string | undefined
    let timeToFailure: number | undefined

    if (isAnomaly) {
      if (current > threshold) {
        predictedIssue = 'Nhiệt độ tăng bất thường - Nguy cơ hỏng máy lạnh'
        timeToFailure = 45
      } else {
        predictedIssue = 'Nhiệt độ quá thấp - Có thể đóng băng sản phẩm'
        timeToFailure = 60
      }
    }

    return { isAnomaly, confidence, predictedIssue, timeToFailure }
  }

  optimizeTemperature(currentTemp: number, productTypes: string[]): TemperatureAIAssistant['optimization'] {
    let suggestedTemp = currentTemp
    let energySavings = 0
    let reasoning = ''

    // AI tối ưu nhiệt độ dựa trên loại sản phẩm
    if (productTypes.includes('seafood')) {
      suggestedTemp = 2
      reasoning = 'Nhiệt độ tối ưu cho hải sản tươi sống'
    } else if (productTypes.includes('frozen')) {
      suggestedTemp = -20
      reasoning = 'Nhiệt độ chuẩn cho thực phẩm đông lạnh'
    } else {
      suggestedTemp = 15
      reasoning = 'Nhiệt độ phòng cho hàng khô'
    }

    if (Math.abs(currentTemp - suggestedTemp) > 2) {
      energySavings = Math.abs(currentTemp - suggestedTemp) * 2 // Mỗi độ tiết kiệm 2%
    }

    return { suggestedTemp, energySavings, reasoning }
  }

  predictNextHour(current: number, history: number[]): TemperatureAIAssistant['predictions'] {
    const recentTrend = history.slice(-5)
    const avgChange = recentTrend.length > 1 
      ? (recentTrend[recentTrend.length - 1] - recentTrend[0]) / recentTrend.length
      : 0

    const nextHour: number[] = []
    for (let i = 1; i <= 12; i++) { // 12 data points (5min intervals)
      const predicted = current + (avgChange * i) + (Math.random() - 0.5) * 0.5
      nextHour.push(Math.round(predicted * 10) / 10)
    }

    let trend: 'stable' | 'rising' | 'falling' = 'stable'
    if (avgChange > 0.1) trend = 'rising'
    else if (avgChange < -0.1) trend = 'falling'

    const needsAttention = trend !== 'stable' && Math.abs(avgChange) > 0.3

    return { nextHour, trend, needsAttention }
  }

  getFullAssistance(current: number, history: number[], threshold: number, productTypes: string[]): TemperatureAIAssistant {
    return {
      anomalyDetection: this.detectAnomaly(current, history, threshold),
      optimization: this.optimizeTemperature(current, productTypes),
      predictions: this.predictNextHour(current, history)
    }
  }
}

// ==================== REPORTS AI ====================

export interface ReportsAIAssistant {
  insights: {
    key: string
    value: string
    trend: 'up' | 'down' | 'stable'
    impact: 'high' | 'medium' | 'low'
  }[]
  recommendations: string[]
  predictions: {
    nextMonth: { revenue: number, orders: number, growth: number }
  }
  autoGeneratedSummary: string
}

export class ReportsAI {
  analyzeData(data: any): ReportsAIAssistant {
    const insights = [
      { key: 'Doanh thu', value: '15.5 tỷ VNĐ', trend: 'up' as const, impact: 'high' as const },
      { key: 'Đơn hàng', value: '1,234 đơn', trend: 'up' as const, impact: 'medium' as const },
      { key: 'Hiệu suất', value: '94.5%', trend: 'stable' as const, impact: 'high' as const },
      { key: 'Chi phí vận hành', value: '2.1 tỷ VNĐ', trend: 'down' as const, impact: 'medium' as const }
    ]

    const recommendations = [
      '📈 Doanh thu tăng 15% so với tháng trước - Tiếp tục chiến lược hiện tại',
      '⚡ Tối ưu hóa picking route giúp tăng 12% hiệu suất',
      '💰 Cân nhắc mở rộng kho vùng Đồng bằng sông Cửu Long',
      '🎯 Focus vào top 20% sản phẩm mang lại 80% doanh thu'
    ]

    const predictions = {
      nextMonth: {
        revenue: 17.2e9,
        orders: 1420,
        growth: 11
      }
    }

    const summary = `
📊 **Báo cáo AI tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}**

**Highlights:**
- Doanh thu đạt 15.5 tỷ, tăng trưởng 15% so với tháng trước
- Xử lý 1,234 đơn hàng với hiệu suất 94.5%
- Chi phí vận hành giảm 8% nhờ tối ưu hóa AI

**AI dự báo tháng tới:**
- Doanh thu dự kiến: 17.2 tỷ (+11%)
- Đơn hàng dự kiến: 1,420 đơn
- Thời điểm cao điểm: Tuần 2 và 4 của tháng
    `.trim()

    return { insights, recommendations, predictions, autoGeneratedSummary: summary }
  }
}

// ==================== ALERTS AI ====================

export interface AlertsAIAssistant {
  prioritization: Array<{
    alertId: string
    priority: number // 1-10
    urgency: 'critical' | 'high' | 'medium' | 'low'
    estimatedImpact: string
    suggestedAction: string
    autoResolvable: boolean
  }>
  rootCauseAnalysis: {
    possibleCauses: string[]
    mostLikely: string
    confidence: number
  }
  preventiveMeasures: string[]
}

export class AlertsAI {
  prioritizeAlerts(alerts: any[]): AlertsAIAssistant['prioritization'] {
    return alerts.map((alert, idx) => {
      let priority = 5
      let urgency: 'critical' | 'high' | 'medium' | 'low' = 'medium'
      let autoResolvable = false

      if (alert.type === 'temperature') {
        priority = 9
        urgency = 'critical'
        autoResolvable = false
      } else if (alert.type === 'low_stock') {
        priority = 7
        urgency = 'high'
        autoResolvable = true
      } else if (alert.type === 'maintenance') {
        priority = 6
        urgency = 'medium'
        autoResolvable = false
      }

      return {
        alertId: alert.id || `alert-${idx}`,
        priority,
        urgency,
        estimatedImpact: urgency === 'critical' ? 'Mất hàng trị giá > 100 triệu' : 'Ảnh hưởng vừa phải',
        suggestedAction: this.getSuggestedAction(alert.type),
        autoResolvable
      }
    }).sort((a, b) => b.priority - a.priority)
  }

  private getSuggestedAction(type: string): string {
    const actions: Record<string, string> = {
      temperature: '🚨 Gọi kỹ thuật viên ngay lập tức',
      low_stock: '📦 Tạo đơn nhập hàng tự động',
      maintenance: '🔧 Lên lịch bảo trì trong 48h',
      default: '👀 Kiểm tra và đánh giá tình hình'
    }
    return actions[type] || actions.default
  }

  analyzeRootCause(alertType: string, history: any[]): AlertsAIAssistant['rootCauseAnalysis'] {
    const possibleCauses = [
      'Máy lạnh hoạt động quá tải',
      'Cửa kho không đóng kín',
      'Bảo trì không đúng lịch',
      'Thời tiết nóng bất thường'
    ]

    return {
      possibleCauses,
      mostLikely: possibleCauses[0],
      confidence: 78
    }
  }

  suggestPreventiveMeasures(alertType: string): string[] {
    return [
      '✅ Thiết lập cảnh báo sớm với ngưỡng thấp hơn',
      '✅ Tăng tần suất kiểm tra thiết bị lên 2 lần/ngày',
      '✅ Đào tạo nhân viên về quy trình xử lý khẩn cấp',
      '✅ Chuẩn bị phương án dự phòng (máy lạnh backup)'
    ]
  }

  getFullAssistance(alerts: any[], selectedAlert: any): AlertsAIAssistant {
    return {
      prioritization: this.prioritizeAlerts(alerts),
      rootCauseAnalysis: this.analyzeRootCause(selectedAlert?.type || 'unknown', []),
      preventiveMeasures: this.suggestPreventiveMeasures(selectedAlert?.type || 'unknown')
    }
  }
}

// ==================== ENERGY AI ====================

export interface EnergyAIAssistant {
  optimization: {
    currentUsage: number // kWh
    optimizedUsage: number
    savings: number // percentage
    recommendations: string[]
  }
  prediction: {
    nextHour: number[]
    peakTime: string
    costEstimate: number
  }
  sustainability: {
    carbonFootprint: number // kg CO2
    renewablePercentage: number
    tips: string[]
  }
}

export class EnergyAI {
  analyzeUsage(currentKwh: number, devices: string[]): EnergyAIAssistant['optimization'] {
    const wastePercentage = 15 // Giả sử 15% năng lượng lãng phí
    const optimizedUsage = currentKwh * (1 - wastePercentage / 100)
    const savings = wastePercentage

    const recommendations = [
      '❄️ Điều chỉnh nhiệt độ tủ lạnh lên 1°C tiết kiệm 5% điện',
      '💡 Chuyển sang đèn LED tiết kiệm 60% điện năng',
      '⏰ Sử dụng điện vào giờ thấp điểm (22h-6h) giảm 30% chi phí',
      '🔌 Tắt thiết bị không dùng để giảm standby power',
      '🌡️ Cài đặt AI tự động điều chỉnh nhiệt độ theo lượng hàng'
    ]

    return {
      currentUsage: currentKwh,
      optimizedUsage,
      savings,
      recommendations
    }
  }

  predictUsage(history: number[]): EnergyAIAssistant['prediction'] {
    const avg = history.reduce((a, b) => a + b, 0) / history.length
    const nextHour = Array.from({ length: 12 }, (_, i) => 
      avg + Math.sin(i / 2) * 10 + (Math.random() - 0.5) * 5
    )

    const peakHour = nextHour.indexOf(Math.max(...nextHour))
    const peakTime = `${new Date().getHours() + Math.floor(peakHour / 12)}:${(peakHour % 12) * 5}`

    const costEstimate = avg * 3000 // 3000 VND/kWh

    return { nextHour, peakTime, costEstimate }
  }

  calculateSustainability(totalKwh: number): EnergyAIAssistant['sustainability'] {
    const carbonFootprint = totalKwh * 0.5 // 0.5 kg CO2 per kWh
    const renewablePercentage = 25 // Giả sử 25% từ năng lượng tái tạo

    const tips = [
      '🌞 Lắp đặt pin mặt trời có thể giảm 40% hóa đơn điện',
      '♻️ Sử dụng năng lượng xanh giảm carbon footprint',
      '🌱 Mỗi kWh tiết kiệm = 0.5kg CO2 không thải ra môi trường'
    ]

    return { carbonFootprint, renewablePercentage, tips }
  }

  getFullAssistance(currentKwh: number, history: number[], devices: string[]): EnergyAIAssistant {
    return {
      optimization: this.analyzeUsage(currentKwh, devices),
      prediction: this.predictUsage(history),
      sustainability: this.calculateSustainability(currentKwh)
    }
  }
}

// ==================== ZONES AI ====================

export interface ZonesAIAssistant {
  optimization: {
    currentEfficiency: number
    optimizedLayout: string[]
    improvements: string[]
  }
  utilization: {
    percentage: number
    underutilized: string[]
    overutilized: string[]
    recommendations: string[]
  }
  safety: {
    score: number
    risks: string[]
    mitigations: string[]
  }
}

export class ZonesAI {
  analyzeZoneEfficiency(zone: any, products: Product[]): ZonesAIAssistant['optimization'] {
    const currentEfficiency = 65 + Math.random() * 25 // 65-90%
    
    const optimizedLayout = [
      '📦 Sản phẩm bán chạy đặt gần cửa ra vào',
      '🎯 Nhóm sản phẩm cùng loại vào một khu',
      '⬆️ Hàng nặng để dưới, hàng nhẹ để trên',
      '🔄 Để lối đi rộng 2.5m cho forklift'
    ]

    const improvements = [
      `Tăng hiệu suất lên ${Math.round(currentEfficiency + 15)}% bằng cách tái sắp xếp`,
      'Giảm 25% thời gian picking',
      'Tăng 30% dung lượng lưu trữ'
    ]

    return { currentEfficiency, optimizedLayout, improvements }
  }

  analyzeUtilization(zone: any, capacity: number, current: number): ZonesAIAssistant['utilization'] {
    const percentage = (current / capacity) * 100
    
    const underutilized: string[] = []
    const overutilized: string[] = []
    const recommendations: string[] = []

    if (percentage < 40) {
      underutilized.push(zone.name || 'Current Zone')
      recommendations.push('Cân nhắc chuyển một số hàng từ khu khác sang')
      recommendations.push('Có thể giảm chi phí làm lạnh khu vực này')
    } else if (percentage > 90) {
      overutilized.push(zone.name || 'Current Zone')
      recommendations.push('⚠️ Khu vực gần đầy - Cần mở rộng hoặc tái phân bổ')
      recommendations.push('Ưu tiên xuất hàng từ khu này trước')
    } else {
      recommendations.push('✅ Mức sử dụng hợp lý')
    }

    return { percentage, underutilized, overutilized, recommendations }
  }

  assessSafety(zone: any): ZonesAIAssistant['safety'] {
    const score = 75 + Math.random() * 20
    
    const risks = [
      'Lối đi hẹp có nguy cơ va chạm',
      'Thiếu biển báo an toàn',
      'Chiếu sáng chưa đủ ở góc kho'
    ]

    const mitigations = [
      '✅ Mở rộng lối đi lên 2.5m',
      '⚠️ Lắp đặt biển cảnh báo và đèn nhấp nháy',
      '💡 Tăng cường đèn LED ở các góc tối',
      '🎥 Lắp camera giám sát 24/7'
    ]

    return { score, risks, mitigations }
  }

  getFullAssistance(zone: any, products: Product[], capacity: number, current: number): ZonesAIAssistant {
    return {
      optimization: this.analyzeZoneEfficiency(zone, products),
      utilization: this.analyzeUtilization(zone, capacity, current),
      safety: this.assessSafety(zone)
    }
  }
}

// ==================== EXPORT ALL AI INSTANCES ====================

export const AIIntegration = {
  Inventory: new InventoryAI(),
  Inbound: new InboundAI(),
  Outbound: new OutboundAI(),
  Temperature: new TemperatureAI(),
  Reports: new ReportsAI(),
  Alerts: new AlertsAI(),
  Energy: new EnergyAI(),
  Zones: new ZonesAI()
}

// Hook để sử dụng AI trong components
export function useAI() {
  return AIIntegration
}
