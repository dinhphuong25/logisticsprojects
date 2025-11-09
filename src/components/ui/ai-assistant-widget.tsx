/**
 * 🤖 AI Assistant Widget - Trợ lý AI thông minh cho mọi trang
 * Component có thể dùng ở bất kỳ đâu để hiển thị gợi ý AI
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronDown,
  Lightbulb,
  Zap,
  Target
} from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { Badge } from './badge'
import { toast } from 'sonner'

export interface AIInsight {
  id: string
  type: 'suggestion' | 'warning' | 'opportunity' | 'prediction'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  actions?: string[]
}

interface AIAssistantWidgetProps {
  context: string // 'inventory' | 'inbound' | 'outbound' | 'temperature' | etc.
  insights?: AIInsight[]
  onAction?: (insightId: string, action: string) => void
  compact?: boolean
}

export function AIAssistantWidget({
  context,
  insights = [],
  onAction,
  compact = false
}: AIAssistantWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeInsights, setActiveInsights] = useState<AIInsight[]>(insights)

  useEffect(() => {
    setActiveInsights(insights)
  }, [insights])

  const handleExecuteAction = (insightId: string, action: string) => {
    toast.success(`✅ Đã thực hiện: ${action}`, {
      description: 'AI đang xử lý yêu cầu của bạn...',
      duration: 3000,
    })
    onAction?.(insightId, action)
    
    // Remove insight after action
    setTimeout(() => {
      setActiveInsights(prev => prev.filter(i => i.id !== insightId))
    }, 500)
  }

  const handleDismiss = (insightId: string) => {
    setActiveInsights(prev => prev.filter(i => i.id !== insightId))
    toast.info('Đã ẩn gợi ý', { duration: 2000 })
  }

  const getIconByType = (type: AIInsight['type']) => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="w-5 h-5 text-blue-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'opportunity':
        return <Target className="w-5 h-5 text-green-500" />
      case 'prediction':
        return <TrendingUp className="w-5 h-5 text-purple-500" />
    }
  }

  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'high':
        return 'from-red-500/20 to-orange-500/20 border-red-500/30'
      case 'medium':
        return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
      case 'low':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
    }
  }

  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="lg"
          className="rounded-full shadow-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Brain className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" />
          <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300" />
          AI Assistant
          {activeInsights.length > 0 && (
            <Badge className="ml-2 bg-red-500 text-white">
              {activeInsights.length}
            </Badge>
          )}
        </Button>

        <AnimatePresence>
          {isExpanded && activeInsights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-full right-0 mb-4 w-96"
            >
              <InsightsPanel
                insights={activeInsights}
                onExecuteAction={handleExecuteAction}
                onDismiss={handleDismiss}
                getIconByType={getIconByType}
                getImpactColor={getImpactColor}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-2 border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              AI Assistant
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {context.toUpperCase()}
              </Badge>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activeInsights.length} gợi ý thông minh
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <InsightsPanel
              insights={activeInsights}
              onExecuteAction={handleExecuteAction}
              onDismiss={handleDismiss}
              getIconByType={getIconByType}
              getImpactColor={getImpactColor}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

interface InsightsPanelProps {
  insights: AIInsight[]
  onExecuteAction: (insightId: string, action: string) => void
  onDismiss: (insightId: string) => void
  getIconByType: (type: AIInsight['type']) => React.ReactNode
  getImpactColor: (impact: AIInsight['impact']) => string
}

function InsightsPanel({
  insights,
  onExecuteAction,
  onDismiss,
  getIconByType,
  getImpactColor
}: InsightsPanelProps) {
  return (
    <div className="space-y-3">
      {insights.map((insight) => (
        <motion.div
          key={insight.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={`relative p-4 rounded-lg bg-gradient-to-r ${getImpactColor(insight.impact)} border backdrop-blur-sm`}
        >
          <button
            onClick={() => onDismiss(insight.id)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="flex items-start gap-3 mb-3">
            <div className="mt-1">{getIconByType(insight.type)}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {insight.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {insight.description}
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-xs bg-white/50 dark:bg-black/20"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {insight.confidence}% confidence
                </Badge>
                <Badge
                  variant={
                    insight.impact === 'high'
                      ? 'destructive'
                      : insight.impact === 'medium'
                      ? 'default'
                      : 'secondary'
                  }
                  className="text-xs"
                >
                  {insight.impact.toUpperCase()} Impact
                </Badge>
              </div>
            </div>
          </div>

          {insight.actions && insight.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
              {insight.actions.map((action, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="secondary"
                  className="text-xs"
                  onClick={() => onExecuteAction(insight.id, action)}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {action}
                </Button>
              ))}
            </div>
          )}
        </motion.div>
      ))}

      {insights.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Không có gợi ý nào lúc này</p>
          <p className="text-xs mt-1">AI đang phân tích dữ liệu...</p>
        </div>
      )}
    </div>
  )
}

// Hook để generate insights dựa trên context
export function useAIInsights(
  context: string,
  data?: any
): { insights: AIInsight[]; isLoading: boolean } {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate AI processing
    setIsLoading(true)
    const timer = setTimeout(() => {
      const mockInsights = generateMockInsights(context, data)
      setInsights(mockInsights)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [context, data])

  return { insights, isLoading }
}

function generateMockInsights(context: string, data?: any): AIInsight[] {
  const contextInsights: Record<string, AIInsight[]> = {
    inventory: [
      {
        id: 'inv-1',
        type: 'warning',
        title: 'Tồn kho thấp phát hiện',
        description: '5 sản phẩm sắp hết hàng trong 3 ngày tới',
        confidence: 92,
        impact: 'high',
        actions: ['Tạo đơn nhập hàng', 'Xem chi tiết']
      },
      {
        id: 'inv-2',
        type: 'opportunity',
        title: 'Cơ hội tối ưu không gian',
        description: 'Tái sắp xếp kho có thể tăng 15% dung lượng',
        confidence: 85,
        impact: 'medium',
        actions: ['Xem gợi ý', 'Lên kế hoạch']
      }
    ],
    inbound: [
      {
        id: 'in-1',
        type: 'suggestion',
        title: 'Đề xuất vị trí lưu trữ tối ưu',
        description: 'AI đã tìm được vị trí tốt nhất cho lô hàng mới',
        confidence: 88,
        impact: 'medium',
        actions: ['Áp dụng ngay', 'Xem vị trí']
      },
      {
        id: 'in-2',
        type: 'prediction',
        title: 'Dự báo thời gian xử lý',
        description: 'Lô hàng này sẽ mất 45 phút để xử lý xong',
        confidence: 78,
        impact: 'low',
        actions: ['Xác nhận']
      }
    ],
    outbound: [
      {
        id: 'out-1',
        type: 'suggestion',
        title: 'Tối ưu hóa picking route',
        description: 'Route mới giảm 20% thời gian picking',
        confidence: 90,
        impact: 'high',
        actions: ['Sử dụng route này', 'Xem bản đồ']
      }
    ],
    temperature: [
      {
        id: 'temp-1',
        type: 'warning',
        title: 'Phát hiện bất thường nhiệt độ',
        description: 'Zone A nhiệt độ tăng 2°C so với bình thường',
        confidence: 95,
        impact: 'high',
        actions: ['Kiểm tra ngay', 'Gọi kỹ thuật viên']
      }
    ],
    reports: [
      {
        id: 'rep-1',
        type: 'prediction',
        title: 'Dự báo tháng tới',
        description: 'Doanh thu dự kiến tăng 15% so với tháng này',
        confidence: 82,
        impact: 'high',
        actions: ['Xem chi tiết', 'Xuất báo cáo']
      }
    ],
    alerts: [
      {
        id: 'alert-1',
        type: 'suggestion',
        title: 'Ưu tiên xử lý cảnh báo',
        description: 'AI đã sắp xếp 15 cảnh báo theo độ ưu tiên',
        confidence: 93,
        impact: 'high',
        actions: ['Xem danh sách', 'Tự động xử lý']
      }
    ],
    energy: [
      {
        id: 'energy-1',
        type: 'opportunity',
        title: 'Tiết kiệm năng lượng',
        description: 'Điều chỉnh nhiệt độ có thể tiết kiệm 12% điện năng',
        confidence: 87,
        impact: 'medium',
        actions: ['Áp dụng', 'Xem chi tiết']
      }
    ],
    zones: [
      {
        id: 'zone-1',
        type: 'suggestion',
        title: 'Tối ưu hóa zone layout',
        description: 'Tái sắp xếp có thể tăng 25% hiệu suất',
        confidence: 84,
        impact: 'high',
        actions: ['Xem layout mới', 'Lên kế hoạch']
      }
    ]
  }

  return contextInsights[context] || []
}
