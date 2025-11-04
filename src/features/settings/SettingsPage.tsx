import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'warehouse' | 'alerts' | 'users' | 'system'>('warehouse')
  const [autoOptimize, setAutoOptimize] = useState(true)
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
      {/* Modern Header with Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-blue-950 dark:to-cyan-950 border border-white/20 p-8 shadow-2xl backdrop-blur-xl">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 flex items-center justify-center shadow-xl">
              <Settings className="w-8 h-8 text-white animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-300 dark:to-teal-400 bg-clip-text text-transparent">
                System Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 font-medium">
                Configure warehouse operations and system parameters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 hover:scale-105 transition-transform shadow-lg"
              onClick={() => analyzeSettings()}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Phân tích AI
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-700 hover:scale-105 transition-transform shadow-lg"
              onClick={() => autoOptimizeSettings()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tối ưu tự động
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:from-blue-700 hover:via-cyan-600 hover:to-teal-600 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              onClick={() => updateSettingsMutation.mutate(settings || {})}
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>

      {/* AI Recommendations Panel */}
      {aiRecommendations.length > 0 && (
        <Card className="border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-purple-950/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">🤖 Khuyến nghị từ AI</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Phát hiện {aiRecommendations.length} điểm cần tối ưu hóa
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setAiRecommendations([])}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiRecommendations.map((recommendation, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-purple-200 dark:border-purple-800 backdrop-blur-xl"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button 
                size="sm"
                variant="outline"
                onClick={() => autoOptimizeSettings()}
                className="flex-1 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50"
              >
                Tự động sửa tất cả
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setAiRecommendations([])}
                className="border-gray-300 dark:border-gray-700"
              >
                Bỏ qua
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modern Tabs with Pills Design */}
      <div className="relative">
        <div className="flex gap-3 p-2 bg-gray-100 dark:bg-gray-800/50 rounded-2xl backdrop-blur-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/50 hover:scale-102'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Warehouse Config Tab - Enhanced Design */}
      {activeTab === 'warehouse' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {settings?.warehouses?.map((warehouse, index) => (
            <Card 
              key={warehouse.id}
              className="group relative overflow-hidden border-2 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                      <Warehouse className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold">{warehouse.name}</CardTitle>
                  </div>
                  <Badge 
                    variant={warehouse.autoAlertEnabled ? 'default' : 'secondary'}
                    className={warehouse.autoAlertEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' : ''}
                  >
                    {warehouse.autoAlertEnabled ? '✓ Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-5">
                {/* Minimum Temperature */}
                <div className="group/input">
                  <label className="text-sm font-bold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Thermometer className="w-4 h-4 text-blue-600" />
                    </div>
                    Minimum Temperature (°C)
                  </label>
                  <Input
                    type="number"
                    defaultValue={warehouse.tempMin}
                    className="w-full h-12 text-lg font-semibold border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                {/* Maximum Temperature */}
                <div className="group/input">
                  <label className="text-sm font-bold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Thermometer className="w-4 h-4 text-red-600" />
                    </div>
                    Maximum Temperature (°C)
                  </label>
                  <Input
                    type="number"
                    defaultValue={warehouse.tempMax}
                    className="w-full h-12 text-lg font-semibold border-2 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all"
                  />
                </div>

                {/* Alert Threshold */}
                <div className="group/input">
                  <label className="text-sm font-bold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    </div>
                    Alert Threshold (°C)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    defaultValue={warehouse.alertThreshold}
                    className="w-full h-12 text-lg font-semibold border-2 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                {/* Auto Alert Toggle */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-bold text-gray-700 dark:text-gray-300">Auto Alert</span>
                  </div>
                  <Button
                    size="sm"
                    variant={warehouse.autoAlertEnabled ? 'default' : 'outline'}
                    className={warehouse.autoAlertEnabled ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : ''}
                  >
                    {warehouse.autoAlertEnabled ? '✓ Enabled' : 'Disabled'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Alert Rules Tab */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Temperature Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Temperature Excursion Duration (minutes)
                </label>
                <Input
                  type="number"
                  defaultValue={settings?.alertRules?.tempExcursionMinutes || 15}
                  placeholder="15"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alert if temperature is out of range for this duration
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Low Stock Alert Threshold (%)
                </label>
                <Input
                  type="number"
                  defaultValue={settings?.alertRules?.lowStockPercentage || 20}
                  placeholder="20"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alert when stock level falls below this percentage
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Expiry Warning (days)
                </label>
                <Input
                  type="number"
                  defaultValue={settings?.alertRules?.expiryWarningDays || 7}
                  placeholder="7"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alert when products expire within this many days
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-medium">Email Alerts</span>
                  <Button
                    size="sm"
                    variant={settings?.notifications?.emailEnabled ? 'default' : 'outline'}
                  >
                    {settings?.notifications?.emailEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-medium">SMS Alerts</span>
                  <Button
                    size="sm"
                    variant={settings?.notifications?.smsEnabled ? 'default' : 'outline'}
                  >
                    {settings?.notifications?.smsEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-medium">Push Notifications</span>
                  <Button
                    size="sm"
                    variant={settings?.notifications?.pushEnabled ? 'default' : 'outline'}
                  >
                    {settings?.notifications?.pushEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Accounts</CardTitle>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                  <Users className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Admin User', email: 'admin@wms.com', role: 'Admin', status: 'active' },
                  { name: 'Warehouse Manager', email: 'manager@wms.com', role: 'Manager', status: 'active' },
                  { name: 'Operator', email: 'operator@wms.com', role: 'Operator', status: 'active' },
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{user.role}</Badge>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status === 'active' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : null}
                        {user.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Shield className="w-4 h-4 mr-1" />
                        Permissions
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Permission</th>
                      <th className="text-center p-3">Admin</th>
                      <th className="text-center p-3">Manager</th>
                      <th className="text-center p-3">Operator</th>
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
                        <td className="p-3">{perm.name}</td>
                        <td className="text-center p-3">
                          {perm.admin ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : '-'}
                        </td>
                        <td className="text-center p-3">
                          {perm.manager ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : '-'}
                        </td>
                        <td className="text-center p-3">
                          {perm.operator ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : '-'}
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

      {/* System Settings Tab */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Data Retention (days)</label>
                <Input type="number" defaultValue={365} />
                <p className="text-xs text-gray-500 mt-1">
                  How long to keep historical data
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Backup Frequency</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <Button variant="outline" className="w-full">
                <Database className="w-4 h-4 mr-2" />
                Backup Now
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Version</span>
                <span className="font-semibold">v2.5.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Update</span>
                <span className="font-semibold">Nov 2, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Database Size</span>
                <span className="font-semibold">2.4 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Users</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">System Status</span>
                <Badge variant="default" className="bg-green-500">
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
