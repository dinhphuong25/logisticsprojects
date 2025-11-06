import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sun,
  Battery,
  Zap,
  Activity,
  TrendingUp,
  Leaf,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  CloudSun,
  Power,
  Gauge,
  Fuel,
  PlayCircle,
  StopCircle,
  Settings,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SolarData {
  currentGeneration: number
  todayGeneration: number
  monthGeneration: number
  batteryLevel: number
  batteryStatus: 'CHARGING' | 'DISCHARGING' | 'IDLE'
  savingsMonth: number
  co2Saved: number
  panelEfficiency: number
  solarPower: number
  gridPower: number
  totalConsumption: number
  peakGeneration: number
  todayChange: number
  yearGeneration: number
}

interface GeneratorData {
  status: 'RUNNING' | 'STOPPED' | 'MAINTENANCE'
  power: number
  fuelLevel: number
  runtime: number
  temperature: number
  oilPressure: number
  voltage: number
  frequency: number
  lastMaintenance: string
  nextMaintenance: string
}

// Mock data function with realistic values
const fetchSolarData = async (): Promise<SolarData> => {
  await new Promise(resolve => setTimeout(resolve, 400))
  
  // Simulate varying values based on time
  const hour = new Date().getHours()
  const isDaytime = hour >= 6 && hour <= 18
  const peakHours = hour >= 10 && hour <= 14
  
  const currentGen = isDaytime 
    ? (peakHours ? 12.5 + Math.random() * 3 : 8 + Math.random() * 4)
    : 0
  
  return {
    currentGeneration: Number(currentGen.toFixed(1)),
    todayGeneration: 142.5 + Math.random() * 20,
    monthGeneration: 4280.8 + Math.random() * 500,
    yearGeneration: 48650.2,
    batteryLevel: 75 + Math.random() * 20,
    batteryStatus: currentGen > 10 ? 'CHARGING' : currentGen > 0 ? 'IDLE' : 'DISCHARGING',
    savingsMonth: 2450 + Math.random() * 200,
    co2Saved: 3200 + Math.random() * 300,
    panelEfficiency: 88 + Math.random() * 8,
    solarPower: Number(currentGen.toFixed(1)),
    gridPower: Number((15 - currentGen).toFixed(1)),
    totalConsumption: 15.2 + Math.random() * 2,
    peakGeneration: 15.8,
    todayChange: 12 + Math.random() * 10,
  }
}

// Mock generator data function
const fetchGeneratorData = async (): Promise<GeneratorData> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return {
    status: 'STOPPED',
    power: 0,
    fuelLevel: 75 + Math.random() * 20,
    runtime: 0,
    temperature: 25 + Math.random() * 5,
    oilPressure: 45 + Math.random() * 10,
    voltage: 230 + Math.random() * 10,
    frequency: 50 + Math.random() * 0.5,
    lastMaintenance: '2025-10-15',
    nextMaintenance: '2026-01-15',
  }
}

