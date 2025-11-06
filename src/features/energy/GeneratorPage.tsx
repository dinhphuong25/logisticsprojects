import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Fuel,
  Zap,
  Activity,
  RefreshCw,
  ArrowLeft,
  Gauge,
  PlayCircle,
  StopCircle,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  Droplet,
  Wind,
  ThermometerSun,
  Power,
  Wrench,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface GeneratorData {
  status: 'RUNNING' | 'STOPPED' | 'MAINTENANCE' | 'STANDBY'
  power: number
  fuelLevel: number
  runtime: number
  temperature: number
  oilPressure: number
  voltage: number
  frequency: number
  lastMaintenance: string
  nextMaintenance: string
  todayRuntime: number
  weekRuntime: number
  fuelConsumption: number
  co2Emission: number
  batteryVoltage: number
  coolantTemp: number
  loadPercentage: number
}

interface GridStatus {
  available: boolean
  voltage: number
  frequency: number
}

// Mock grid status
const fetchGridStatus = async (): Promise<GridStatus> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  // Simulate grid outage randomly (5% chance)
  const available = Math.random() > 0.05
  return {
    available,
    voltage: available ? 230 + Math.random() * 5 : 0,
    frequency: available ? 50 + Math.random() * 0.2 : 0,
  }
}

// Mock generator data function with advanced logic
const fetchGeneratorData = async (
  isRunning: boolean, 
  startTime: number,
  currentFuelLevel: number
): Promise<GeneratorData> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const runtime = isRunning ? Math.floor((Date.now() - startTime) / 1000) : 0
  
  // Fuel consumption calculation: ~3% per hour when running at 75% load
  const fuelConsumedPerSecond = isRunning ? 0.000833 : 0 // ~3% per hour
  const newFuelLevel = Math.max(0, currentFuelLevel - (fuelConsumedPerSecond * 100))
  
  // Temperature increases gradually when running
  const targetTemp = isRunning ? Math.min(70 + (runtime / 120), 85) : 25
  const tempVariation = Math.random() * 2 - 1 // ±1°C variation
  const currentTemp = targetTemp + tempVariation
  
  // Power output with smooth variation (using time-based smoothing)
  const basePower = 12
  const smoothPowerVariation = Math.sin(Date.now() / 5000) * 0.8 // Slower, smaller variation
  const currentPower = isRunning ? basePower + smoothPowerVariation : 0
  
  // Smooth voltage variation
  const baseVoltage = 230
  const voltageVariation = Math.sin(Date.now() / 3000) * 3 // ±3V smooth variation
  
  // Smooth frequency variation
  const baseFrequency = 50
  const frequencyVariation = Math.sin(Date.now() / 4000) * 0.15 // ±0.15Hz smooth variation
  
  return {
    status: isRunning ? 'RUNNING' : 'STOPPED',
    power: Math.max(0, Number(currentPower.toFixed(1))),
    fuelLevel: Number(newFuelLevel.toFixed(1)),
    runtime: runtime,
    temperature: Number(currentTemp.toFixed(0)),
    oilPressure: isRunning ? 50 + Math.sin(Date.now() / 6000) * 2 : 45,
    voltage: isRunning ? baseVoltage + voltageVariation : 0,
    frequency: isRunning ? baseFrequency + frequencyVariation : 0,
    lastMaintenance: '2025-10-15',
    nextMaintenance: '2026-01-15',
    todayRuntime: 120 + runtime / 60,
    weekRuntime: 840 + runtime / 60,
    fuelConsumption: isRunning ? 2.8 + Math.sin(Date.now() / 7000) * 0.2 : 0,
    co2Emission: 45.8 + (runtime / 3600) * 15,
    batteryVoltage: 12.6 + Math.sin(Date.now() / 8000) * 0.3,
    coolantTemp: isRunning ? 75 + Math.sin(Date.now() / 5000) * 5 : 30,
    loadPercentage: isRunning ? 65 + Math.sin(Date.now() / 6000) * 10 : 0,
  }
}

