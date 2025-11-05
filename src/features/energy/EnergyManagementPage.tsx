import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sun,
  Battery,
  Zap,
  TrendingDown,
  Leaf,
  DollarSign,
  Activity,
  Power,
  CloudSun,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Wind,
  BarChart3,
  TrendingUp,
  Gauge,
  Clock,
} from 'lucide-react'

interface SolarData {
  currentGeneration: number
  todayGeneration: number
  monthGeneration: number
  batteryLevel: number
  batteryStatus: 'CHARGING' | 'DISCHARGING' | 'IDLE'
  gridPower: number
  solarPower: number
  totalConsumption: number
  savingsToday: number
  savingsMonth: number
  co2Saved: number
  panelEfficiency: number
}

const weeklyData = [
  { day: 'T2', solar: 42, grid: 38 },
  { day: 'T3', solar: 45, grid: 35 },
  { day: 'T4', solar: 38, grid: 42 },
  { day: 'T5', solar: 48, grid: 32 },
  { day: 'T6', solar: 51, grid: 29 },
  { day: 'T7', solar: 46, grid: 34 },
  { day: 'CN', solar: 43, grid: 37 },
]

const hourlyData = [
  { hour: '6h', power: 1.2 },
  { hour: '7h', power: 2.5 },
  { hour: '8h', power: 3.2 },
  { hour: '9h', power: 3.8 },
  { hour: '10h', power: 4.2 },
  { hour: '11h', power: 4.5 },
  { hour: '12h', power: 4.8 },
  { hour: '13h', power: 4.6 },
  { hour: '14h', power: 4.3 },
  { hour: '15h', power: 3.9 },
  { hour: '16h', power: 3.2 },
  { hour: '17h', power: 2.5 },
  { hour: '18h', power: 1.5 },
]

const activityLog = [
  { time: '14:35', event: 'Pin đạt 85% - Chuyển sang chế độ lưu trữ', type: 'success' },
  { time: '12:20', event: 'Phát điện đạt đỉnh: 4.8kW', type: 'info' },
  { time: '10:15', event: 'Hệ thống hoạt động bình thường', type: 'success' },
  { time: '08:45', event: 'Bắt đầu phát điện', type: 'info' },
]

