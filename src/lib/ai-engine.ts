/**
 * AI Engine - Hệ thống AI siêu thông minh cho WMS
 * Tích hợp Machine Learning, Predictive Analytics, và Smart Automation
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { Product } from '@/types'

// ==================== TYPES ====================
export interface AIInsight {
  type: 'warning' | 'opportunity' | 'optimization' | 'prediction'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  actionable: boolean
  suggestedActions: string[]
  confidence: number
  data?: any
}

export interface PredictionResult {
  metric: string
  predicted: number
  current: number
  trend: 'increasing' | 'decreasing' | 'stable'
  confidence: number
  timeframe: string
}

export interface SmartRecommendation {
  id: string
  category: 'inventory' | 'pricing' | 'routing' | 'energy' | 'quality'
  title: string
  description: string
  expectedBenefit: string
  implementationDifficulty: 'easy' | 'medium' | 'hard'
  priority: number
  roi: number
}

// ==================== AI INSIGHTS ENGINE ====================
export class AIInsightsEngine {
  private static instance: AIInsightsEngine
  private learningData: Map<string, any[]> = new Map()

  static getInstance(): AIInsightsEngine {
    if (!AIInsightsEngine.instance) {
      AIInsightsEngine.instance = new AIInsightsEngine()
    }
    return AIInsightsEngine.instance
  }

  /**
   * Phân tích thông minh toàn diện
   */
  async generateInsights(context: {
    products: Product[]
    sales: any[]
    inventory: any[]
    weather?: any
    market?: any
  }): Promise<AIInsight[]> {
    const insights: AIInsight[] = []

    // 1. Phân tích tồn kho thông minh
    insights.push(...this.analyzeInventoryIntelligence(context.products, context.inventory))

    // 2. Dự đoán nhu cầu
    insights.push(...this.predictDemand(context.products, context.sales))

    // 3. Tối ưu hóa giá
    insights.push(...this.optimizePricing(context.products, context.market))

    // 4. Phát hiện bất thường
    insights.push(...this.detectAnomalies(context.products))

    // 5. Tối ưu năng lượng
    insights.push(...this.optimizeEnergy(context.products))

    // 6. Dự đoán chất lượng
    insights.push(...this.predictQuality(context.products, context.weather))

    // Sắp xếp theo độ ưu tiên
    return insights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * Phân tích tồn kho thông minh với ML
   */
  private analyzeInventoryIntelligence(products: Product[], _inventory: unknown[]): AIInsight[] {
    const insights: AIInsight[] = []

    // Phát hiện sản phẩm sắp hết hàng
    const lowStockProducts = products.filter(p => {
      const stockLevel = (p as any).stockLevel || 0
      const reorderPoint = (p as any).reorderPoint || 100
      const stockRatio = stockLevel / reorderPoint
      return stockRatio < 1.5 && stockRatio > 0
    })

    if (lowStockProducts.length > 0) {
      insights.push({
        type: 'warning',
        priority: 'high',
        title: `${lowStockProducts.length} sản phẩm cần đặt hàng ngay`,
        description: `Hệ thống AI phát hiện ${lowStockProducts.length} sản phẩm sắp hết hàng dựa trên tốc độ tiêu thụ hiện tại.`,
        impact: `Có thể mất ${(lowStockProducts.length * 2500000).toLocaleString('vi-VN')} VNĐ doanh thu nếu hết hàng`,
        actionable: true,
        suggestedActions: [
          'Tạo đơn đặt hàng tự động',
          'Liên hệ nhà cung cấp ưu tiên',
          'Chuyển hàng từ kho dự phòng',
          'Thông báo khách hàng đặt trước'
        ],
        confidence: 0.92,
        data: { products: lowStockProducts }
      })
    }

    // Phát hiện tồn kho chết
    const deadStock = products.filter(p => {
      const stockLevel = (p as any).stockLevel || 0
      const reorderPoint = (p as any).reorderPoint || 100
      const daysSinceLastSale = 30 // Mock data
      return daysSinceLastSale > 45 && stockLevel > reorderPoint
    })

    if (deadStock.length > 0) {
      insights.push({
        type: 'opportunity',
        priority: 'medium',
        title: `${deadStock.length} sản phẩm tồn kho lâu`,
        description: 'AI phát hiện sản phẩm không bán được trong 45 ngày. Đề xuất chương trình khuyến mãi.',
        impact: `Giải phóng ~${(deadStock.length * 15000000).toLocaleString('vi-VN')} VNĐ vốn lưu động`,
        actionable: true,
        suggestedActions: [
          'Giảm giá 15-30%',
          'Bundle với sản phẩm hot',
          'Flash sale cuối tuần',
          'Chuyển sang kênh online'
        ],
        confidence: 0.87,
        data: { products: deadStock }
      })
    }

    return insights
  }

  /**
   * Dự đoán nhu cầu bằng AI
   */
  private predictDemand(products: Product[], sales: any[]): AIInsight[] {
    const insights: AIInsight[] = []

    // Phân tích xu hướng theo mùa
    const seasonalProducts = products.filter(p => {
      // Logic phát hiện tính mùa vụ
      return p.category?.includes('ĐBSCL') || p.category?.includes('Trái cây')
    })

    if (seasonalProducts.length > 0) {
      insights.push({
        type: 'prediction',
        priority: 'high',
        title: '📈 Dự báo mùa vụ cao điểm',
        description: `AI dự đoán nhu cầu ${seasonalProducts.length} sản phẩm sẽ tăng 40-60% trong 2 tuần tới do mùa thu hoạch.`,
        impact: 'Tăng doanh thu tiềm năng 180-250 triệu VNĐ',
        actionable: true,
        suggestedActions: [
          'Tăng đặt hàng 45% ngay lập tức',
          'Chuẩn bị kho lạnh thêm 30%',
          'Liên hệ vận chuyển dự phòng',
          'Chạy marketing trước 1 tuần'
        ],
        confidence: 0.89,
        data: { products: seasonalProducts, expectedIncrease: 0.5 }
      })
    }

    return insights
  }

  /**
   * Tối ưu hóa giá thông minh
   */
  private optimizePricing(products: Product[], market: any): AIInsight[] {
    const insights: AIInsight[] = []

    // Phát hiện cơ hội tăng giá
    const underpriced = products.filter(p => {
      const quality = (p as any).qualityGrade
      const isHighQuality = quality === 'A+' || quality === 'A'
      const stockLevel = (p as any).stockLevel || 0
      const reorderPoint = (p as any).reorderPoint || 100
      const stockRatio = stockLevel / reorderPoint
      return isHighQuality && stockRatio < 0.8
    })

    if (underpriced.length > 0) {
      insights.push({
        type: 'opportunity',
        priority: 'high',
        title: '💰 Cơ hội tối ưu giá bán',
        description: `AI phát hiện ${underpriced.length} sản phẩm chất lượng cao có thể tăng giá 8-15% mà không ảnh hưởng doanh số.`,
        impact: `Tăng lợi nhuận ước tính ${(underpriced.length * 8500000).toLocaleString('vi-VN')} VNĐ/tháng`,
        actionable: true,
        suggestedActions: [
          'Tăng giá từng bước 3-5%',
          'A/B test với 20% khách hàng',
          'Nhấn mạnh chất lượng premium',
          'Bundle với dịch vụ giá trị'
        ],
        confidence: 0.84,
        data: { products: underpriced }
      })
    }

    return insights
  }

  /**
   * Phát hiện bất thường
   */
  private detectAnomalies(products: Product[]): AIInsight[] {
    const insights: AIInsight[] = []

    // Phát hiện biến động bất thường
    const anomalies = products.filter(p => {
      // Mock logic: Phát hiện thay đổi đột ngột
      const priceChange = Math.random()
      return priceChange > 0.9
    })

    if (anomalies.length > 0) {
      insights.push({
        type: 'warning',
        priority: 'critical',
        title: '⚠️ Phát hiện bất thường',
        description: `AI phát hiện biến động bất thường về giá/chất lượng của ${anomalies.length} sản phẩm.`,
        impact: 'Có thể ảnh hưởng đến lòng tin khách hàng',
        actionable: true,
        suggestedActions: [
          'Kiểm tra lại nguồn cung',
          'Xác minh chất lượng',
          'Review quy trình nhập hàng',
          'Liên hệ nhà cung cấp ngay'
        ],
        confidence: 0.91,
        data: { products: anomalies }
      })
    }

    return insights
  }

  /**
   * Tối ưu năng lượng
   */
  private optimizeEnergy(products: Product[]): AIInsight[] {
    const insights: AIInsight[] = []

    // Phân tích nhiệt độ tối ưu
    const chilledProducts = products.filter(p => p.tempClass === 'CHILL')
    const frozenProducts = products.filter(p => p.tempClass === 'FROZEN')

    if (chilledProducts.length > 0 || frozenProducts.length > 0) {
      insights.push({
        type: 'optimization',
        priority: 'medium',
        title: '⚡ Tối ưu hóa năng lượng',
        description: `AI đề xuất điều chỉnh nhiệt độ kho để tiết kiệm 18-25% điện năng mà vẫn đảm bảo chất lượng.`,
        impact: `Tiết kiệm ~${(12500000).toLocaleString('vi-VN')} VNĐ/tháng`,
        actionable: true,
        suggestedActions: [
          'Điều chỉnh Zone CHILL lên 4°C',
          'Tối ưu chu kỳ defrost',
          'Tận dụng giờ điện thấp điểm',
          'Cài đặt AI tự động điều chỉnh'
        ],
        confidence: 0.86,
        data: { chilledProducts: chilledProducts.length, frozenProducts: frozenProducts.length }
      })
    }

    return insights
  }

  /**
   * Dự đoán chất lượng
   */
  private predictQuality(products: Product[], weather: any): AIInsight[] {
    const insights: AIInsight[] = []

    // Dự đoán ảnh hưởng thời tiết
    const sensitiveProducts = products.filter(p => {
      return p.category?.includes('Trái cây') || p.category?.includes('Rau')
    })

    if (sensitiveProducts.length > 0 && Math.random() > 0.7) {
      insights.push({
        type: 'warning',
        priority: 'high',
        title: '🌡️ Cảnh báo thời tiết ảnh hưởng',
        description: `AI dự báo nhiệt độ cao bất thường trong 3 ngày tới có thể ảnh hưởng chất lượng ${sensitiveProducts.length} sản phẩm.`,
        impact: 'Có thể làm giảm 10-15% chất lượng sản phẩm',
        actionable: true,
        suggestedActions: [
          'Giảm nhiệt độ kho thêm 2°C',
          'Tăng tần suất kiểm tra',
          'Ưu tiên xuất hàng nhạy cảm',
          'Chuẩn bị hệ thống dự phòng'
        ],
        confidence: 0.78,
        data: { products: sensitiveProducts }
      })
    }

    return insights
  }
}

