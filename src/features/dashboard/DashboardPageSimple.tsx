import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  PackageCheck,
  Thermometer,
  AlertTriangle,
  Activity,
  RefreshCw,
  Sun,
  Battery,
  Zap,
  TrendingUp,
  TrendingDown,
  Warehouse,
  DollarSign,
  Leaf,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Mock data function
const fetchDashboardData = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    kpis: {
      inboundToday: 24,
      inboundChange: 12,
      outboundToday: 18,
      outboundChange: 8,
      avgTemperature: -22,
      tempStatus: 'stable',
      openAlerts: 3,
      alertsChange: -2,
    },
    solar: {
      currentPower: 12.5,
      peakPower: 15.2,
      todayEnergy: 142,
      todayChange: 18,
      batteryLevel: 85,
      batteryStatus: 'charging',
      monthlySavings: 2450,
      totalGeneration: 4280,
      co2Saved: 3.2,
    },
    recentActivity: [
      { id: 1, type: 'inbound', message: 'Đơn hàng IB-00234 đã hoàn thành', time: '5 phút trước', status: 'success' },
      { id: 2, type: 'alert', message: 'Cảnh báo nhiệt độ Zone CHILL-A', time: '12 phút trước', status: 'warning' },
      { id: 3, type: 'outbound', message: 'Đang xuất hàng OB-00156', time: '25 phút trước', status: 'info' },
    ],
  }
}

