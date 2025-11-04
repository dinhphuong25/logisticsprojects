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
    <div className="space-y-6 pb-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <Sun className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold drop-shadow-lg">Năng lượng mặt trời</h1>
                <p className="text-white/90 text-sm mt-1">Hệ thống xanh - Tiết kiệm bền vững</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 mt-6">
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl px-6 py-3">
                <p className="text-sm text-white/80">Công suất hiện tại</p>
                <p className="text-3xl font-bold">{solarData?.currentGeneration.toFixed(1)}kW</p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl px-6 py-3">
                <p className="text-sm text-white/80">Hiệu suất</p>
                <p className="text-3xl font-bold">{solarData?.panelEfficiency}%</p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl px-6 py-3">
                <p className="text-sm text-white/80">Trạng thái</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-lg font-semibold">Hoạt động</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {['day', 'week', 'month'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'secondary' : 'ghost'}
                onClick={() => setTimeRange(range as 'day' | 'week' | 'month')}
                className={timeRange === range ? 'bg-white text-orange-600' : 'text-white hover:bg-white/20'}
              >
                {range === 'day' ? 'Ngày' : range === 'week' ? 'Tuần' : 'Tháng'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Solar Generation */}
        <Card className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">
                <ArrowUp className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Phát điện mặt trời</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {solarData?.todayGeneration.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500">kWh hôm nay</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Sparkles className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Tháng này: {solarData?.monthGeneration} kWh
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Battery Storage */}
        <Card className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Battery className="w-8 h-8 text-white" />
              </div>
              <Badge
                className={
                  solarData?.batteryStatus === 'CHARGING'
                    ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
                    : 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30'
                }
              >
                {solarData?.batteryStatus === 'CHARGING' ? (
                  <><ArrowUp className="w-3 h-3 mr-1" />Đang sạc</>
                ) : (
                  <><ArrowDown className="w-3 h-3 mr-1" />Đang xả</>
                )}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dung lượng pin</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {solarData?.batteryLevel}%
              </p>
              <p className="text-sm text-gray-500">Trạng thái tốt</p>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 relative"
                    style={{ width: `${solarData?.batteryLevel}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Savings */}
        <Card className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30">
                <TrendingDown className="w-3 h-3 mr-1" />
                Tiết kiệm
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chi phí tiết kiệm</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {(solarData?.savingsMonth || 0).toLocaleString('vi-VN')}
              </p>
              <p className="text-sm text-gray-500">VNĐ / tháng</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Hôm nay: {(solarData?.savingsToday || 0).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CO2 Reduction */}
        <Card className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                <TrendingDown className="w-3 h-3 mr-1" />
                -18%
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Giảm CO₂</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {solarData?.co2Saved}
              </p>
              <p className="text-sm text-gray-500">kg tháng này</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Wind className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Tương đương {Math.round((solarData?.co2Saved || 0) / 20)} cây xanh
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Generation */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">Phát điện 7 ngày</p>
                <p className="text-xs text-gray-500 font-normal">So sánh năng lượng mặt trời vs lưới điện</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simple visualization without recharts */}
            <div className="space-y-4">
              {weeklyData.map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{data.day}</span>
                    <span className="text-gray-500">{data.solar + data.grid} kWh</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-16 text-xs text-yellow-600 font-medium">Solar</div>
                      <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${(data.solar / 60) * 100}%` }}
                        >
                          <span className="text-xs font-semibold text-white">{data.solar}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 text-xs text-blue-600 font-medium">Grid</div>
                      <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${(data.grid / 60) * 100}%` }}
                        >
                          <span className="text-xs font-semibold text-white">{data.grid}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Năng lượng mặt trời</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Lưới điện</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Production Curve */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <CloudSun className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">Đường cong phát điện</p>
                <p className="text-xs text-gray-500 font-normal">Công suất theo giờ trong ngày</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simple hourly chart without recharts */}
            <div className="space-y-3">
              {hourlyData.map((data, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-600 w-8">{data.hour}</span>
                  <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${(data.power / 5) * 100}%` }}
                    >
                      {data.power > 0 && (
                        <span className="text-xs font-semibold text-white">{data.power}kW</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
              <Sun className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Công suất đỉnh: <span className="font-bold text-orange-600">4.8 kW</span> (12:00)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Energy Mix & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Mix */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">Cơ cấu năng lượng</p>
                <p className="text-xs text-gray-500 font-normal">Tỷ lệ nguồn điện sử dụng</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Solar Power */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Năng lượng mặt trời</p>
                    <p className="text-xs text-gray-500">{solarData?.solarPower.toFixed(1)} kW</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{solarPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${solarPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Grid Power */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Power className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Lưới điện quốc gia</p>
                    <p className="text-xs text-gray-500">{solarData?.gridPower.toFixed(1)} kW</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">{100 - solarPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${100 - solarPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Total Consumption */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Tổng tiêu thụ</p>
                    <p className="text-xs text-gray-500">Công suất hiện tại</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {solarData?.totalConsumption.toFixed(1)} kW
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">Hoạt động hệ thống</p>
                <p className="text-xs text-gray-500 font-normal">Nhật ký thời gian thực</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLog.map((log, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    log.type === 'success'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {log.type === 'success' ? (
                      <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{log.event}</p>
                    <p className="text-xs text-gray-500 mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