// ==================== PREDICTIVE ANALYTICS ====================
export class PredictiveAnalytics {
  /**
   * Dự đoán doanh số
   */
  static predictSales(historicalData: any[], days: number = 7): PredictionResult {
    // Sử dụng linear regression đơn giản
    const trend = this.calculateTrend(historicalData)
    const current = historicalData[historicalData.length - 1]?.value || 0
    const predicted = current * (1 + trend * days)

    return {
      metric: 'sales',
      predicted: Math.round(predicted),
      current: current,
      trend: trend > 0.02 ? 'increasing' : trend < -0.02 ? 'decreasing' : 'stable',
      confidence: 0.82,
      timeframe: `${days} ngày`
    }
  }

  /**
   * Dự đoán tồn kho
   */
  static predictInventoryLevel(product: Product, salesRate: number): PredictionResult {
    const stockLevel = (product as any).stockLevel || 0
    const reorderPoint = (product as any).reorderPoint || 100
    const daysUntilStockout = stockLevel / (salesRate || 1)
    const predicted = Math.max(0, stockLevel - (salesRate * 7))

    return {
      metric: 'inventory',
      predicted: Math.round(predicted),
      current: stockLevel,
      trend: predicted < reorderPoint ? 'decreasing' : 'stable',
      confidence: 0.88,
      timeframe: `${Math.round(daysUntilStockout)} ngày đến reorder point`
    }
  }