export default function DashboardPageSimple() {
  const navigate = useNavigate()
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000, // Auto refresh every 30s
  })

  useEffect(() => {
    setLastUpdate(new Date())
  }, [data])

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 font-semibold">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/40 dark:from-gray-900 dark:via-blue-950/20 dark:to-cyan-950/20 min-h-screen">
      <div className="relative z-10 space-y-6">
        {/* Action Buttons Only */}
        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="font-semibold">Làm mới</span>
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-bold text-green-700 dark:text-green-400">Live Data</span>
          </div>
        </div>


        {/* KPI Cards with Enhanced Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Inbound Today */}
          <Card className="group hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 border border-blue-500/20 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950/50 dark:via-gray-900 dark:to-cyan-950/50 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Nhập kho hôm nay
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-300">
                <Package className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {data?.kpis.inboundToday}
              </div>
              <div className="flex items-center gap-2">
                <Badge className="gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm text-xs">
                  <TrendingUp className="w-3 h-3" />
                  +{data?.kpis.inboundChange}%
                </Badge>
                <span className="text-xs text-gray-500">vs hôm qua</span>
              </div>
            </CardContent>
          </Card>

          {/* Outbound Today */}
          <Card className="group hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 border border-green-500/20 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950/50 dark:via-gray-900 dark:to-emerald-950/50 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Xuất kho hôm nay
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-green-500/50 group-hover:scale-110 transition-all duration-300">
                <PackageCheck className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {data?.kpis.outboundToday}
              </div>
              <div className="flex items-center gap-2">
                <Badge className="gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm text-xs">
                  <TrendingUp className="w-3 h-3" />
                  +{data?.kpis.outboundChange}%
                </Badge>
                <span className="text-xs text-gray-500">vs hôm qua</span>
              </div>
            </CardContent>
          </Card>

          {/* Temperature */}
          <Card className="group hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 border border-cyan-500/20 bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-cyan-950/50 dark:via-gray-900 dark:to-blue-950/50 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                Nhiệt độ trung bình
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-cyan-500/50 group-hover:scale-110 transition-all duration-300">
                <Thermometer className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-br from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {data?.kpis.avgTemperature}°C
              </div>
              <div className="flex items-center gap-2">
                <Badge className="gap-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm text-xs">
                  <Activity className="w-3 h-3" />
                  Stable
                </Badge>
                <span className="text-xs text-gray-500">Trong giới hạn</span>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="group hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 border border-orange-500/20 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-orange-950/50 dark:via-gray-900 dark:to-red-950/50 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-red-500/0 group-hover:from-orange-500/10 group-hover:to-red-500/10 transition-all duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                Cảnh báo
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-orange-500/50 group-hover:scale-110 transition-all duration-300">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-br from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                {data?.kpis.openAlerts}
              </div>
              <div className="flex items-center gap-2">
                <Badge className="gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm text-xs">
                  <TrendingDown className="w-3 h-3" />
                  {data?.kpis.alertsChange}
                </Badge>
                <span className="text-xs text-gray-500">vs hôm qua</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Solar Energy Section - Compact Design */}
        <Card className="border border-yellow-500/30 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-950/30 dark:via-orange-950/30 dark:to-amber-950/30 shadow-lg backdrop-blur-xl relative overflow-hidden group">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-amber-400/10 group-hover:from-yellow-400/15 group-hover:via-orange-400/15 group-hover:to-amber-400/15 transition-all duration-500"></div>
          
          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:shadow-yellow-500/50 group-hover:scale-105 transition-all duration-300">
                  <Sun className="w-6 h-6 text-white animate-spin-slow" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Năng lượng Mặt trời
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mt-0.5">
                    Hệ thống Solar Panel đang hoạt động ☀️
                  </p>
                </div>
              </div>
              <Badge className="gap-1.5 py-1.5 px-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm shadow-md">
                <Activity className="w-4 h-4" />
                <span className="font-semibold">ONLINE</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Current Power - Compact */}
              <Card className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-yellow-500/30 hover:border-yellow-500/60 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-orange-500/0 group-hover:from-yellow-500/10 group-hover:to-orange-500/10 transition-all"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-md group-hover:shadow-yellow-500/50 group-hover:scale-105 transition-all">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Công suất hiện tại
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-br from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    {data?.solar.currentPower} kW
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-1.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: `${data?.solar.currentPower && data?.solar.peakPower ? (data.solar.currentPower / data.solar.peakPower) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-semibold mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Peak: {data?.solar.peakPower} kW
                  </div>
                </CardContent>
              </Card>

              {/* Battery - Compact */}
              <Card className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-green-500/30 hover:border-green-500/60 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md group-hover:shadow-green-500/50 group-hover:scale-105 transition-all">
                      <Battery className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Pin lưu trữ
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {data?.solar.batteryLevel}%
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 rounded-full"
                        style={{ width: `${data?.solar.batteryLevel}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-semibold mt-2 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Đang sạc nhanh
                  </div>
                </CardContent>
              </Card>

              {/* Today Generation - Compact */}
              <Card className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-blue-500/30 hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md group-hover:shadow-blue-500/50 group-hover:scale-105 transition-all">
                      <Sun className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Sản lượng hôm nay
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {data?.solar.todayEnergy} kWh
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="gap-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm text-xs">
                      <TrendingUp className="w-3 h-3" />
                      +{data?.solar.todayChange}%
                    </Badge>
                    <span className="text-xs text-gray-500">vs hôm qua</span>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Savings - Compact */}
              <Card className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-purple-500/30 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md group-hover:shadow-purple-500/50 group-hover:scale-105 transition-all">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Tiết kiệm tháng này
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ${data?.solar.monthlySavings}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Leaf className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <div className="text-xs text-green-700 dark:text-green-300 font-semibold">
                      {data?.solar.co2Saved} tấn CO₂ 🌱
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

      {/* Quick Actions & Recent Activity - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Premium Design */}
        <div className="lg:col-span-1">
          <Card className="h-full border-0 shadow-2xl bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-950/30 dark:to-pink-950/30 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
            <CardHeader className="relative z-10 border-b border-purple-100 dark:border-purple-900/30">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Thao tác nhanh
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6 relative z-10">
              <Button
                onClick={() => navigate('/inventory')}
                className="w-full justify-between group hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Warehouse className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">Quản lý tồn kho</span>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                onClick={() => navigate('/inbound/create')}
                className="w-full justify-between group hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">Tạo phiếu nhập</span>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={() => navigate('/outbound/create')}
                className="w-full justify-between group hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">Tạo phiếu xuất</span>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={() => navigate('/alerts')}
                className="w-full justify-between group hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">Xem cảnh báo</span>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={() => navigate('/energy')}
                className="w-full justify-between group hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">Quản lý năng lượng</span>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - Premium Design */}
        <div className="lg:col-span-2">
          <Card className="h-full border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-cyan-950/30 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
            <CardHeader className="relative z-10 border-b border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Hoạt động gần đây
                  </span>
                </CardTitle>
                <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                  {data?.recentActivity.length} hoạt động
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
              <div className="space-y-3">
                {data?.recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="group relative flex items-start gap-4 p-5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Status indicator line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
                      activity.status === 'success' ? 'bg-gradient-to-b from-green-500 to-emerald-500' :
                      activity.status === 'warning' ? 'bg-gradient-to-b from-yellow-500 to-orange-500' :
                      'bg-gradient-to-b from-blue-500 to-cyan-500'
                    }`}></div>

                    {/* Icon */}
                    <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
                      activity.status === 'success' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                      activity.status === 'warning' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                      'bg-gradient-to-br from-blue-500 to-cyan-500'
                    }`}>
                      <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                      {activity.type === 'inbound' && <Package className="w-6 h-6 text-white relative z-10" />}
                      {activity.type === 'outbound' && <PackageCheck className="w-6 h-6 text-white relative z-10" />}
                      {activity.type === 'alert' && <AlertTriangle className="w-6 h-6 text-white relative z-10" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                          {activity.message}
                        </p>
                        <Badge className={`shrink-0 ${
                          activity.status === 'success' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700' :
                          activity.status === 'warning' ? 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700' :
                          'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700'
                        }`}>
                          {activity.status === 'success' ? '✓ Thành công' :
                           activity.status === 'warning' ? '⚠ Cảnh báo' :
                           'ℹ Đang xử lý'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-3 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-medium">{activity.time}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                      </div>
                    </div>

                    {/* Hover arrow */}
                    <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>

              {/* View All button */}
              <Button 
                variant="outline" 
                className="w-full mt-6 group hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white hover:border-transparent transition-all duration-300"
              >
                <span>Xem tất cả hoạt động</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}