export default function EnergyManagementPage() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week')

  const { data: solarData, isLoading } = useQuery<SolarData>({
    queryKey: ['solar-data'],
    queryFn: async () => {
      const response = await apiClient.get('/energy/solar')
      return response.data
    },
    refetchInterval: 5000,
  })

  const solarPercentage = solarData
    ? Math.round((solarData.solarPower / solarData.totalConsumption) * 100)
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Sun className="w-20 h-20 text-yellow-500 animate-spin" />
            <Sparkles className="w-8 h-8 text-orange-500 absolute top-0 right-0 animate-pulse" />
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            Đang tải dữ liệu năng lượng mặt trời...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6 pb-6 sm:pb-8">
      {/* Modern Hero Header */}
      <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <CardContent className="relative z-10 p-4 sm:p-6 lg:p-8 text-white">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                  <Sun className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black mb-1">Năng lượng mặt trời</h1>
                <p className="text-white/90 text-xs sm:text-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Hệ thống điện năng lượng sạch
                </p>
              </div>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-xl rounded-xl p-1">
              {['day', 'week', 'month'].map((range) => (
                <Button
                  key={range}
                  size="sm"
                  variant={timeRange === range ? 'secondary' : 'ghost'}
                  onClick={() => setTimeRange(range as 'day' | 'week' | 'month')}
                  className={`h-7 sm:h-8 px-2.5 sm:px-3 text-[10px] sm:text-xs font-semibold ${
                    timeRange === range 
                      ? 'bg-white text-orange-600 shadow-lg' 
                      : 'text-white/90 hover:bg-white/20'
                  }`}
                >
                  {range === 'day' ? 'Ngày' : range === 'week' ? 'Tuần' : 'Tháng'}
                </Button>
              ))}
            </div>
          </div>

          {/* Real-time Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
            <div className="bg-white/15 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-200" />
                <p className="text-[10px] sm:text-xs text-white/80 font-medium">Công suất hiện tại</p>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black">{solarData?.currentGeneration.toFixed(1)}</p>
              <p className="text-[10px] sm:text-xs text-white/70">kW</p>
            </div>

            <div className="bg-white/15 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-200" />
                <p className="text-[10px] sm:text-xs text-white/80 font-medium">Hiệu suất tấm pin</p>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black">{solarData?.panelEfficiency}</p>
              <p className="text-[10px] sm:text-xs text-white/70">%</p>
            </div>

            <div className="bg-white/15 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
                <p className="text-[10px] sm:text-xs text-white/80 font-medium">Trạng thái hệ thống</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-base sm:text-lg lg:text-xl font-bold">Hoạt động</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modern KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Solar Generation Card */}
        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 dark:from-yellow-950/30 dark:to-orange-950/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
          
          <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Sun className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <ArrowUp className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700 font-semibold">
                +12% hôm nay
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Tổng phát điện hôm nay</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  {solarData?.todayGeneration.toFixed(1)}
                </p>
                <span className="text-lg sm:text-xl font-bold text-gray-600 dark:text-gray-400">kWh</span>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600" />
                  <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Tháng này</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-yellow-700 dark:text-yellow-400">
                  {solarData?.monthGeneration} kWh
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Battery Storage Card */}
        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
          
          <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <Battery className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                  solarData?.batteryStatus === 'CHARGING' ? 'bg-green-500' : 'bg-orange-500'
                }`}>
                  {solarData?.batteryStatus === 'CHARGING' ? (
                    <Zap className="w-2.5 h-2.5 text-white" />
                  ) : (
                    <ArrowDown className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
              </div>
              <Badge variant="outline" className={
                solarData?.batteryStatus === 'CHARGING'
                  ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30'
                  : 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30'
              }>
                {solarData?.batteryStatus === 'CHARGING' ? '🔋 Đang sạc' : '⚡ Đang xả'}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Mức pin lưu trữ</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {solarData?.batteryLevel}
                </p>
                <span className="text-lg sm:text-xl font-bold text-gray-600 dark:text-gray-400">%</span>
              </div>
              
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Trạng thái pin</span>
                  <span className="font-semibold text-green-700 dark:text-green-400">Tốt</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-1000 relative"
                    style={{ width: `${solarData?.batteryLevel}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Savings Card */}
        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950/30 dark:to-cyan-950/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
          
          <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                  <TrendingDown className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700 font-semibold">
                💰 Tiết kiệm
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Chi phí tiết kiệm tháng này</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  {((solarData?.savingsMonth || 0) / 1000).toFixed(0)}K
                </p>
                <span className="text-lg sm:text-xl font-bold text-gray-600 dark:text-gray-400">VNĐ</span>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Hôm nay</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-400">
                  {((solarData?.savingsToday || 0) / 1000).toFixed(1)}K VNĐ
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CO2 Reduction Card */}
        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
          
          <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <TrendingDown className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700 font-semibold">
                🌱 -18% CO₂
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Giảm phát thải CO₂</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
                  {solarData?.co2Saved}
                </p>
                <span className="text-lg sm:text-xl font-bold text-gray-600 dark:text-gray-400">kg</span>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Tương đương</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">
                  {Math.round((solarData?.co2Saved || 0) / 20)} cây xanh
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Weekly Generation Chart */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">Biểu đồ tuần</h3>
                  <p className="text-xs text-gray-500">Phát điện 7 ngày qua</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30">
                {timeRange === 'week' ? 'Tuần này' : timeRange === 'day' ? 'Hôm nay' : 'Tháng này'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Modern Bar Chart */}
            <div className="space-y-4">
              {weeklyData.map((data, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-8">{data.day}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {data.solar + data.grid}kWh
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Solar Bar */}
                    <div className="flex items-center gap-2 group-hover:scale-[1.02] transition-transform">
                      <Sun className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" />
                      <div className="flex-1 h-7 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 rounded-lg transition-all duration-700 flex items-center justify-end px-2 shadow-sm"
                          style={{ width: `${(data.solar / 60) * 100}%` }}
                        >
                          <span className="text-xs font-bold text-white drop-shadow">{data.solar}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Grid Bar */}
                    <div className="flex items-center gap-2 group-hover:scale-[1.02] transition-transform">
                      <Power className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 h-7 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 via-cyan-400 to-cyan-500 rounded-lg transition-all duration-700 flex items-center justify-end px-2 shadow-sm"
                          style={{ width: `${(data.grid / 60) * 100}%` }}
                        >
                          <span className="text-xs font-bold text-white drop-shadow">{data.grid}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Năng lượng mặt trời</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"></div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Lưới điện</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Production Curve */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md">
                  <CloudSun className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">Công suất theo giờ</h3>
                  <p className="text-xs text-gray-500">Đường cong phát điện hôm nay</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30">
                📊 Real-time
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Hourly Curve Visualization */}
            <div className="space-y-2.5">
              {hourlyData.map((data, index) => (
                <div key={index} className="flex items-center gap-2 group hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1.5 rounded-lg transition-colors">
                  <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-10">{data.hour}</span>
                  <div className="flex-1 h-6 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 via-red-400 to-red-500 rounded-lg transition-all duration-700 flex items-center justify-end px-2 relative"
                      style={{ width: `${(data.power / 5) * 100}%` }}
                    >
                      {data.power > 0 && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                          <span className="text-[10px] font-bold text-white drop-shadow relative z-10">{data.power}kW</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Công suất đỉnh</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-orange-600">4.8 kW</p>
                <p className="text-[10px] text-gray-500">Lúc 12:00 trưa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Energy Mix & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Energy Mix Card */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">Cơ cấu năng lượng</h3>
                <p className="text-xs text-gray-500">Phân bổ nguồn điện hiện tại</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-5">
            {/* Solar Energy Source */}
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
                    <Sun className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Năng lượng mặt trời</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{solarData?.solarPower.toFixed(1)} kW</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-yellow-600">{solarPercentage}%</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 h-3 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${solarPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
              </div>
            </div>

            {/* Grid Energy Source */}
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-md">
                    <Power className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Lưới điện quốc gia</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{solarData?.gridPower.toFixed(1)} kW</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-blue-600">{100 - solarPercentage}%</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-400 via-cyan-400 to-cyan-500 h-3 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${100 - solarPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
              </div>
            </div>

            {/* Total Consumption Summary */}
            <div className="pt-4 border-t-2 border-dashed">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-md">
                    <Gauge className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Tổng tiêu thụ điện</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Công suất tổng hợp</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-800 dark:text-gray-200">
                    {solarData?.totalConsumption.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">kW</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Activity Log */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">Hoạt động hệ thống</h3>
                <p className="text-xs text-gray-500">Nhật ký thời gian thực</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {activityLog.map((log, index) => (
                <div
                  key={index}
                  className="group flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br hover:shadow-md transition-all duration-300 cursor-pointer"
                  style={{
                    background: log.type === 'success'
                      ? 'linear-gradient(135deg, rgb(240 253 244) 0%, rgb(220 252 231) 100%)'
                      : 'linear-gradient(135deg, rgb(239 246 255) 0%, rgb(219 234 254) 100%)',
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform ${
                      log.type === 'success'
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                        : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                    }`}
                  >
                    {log.type === 'success' ? (
                      <Sparkles className="w-5 h-5 text-white" />
                    ) : (
                      <Activity className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1 line-clamp-2">
                      {log.event}
                    </p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">{log.time}</p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${
                          log.type === 'success'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-blue-100 text-blue-700 border-blue-300'
                        }`}
                      >
                        {log.type === 'success' ? '✓ Thành công' : 'ℹ Thông tin'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View All Button */}
            <Button
              variant="outline"
              className="w-full mt-4 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border-violet-200 text-violet-700 font-semibold"
            >
              <Activity className="w-4 h-4 mr-2" />
              Xem tất cả hoạt động
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