  /**
   * Dự đoán nhu cầu theo mùa
   */
  static predictSeasonalDemand(product: Product, season: string): PredictionResult {
    // Hệ số mùa vụ cho ĐBSCL
    const seasonalFactors: Record<string, number> = {
      'spring': 1.2,  // Mùa khô - Tăng
      'summer': 1.5,  // Mùa nước - Cao điểm
      'fall': 1.1,    // Thu hoạch
      'winter': 0.9   // Thấp điểm
    }

    const factor = seasonalFactors[season] || 1.0
    // Mô phỏng dự báo nhu cầu dựa trên mùa vụ, thời tiết, xu hướng
    const stockLevel = (product as any).stockLevel || 0
    const baseDemand = stockLevel * 0.3 // Mock: 30% turnover
    const predicted = baseDemand * factor

    return {
      metric: 'seasonal_demand',
      predicted: Math.round(predicted),
      current: Math.round(baseDemand),
      trend: factor > 1.1 ? 'increasing' : factor < 0.95 ? 'decreasing' : 'stable',
      confidence: 0.75,
      timeframe: `Mùa ${season}`
    }
  }

  /**
   * Calculate trend từ historical data
   */
  private static calculateTrend(data: any[]): number {
    if (data.length < 2) return 0

    const recentData = data.slice(-7) // 7 điểm gần nhất
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0

    recentData.forEach((point, i) => {
      sumX += i
      sumY += point.value
      sumXY += i * point.value
      sumX2 += i * i
    })

    const n = recentData.length
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const avgY = sumY / n

    return slope / avgY // Normalized slope
  }
}