export default function EnergyManagementPage() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day')
  const [refreshing, setRefreshing] = useState(false)
  const [generatorRunning, setGeneratorRunning] = useState(false)
  const [generatorStartTime, setGeneratorStartTime] = useState<number>(0)

  const { data: solarData, refetch, isLoading } = useQuery<SolarData>({
    queryKey: ['solar-energy'],
    queryFn: fetchSolarData,
    refetchInterval: 5000, // Real-time updates every 5s
  })

  const { data: generatorData, refetch: refetchGenerator } = useQuery<GeneratorData>({
    queryKey: ['generator-data', generatorRunning],
    queryFn: async () => {
      const data = await fetchGeneratorData()
      if (generatorRunning) {
        const runtime = Math.floor((Date.now() - generatorStartTime) / 1000)
        return {
          ...data,
          status: 'RUNNING' as const,
          power: 10 + Math.random() * 5,
          runtime: runtime,
          temperature: 65 + Math.random() * 15,
          oilPressure: 48 + Math.random() * 8,
        }
      }
      return data
    },
    refetchInterval: 3000, // Update every 3s
  })

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400">Đang tải dữ liệu năng lượng...</p>
        </div>
      </div>
    )
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    await refetchGenerator()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleGeneratorToggle = () => {
    if (!generatorRunning) {
      setGeneratorStartTime(Date.now())
    }
    setGeneratorRunning(!generatorRunning)
    // In real app, this would call an API to start/stop the generator
  }

  const solarPercentage = solarData ? Math.round((solarData.solarPower / solarData.totalConsumption) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-3 md:p-6">
      <div className="max-w-full mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <Button onClick={() => navigate('/dashboard')} variant="outline" size="icon" className="shrink-0">
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
                <Sun className="w-6 h-6 md:w-10 md:h-10 text-yellow-500 animate-pulse" />
                Năng lượng mặt trời
              </h1>
              <p className="text-xs md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
                Giám sát và quản lý hệ thống năng lượng xanh
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0">
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              {['day', 'week', 'month'].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range as 'day' | 'week' | 'month')}
                  className={`text-xs md:text-sm ${timeRange === range ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : ''}`}
                >
                  {range === 'day' ? 'Ngày' : range === 'week' ? 'Tuần' : 'Tháng'}
                </Button>
              ))}
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              size="sm"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shrink-0"
            >
              <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 md:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Làm mới</span>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {/* Solar Generation */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white overflow-hidden group hover:shadow-2xl transition-all relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 animate-pulse"></div>
            <CardContent className="p-4 md:p-6 relative z-10">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Sun className="w-6 h-6 md:w-7 md:h-7 text-white animate-spin-slow" />
                </div>
                <Badge className="bg-white/30 backdrop-blur-sm text-white border-0 text-xs">
                  Hoạt động
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-white/80 mb-1">Phát điện hiện tại</p>
              <p className="text-3xl md:text-5xl font-bold text-white mb-1 md:mb-2 drop-shadow-lg">
                {solarData?.currentGeneration.toFixed(1)}
              </p>
              <p className="text-lg md:text-2xl font-semibold text-white/90 mb-2 md:mb-3">kW</p>
              <div className="flex items-center gap-1 text-xs md:text-sm text-white/90 bg-white/20 backdrop-blur-sm rounded-full px-2 md:px-3 py-1 w-fit">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                <span>Hiệu suất {solarData?.panelEfficiency.toFixed(0)}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Battery */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white overflow-hidden group hover:shadow-2xl transition-all relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20"></div>
            <CardContent className="p-4 md:p-6 relative z-10">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Battery className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <Badge className="bg-white/30 backdrop-blur-sm text-white border-0 text-xs">
                  {solarData?.batteryStatus === 'CHARGING' ? '⚡' : 
                   solarData?.batteryStatus === 'DISCHARGING' ? '🔋' : '⏸️'}
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-white/80 mb-1">Dung lượng pin</p>
              <p className="text-3xl md:text-5xl font-bold text-white mb-1 md:mb-2 drop-shadow-lg">
                {solarData?.batteryLevel.toFixed(0)}
              </p>
              <p className="text-lg md:text-2xl font-semibold text-white/90 mb-2 md:mb-3">%</p>
              <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-2 md:h-3 overflow-hidden">
                <div 
                  className="bg-white h-2 md:h-3 rounded-full transition-all duration-1000 shadow-lg"
                  style={{ width: `${solarData?.batteryLevel}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Savings */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white overflow-hidden group hover:shadow-2xl transition-all relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20"></div>
            <CardContent className="p-4 md:p-6 relative z-10">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <Badge className="bg-white/30 backdrop-blur-sm text-white border-0 text-xs">
                  Tháng
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-white/80 mb-1">Tiết kiệm điện</p>
              <p className="text-3xl md:text-5xl font-bold text-white mb-1 md:mb-2 drop-shadow-lg">
                ${solarData?.savingsMonth.toFixed(0)}
              </p>
              <p className="text-xs md:text-sm text-white/80 mb-2 md:mb-3">~{(solarData?.monthGeneration || 0).toFixed(0)} kWh</p>
              <div className="flex items-center gap-1 text-xs md:text-sm text-white/90 bg-white/20 backdrop-blur-sm rounded-full px-2 md:px-3 py-1 w-fit">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                <span className="truncate">+{solarData?.todayGeneration.toFixed(1)} kWh</span>
              </div>
            </CardContent>
          </Card>

          {/* CO2 Reduction */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white overflow-hidden group hover:shadow-2xl transition-all relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20"></div>
            <CardContent className="p-4 md:p-6 relative z-10">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Leaf className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <Badge className="bg-white/30 backdrop-blur-sm text-white border-0 text-xs">
                  🌱
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-white/80 mb-1">Giảm CO₂</p>
              <p className="text-3xl md:text-5xl font-bold text-white mb-1 md:mb-2 drop-shadow-lg">
                {(solarData?.co2Saved || 0).toFixed(0)}
              </p>
              <p className="text-lg md:text-2xl font-semibold text-white/90 mb-2 md:mb-3">kg</p>
              <div className="flex items-center gap-1 text-xs md:text-sm text-white/90 bg-white/20 backdrop-blur-sm rounded-full px-2 md:px-3 py-1 w-fit">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Thân thiện</span>
                <span className="sm:hidden">Xanh</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Energy Mix */}
        <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 md:gap-3 text-base md:text-lg">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <p className="text-base md:text-lg font-bold">Cơ cấu năng lượng</p>
                <p className="text-xs text-gray-500 font-normal">Tỷ lệ nguồn điện sử dụng</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
            {/* Solar Power */}
            <div>
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">Năng lượng mặt trời</p>
                    <p className="text-xs text-gray-500">{solarData?.solarPower.toFixed(1)} kW</p>
                  </div>
                </div>
                <span className="text-xl md:text-2xl font-bold text-yellow-600">{solarPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 md:h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 md:h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${solarPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Grid Power */}
            <div>
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Power className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">Lưới điện quốc gia</p>
                    <p className="text-xs text-gray-500">{solarData?.gridPower.toFixed(1)} kW</p>
                  </div>
                </div>
                <span className="text-xl md:text-2xl font-bold text-blue-600">{100 - solarPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 md:h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 md:h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${100 - solarPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 md:pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Activity className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">Tổng tiêu thụ</p>
                    <p className="text-xs text-gray-500">Công suất hiện tại</p>
                  </div>
                </div>
                <span className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {solarData?.totalConsumption.toFixed(1)} kW
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generator Control Section */}
        <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Fuel className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">Điều khiển máy phát điện</p>
                <p className="text-xs text-gray-500 font-normal">Quản lý và giám sát nguồn dự phòng</p>
              </div>
              <Badge className={
                generatorRunning 
                  ? 'ml-auto bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'ml-auto bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
              }>
                {generatorRunning ? 'ĐANG HOẠT ĐỘNG' : 'DỪNG'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Control Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handleGeneratorToggle}
                disabled={generatorRunning}
                className={`h-20 text-lg font-semibold ${
                  generatorRunning 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                }`}
              >
                <PlayCircle className="w-6 h-6 mr-2" />
                Khởi động
              </Button>
              
              <Button
                onClick={handleGeneratorToggle}
                disabled={!generatorRunning}
                className={`h-20 text-lg font-semibold ${
                  !generatorRunning 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white'
                }`}
              >
                <StopCircle className="w-6 h-6 mr-2" />
                Tắt máy
              </Button>
              
              <Button
                variant="outline"
                className="h-20 text-lg font-semibold border-2"
              >
                <Settings className="w-6 h-6 mr-2" />
                Cài đặt
              </Button>
            </div>

            {/* Generator Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Power Output */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Công suất</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {generatorRunning ? (generatorData?.power || 0).toFixed(1) : '0.0'} kW
                </p>
              </div>

              {/* Fuel Level */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Fuel className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Nhiên liệu</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {generatorData?.fuelLevel.toFixed(0)}%
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${generatorData?.fuelLevel}%` }}
                  ></div>
                </div>
              </div>

              {/* Temperature */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Nhiệt độ</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {generatorData?.temperature.toFixed(0)}°C
                </p>
              </div>

              {/* Runtime */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Thời gian chạy</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {generatorRunning ? Math.floor((generatorData?.runtime || 0) / 60) : 0}h {generatorRunning ? (generatorData?.runtime || 0) % 60 : 0}m
                </p>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Áp suất dầu</span>
                  {(generatorData?.oilPressure || 0) > 40 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {generatorData?.oilPressure.toFixed(1)} PSI
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (generatorData?.oilPressure || 0) > 40 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(((generatorData?.oilPressure || 0) / 60) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Điện áp</span>
                  {Math.abs((generatorData?.voltage || 230) - 230) < 10 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {generatorData?.voltage.toFixed(1)} V
                </p>
                <p className="text-xs text-gray-500 mt-1">Chuẩn: 220-240V</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tần số</span>
                  {Math.abs((generatorData?.frequency || 50) - 50) < 1 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {generatorData?.frequency.toFixed(2)} Hz
                </p>
                <p className="text-xs text-gray-500 mt-1">Chuẩn: 49-51Hz</p>
              </div>
            </div>

            {/* Maintenance Info */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-l-4 border-indigo-500">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-indigo-800 dark:text-indigo-400 mb-2">Thông tin bảo trì</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Bảo trì lần cuối: </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {new Date(generatorData?.lastMaintenance || '').toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Bảo trì tiếp theo: </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {new Date(generatorData?.nextMaintenance || '').toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generator Alert */}
            {!generatorRunning && (generatorData?.fuelLevel || 0) < 30 && (
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
          </CardContent>
        </Card>

        {/* Hourly Generation Chart */}
        <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">Xu hướng phát điện</p>
                <p className="text-xs text-gray-500 font-normal">Công suất theo giờ trong ngày</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { hour: '6:00', value: 2.1 },
                { hour: '8:00', value: 5.8 },
                { hour: '10:00', value: 10.2 },
                { hour: '12:00', value: 15.8 },
                { hour: '14:00', value: 13.5 },
                { hour: '16:00', value: 8.9 },
                { hour: '18:00', value: 3.2 },
              ].map((data, idx) => {
                const percentage = (data.value / 15.8) * 100
                const isCurrentHour = new Date().getHours() >= parseInt(data.hour) && 
                                      new Date().getHours() < parseInt(data.hour) + 2
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <span className={`w-16 text-sm font-medium ${isCurrentHour ? 'text-yellow-600' : 'text-gray-600 dark:text-gray-400'}`}>
                      {data.hour}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden relative">
                      <div
                        className={`h-8 rounded-full transition-all duration-1000 ${
                          isCurrentHour 
                            ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse' 
                            : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-3">
                        <span className={`text-sm font-bold ${percentage > 50 ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {data.value} kW
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* System Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">Trạng thái hệ thống</p>
                  <p className="text-xs text-gray-500 font-normal">Tình trạng thiết bị real-time</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { name: 'Inverter chính', status: 'online', power: '15.2 kW', temp: '42°C', efficiency: '96%' },
                { name: 'Panel mặt trời', status: 'online', power: '10.1 kW', temp: '65°C', efficiency: '88%' },
                { name: 'Bộ lưu trữ', status: 'charging', power: '3.8 kW', temp: '28°C', efficiency: '92%' },
                { name: 'Điều khiển MPPT', status: 'online', power: '10.3 kW', temp: '38°C', efficiency: '98%' },
              ].map((device, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      device.status === 'online' ? 'bg-green-500' : 
                      device.status === 'charging' ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{device.name}</p>
                      <p className="text-xs text-gray-500">{device.power} • {device.temp}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-2 border-green-400 text-green-600 dark:text-green-400">
                    {device.efficiency}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Alerts & Notifications */}
          <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">Cảnh báo & Thông báo</p>
                  <p className="text-xs text-gray-500 font-normal">Cập nhật mới nhất</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {[
                { type: 'success', title: 'Hiệu suất cao', message: 'Panel đang hoạt động ở 96% công suất', time: '2 phút trước' },
                { type: 'info', title: 'Dự báo thời tiết', message: 'Trời nắng tốt trong 3 ngày tới', time: '1 giờ trước' },
                { type: 'warning', title: 'Nhiệt độ panel', message: 'Panel đạt 65°C, trong ngưỡng bình thường', time: '2 giờ trước' },
                { type: 'info', title: 'Bảo trì định kỳ', message: 'Kiểm tra hệ thống vào 15/11/2025', time: 'Hôm qua' },
              ].map((alert, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-l-4 ${
                  alert.type === 'success' ? 'bg-green-50 dark:bg-green-950/20 border-green-500' :
                  alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500' :
                  'bg-blue-50 dark:bg-blue-950/20 border-blue-500'
                }`}>
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{alert.title}</p>
                    <span className="text-xs text-gray-500">{alert.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{alert.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Comparison & Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Comparison Chart */}
          <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">So sánh theo tháng</p>
                  <p className="text-xs text-gray-500 font-normal">3 tháng gần nhất</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {[
                  { month: 'Tháng 11', value: 4250, target: 4500, percentage: 94.4, color: 'blue' },
                  { month: 'Tháng 10', value: 3980, target: 4500, percentage: 88.4, color: 'cyan' },
                  { month: 'Tháng 9', value: 4120, target: 4500, percentage: 91.6, color: 'indigo' },
                ].map((data, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{data.month}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{data.value} kWh</span>
                        <Badge variant="outline" className={`border-${data.color}-400 text-${data.color}-600 dark:text-${data.color}-400`}>
                          {data.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-3 bg-gradient-to-r from-${data.color}-500 to-${data.color}-600 rounded-full transition-all duration-1000`}
                        style={{ width: `${data.percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-2">
                        <div className="w-full border-t-2 border-dashed border-gray-400 dark:border-gray-500 opacity-50" />
                      </div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">0 kWh</span>
                      <span className="text-xs text-gray-500">Mục tiêu: {data.target} kWh</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weather Forecast & Predictions */}
          <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <CloudSun className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">Dự báo 7 ngày</p>
                  <p className="text-xs text-gray-500 font-normal">Thời tiết & sản lượng dự kiến</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-2">
                {[
                  { day: 'T2', weather: '☀️', temp: '28°C', gen: 95 },
                  { day: 'T3', weather: '⛅', temp: '27°C', gen: 85 },
                  { day: 'T4', weather: '☀️', temp: '29°C', gen: 98 },
                  { day: 'T5', weather: '🌤️', temp: '26°C', gen: 80 },
                  { day: 'T6', weather: '☀️', temp: '30°C', gen: 100 },
                  { day: 'T7', weather: '⛅', temp: '28°C', gen: 88 },
                  { day: 'CN', weather: '🌤️', temp: '27°C', gen: 82 },
                ].map((forecast, idx) => (
                  <div key={idx} className={`p-3 rounded-xl text-center transition-all hover:scale-105 ${
                    idx === 0 ? 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 ring-2 ring-yellow-500' :
                    'bg-gray-50 dark:bg-gray-700/50'
                  }`}>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{forecast.day}</p>
                    <p className="text-2xl mb-1">{forecast.weather}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{forecast.temp}</p>
                    <div className="relative h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                      <div 
                        className={`absolute bottom-0 w-full bg-gradient-to-t ${
                          forecast.gen >= 95 ? 'from-green-500 to-emerald-400' :
                          forecast.gen >= 85 ? 'from-yellow-500 to-amber-400' :
                          'from-orange-500 to-red-400'
                        } transition-all duration-1000`}
                        style={{ height: `${forecast.gen}%` }}
                      />
                    </div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-2">{forecast.gen}%</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-400 mb-1">Dự báo tuần này</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Trời nắng tốt 5/7 ngày, dự kiến sản lượng đạt <span className="font-bold text-green-700 dark:text-green-400">285-310 kWh</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Production Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
            <CardHeader className="pb-2 md:pb-6">
              <CardTitle className="flex items-center gap-2 md:gap-3 text-base md:text-lg text-orange-700 dark:text-orange-400">
                <CloudSun className="w-4 h-4 md:w-5 md:h-5" />
                Hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 md:pb-6">
              <div className="text-center py-2 md:py-4">
                <p className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-1 md:mb-2">
                  {solarData?.todayGeneration.toFixed(1)}
                </p>
                <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 mb-2 md:mb-3">kWh</p>
                <Badge className="bg-green-500 text-white text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{solarData?.todayChange.toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <CardHeader className="pb-2 md:pb-6">
              <CardTitle className="flex items-center gap-2 md:gap-3 text-base md:text-lg text-blue-700 dark:text-blue-400">
                <Activity className="w-4 h-4 md:w-5 md:h-5" />
                Tháng này
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 md:pb-6">
              <div className="text-center py-2 md:py-4">
                <p className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1 md:mb-2">
                  {solarData?.monthGeneration.toFixed(0)}
                </p>
                <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 mb-2 md:mb-3">kWh</p>
                <Badge className="bg-blue-500 text-white text-xs">
                  📊 Ổn định
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 sm:col-span-2 md:col-span-1">
            <CardHeader className="pb-2 md:pb-6">
              <CardTitle className="flex items-center gap-2 md:gap-3 text-base md:text-lg text-purple-700 dark:text-purple-400">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                Năm nay
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 md:pb-6">
              <div className="text-center py-2 md:py-4">
                <p className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 md:mb-2">
                  {(solarData?.yearGeneration || 48650).toFixed(0)}
                </p>
                <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 mb-2 md:mb-3">kWh</p>
                <Badge className="bg-purple-500 text-white text-xs">
                  🎯 95%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health */}
          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-500" />
                Tình trạng hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Solar Panels</span>
                </div>
                <Badge className="bg-green-500 text-white">Online</Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Battery System</span>
                </div>
                <Badge className="bg-green-500 text-white">
                  {solarData?.batteryStatus === 'CHARGING' ? 'Charging' : 
                   solarData?.batteryStatus === 'DISCHARGING' ? 'Discharging' : 'Standby'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Inverter</span>
                </div>
                <Badge className="bg-green-500 text-white">Normal</Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Grid Connection</span>
                </div>
                <Badge className="bg-blue-500 text-white">Connected</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Thống kê nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Công suất đỉnh hôm nay</span>
                  <Sun className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-600">{solarData?.peakGeneration.toFixed(1)} kW</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Hiệu suất panel</span>
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">{solarData?.panelEfficiency.toFixed(1)}%</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tiết kiệm chi phí</span>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">${solarData?.savingsMonth.toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-1">Tháng này</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">CO₂ giảm thiểu</span>
                  <Leaf className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-emerald-600">{(solarData?.co2Saved || 0).toFixed(0)} kg</p>
                <p className="text-xs text-gray-500 mt-1">Tháng này</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
