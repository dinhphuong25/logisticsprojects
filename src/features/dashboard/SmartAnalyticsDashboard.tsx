import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Brain, TrendingUp, Target, Zap, AlertTriangle, CheckCircle,
  Sparkles, Activity, RefreshCw,
  Lightbulb, Rocket, ArrowRight, Star, 
  ThumbsUp, Award, MessageSquare
} from 'lucide-react'
import { AIEngine } from '@/lib/ai-engine'
import type { AIInsight, SmartRecommendation } from '@/lib/ai-engine'
import { useProductStore } from '@/stores'

export default function SmartAnalyticsDashboard() {
  const { products } = useProductStore()
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)

  // Load AI Insights
  const loadAIInsights = useCallback(async () => {
    setIsAnalyzing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const generatedInsights = await AIEngine.insights.generateInsights({
        products: products,
        sales: [],
        inventory: [],
        weather: {},
        market: {}
      })
      
      setInsights(generatedInsights)
      
      const generatedRecommendations = AIEngine.recommendations.generateRecommendations({
        products: products,
        insights: generatedInsights
      })
      
      setRecommendations(generatedRecommendations)
    } finally {
      setIsAnalyzing(false)
    }
  }, [products])

  useEffect(() => {
    loadAIInsights()
  }, [loadAIInsights])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle
      case 'opportunity': return Target
      case 'optimization': return Zap
      case 'prediction': return Brain
      default: return Activity
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-8 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2">AI Analytics Dashboard</h1>
                <p className="text-blue-100">Phân tích thông minh được hỗ trợ bởi Machine Learning</p>
              </div>
            </div>
            
            <Button
              onClick={loadAIInsights}
              disabled={isAnalyzing}
              className="bg-white text-purple-600 hover:bg-blue-50 font-bold px-6 py-6 rounded-xl shadow-2xl"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Phân tích AI
                </>
              )}
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: Brain, label: 'AI Insights', value: insights.length, color: 'from-purple-500 to-pink-500' },
              { icon: Target, label: 'Opportunities', value: insights.filter(i => i.type === 'opportunity').length, color: 'from-green-500 to-emerald-500' },
              { icon: AlertTriangle, label: 'Warnings', value: insights.filter(i => i.type === 'warning').length, color: 'from-orange-500 to-red-500' },
              { icon: Zap, label: 'Optimizations', value: insights.filter(i => i.type === 'optimization').length, color: 'from-cyan-500 to-blue-500' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-black mb-1">{stat.value}</div>
                <div className="text-sm text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: Math.random() * 300 + 50,
                height: Math.random() * 300 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Insights */}
        <div className="col-span-2 space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                AI Insights & Predictions
                <Badge className="ml-auto">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {insights.map((insight, index) => {
                    const Icon = getTypeIcon(insight.type)
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedInsight(insight)}
                        className="group p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer transition-all hover:shadow-lg"
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={`w-12 h-12 rounded-xl ${getPriorityColor(insight.priority)} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                {insight.title}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {(insight.confidence * 100).toFixed(0)}% confident
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {insight.description}
                            </p>
                            
                            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium">
                              <TrendingUp className="w-4 h-4" />
                              {insight.impact}
                            </div>
                          </div>

                          {/* Arrow */}
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <Progress 
                            value={insight.confidence * 100} 
                            className="h-1"
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {insights.length === 0 && !isAnalyzing && (
                  <div className="text-center py-12 text-gray-500">
                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Nhấn "Phân tích AI" để bắt đầu</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Recommendations */}
        <div className="space-y-6">
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                Smart Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-sm mb-1">{rec.title}</h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {rec.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">ROI</span>
                        <span className="font-bold text-green-600">{rec.roi}x</span>
                      </div>
                      <Progress value={rec.priority} className="h-1" />
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {rec.implementationDifficulty}
                      </Badge>
                      <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {rec.expectedBenefit}
                      </Badge>
                    </div>

                    <Button size="sm" className="w-full mt-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                      <Rocket className="w-4 h-4 mr-2" />
                      Triển khai
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Score Card */}
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-2xl">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <div className="text-5xl font-black text-blue-600 dark:text-blue-400 mb-2">
                  92
                </div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  AI Optimization Score
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  Xuất sắc! Top 5% trong ngành
                </div>
                
                <div className="space-y-2">
                  {[
                    { label: 'Inventory Mgmt', score: 95 },
                    { label: 'Energy Efficiency', score: 88 },
                    { label: 'Demand Forecast', score: 92 }
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={metric.score} className="w-20 h-1.5" />
                        <span className="font-bold text-blue-600 dark:text-blue-400 min-w-[30px] text-right">
                          {metric.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedInsight(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className={`${getPriorityColor(selectedInsight.priority)} p-8 text-white`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                  {React.createElement(getTypeIcon(selectedInsight.type), { className: 'w-8 h-8' })}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-black mb-1">{selectedInsight.title}</h2>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {(selectedInsight.confidence * 100).toFixed(0)}% Độ tin cậy
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Phân tích chi tiết
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedInsight.description}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Tác động dự kiến
                </h3>
                <p className="text-green-600 dark:text-green-400 font-medium">
                  {selectedInsight.impact}
                </p>
              </div>

              {selectedInsight.actionable && selectedInsight.suggestedActions && (
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-purple-600" />
                    Hành động được đề xuất
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedInsight.suggestedActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start h-auto py-3 px-4 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-sm">{action}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => {
                    if (selectedInsight) {
                      toast.success(`✅ Đã thực hiện: ${selectedInsight.title}`, {
                        description: selectedInsight.suggestedActions?.[0] || 'Đang xử lý hành động...',
                        duration: 4000,
                      })
                      setSelectedInsight(null)
                    }
                  }}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Thực hiện ngay
                </Button>
                <Button variant="outline" onClick={() => setSelectedInsight(null)}>
                  Đóng
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