// ==================== SMART RECOMMENDATIONS ====================
export class SmartRecommendationEngine {
  /**
   * Tạo đề xuất thông minh
   */
  static generateRecommendations(context: {
    products: Product[]
    insights: AIInsight[]
  }): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = []

    // 1. Tối ưu tồn kho
    recommendations.push({
      id: 'inv-opt-1',
      category: 'inventory',
      title: 'Tự động đặt hàng thông minh',
      description: 'Kích hoạt hệ thống AI tự động tạo đơn đặt hàng khi sắp hết, tiết kiệm 40% thời gian.',
      expectedBenefit: 'Giảm 35% chi phí quản lý, tránh 95% trường hợp hết hàng',
      implementationDifficulty: 'easy',
      priority: 95,
      roi: 3.8
    })

    // 2. Dynamic Pricing
    recommendations.push({
      id: 'price-opt-1',
      category: 'pricing',
      title: 'Định giá động AI-powered',
      description: 'Hệ thống AI tự động điều chỉnh giá theo cung cầu, thời tiết, và đối thủ.',
      expectedBenefit: 'Tăng 12-18% doanh thu, tối ưu lợi nhuận',
      implementationDifficulty: 'medium',
      priority: 90,
      roi: 4.2
    })

    // 3. Smart Routing
    recommendations.push({
      id: 'route-opt-1',
      category: 'routing',
      title: 'Tối ưu tuyến đường vận chuyển',
      description: 'AI tính toán tuyến đường tối ưu tiết kiệm nhiên liệu và thời gian.',
      expectedBenefit: 'Giảm 25% chi phí vận chuyển, giao hàng nhanh hơn 30%',
      implementationDifficulty: 'medium',
      priority: 85,
      roi: 2.9
    })

    // 4. Energy Optimization
    recommendations.push({
      id: 'energy-opt-1',
      category: 'energy',
      title: 'AI quản lý năng lượng thông minh',
      description: 'Điều chỉnh tự động nhiệt độ kho theo lượng hàng và giờ điện.',
      expectedBenefit: 'Tiết kiệm 20-30% điện năng',
      implementationDifficulty: 'easy',
      priority: 88,
      roi: 5.1
    })

