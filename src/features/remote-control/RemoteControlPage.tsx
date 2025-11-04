import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Power,
  Wind,
  Lightbulb,
  DoorOpen,
  Thermometer,
  Gauge,
  Activity,
  ZapOff,
  Zap,
  Settings,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { toast } from 'sonner'

interface Device {
  id: string
  name: string
  nameVi: string
  type: 'COMPRESSOR' | 'FAN' | 'LIGHT' | 'DOOR' | 'HEATER'
  zone: string
  status: 'ON' | 'OFF' | 'AUTO' | 'FAULT'
  power: number // watts
  mode?: string
  temperature?: number
  speed?: number // 0-100
  brightness?: number // 0-100
}

export default function RemoteControlPage() {
  const queryClient = useQueryClient()
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [autoMode, setAutoMode] = useState(false)

  const { data: devices = [] } = useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await apiClient.get('/devices')
      return response.data
    },
    refetchInterval: 3000,
  })

  // Smart Logic: Auto control based on conditions
  const applySmartLogic = () => {
    devices.forEach((device) => {
      if (device.type === 'COMPRESSOR' && device.temperature) {
        // Auto turn on compressor if temperature > 5°C
        if (device.temperature > 5 && device.status === 'OFF') {
          controlDeviceMutation.mutate({ 
            id: device.id, 
            action: 'toggle', 
            value: 'ON' 
          })
          toast.info(`Tự động bật ${device.nameVi} - Nhiệt độ cao: ${device.temperature}°C`)
        }
        // Auto turn off if temperature < 0°C
        if (device.temperature < 0 && device.status === 'ON') {
          controlDeviceMutation.mutate({ 
            id: device.id, 
            action: 'toggle', 
            value: 'OFF' 
          })
          toast.info(`Tự động tắt ${device.nameVi} - Nhiệt độ đủ lạnh: ${device.temperature}°C`)
        }
      }

      // Auto control fans based on power usage
      if (device.type === 'FAN') {
        const activeCompressors = devices.filter(
          d => d.type === 'COMPRESSOR' && d.status === 'ON' && d.zone === device.zone
        ).length
        
        if (activeCompressors > 2 && device.status === 'OFF') {
          controlDeviceMutation.mutate({ 
            id: device.id, 
            action: 'toggle', 
            value: 'ON' 
          })
          toast.info(`Tự động bật quạt ${device.nameVi} - Nhiều máy nén đang hoạt động`)
        }
      }

      // Auto turn off lights if no activity
      if (device.type === 'LIGHT' && device.status === 'ON') {
        const now = new Date().getHours()
        // Turn off lights between 22:00 - 06:00 if no one is working
        if (now >= 22 || now < 6) {
          controlDeviceMutation.mutate({ 
            id: device.id, 
            action: 'toggle', 
            value: 'OFF' 
          })
          toast.info(`Tự động tắt đèn ${device.nameVi} - Ngoài giờ làm việc`)
        }
      }
    })
  }

  const controlDeviceMutation = useMutation({
    mutationFn: async ({ id, action, value }: { id: string; action: string; value?: any }) => {
      await apiClient.post(`/devices/${id}/control`, { action, value })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      toast.success('Đã điều khiển thiết bị')
    },
    onError: () => {
      toast.error('Không thể điều khiển thiết bị')
    },
  })

  const handleToggle = (deviceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ON' ? 'OFF' : 'ON'
    controlDeviceMutation.mutate({ id: deviceId, action: 'toggle', value: newStatus })
  }

  const handleSpeedChange = (deviceId: string, speed: number) => {
    controlDeviceMutation.mutate({ id: deviceId, action: 'setSpeed', value: speed })
  }

  const filteredDevices =
    selectedZone === 'all' ? devices : devices.filter((d) => d.zone === selectedZone)

  const zones = [...new Set(devices.map((d) => d.zone))]

  const totalPower = devices
    .filter((d) => d.status === 'ON')
    .reduce((sum, d) => sum + d.power, 0)

  // Smart Energy Optimization
  const optimizeEnergy = () => {
    // Turn off unnecessary devices
    const officeHours = new Date().getHours()
    const isWorkingHours = officeHours >= 6 && officeHours < 22

    devices.forEach((device) => {
      // Turn off lights in empty zones
      if (device.type === 'LIGHT' && !isWorkingHours && device.status === 'ON') {
        controlDeviceMutation.mutate({ 
          id: device.id, 
          action: 'toggle', 
          value: 'OFF' 
        })
      }

      // Optimize fan speed based on temperature
      if (device.type === 'FAN' && device.speed && device.speed > 70) {
        const zoneTemp = devices.find(
          d => d.type === 'COMPRESSOR' && d.zone === device.zone
        )?.temperature
        
        if (zoneTemp && zoneTemp < 2) {
          // Reduce fan speed if temperature is stable
          handleSpeedChange(device.id, 50)
          toast.info(`Giảm tốc độ quạt ${device.nameVi} - Nhiệt độ ổn định`)
        }
      }

      // Consolidate cooling power
      if (device.type === 'COMPRESSOR') {
        const zoneCompressors = devices.filter(
          d => d.type === 'COMPRESSOR' && d.zone === device.zone && d.status === 'ON'
        )
        
        // If too many compressors on, turn off some
        if (zoneCompressors.length > 2 && device.temperature && device.temperature < 3) {
          controlDeviceMutation.mutate({ 
            id: device.id, 
            action: 'toggle', 
            value: 'OFF' 
          })
          toast.info(`Tắt ${device.nameVi} để tiết kiệm năng lượng`)
        }
      }
    })

    toast.success('Đã tối ưu hóa mức tiêu thụ năng lượng')
  }

  // Power Usage Alert
  const checkPowerUsage = () => {
    const powerInKW = totalPower / 1000
    
    if (powerInKW > 15) {
      toast.warning(`⚠️ Công suất cao: ${powerInKW.toFixed(2)} kW - Cân nhắc tối ưu hóa`, {
        duration: 5000
      })
    }

    // Check for devices that have been on too long
    devices.forEach((device) => {
      if (device.type === 'LIGHT' && device.status === 'ON') {
        toast.info(`💡 ${device.nameVi} đang bật - Tắt nếu không cần thiết`)
      }
    })
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'COMPRESSOR':
        return Gauge
      case 'FAN':
        return Wind
      case 'LIGHT':
        return Lightbulb
      case 'DOOR':
        return DoorOpen
      case 'HEATER':
        return Thermometer
      default:
        return Power
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'OFF':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      case 'AUTO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'FAULT':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Điều khiển từ xa
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Quản lý và điều khiển thiết bị trong kho lạnh
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Tổng công suất</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                  {(totalPower / 1000).toFixed(2)} kW
                </p>
              </div>
            </div>
          </div>

          <Button 
            variant={autoMode ? "default" : "outline"} 
            className={`flex items-center gap-2 ${autoMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''}`}
            onClick={() => {
              setAutoMode(!autoMode)
              if (!autoMode) {
                applySmartLogic()
                toast.success('Đã bật chế độ điều khiển thông minh')
              } else {
                toast.info('Đã tắt chế độ điều khiển thông minh')
              }
            }}
          >
            <Activity className="w-4 h-4" />
            {autoMode ? 'Chế độ thông minh: BẬT' : 'Chế độ thông minh: TẮT'}
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Cài đặt
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/20 border-2 hover:border-purple-500"
          onClick={() => applySmartLogic()}
        >
          <Activity className="w-6 h-6 text-purple-600" />
          <div className="text-center">
            <p className="font-bold">Điều khiển thông minh</p>
            <p className="text-xs text-gray-500">Tự động điều chỉnh thiết bị</p>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50 dark:hover:bg-green-950/20 border-2 hover:border-green-500"
          onClick={() => optimizeEnergy()}
        >
          <Zap className="w-6 h-6 text-green-600" />
          <div className="text-center">
            <p className="font-bold">Tối ưu năng lượng</p>
            <p className="text-xs text-gray-500">Giảm mức tiêu thụ điện</p>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-950/20 border-2 hover:border-orange-500"
          onClick={() => checkPowerUsage()}
        >
          <Gauge className="w-6 h-6 text-orange-600" />
          <div className="text-center">
            <p className="font-bold">Kiểm tra công suất</p>
            <p className="text-xs text-gray-500">Phân tích mức sử dụng</p>
          </div>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">
                  {devices.filter((d) => d.status === 'ON').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Power className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đang tắt</p>
                <p className="text-2xl font-bold text-gray-600">
                  {devices.filter((d) => d.status === 'OFF').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                <ZapOff className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chế độ tự động</p>
                <p className="text-2xl font-bold text-blue-600">
                  {devices.filter((d) => d.status === 'AUTO').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lỗi</p>
                <p className="text-2xl font-bold text-red-600">
                  {devices.filter((d) => d.status === 'FAULT').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <ZapOff className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zone Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Khu vực:</span>
            <Button
              size="sm"
              variant={selectedZone === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedZone('all')}
            >
              Tất cả
            </Button>
            {zones.map((zone) => (
              <Button
                key={zone}
                size="sm"
                variant={selectedZone === zone ? 'default' : 'outline'}
                onClick={() => setSelectedZone(zone)}
              >
                {zone}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device) => {
          const Icon = getDeviceIcon(device.type)
          return (
            <Card
              key={device.id}
              className={`transition-all duration-300 hover:shadow-xl ${
                device.status === 'ON'
                  ? 'border-2 border-green-500 shadow-lg shadow-green-500/20'
                  : device.status === 'FAULT'
                  ? 'border-2 border-red-500'
                  : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                        device.status === 'ON'
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          device.status === 'ON' ? 'text-white' : 'text-gray-600'
                        }`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">{device.nameVi}</CardTitle>
                      <p className="text-xs text-gray-500">{device.zone}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggle(device.id, device.status)}
                    disabled={controlDeviceMutation.isPending || device.status === 'FAULT'}
                    className={
                      device.status === 'ON'
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-gray-600 hover:text-gray-700'
                    }
                  >
                    {device.status === 'ON' ? (
                      <ToggleRight className="w-8 h-8" />
                    ) : (
                      <ToggleLeft className="w-8 h-8" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(device.status)}>
                    {device.status === 'ON'
                      ? 'Đang bật'
                      : device.status === 'OFF'
                      ? 'Đang tắt'
                      : device.status === 'AUTO'
                      ? 'Tự động'
                      : 'Lỗi'}
                  </Badge>
                  <span className="text-sm font-semibold">
                    {device.power}W
                  </span>
                </div>

                {/* Speed Control for Fans */}
                {device.type === 'FAN' && device.speed !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tốc độ</span>
                      <span className="text-sm font-bold">{device.speed}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={device.speed}
                      onChange={(e) => handleSpeedChange(device.id, Number(e.target.value))}
                      disabled={device.status !== 'ON'}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Brightness Control for Lights */}
                {device.type === 'LIGHT' && device.brightness !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Độ sáng</span>
                      <span className="text-sm font-bold">{device.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={device.brightness}
                      disabled={device.status !== 'ON'}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Temperature for Compressors */}
                {device.type === 'COMPRESSOR' && device.temperature !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Nhiệt độ</span>
                    <span className="text-lg font-bold text-blue-600">
                      {device.temperature}°C
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      controlDeviceMutation.mutate({ id: device.id, action: 'setMode', value: 'AUTO' })
                    }
                    disabled={device.status === 'FAULT'}
                  >
                    Tự động
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      controlDeviceMutation.mutate({ id: device.id, action: 'reset' })
                    }
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredDevices.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Power className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Không có thiết bị trong khu vực này</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
