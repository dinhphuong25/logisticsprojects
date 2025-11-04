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
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header with Glassmorphism */}


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

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Thao tác nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => navigate('/inventory')}
                className="w-full justify-between hover:scale-105 transition-transform"
                variant="outline"
              >
                <div className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4" />
                  <span>Quản lý Kho</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => navigate('/temperature')}
                className="w-full justify-between hover:scale-105 transition-transform"
                variant="outline"
              >
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  <span>Giám sát Nhiệt độ</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => navigate('/energy')}
                className="w-full justify-between hover:scale-105 transition-transform"
                variant="outline"
              >
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  <span>Năng lượng Solar</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => navigate('/alerts')}
                className="w-full justify-between hover:scale-105 transition-transform"
                variant="outline"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Xem Cảnh báo</span>
                </div>
                <Badge variant="destructive" className="ml-2">{data?.kpis.openAlerts}</Badge>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-all">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.status === 'success' ? 'bg-green-100 dark:bg-green-900' :
                      activity.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
                      'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      {activity.type === 'inbound' && <Package className="w-5 h-5 text-green-600 dark:text-green-400" />}
                      {activity.type === 'outbound' && <PackageCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                      {activity.type === 'alert' && <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{activity.message}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}