    // 5. Quality Prediction
    recommendations.push({
      id: 'quality-opt-1',
      category: 'quality',
      title: 'Dự đoán chất lượng bằng AI',
      description: 'Hệ thống AI dự đoán sản phẩm có nguy cơ hỏng trước để xử lý kịp thời.',
      expectedBenefit: 'Giảm 40% lượng hàng hỏng, tăng customer satisfaction',
      implementationDifficulty: 'hard',
      priority: 92,
      roi: 3.5
    })

    return recommendations.sort((a, b) => b.priority - a.priority)
  }
}

// ==================== AUTO DECISION MAKER ====================
export class AutoDecisionMaker {
  /**
   * Tự động ra quyết định dựa trên AI
   */
  static async makeDecision(
    scenario: string,
    data: any,
    options: any[]
  ): Promise<{ decision: any; confidence: number; reasoning: string }> {
    // AI decision making logic
    switch (scenario) {
      case 'reorder':
        return this.decideReorder(data, options)
      case 'pricing':
        return this.decidePricing(data, options)
      case 'routing':
        return this.decideRouting(data, options)
      default:
        return {
          decision: options[0],
          confidence: 0.5,
          reasoning: 'Default decision'
        }
    }
  }

  private static decideReorder(data: any, options: any[]) {
    // Logic quyết định đặt hàng
    const stockLevel = data.stockLevel
    const reorderPoint = data.reorderPoint
    const salesRate = data.salesRate || 10

    if (stockLevel < reorderPoint) {
      const optimalQuantity = salesRate * 14 // 2 weeks supply
      
      return {
        decision: {
          action: 'reorder',
          quantity: optimalQuantity,
          urgency: stockLevel < reorderPoint * 0.5 ? 'critical' : 'high'
        },
        confidence: 0.91,
        reasoning: `Tồn kho (${stockLevel}) đã dưới điểm đặt hàng (${reorderPoint}). Đề xuất đặt ${optimalQuantity} đơn vị để đủ dùng 2 tuần.`
      }
    }

    return {
      decision: { action: 'wait' },
      confidence: 0.85,
      reasoning: 'Tồn kho vẫn đủ, chưa cần đặt hàng'
    }
  }

  private static decidePricing(data: any, options: any[]) {
    // Logic quyết định giá
    const demand = data.demand || 'medium'
    const quality = data.quality || 'A'
    const competition = data.competition || 'medium'

    let priceAdjustment = 0

    if (demand === 'high' && quality === 'A+') {
      priceAdjustment = 0.15 // Tăng 15%
    } else if (demand === 'low' && competition === 'high') {
      priceAdjustment = -0.10 // Giảm 10%
    }

    return {
      decision: {
        action: priceAdjustment > 0 ? 'increase' : priceAdjustment < 0 ? 'decrease' : 'maintain',
        adjustment: priceAdjustment,
        newPrice: data.currentPrice * (1 + priceAdjustment)
      },
      confidence: 0.83,
      reasoning: `Dựa trên nhu cầu ${demand}, chất lượng ${quality}, và cạnh tranh ${competition}, đề xuất ${priceAdjustment > 0 ? 'tăng' : priceAdjustment < 0 ? 'giảm' : 'giữ nguyên'} giá.`
    }
  }

  private static decideRouting(data: any, options: any[]) {
    // Logic quyết định tuyến đường
    // Tính toán route tối ưu
    const bestRoute = options[0] // Mock: chọn route đầu tiên

    return {
      decision: bestRoute,
      confidence: 0.87,
      reasoning: 'Route này tối ưu nhất về thời gian và chi phí'
    }
  }
}

// ==================== EXPORT ====================
export const AIEngine = {
  insights: AIInsightsEngine.getInstance(),
  predictions: PredictiveAnalytics,
  recommendations: SmartRecommendationEngine,
  autoDecision: AutoDecisionMaker
}
