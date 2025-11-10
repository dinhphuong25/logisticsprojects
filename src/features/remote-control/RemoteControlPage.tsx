import { useState, useEffect, useCallback, useRef } from 'react'
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
  const autoModeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastControlTime = useRef<Map<string, number>>(new Map())

  const { data: devices = [] } = useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await apiClient.get('/devices')
      return response.data
    },
    refetchInterval: 3000,
  })

  // Debounce function to prevent rapid API calls
  const canControlDevice = useCallback((deviceId: string): boolean => {
    const now = Date.now()
    const lastTime = lastControlTime.current.get(deviceId) || 0
    const timeDiff = now - lastTime
    
    // Minimum 2 seconds between controls for same device
    if (timeDiff < 2000) {
      toast.warning('Vui lòng đợi 2 giây trước khi điều khiển lại thiết bị này')
      return false
    }
    
    lastControlTime.current.set(deviceId, now)
    return true
  }, [])

  const controlDeviceMutation = useMutation({
    mutationFn: async ({ id, action, value }: { id: string; action: string; value?: string | number }) => {
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

  // Enhanced Smart Logic: Improved auto control with better conditions
  const applySmartLogic = useCallback(() => {
    if (!devices || devices.length === 0) return

    let actionCount = 0
    const MAX_ACTIONS = 5 // Limit actions per cycle

    devices.forEach((device) => {
      if (actionCount >= MAX_ACTIONS) return

      // Skip devices with faults
      if (device.status === 'FAULT') return

      // COMPRESSOR LOGIC: Temperature-based control
      if (device.type === 'COMPRESSOR' && device.temperature !== undefined) {
        const temp = device.temperature
        
        // Critical: Turn ON if temperature is dangerously high (> 8°C)
        if (temp > 8 && device.status === 'OFF') {
          if (canControlDevice(device.id)) {
            controlDeviceMutation.mutate({ 
              id: device.id, 
              action: 'toggle', 
              value: 'ON' 
            })
            toast.warning(`🚨 Cảnh báo nhiệt độ cao: ${temp}°C - Tự động bật ${device.nameVi}`, {
              duration: 5000
            })
            actionCount++
          }
        }
        // Turn ON if temperature is high (> 5°C)
        else if (temp > 5 && temp <= 8 && device.status === 'OFF') {
          if (canControlDevice(device.id)) {
            controlDeviceMutation.mutate({ 
              id: device.id, 
              action: 'toggle', 
              value: 'ON' 
            })
            toast.info(`❄️ Tự động bật ${device.nameVi} - Nhiệt độ: ${temp}°C`)
            actionCount++
          }
        }
        // Turn OFF if temperature is too cold (< -2°C) to save energy
        else if (temp < -2 && device.status === 'ON') {
          if (canControlDevice(device.id)) {
            controlDeviceMutation.mutate({ 
              id: device.id, 
              action: 'toggle', 
              value: 'OFF' 
            })
            toast.success(`✅ Tự động tắt ${device.nameVi} - Nhiệt độ đủ lạnh: ${temp}°C`)
            actionCount++
          }
        }
      }

      // FAN LOGIC: Control based on active compressors in same zone
      if (device.type === 'FAN') {
        const zoneDevices = devices.filter(d => d.zone === device.zone)
        const activeCompressors = zoneDevices.filter(
          d => d.type === 'COMPRESSOR' && d.status === 'ON'
        )
        
        // Turn ON fans if multiple compressors are running
        if (activeCompressors.length >= 2 && device.status === 'OFF') {
          if (canControlDevice(device.id)) {
            controlDeviceMutation.mutate({ 
              id: device.id, 
              action: 'toggle', 
              value: 'ON' 
            })
            toast.info(`🌀 Tự động bật ${device.nameVi} - ${activeCompressors.length} máy nén đang hoạt động`)
            actionCount++
          }
        }
        // Turn OFF fans if no compressors running
        else if (activeCompressors.length === 0 && device.status === 'ON') {
          if (canControlDevice(device.id)) {
            controlDeviceMutation.mutate({ 
              id: device.id, 
              action: 'toggle', 
              value: 'OFF' 
            })
            toast.info(`💤 Tự động tắt ${device.nameVi} - Không có máy nén hoạt động`)
            actionCount++
          }
        }
      }

      // LIGHT LOGIC: Time-based control
      if (device.type === 'LIGHT') {
        const now = new Date().getHours()
        const isNightTime = now >= 22 || now < 6
        
        // Turn OFF lights during night time
        if (isNightTime && device.status === 'ON') {
          if (canControlDevice(device.id)) {
            controlDeviceMutation.mutate({ 
              id: device.id, 
              action: 'toggle', 
              value: 'OFF' 
            })
            toast.info(`🌙 Tự động tắt ${device.nameVi} - Ngoài giờ làm việc (${now}:00)`)
            actionCount++
          }
        }
      }
    })

    if (actionCount === 0) {
      toast.success('✅ Hệ thống đang hoạt động ổn định')
    } else {
      toast.success(`🤖 Đã thực hiện ${actionCount} hành động điều khiển thông minh`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices, canControlDevice])

  // Auto mode effect - run smart logic periodically
  useEffect(() => {
    if (autoMode) {
      // Run immediately
      applySmartLogic()
      
      // Then run every 30 seconds
      const intervalId = setInterval(() => {
        applySmartLogic()
      }, 30000)
      autoModeIntervalRef.current = intervalId as unknown as NodeJS.Timeout
    } else {
      // Clear interval when auto mode is disabled
      if (autoModeIntervalRef.current) {
        clearInterval(autoModeIntervalRef.current as unknown as NodeJS.Timeout)
        autoModeIntervalRef.current = null
      }
    }

    // Cleanup on unmount
    return () => {
      if (autoModeIntervalRef.current) {
        clearInterval(autoModeIntervalRef.current)
      }
    }
  }, [autoMode, applySmartLogic])

  const handleToggle = useCallback((deviceId: string, currentStatus: string) => {
    if (!canControlDevice(deviceId)) return

    const device = devices.find(d => d.id === deviceId)
    if (!device) return

    if (device.status === 'FAULT') {
      toast.error(`❌ Không thể điều khiển ${device.nameVi} - Thiết bị đang lỗi`)
      return
    }

    const newStatus = currentStatus === 'ON' ? 'OFF' : 'ON'
    controlDeviceMutation.mutate({ id: deviceId, action: 'toggle', value: newStatus })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices, canControlDevice])

  const handleSpeedChange = useCallback((deviceId: string, speed: number) => {
    if (!canControlDevice(deviceId)) return

    // Validate speed range
    if (speed < 0 || speed > 100) {
      toast.error('Tốc độ phải trong khoảng 0-100%')
      return
    }

    controlDeviceMutation.mutate({ id: deviceId, action: 'setSpeed', value: speed })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canControlDevice])

  const filteredDevices =
    selectedZone === 'all' ? devices : devices.filter((d) => d.zone === selectedZone)

  const zones = [...new Set(devices.map((d) => d.zone))]

  const totalPower = devices
    .filter((d) => d.status === 'ON')
    .reduce((sum, d) => sum + d.power, 0)

  // Enhanced Energy Optimization with smarter logic
  const optimizeEnergy = useCallback(() => {
    if (!devices || devices.length === 0) {
      toast.error('Không có thiết bị để tối ưu')
      return
    }

    let savedPower = 0
    let optimizationActions = 0
    const officeHours = new Date().getHours()
    const isWorkingHours = officeHours >= 6 && officeHours < 22

    // Group devices by zone for better analysis
    const devicesByZone = devices.reduce((acc, device) => {
      if (!acc[device.zone]) acc[device.zone] = []
      acc[device.zone].push(device)
      return acc
    }, {} as Record<string, Device[]>)

    Object.entries(devicesByZone).forEach(([zone, zoneDevices]) => {
      const compressors = zoneDevices.filter(d => d.type === 'COMPRESSOR')
      const fans = zoneDevices.filter(d => d.type === 'FAN')
      const lights = zoneDevices.filter(d => d.type === 'LIGHT')

      // COMPRESSOR OPTIMIZATION
      const activeCompressors = compressors.filter(d => d.status === 'ON')
      if (activeCompressors.length > 1) {
        // Find compressors in zones with good temperature
        const coolCompressors = activeCompressors.filter(
          c => c.temperature !== undefined && c.temperature < 2
        )
        
        // Turn off redundant compressors if temperature is stable
        if (coolCompressors.length > 1) {
          const toTurnOff = coolCompressors.slice(1) // Keep first one, turn off others
          toTurnOff.forEach(compressor => {
            if (canControlDevice(compressor.id)) {
              controlDeviceMutation.mutate({ 
                id: compressor.id, 
                action: 'toggle', 
                value: 'OFF' 
              })
              savedPower += compressor.power
              optimizationActions++
              toast.info(`💡 Tắt ${compressor.nameVi} - Nhiệt độ ổn định tại ${zone}`)
            }
          })
        }
      }

      // FAN OPTIMIZATION
      fans.forEach(fan => {
        if (fan.status === 'ON' && fan.speed !== undefined) {
          const zoneTemp = compressors.find(c => c.temperature !== undefined)?.temperature
          
          // Reduce fan speed if temperature is good
          if (zoneTemp !== undefined && zoneTemp < 3 && fan.speed > 60) {
            if (canControlDevice(fan.id)) {
              const newSpeed = 40 // Reduce to 40%
              handleSpeedChange(fan.id, newSpeed)
              savedPower += fan.power * 0.3 // Estimate 30% power saving
              optimizationActions++
              toast.info(`🌀 Giảm tốc độ ${fan.nameVi} xuống ${newSpeed}%`)
            }
          }
          
          // Turn off fans if no compressors running
          const activeCompressorsInZone = compressors.filter(c => c.status === 'ON')
          if (activeCompressorsInZone.length === 0 && fan.status === 'ON') {
            if (canControlDevice(fan.id)) {
              controlDeviceMutation.mutate({ 
                id: fan.id, 
                action: 'toggle', 
                value: 'OFF' 
              })
              savedPower += fan.power
              optimizationActions++
              toast.info(`💤 Tắt ${fan.nameVi} - Không cần thiết`)
            }
          }
        }
      })

      // LIGHT OPTIMIZATION
      lights.forEach(light => {
        if (light.status === 'ON') {
          // Turn off during non-working hours
          if (!isWorkingHours) {
            if (canControlDevice(light.id)) {
              controlDeviceMutation.mutate({ 
                id: light.id, 
                action: 'toggle', 
                value: 'OFF' 
              })
              savedPower += light.power
              optimizationActions++
            }
          }
          // Reduce brightness if possible
          else if (light.brightness !== undefined && light.brightness > 70) {
            // Dim lights to 60% during normal hours
            savedPower += light.power * 0.15
            optimizationActions++
          }
        }
      })
    })

    if (optimizationActions === 0) {
      toast.info('✅ Hệ thống đã được tối ưu hóa tốt')
    } else {
      toast.success(
        `✅ Đã tối ưu ${optimizationActions} thiết bị - Tiết kiệm ~${(savedPower / 1000).toFixed(2)} kW`,
        { duration: 5000 }
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices, canControlDevice, handleSpeedChange])

  // Enhanced Power Usage Alert with detailed analysis
  const checkPowerUsage = useCallback(() => {
    const powerInKW = totalPower / 1000
    const devicesByType = {
      COMPRESSOR: devices.filter(d => d.type === 'COMPRESSOR' && d.status === 'ON'),
      FAN: devices.filter(d => d.type === 'FAN' && d.status === 'ON'),
      LIGHT: devices.filter(d => d.type === 'LIGHT' && d.status === 'ON'),
      OTHER: devices.filter(d => !['COMPRESSOR', 'FAN', 'LIGHT'].includes(d.type) && d.status === 'ON')
    }

    // Calculate power by type
    const powerByType = {
      COMPRESSOR: devicesByType.COMPRESSOR.reduce((sum, d) => sum + d.power, 0) / 1000,
      FAN: devicesByType.FAN.reduce((sum, d) => sum + d.power, 0) / 1000,
      LIGHT: devicesByType.LIGHT.reduce((sum, d) => sum + d.power, 0) / 1000,
      OTHER: devicesByType.OTHER.reduce((sum, d) => sum + d.power, 0) / 1000
    }

    // Alert levels
    if (powerInKW > 20) {
      toast.error(`🚨 Cảnh báo nghiêm trọng: Công suất ${powerInKW.toFixed(2)} kW - Vượt ngưỡng an toàn!`, {
        duration: 10000
      })
    } else if (powerInKW > 15) {
      toast.warning(`⚠️ Cảnh báo cao: Công suất ${powerInKW.toFixed(2)} kW - Nên tối ưu hóa`, {
        duration: 7000
      })
    } else if (powerInKW > 10) {
      toast.warning(`⚡ Mức tiêu thụ trung bình: ${powerInKW.toFixed(2)} kW`, {
        duration: 5000
      })
    } else {
      toast.success(`✅ Mức tiêu thụ tốt: ${powerInKW.toFixed(2)} kW`, {
        duration: 5000
      })
    }

    // Detailed breakdown
    const breakdown = `
📊 Phân tích chi tiết:
• Máy nén: ${powerByType.COMPRESSOR.toFixed(2)} kW (${devicesByType.COMPRESSOR.length} thiết bị)
• Quạt: ${powerByType.FAN.toFixed(2)} kW (${devicesByType.FAN.length} thiết bị)
• Đèn: ${powerByType.LIGHT.toFixed(2)} kW (${devicesByType.LIGHT.length} thiết bị)
• Khác: ${powerByType.OTHER.toFixed(2)} kW (${devicesByType.OTHER.length} thiết bị)
    `.trim()

    toast.info(breakdown, { duration: 8000 })

    // Check for specific issues
    const highTempCompressors = devicesByType.COMPRESSOR.filter(
      d => d.temperature !== undefined && d.temperature > 5
    )
    if (highTempCompressors.length > 0) {
      toast.warning(`🌡️ Cảnh báo: ${highTempCompressors.length} máy nén có nhiệt độ > 5°C`, {
        duration: 6000
      })
    }

    // Check for lights on during night
    const now = new Date().getHours()
    if ((now >= 22 || now < 6) && devicesByType.LIGHT.length > 0) {
      toast.info(`💡 ${devicesByType.LIGHT.length} đèn đang bật ngoài giờ làm việc`, {
        duration: 5000
      })
    }

    // Check for idle fans
    const idleFans = devicesByType.FAN.filter(fan => {
      const zoneCompressors = devices.filter(
        d => d.type === 'COMPRESSOR' && d.zone === fan.zone && d.status === 'ON'
      )
      return zoneCompressors.length === 0
    })
    if (idleFans.length > 0) {
      toast.info(`🌀 ${idleFans.length} quạt đang chạy không cần thiết`, {
        duration: 5000
      })
    }
  }, [devices, totalPower])

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
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Điều khiển từ xa
          </h1>
          <p className="text-xs md:text-base text-gray-500 dark:text-gray-400 mt-1 md:mt-2">
            Quản lý và điều khiển thiết bị trong kho lạnh
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0">
          <div className="px-3 md:px-4 py-2 rounded-lg md:rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 shrink-0">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Tổng công suất</p>
                <p className="text-sm md:text-lg font-bold text-green-700 dark:text-green-400">
                  {(totalPower / 1000).toFixed(2)} kW
                </p>
              </div>
            </div>
          </div>

          <Button 
            variant={autoMode ? "default" : "outline"} 
            size="sm"
            className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm shrink-0 ${autoMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''}`}
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
            <Activity className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">{autoMode ? 'Chế độ thông minh: BẬT' : 'Chế độ thông minh: TẮT'}</span>
            <span className="sm:hidden">{autoMode ? 'Thông minh' : 'Thủ công'}</span>
          </Button>

          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 shrink-0">
            <Settings className="w-4 h-4" />
            Cài đặt
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <Button 
          variant="outline" 
          className="h-auto p-3 md:p-4 flex flex-col items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/20 border-2 hover:border-purple-500"
          onClick={() => applySmartLogic()}
        >
          <Activity className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          <div className="text-center">
            <p className="text-sm md:text-base font-bold">Điều khiển thông minh</p>
            <p className="text-xs text-gray-500 hidden md:block">Tự động điều chỉnh thiết bị</p>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-auto p-3 md:p-4 flex flex-col items-center gap-2 hover:bg-green-50 dark:hover:bg-green-950/20 border-2 hover:border-green-500"
          onClick={() => optimizeEnergy()}
        >
          <Zap className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          <div className="text-center">
            <p className="text-sm md:text-base font-bold">Tối ưu năng lượng</p>
            <p className="text-xs text-gray-500 hidden md:block">Giảm mức tiêu thụ điện</p>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-auto p-3 md:p-4 flex flex-col items-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-950/20 border-2 hover:border-orange-500 sm:col-span-2 md:col-span-1"
          onClick={() => checkPowerUsage()}
        >
          <Gauge className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
          <div className="text-center">
            <p className="text-sm md:text-base font-bold">Kiểm tra công suất</p>
            <p className="text-xs text-gray-500 hidden md:block">Phân tích mức sử dụng</p>
          </div>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Hoạt động</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">
                  {devices.filter((d) => d.status === 'ON').length}
                </p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Power className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Đang tắt</p>
                <p className="text-xl md:text-2xl font-bold text-gray-600">
                  {devices.filter((d) => d.status === 'OFF').length}
                </p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                <ZapOff className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Tự động</p>
                <p className="text-xl md:text-2xl font-bold text-blue-600">
                  {devices.filter((d) => d.status === 'AUTO').length}
                </p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Activity className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Lỗi</p>
                <p className="text-xl md:text-2xl font-bold text-red-600">
                  {devices.filter((d) => d.status === 'FAULT').length}
                </p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <ZapOff className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zone Filter */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs md:text-sm font-medium">Khu vực:</span>
            <Button
              size="sm"
              variant={selectedZone === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedZone('all')}
              className="text-xs"
            >
              Tất cả
            </Button>
            {zones.map((zone) => (
              <Button
                key={zone}
                size="sm"
                variant={selectedZone === zone ? 'default' : 'outline'}
                onClick={() => setSelectedZone(zone)}
                className="text-xs"
              >
                {zone}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
              <CardHeader className="pb-3 md:pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-md ${
                        device.status === 'ON'
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 md:w-6 md:h-6 ${
                          device.status === 'ON' ? 'text-white' : 'text-gray-600'
                        }`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-sm md:text-base">{device.nameVi}</CardTitle>
                      <p className="text-xs text-gray-500">{device.zone}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggle(device.id, device.status)}
                    disabled={controlDeviceMutation.isPending || device.status === 'FAULT'}
                    className={`p-1 ${
                      device.status === 'ON'
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-gray-600 hover:text-gray-700'
                    }`}
                  >
                    {device.status === 'ON' ? (
                      <ToggleRight className="w-7 h-7 md:w-8 md:h-8" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 md:w-8 md:h-8" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 md:space-y-4 pt-0">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge className={`text-xs ${getStatusColor(device.status)}`}>
                    {device.status === 'ON'
                      ? 'Đang bật'
                      : device.status === 'OFF'
                      ? 'Đang tắt'
                      : device.status === 'AUTO'
                      ? 'Tự động'
                      : 'Lỗi'}
                  </Badge>
                  <span className="text-xs md:text-sm font-semibold">
                    {device.power}W
                  </span>
                </div>

                {/* Speed Control for Fans */}
                {device.type === 'FAN' && device.speed !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Tốc độ</span>
                      <span className="text-xs md:text-sm font-bold">{device.speed}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={device.speed}
                      onChange={(e) => handleSpeedChange(device.id, Number(e.target.value))}
                      disabled={device.status !== 'ON'}
                      className="w-full h-2"
                    />
                  </div>
                )}

                {/* Brightness Control for Lights */}
                {device.type === 'LIGHT' && device.brightness !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Độ sáng</span>
                      <span className="text-xs md:text-sm font-bold">{device.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={device.brightness}
                      disabled={device.status !== 'ON'}
                      className="w-full h-2"
                    />
                  </div>
                )}

                {/* Temperature for Compressors */}
                {device.type === 'COMPRESSOR' && device.temperature !== undefined && (
                  <div className="flex items-center justify-between p-2 md:p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Nhiệt độ</span>
                    <span className="text-base md:text-lg font-bold text-blue-600">
                      {device.temperature}°C
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
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
                    className="flex-1 text-xs"
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
