import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Thermometer, 
  Bell, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Zap,
  Shield
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

export default function TemperatureSettingsPage() {
  const queryClient = useQueryClient()
  const [editingConfig, setEditingConfig] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<TemperatureConfig>>({})

  // Fetch zones
  const { data: zones = [] } = useQuery<Zone[]>({
    queryKey: ['zones'],
    queryFn: async () => {
      const res = await apiClient.get('/zones')
      return res.data
    }
  })

  // Fetch sensors
  const { data: sensors = [] } = useQuery<Sensor[]>({
    queryKey: ['sensors'],
    queryFn: async () => {
      const res = await apiClient.get('/sensors')
      return res.data
    }
  })

  // Mock temperature configs
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

  const temperatureSensors = sensors.filter(s => s.type === 'TEMPERATURE')
  const activeSensors = temperatureSensors.filter(s => s.status === 'ONLINE').length
  const totalAlerts = temperatureConfigs.filter(c => c.alertEnabled).length

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Cấu hình Nhiệt độ
          </h1>
          <p className="text-xs md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
            Quản lý ngưỡng nhiệt độ và cảnh báo cho từng khu vực
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['zones'] })}>
            <RefreshCw className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
            <p className="text-xl md:text-3xl font-bold text-green-600">{activeSensors}/{temperatureSensors.length}</p>
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
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
          Cấu hình theo khu vực
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {temperatureConfigs.map((config) => {
            const isEditing = editingConfig === config.id
            const data = isEditing ? (formData as TemperatureConfig) : config
            const zoneSensors = sensors.filter(s => s.zone?.id === config.zoneId && s.type === 'TEMPERATURE')

            return (
              <Card key={config.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50">
                  <div className="flex items-center justify-between">
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
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
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
                  <div className="flex items-center justify-end gap-2">
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
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
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
    </div>
  )
}
