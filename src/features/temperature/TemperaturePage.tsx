import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Thermometer, 
  AlertCircle, 
  TrendingUp, 
  Activity, 
  RefreshCw, 
  Download, 
  Filter,
  Settings,
  Bell,
  Save,
  Clock,
  Mail,
  Phone,
  Zap,
  Shield,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import type { Sensor, Zone } from '@/types'

interface TemperatureConfig {
  id: string
  zoneId: string
  zoneName: string
  minTemp: number
  maxTemp: number
  targetTemp: number
  alertEnabled: boolean
  alertDelay: number // minutes
  notifyEmail: boolean
  notifySMS: boolean
  autoAdjust: boolean
}

export default function TemperaturePage() {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'settings'>('monitoring')
  const [editingConfig, setEditingConfig] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<TemperatureConfig>>({})
  
  const queryClient = useQueryClient()

  const { data: sensors, refetch } = useQuery<Sensor[]>({
    queryKey: ['sensors'],
    queryFn: async () => {
      const res = await apiClient.get('/sensors')
      return res.data
    },
    refetchInterval: 5000, // Update every 5 seconds
  })

  // Fetch zones for settings tab
  const { data: zones = [] } = useQuery<Zone[]>({
    queryKey: ['zones'],
    queryFn: async () => {
      const res = await apiClient.get('/zones')
      return res.data
    },
    enabled: activeTab === 'settings'
  })

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      ONLINE: { label: 'Hoạt động', color: 'bg-green-500 text-white' },
      WARNING: { label: 'Cảnh báo', color: 'bg-yellow-500 text-white' },
      OFFLINE: { label: 'Ngoại tuyến', color: 'bg-gray-500 text-white' },
      ERROR: { label: 'Lỗi', color: 'bg-red-500 text-white' },
    }
    const config = statusMap[status] || statusMap.OFFLINE
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const temperatureSensors = sensors?.filter((s) => s.type === 'TEMPERATURE') || []
  
  // Calculate statistics
  const stats = {
    total: temperatureSensors.length,
    online: temperatureSensors.filter(s => s.status === 'ONLINE').length,
    warning: temperatureSensors.filter(s => s.status === 'WARNING').length,
    offline: temperatureSensors.filter(s => s.status === 'OFFLINE' || s.status === 'ERROR').length,
    avgTemp: temperatureSensors.length > 0 
      ? (temperatureSensors.reduce((sum, s) => sum + s.currentValue, 0) / temperatureSensors.length).toFixed(1)
      : '0.0'
  }

  // Mock temperature configs for settings
  const temperatureConfigs: TemperatureConfig[] = zones.map(zone => ({
    id: `config-${zone.id}`,
    zoneId: zone.id,
    zoneName: zone.name,
    minTemp: zone.tempTarget ? zone.tempTarget - 5 : -20,
    maxTemp: zone.tempTarget ? zone.tempTarget + 5 : 5,
    targetTemp: zone.tempTarget || 0,
    alertEnabled: true,
    alertDelay: 5,
    notifyEmail: true,
    notifySMS: false,
    autoAdjust: false
  }))

  const totalAlerts = temperatureConfigs.filter(c => c.alertEnabled).length

  const updateConfigMutation = useMutation({
    mutationFn: async (config: Partial<TemperatureConfig>) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return config
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] })
      toast.success('Đã lưu cấu hình nhiệt độ')
      setEditingConfig(null)
      setFormData({})
    },
    onError: () => {
      toast.error('Không thể lưu cấu hình')
    }
  })

  const handleEdit = (config: TemperatureConfig) => {
    setEditingConfig(config.id)
    setFormData(config)
  }

  const handleSave = () => {
    updateConfigMutation.mutate(formData)
  }

  const handleCancel = () => {
    setEditingConfig(null)
    setFormData({})
  }

  const updateField = (field: keyof TemperatureConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getTempColor = (temp: number, target?: number) => {
    if (!target) return 'from-blue-500 to-cyan-500'
    const diff = Math.abs(temp - target)
    if (diff < 1) return 'from-green-500 to-emerald-500'
    if (diff < 3) return 'from-blue-500 to-cyan-500'
    if (diff < 5) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-rose-500'
  }

  const getTempStatus = (temp: number, target?: number) => {
    if (!target) return { icon: Activity, label: 'Đang đo', color: 'text-blue-600' }
    const diff = Math.abs(temp - target)
    if (diff < 1) return { icon: Activity, label: 'Ổn định', color: 'text-green-600' }
    if (diff < 3) return { icon: TrendingUp, label: 'Bình thường', color: 'text-blue-600' }
    if (diff < 5) return { icon: AlertCircle, label: 'Chú ý', color: 'text-yellow-600' }
    return { icon: AlertCircle, label: 'Cảnh báo', color: 'text-red-600' }
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-4 md:space-y-6 px-3 sm:px-4 lg:px-0 py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
            Giám sát nhiệt độ
          </h1>
          <p className="text-xs md:text-base text-gray-500 dark:text-gray-400 mt-1 md:mt-2">
            Theo dõi nhiệt độ thời gian thực từ các cảm biến
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {activeTab === 'monitoring' ? (
            <>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs md:text-sm">
                <Filter className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden sm:inline">Bộ lọc</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="flex-1 sm:flex-none text-xs md:text-sm">
                <RefreshCw className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden sm:inline">Làm mới</span>
              </Button>
              <Button size="sm" className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-cyan-600 text-xs md:text-sm">
                <Download className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden sm:inline">Xuất báo cáo</span>
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['zones'] })} className="w-full sm:w-auto">
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-4 py-2 text-sm md:text-base font-medium transition-all relative ${
            activeTab === 'monitoring'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>Giám sát</span>
          </div>
          {activeTab === 'monitoring' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600"></div>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm md:text-base font-medium transition-all relative ${
            activeTab === 'settings'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Cấu hình</span>
          </div>
          {activeTab === 'settings' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600"></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'monitoring' ? (
        <>
          {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-3 md:p-5">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <Thermometer className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Tổng cảm biến</p>
            <p className="text-xl md:text-3xl font-bold text-blue-600">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-3 md:p-5">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <Activity className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Hoạt động</p>
            <p className="text-xl md:text-3xl font-bold text-green-600">{stats.online}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
          <CardContent className="p-3 md:p-5">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Cảnh báo</p>
            <p className="text-xl md:text-3xl font-bold text-yellow-600">{stats.warning}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-3 md:p-5">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">TB nhiệt độ</p>
            <p className="text-xl md:text-3xl font-bold text-purple-600">{stats.avgTemp}°C</p>
          </CardContent>
        </Card>
      </div>

      {/* Temperature Sensors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {temperatureSensors.map((sensor) => {
          const tempStatus = getTempStatus(sensor.currentValue, sensor.zone?.tempTarget)
          const StatusIcon = tempStatus.icon
          const gradient = getTempColor(sensor.currentValue, sensor.zone?.tempTarget)
          
          return (
            <Card key={sensor.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              {/* Header */}
              <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate">
                      {sensor.name}
                    </CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sensor.zone?.name || 'Chưa gán khu vực'}</p>
                  </div>
                  {getStatusBadge(sensor.status)}
                </div>
              </CardHeader>

              <CardContent className="p-4 md:p-6">
                {/* Temperature Display */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-60 animate-pulse`}></div>
                    <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl`}>
                      <Thermometer className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      {sensor.currentValue.toFixed(1)}°C
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusIcon className={`w-4 h-4 ${tempStatus.color}`} />
                      <p className={`text-xs md:text-sm font-medium ${tempStatus.color}`}>
                        {tempStatus.label}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Target Info */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mb-3">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Mục tiêu:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {sensor.zone?.tempTarget || '-'}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm mt-2">
                    <span className="text-gray-600 dark:text-gray-400">Chênh lệch:</span>
                    <span className={`font-bold ${
                      sensor.zone?.tempTarget 
                        ? Math.abs(sensor.currentValue - sensor.zone.tempTarget) < 1 
                          ? 'text-green-600' 
                          : Math.abs(sensor.currentValue - sensor.zone.tempTarget) < 3
                          ? 'text-blue-600'
                          : 'text-red-600'
                        : 'text-gray-600'
                    }`}>
                      {sensor.zone?.tempTarget 
                        ? `${(sensor.currentValue - sensor.zone.tempTarget > 0 ? '+' : '')}${(sensor.currentValue - sensor.zone.tempTarget).toFixed(1)}°C`
                        : '-'
                      }
                    </span>
                  </div>
                </div>

                {/* Warning Alert */}
                {sensor.status === 'WARNING' && (
                  <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-l-4 border-yellow-500">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs md:text-sm flex-1">
                        <p className="font-bold text-yellow-900 dark:text-yellow-300">
                          Cảnh báo nhiệt độ
                        </p>
                        <p className="text-yellow-700 dark:text-yellow-400 mt-0.5">
                          Vượt ngưỡng cho phép
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Alert */}
                {(sensor.status === 'ERROR' || sensor.status === 'OFFLINE') && (
                  <div className="p-3 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border-l-4 border-red-500">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs md:text-sm flex-1">
                        <p className="font-bold text-red-900 dark:text-red-300">
                          {sensor.status === 'ERROR' ? 'Lỗi cảm biến' : 'Mất kết nối'}
                        </p>
                        <p className="text-red-700 dark:text-red-400 mt-0.5">
                          Kiểm tra thiết bị ngay
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {temperatureSensors.length === 0 && (
        <Card className="border-0 shadow-xl">
          <CardContent className="py-12 md:py-16">
            <div className="text-center text-gray-500">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-2xl opacity-20"></div>
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto">
                  <Thermometer className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
              </div>
              <p className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300">Không có dữ liệu cảm biến</p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-2">Hệ thống chưa phát hiện cảm biến nhiệt độ nào</p>
            </div>
          </CardContent>
        </Card>
      )}
        </>
      ) : (
        <>
          {/* Settings Tab Content */}
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardContent className="p-3 md:p-5">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <Settings className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Khu vực</p>
                <p className="text-xl md:text-3xl font-bold text-blue-600">{zones.length}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardContent className="p-3 md:p-5">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <Thermometer className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Cảm biến</p>
                <p className="text-xl md:text-3xl font-bold text-green-600">{stats.online}/{temperatureSensors.length}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
              <CardContent className="p-3 md:p-5">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <Bell className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Cảnh báo</p>
                <p className="text-xl md:text-3xl font-bold text-yellow-600">{totalAlerts}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardContent className="p-3 md:p-5">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <Shield className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Tự động</p>
                <p className="text-xl md:text-3xl font-bold text-purple-600">
                  {temperatureConfigs.filter(c => c.autoAdjust).length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Configuration List */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              Cấu hình theo khu vực
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {temperatureConfigs.map((config) => {
                const isEditing = editingConfig === config.id
                const data = isEditing ? (formData as TemperatureConfig) : config
                const zoneSensors = sensors?.filter(s => s.zone?.id === config.zoneId && s.type === 'TEMPERATURE') || []

                return (
                  <Card key={config.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Thermometer className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base md:text-lg">{config.zoneName}</CardTitle>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {zoneSensors.length} cảm biến • {zoneSensors.filter(s => s.status === 'ONLINE').length} hoạt động
                            </p>
                          </div>
                        </div>
                        {data.alertEnabled && (
                          <Badge className="bg-green-500 text-white">
                            <Bell className="w-3 h-3 mr-1" />
                            Bật
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 md:p-6">
                      {/* Temperature Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Nhiệt độ tối thiểu (°C)
                          </label>
                          <Input
                            type="number"
                            value={data.minTemp}
                            onChange={(e) => isEditing && updateField('minTemp', parseFloat(e.target.value))}
                            disabled={!isEditing}
                            className="text-sm md:text-base"
                          />
                        </div>

                        <div>
                          <label className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Nhiệt độ mục tiêu (°C)
                          </label>
                          <Input
                            type="number"
                            value={data.targetTemp}
                            onChange={(e) => isEditing && updateField('targetTemp', parseFloat(e.target.value))}
                            disabled={!isEditing}
                            className="text-sm md:text-base font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Nhiệt độ tối đa (°C)
                          </label>
                          <Input
                            type="number"
                            value={data.maxTemp}
                            onChange={(e) => isEditing && updateField('maxTemp', parseFloat(e.target.value))}
                            disabled={!isEditing}
                            className="text-sm md:text-base"
                          />
                        </div>
                      </div>

                      {/* Alert Settings */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          Cài đặt cảnh báo
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <label className="text-xs md:text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Bell className="w-4 h-4" />
                              Bật cảnh báo
                            </label>
                            <input
                              type="checkbox"
                              checked={data.alertEnabled}
                              onChange={(e) => isEditing && updateField('alertEnabled', e.target.checked)}
                              disabled={!isEditing}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                          </div>

                          <div>
                            <label className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Độ trễ cảnh báo (phút)
                            </label>
                            <Input
                              type="number"
                              value={data.alertDelay}
                              onChange={(e) => isEditing && updateField('alertDelay', parseInt(e.target.value))}
                              disabled={!isEditing || !data.alertEnabled}
                              className="text-sm"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="text-xs md:text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Thông báo Email
                            </label>
                            <input
                              type="checkbox"
                              checked={data.notifyEmail}
                              onChange={(e) => isEditing && updateField('notifyEmail', e.target.checked)}
                              disabled={!isEditing || !data.alertEnabled}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="text-xs md:text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Thông báo SMS
                            </label>
                            <input
                              type="checkbox"
                              checked={data.notifySMS}
                              onChange={(e) => isEditing && updateField('notifySMS', e.target.checked)}
                              disabled={!isEditing || !data.alertEnabled}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Advanced Settings */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4">
                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          Cài đặt nâng cao
                        </h3>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Tự động điều chỉnh
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Hệ thống tự động điều chỉnh nhiệt độ khi cần thiết
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={data.autoAdjust}
                            onChange={(e) => isEditing && updateField('autoAdjust', e.target.checked)}
                            disabled={!isEditing}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancel}
                              disabled={updateConfigMutation.isPending}
                            >
                              Hủy
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSave}
                              disabled={updateConfigMutation.isPending}
                              className="bg-gradient-to-r from-blue-600 to-cyan-600"
                            >
                              {updateConfigMutation.isPending ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Đang lưu...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  Lưu
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(config)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Info Box */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-teal-950/20">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-bold mb-2">Lưu ý khi cấu hình nhiệt độ:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    <li>Nhiệt độ mục tiêu nên nằm giữa min và max</li>
                    <li>Độ trễ cảnh báo giúp tránh cảnh báo giả khi có dao động nhỏ</li>
                    <li>Tự động điều chỉnh chỉ hoạt động khi có thiết bị điều khiển</li>
                    <li>Thông báo SMS có thể phát sinh chi phí</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
