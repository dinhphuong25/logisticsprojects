import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Warehouse,
  Thermometer,
  Bell,
  Users,
  Shield,
  Database,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import './settings-responsive.css'

interface WarehouseSettings {
  id: string
  name: string
  tempMin: number
  tempMax: number
  alertThreshold: number
  autoAlertEnabled: boolean
}

interface SystemSettings {
  warehouses: WarehouseSettings[]
  alertRules: {
    tempExcursionMinutes: number
    lowStockPercentage: number
    expiryWarningDays: number
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
  }
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'warehouse' | 'alerts' | 'users' | 'system'>('warehouse')
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([])

  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const response = await apiClient.get('/settings')
      return response.data
    },
  })

  // Smart Logic: Analyze and provide recommendations
  const analyzeSettings = () => {
    const recommendations: string[] = []

    settings?.warehouses?.forEach((warehouse) => {
      // Check temperature range
      const tempRange = warehouse.tempMax - warehouse.tempMin
      if (tempRange > 15) {
        recommendations.push(
          `⚠️ ${warehouse.name}: Phạm vi nhiệt độ quá rộng (${tempRange}°C). Khuyến nghị thu hẹp để kiểm soát tốt hơn.`
        )
      }

      // Check alert threshold
      if (warehouse.alertThreshold < 2) {
        recommendations.push(
          `💡 ${warehouse.name}: Ngưỡng cảnh báo thấp (${warehouse.alertThreshold}°C). Có thể tăng lên 2-3°C để giảm cảnh báo giả.`
        )
      }

      // Check if auto alert is disabled
      if (!warehouse.autoAlertEnabled) {
        recommendations.push(
          `🔔 ${warehouse.name}: Cảnh báo tự động đang TẮT. Khuyến nghị BẬT để phát hiện sự cố kịp thời.`
        )
      }

      // Check extreme temperatures
      if (warehouse.tempMin < -30) {
        recommendations.push(
          `❄️ ${warehouse.name}: Nhiệt độ tối thiểu rất thấp (${warehouse.tempMin}°C). Kiểm tra thiết bị làm lạnh.`
        )
      }

      if (warehouse.tempMax > 10) {
        recommendations.push(
          `🌡️ ${warehouse.name}: Nhiệt độ tối đa cao (${warehouse.tempMax}°C). Có thể không phù hợp cho kho lạnh.`
        )
      }
    })

    // Check alert rules
    if (settings?.alertRules) {
      if (settings.alertRules.tempExcursionMinutes < 10) {
        recommendations.push(
          `⏱️ Thời gian vượt ngưỡng quá ngắn (${settings.alertRules.tempExcursionMinutes} phút). Khuyến nghị 10-15 phút.`
        )
      }

      if (settings.alertRules.lowStockPercentage > 30) {
        recommendations.push(
          `📦 Ngưỡng cảnh báo tồn kho cao (${settings.alertRules.lowStockPercentage}%). Khuyến nghị 15-20% để kịp thời bổ sung.`
        )
      }

      if (settings.alertRules.expiryWarningDays < 5) {
        recommendations.push(
          `📅 Cảnh báo hết hạn quá ngắn (${settings.alertRules.expiryWarningDays} ngày). Khuyến nghị 7-14 ngày.`
        )
      }
    }

    // Check notification channels
    if (settings?.notifications) {
      const enabledChannels = Object.values(settings.notifications).filter(Boolean).length
      if (enabledChannels === 0) {
        recommendations.push('🔕 Không có kênh thông báo nào được bật. Khuyến nghị bật ít nhất Email.')
      } else if (enabledChannels === 1) {
        recommendations.push('📢 Chỉ có 1 kênh thông báo. Khuyến nghị bật thêm kênh dự phòng.')
      }
    }

    setAiRecommendations(recommendations)
    
    if (recommendations.length === 0) {
      toast.success('✅ Cấu hình hoàn hảo! Không có khuyến nghị nào.')
    } else {
      toast.info(`🤖 Phát hiện ${recommendations.length} khuyến nghị tối ưu hóa`)
    }
  }

  // Auto-optimize settings based on best practices
  const autoOptimizeSettings = () => {
    if (!settings) return

    const optimizedSettings: Partial<SystemSettings> = {
      warehouses: settings.warehouses?.map(w => ({
        ...w,
        // Optimize temperature range
        tempMin: Math.max(w.tempMin, -25),
        tempMax: Math.min(w.tempMax, 8),
        // Set optimal alert threshold
        alertThreshold: Math.max(w.alertThreshold, 2),
        // Enable auto alerts
        autoAlertEnabled: true,
      })),
      alertRules: {
        // Optimal alert timing
        tempExcursionMinutes: Math.max(settings.alertRules?.tempExcursionMinutes || 15, 10),
        lowStockPercentage: Math.min(settings.alertRules?.lowStockPercentage || 20, 20),
        expiryWarningDays: Math.max(settings.alertRules?.expiryWarningDays || 7, 7),
      },
      notifications: {
        // Enable all notification channels
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
      },
    }

    updateSettingsMutation.mutate(optimizedSettings)
    toast.success('🚀 Đã tối ưu hóa cấu hình tự động!')
  }

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<SystemSettings>) => {
      await apiClient.put('/settings', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
      toast.success('Settings updated successfully')
    },
    onError: () => {
      toast.error('Failed to update settings')
    },
  })

  const tabs = [
    { id: 'warehouse', label: 'Warehouse Config', icon: Warehouse },
    { id: 'alerts', label: 'Alert Rules', icon: Bell },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'system', label: 'System Settings', icon: Database },
  ]

  return (
    <div className="space-y-6">
      {/* Modern Header with Glassmorphism - Mobile Optimized */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-blue-950 dark:to-cyan-950 border border-white/20 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 flex items-center justify-center shadow-xl flex-shrink-0">
              <Settings className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-300 dark:to-teal-400 bg-clip-text text-transparent truncate">
                System Settings
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 md:mt-1 font-medium line-clamp-1">
                Configure warehouse operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 hover:scale-105 transition-transform shadow-lg text-xs sm:text-sm"
              onClick={() => analyzeSettings()}
            >
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Phân tích AI</span>
              <span className="sm:hidden ml-1">AI</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-700 hover:scale-105 transition-transform shadow-lg text-xs sm:text-sm"
              onClick={() => autoOptimizeSettings()}
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Tối ưu tự động</span>
              <span className="sm:hidden ml-1">Tối ưu</span>
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:from-blue-700 hover:via-cyan-600 hover:to-teal-600 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-xs sm:text-sm"
              onClick={() => updateSettingsMutation.mutate(settings || {})}
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Lưu thay đổi</span>
              <span className="sm:hidden ml-1">Lưu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* AI Recommendations Panel - Mobile Optimized */}
      {aiRecommendations.length > 0 && (
        <Card className="border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-purple-950/30">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg font-bold truncate">🤖 Khuyến nghị từ AI</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {aiRecommendations.length} điểm cần tối ưu
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setAiRecommendations([])}
                className="text-gray-500 hover:text-gray-700 flex-shrink-0 h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 sm:space-y-3">
              {aiRecommendations.map((recommendation, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg sm:rounded-xl border border-purple-200 dark:border-purple-800 backdrop-blur-xl"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] sm:text-xs font-bold text-purple-600 dark:text-purple-400">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
              <Button 
                size="sm"
                variant="outline"
                onClick={() => autoOptimizeSettings()}
                className="flex-1 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-xs sm:text-sm"
              >
                Tự động sửa tất cả
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setAiRecommendations([])}
                className="border-gray-300 dark:border-gray-700 text-xs sm:text-sm"
              >
                Bỏ qua
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modern Tabs with Pills Design - Mobile Optimized */}
      <div className="relative">
        <div className="flex gap-2 sm:gap-3 p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800/50 rounded-xl sm:rounded-2xl backdrop-blur-xl overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'warehouse' | 'alerts' | 'users' | 'system')}
                className={`flex-1 min-w-[80px] sm:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/50 hover:scale-102'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden xs:inline sm:inline truncate">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Warehouse Config Tab - Enhanced Design - Mobile Optimized */}
      {activeTab === 'warehouse' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {settings?.warehouses?.map((warehouse, index) => (
            <Card 
              key={warehouse.id}
              className="group relative overflow-hidden border-2 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardHeader className="relative z-10 pb-3 sm:pb-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Warehouse className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold truncate">{warehouse.name}</CardTitle>
                  </div>
                  <Badge 
                    variant={warehouse.autoAlertEnabled ? 'default' : 'secondary'}
                    className={`${warehouse.autoAlertEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' : ''} text-xs flex-shrink-0`}
                  >
                    {warehouse.autoAlertEnabled ? '✓ Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4 sm:space-y-5">
                {/* Minimum Temperature */}
                <div className="group/input">
                  <label className="text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                    </div>
                    <span className="truncate">Minimum Temp (°C)</span>
                  </label>
                  <Input
                    type="number"
                    defaultValue={warehouse.tempMin}
                    className="w-full h-10 sm:h-12 text-base sm:text-lg font-semibold border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                {/* Maximum Temperature */}
                <div className="group/input">
                  <label className="text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                    </div>
                    <span className="truncate">Maximum Temp (°C)</span>
                  </label>
                  <Input
                    type="number"
                    defaultValue={warehouse.tempMax}
                    className="w-full h-10 sm:h-12 text-base sm:text-lg font-semibold border-2 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all"
                  />
                </div>

                {/* Alert Threshold */}
                <div className="group/input">
                  <label className="text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                    </div>
                    <span className="truncate">Alert Threshold (°C)</span>
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    defaultValue={warehouse.alertThreshold}
                    className="w-full h-10 sm:h-12 text-base sm:text-lg font-semibold border-2 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                {/* Auto Alert Toggle */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    <span className="font-bold text-sm sm:text-base text-gray-700 dark:text-gray-300 truncate">Auto Alert</span>
                  </div>
                  <Button
                    size="sm"
                    variant={warehouse.autoAlertEnabled ? 'default' : 'outline'}
                    className={`${warehouse.autoAlertEnabled ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : ''} text-xs sm:text-sm flex-shrink-0`}
                  >
                    {warehouse.autoAlertEnabled ? '✓ Enabled' : 'Disabled'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Alert Rules Tab - Mobile Optimized */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Temperature Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">
                  Temperature Excursion Duration (minutes)
                </label>
                <Input
                  type="number"
                  defaultValue={settings?.alertRules?.tempExcursionMinutes || 15}
                  placeholder="15"
                  className="h-10 sm:h-11"
                />
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  Alert if temperature is out of range for this duration
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Inventory Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">
                  Low Stock Alert Threshold (%)
                </label>
                <Input
                  type="number"
                  defaultValue={settings?.alertRules?.lowStockPercentage || 20}
                  placeholder="20"
                  className="h-10 sm:h-11"
                />
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  Alert when stock level falls below this percentage
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">
                  Expiry Warning (days)
                </label>
                <Input
                  type="number"
                  defaultValue={settings?.alertRules?.expiryWarningDays || 7}
                  placeholder="7"
                  className="h-10 sm:h-11"
                />
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  Alert when products expire within this many days
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Notification Channels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <span className="font-medium text-sm sm:text-base truncate mr-2">Email Alerts</span>
                  <Button
                    size="sm"
                    variant={settings?.notifications?.emailEnabled ? 'default' : 'outline'}
                    className="flex-shrink-0 text-xs sm:text-sm"
                  >
                    {settings?.notifications?.emailEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <span className="font-medium text-sm sm:text-base truncate mr-2">SMS Alerts</span>
                  <Button
                    size="sm"
                    variant={settings?.notifications?.smsEnabled ? 'default' : 'outline'}
                    className="flex-shrink-0 text-xs sm:text-sm"
                  >
                    {settings?.notifications?.smsEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                  <span className="font-medium text-sm sm:text-base truncate mr-2">Push Notifications</span>
                  <Button
                    size="sm"
                    variant={settings?.notifications?.pushEnabled ? 'default' : 'outline'}
                    className="flex-shrink-0 text-xs sm:text-sm"
                  >
                    {settings?.notifications?.pushEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Management Tab - Mobile Optimized */}
      {activeTab === 'users' && (
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base sm:text-lg">User Accounts</CardTitle>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-sm w-full sm:w-auto">
                  <Users className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { name: 'Admin User', email: 'admin@wms.com', role: 'Admin', status: 'active' },
                  { name: 'Warehouse Manager', email: 'manager@wms.com', role: 'Manager', status: 'active' },
                  { name: 'Operator', email: 'operator@wms.com', role: 'Operator', status: 'active' },
                ].map((user, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm sm:text-base truncate">{user.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <Badge variant="outline" className="text-xs">{user.role}</Badge>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {user.status === 'active' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : null}
                        {user.status}
                      </Badge>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Permissions</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Role Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 sm:p-3 text-xs sm:text-sm">Permission</th>
                      <th className="text-center p-2 sm:p-3 text-xs sm:text-sm">Admin</th>
                      <th className="text-center p-2 sm:p-3 text-xs sm:text-sm">Manager</th>
                      <th className="text-center p-2 sm:p-3 text-xs sm:text-sm">Operator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'View Dashboard', admin: true, manager: true, operator: true },
                      { name: 'Manage Inventory', admin: true, manager: true, operator: true },
                      { name: 'Create Inbound', admin: true, manager: true, operator: false },
                      { name: 'Create Outbound', admin: true, manager: true, operator: false },
                      { name: 'System Settings', admin: true, manager: false, operator: false },
                      { name: 'User Management', admin: true, manager: false, operator: false },
                    ].map((perm, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">{perm.name}</td>
                        <td className="text-center p-2 sm:p-3">
                          {perm.admin ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /> : '-'}
                        </td>
                        <td className="text-center p-2 sm:p-3">
                          {perm.manager ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /> : '-'}
                        </td>
                        <td className="text-center p-2 sm:p-3">
                          {perm.operator ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /> : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Settings Tab - Mobile Optimized */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Database Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Data Retention (days)</label>
                <Input type="number" defaultValue={365} className="h-10 sm:h-11" />
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  How long to keep historical data
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Backup Frequency</label>
                <select className="w-full px-3 py-2 sm:py-2.5 border rounded-lg text-sm sm:text-base">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <Button variant="outline" className="w-full text-xs sm:text-sm">
                <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Backup Now
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Version</span>
                <span className="font-semibold">v2.5.0</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Last Update</span>
                <span className="font-semibold">Nov 2, 2025</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Database Size</span>
                <span className="font-semibold">2.4 GB</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Người dùng đang hoạt động</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">System Status</span>
                <Badge variant="default" className="bg-green-500 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Healthy
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