export default function GeneratorPage() {
  const navigate = useNavigate()
  const [refreshing, setRefreshing] = useState(false)
  const [generatorRunning, setGeneratorRunning] = useState(false)
  const [generatorStartTime, setGeneratorStartTime] = useState<number>(0)
  const fuelLevelRef = useRef(85)
  const lastUpdateTimeRef = useRef(Date.now())

  // Query grid status
  const { data: gridStatus } = useQuery<GridStatus>({
    queryKey: ['grid-status'],
    queryFn: fetchGridStatus,
    refetchInterval: 5000,
  })

  const { data: generatorData, refetch } = useQuery<GeneratorData>({
    queryKey: ['generator-data', generatorRunning, generatorStartTime],
    queryFn: () => {
      // Calculate fuel consumption only when running
      if (generatorRunning) {
        const now = Date.now()
        const timeDiff = (now - lastUpdateTimeRef.current) / 1000 // seconds
        const fuelConsumedPerSecond = 0.000833 // ~3% per hour
        fuelLevelRef.current = Math.max(0, fuelLevelRef.current - (fuelConsumedPerSecond * timeDiff * 100))
        lastUpdateTimeRef.current = now
      }
      return fetchGeneratorData(generatorRunning, generatorStartTime, fuelLevelRef.current)
    },
    refetchInterval: 2000,
  })

  const handleGeneratorStart = useCallback(() => {
    if (fuelLevelRef.current < 15) {
      toast.error('❌ Không thể khởi động: Nhiên liệu quá thấp!', {
        description: 'Cần tiếp nhiên liệu trước khi khởi động máy phát điện.',
        duration: 5000,
      })
      return
    }
    setGeneratorStartTime(Date.now())
    lastUpdateTimeRef.current = Date.now()
    setGeneratorRunning(true)
    toast.success('✅ Máy phát điện đã được khởi động!', {
      description: 'Hệ thống đang khởi tạo và ổn định công suất...',
      duration: 3000,
    })
  }, [])

  const handleGeneratorStop = useCallback(() => {
    setGeneratorRunning(false)
    toast.info('🔴 Máy phát điện đã dừng', {
      description: 'Hệ thống đang làm mát và dừng an toàn.',
      duration: 3000,
    })
  }, [])

  // Safety checks - Auto shutdown on critical conditions
  useEffect(() => {
    if (!generatorData || !generatorRunning) return

    // Critical: Low fuel auto-shutdown
    if (generatorData.fuelLevel < 10) {
      toast.error('🚨 TẮT MÁY KHẨN CẤP: Nhiên liệu cực thấp!', {
        description: `Mức nhiên liệu: ${generatorData.fuelLevel.toFixed(0)}%. Đã tắt máy để bảo vệ động cơ.`,
        duration: 10000,
      })
      handleGeneratorStop()
      return
    }

    // Critical: High temperature auto-shutdown
    if (generatorData.temperature > 92) {
      toast.error('🚨 TẮT MÁY KHẨN CẤP: Nhiệt độ quá cao!', {
        description: `Nhiệt độ: ${generatorData.temperature.toFixed(0)}°C. Nguy cơ hư hỏng động cơ.`,
        duration: 10000,
      })
      handleGeneratorStop()
      return
    }

    // Warning: Low fuel
    if (generatorData.fuelLevel < 20 && generatorData.fuelLevel >= 10) {
      toast.warning('⚠️ Cảnh báo nhiên liệu thấp', {
        description: `Còn ${generatorData.fuelLevel.toFixed(0)}%. Chuẩn bị tiếp nhiên liệu.`,
        duration: 5000,
      })
    }

    // Warning: High temperature
    if (generatorData.temperature > 85 && generatorData.temperature <= 92) {
      toast.warning('⚠️ Nhiệt độ cao', {
        description: `Nhiệt độ: ${generatorData.temperature.toFixed(0)}°C. Theo dõi chặt chẽ.`,
        duration: 5000,
      })
    }

    // Info: Long runtime
    if (generatorData.runtime > 6 * 3600) {
      toast.info('ℹ️ Đã chạy lâu', {
        description: `Thời gian chạy: ${Math.floor(generatorData.runtime / 3600)} giờ. Nên bảo trì sớm.`,
        duration: 5000,
      })
    }
  }, [generatorData, generatorRunning, handleGeneratorStop])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleGeneratorToggle = () => {
    if (!generatorRunning) {
      handleGeneratorStart()
    } else {
      handleGeneratorStop()
    }
  }

  const formatRuntime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/dashboard')} variant="outline" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent flex items-center gap-3">
                <Fuel className="w-10 h-10 text-red-500" />
                Máy phát điện dự phòng
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Giám sát và điều khiển nguồn điện dự phòng
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Grid Outage Alert */}
        {!gridStatus?.available && (
          <Card className="border-0 shadow-xl bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                <div className="flex-1">
                  <p className="font-bold text-lg">⚠️ CẢNH BÁO MẤT ĐIỆN LƯỚI</p>
                  <p className="text-sm opacity-90">
                    Điện lưới không khả dụng. {generatorRunning ? 'Máy phát đang cung cấp điện dự phòng.' : 'Vui lòng khởi động máy phát điện để duy trì nguồn điện.'}
                  </p>
                </div>
                {!generatorRunning && (
                  <Button 
                    onClick={handleGeneratorStart}
                    className="bg-white text-red-600 hover:bg-gray-100 font-bold"
                    size="lg"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Khởi động ngay
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fuel Warning */}
        {fuelLevelRef.current < 25 && (
          <Card className={`border-0 shadow-xl text-white ${
            fuelLevelRef.current < 15 
              ? 'bg-gradient-to-r from-red-500 to-pink-500' 
              : 'bg-gradient-to-r from-yellow-500 to-orange-500'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Droplet className="w-6 h-6" />
                <div className="flex-1">
                  <p className="font-bold">
                    {fuelLevelRef.current < 15 ? '🚨 CẢNH BÁO NGHIÊM TRỌNG: Nhiên liệu cực thấp!' : '⚠️ Cảnh báo: Nhiên liệu thấp'}
                  </p>
                  <p className="text-sm opacity-90">
                    Mức nhiên liệu còn {fuelLevelRef.current.toFixed(0)}%. 
                    {fuelLevelRef.current < 15 
                      ? ' Không thể khởi động! Cần tiếp nhiên liệu ngay lập tức.' 
                      : ' Nên tiếp nhiên liệu sớm để đảm bảo nguồn dự phòng.'}
                  </p>
                </div>
                {fuelLevelRef.current < 15 && (
                  <Badge className="bg-white text-red-600 text-xs px-2 py-1">
                    KHẨN CẤP
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Control Panel */}
        <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">Bảng điều khiển</p>
                <p className="text-xs text-gray-500 font-normal">Khởi động và quản lý máy phát điện</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Control Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleGeneratorToggle}
                disabled={generatorRunning || fuelLevelRef.current < 15}
                className={`h-28 text-2xl font-bold shadow-lg ${
                  generatorRunning || fuelLevelRef.current < 15
                    ? 'bg-gray-300 cursor-not-allowed dark:bg-gray-700' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:shadow-2xl hover:scale-105 transition-all'
                }`}
              >
                <div className="flex flex-col items-center">
                  <PlayCircle className="w-10 h-10 mb-2" />
                  <span>Khởi động</span>
                  {fuelLevelRef.current < 15 && (
                    <span className="text-xs font-normal mt-1 opacity-70">Nhiên liệu thấp</span>
                  )}
                </div>
              </Button>
              
              <Button
                onClick={handleGeneratorToggle}
                disabled={!generatorRunning}
                className={`h-28 text-2xl font-bold shadow-lg ${
                  !generatorRunning 
                    ? 'bg-gray-300 cursor-not-allowed dark:bg-gray-700' 
                    : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white hover:shadow-2xl hover:scale-105 transition-all'
                }`}
              >
                <div className="flex flex-col items-center">
                  <StopCircle className="w-10 h-10 mb-2" />
                  <span>Tắt máy</span>
                  {generatorRunning && (
                    <span className="text-xs font-normal mt-1 opacity-70">
                      Đã chạy {Math.floor((generatorData?.runtime || 0) / 60)} phút
                    </span>
                  )}
                </div>
              </Button>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Trạng thái lưới</p>
                <p className={`text-sm font-bold ${gridStatus?.available ? 'text-blue-600' : 'text-red-600'}`}>
                  {gridStatus?.available ? '✓ Bình thường' : '✗ Mất điện'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Nhiên liệu</p>
                <p className={`text-sm font-bold ${
                  fuelLevelRef.current > 50 ? 'text-green-600' : fuelLevelRef.current > 20 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {fuelLevelRef.current.toFixed(0)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Trạng thái</p>
                <p className={`text-sm font-bold ${generatorRunning ? 'text-green-600' : 'text-gray-600'}`}>
                  {generatorRunning ? '⚡ Hoạt động' : '⚫ Dừng'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Power Output */}
          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 overflow-hidden group hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
                  generatorRunning 
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500 animate-pulse' 
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}>
                  <Zap className={`w-7 h-7 ${generatorRunning ? 'text-white' : 'text-gray-500'}`} />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Công suất</p>
              <p className={`text-4xl font-bold mb-2 ${
                generatorRunning ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'
              }`}>
                {(generatorData?.power || 0).toFixed(1)} kW
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Activity className="w-3 h-3" />
                <span>Công suất tối đa: 15 kW</span>
              </div>
            </CardContent>
          </Card>

          {/* Fuel Level */}
          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 overflow-hidden group hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Droplet className="w-7 h-7 text-white" />
                </div>
                <Badge className={
                  (generatorData?.fuelLevel || 0) > 50 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                    : (generatorData?.fuelLevel || 0) > 30
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                }>
                  {(generatorData?.fuelLevel || 0) > 50 ? 'Tốt' : (generatorData?.fuelLevel || 0) > 30 ? 'Trung bình' : 'Thấp'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mức nhiên liệu</p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {(generatorData?.fuelLevel || 0).toFixed(0)}%
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    (generatorData?.fuelLevel || 0) > 50 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : (generatorData?.fuelLevel || 0) > 30
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-red-500 to-pink-500'
                  }`}
                  style={{ width: `${generatorData?.fuelLevel || 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Temperature */}
          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 overflow-hidden group hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <ThermometerSun className="w-7 h-7 text-white" />
                </div>
                <Badge className={
                  (generatorData?.temperature || 0) < 80 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30'
                }>
                  {(generatorData?.temperature || 0) < 80 ? 'Bình thường' : 'Cao'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nhiệt độ</p>
              <p className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                {(generatorData?.temperature || 0).toFixed(0)}°C
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Wind className="w-3 h-3" />
                <span>Nhiệt độ tối đa: 90°C</span>
              </div>
            </CardContent>
          </Card>

          {/* Runtime */}
          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 overflow-hidden group hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
                  generatorRunning 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}>
                  <Clock className={`w-7 h-7 ${generatorRunning ? 'text-white' : 'text-gray-500'}`} />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Thời gian chạy</p>
              <p className={`text-3xl font-bold mb-2 ${
                generatorRunning ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'
              }`}>
                {generatorRunning && generatorData?.runtime ? formatRuntime(generatorData.runtime) : '0h 0m 0s'}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Activity className="w-3 h-3" />
                <span>{generatorRunning ? 'Đang hoạt động' : 'Không hoạt động'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">Thông số kỹ thuật</p>
                <p className="text-xs text-gray-500 font-normal">Giám sát chi tiết các thông số</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Oil Pressure */}
              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Áp suất dầu</span>
                  {(generatorData?.oilPressure || 0) > 40 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {generatorData?.oilPressure.toFixed(1)} PSI
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      (generatorData?.oilPressure || 0) > 40 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(((generatorData?.oilPressure || 0) / 60) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">Chuẩn: 40-60 PSI</p>
              </div>

              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Điện áp</span>
                  {generatorRunning && Math.abs((generatorData?.voltage || 0) - 230) < 10 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : generatorRunning ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-300" />
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {generatorData?.voltage.toFixed(1)} V
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      generatorRunning ? 'bg-blue-500' : 'bg-gray-400'
                    }`}
                    style={{ width: generatorRunning ? '100%' : '0%' }}
                  />
                </div>
                <p className="text-xs text-gray-500">Chuẩn: 220-240 V</p>
              </div>

              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Tần số</span>
                  {generatorRunning && Math.abs((generatorData?.frequency || 0) - 50) < 1 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : generatorRunning ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-300" />
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {generatorData?.frequency.toFixed(2)} Hz
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      generatorRunning ? 'bg-purple-500' : 'bg-gray-400'
                    }`}
                    style={{ width: generatorRunning ? '100%' : '0%' }}
                  />
                </div>
                <p className="text-xs text-gray-500">Chuẩn: 49-51 Hz</p>
              </div>

              {/* Load Percentage */}
              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Tải hiện tại</span>
                  {(generatorData?.loadPercentage || 0) < 80 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {generatorData?.loadPercentage.toFixed(0)}%
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      (generatorData?.loadPercentage || 0) < 80 ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${generatorData?.loadPercentage || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">Tối ưu: 60-80%</p>
              </div>

              {/* Battery Voltage */}
              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Pin khởi động</span>
                  {(generatorData?.batteryVoltage || 0) > 12 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {generatorData?.batteryVoltage.toFixed(1)} V
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      (generatorData?.batteryVoltage || 0) > 12 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(((generatorData?.batteryVoltage || 0) / 14) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">Chuẩn: 12-14 V</p>
              </div>

              {/* Coolant Temperature */}
              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Nhiệt độ làm mát</span>
                  {(generatorData?.coolantTemp || 0) < 85 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {generatorData?.coolantTemp.toFixed(0)}°C
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      (generatorData?.coolantTemp || 0) < 85 ? 'bg-blue-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(((generatorData?.coolantTemp || 0) / 100) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">Tối đa: 85°C</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics and Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Runtime Statistics */}
          <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">Thống kê hoạt động</p>
                  <p className="text-xs text-gray-500 font-normal">Tổng hợp thời gian chạy</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hôm nay</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {generatorData?.todayRuntime.toFixed(0)} phút
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tuần này</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {(generatorData?.weekRuntime || 0 / 60).toFixed(0)} giờ
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tiêu hao nhiên liệu</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {generatorData?.fuelConsumption.toFixed(1)} L/h
                  </p>
                </div>
                <Droplet className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance & Alerts */}
          <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">Bảo trì & Cảnh báo</p>
                  <p className="text-xs text-gray-500 font-normal">Lịch bảo trì và thông báo</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Maintenance Info */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-l-4 border-indigo-500">
                <div className="flex items-start gap-3">
                  <Wrench className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-indigo-800 dark:text-indigo-400 mb-3">Thông tin bảo trì</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Bảo trì lần cuối:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {new Date(generatorData?.lastMaintenance || '').toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Bảo trì tiếp theo:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {new Date(generatorData?.nextMaintenance || '').toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Low Fuel Alert */}
              {(generatorData?.fuelLevel || 0) < 30 && (
                <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800 dark:text-yellow-400">Cảnh báo nhiên liệu thấp</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        Mức nhiên liệu chỉ còn {generatorData?.fuelLevel.toFixed(0)}%. Vui lòng tiếp nhiên liệu để đảm bảo nguồn dự phòng.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status OK */}
              {!generatorRunning && (generatorData?.fuelLevel || 0) >= 30 && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-400">Hệ thống sẵn sàng</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        Máy phát điện đã sẵn sàng để khởi động khi cần thiết.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Running Status */}
              {generatorRunning && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-blue-600 mt-0.5 animate-pulse" />
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-400">Đang hoạt động</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        Máy phát điện đang cung cấp {generatorData?.power.toFixed(1)} kW công suất.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
