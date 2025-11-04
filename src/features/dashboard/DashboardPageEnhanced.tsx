import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Package,
  PackageCheck,
  Thermometer,
  AlertTriangle,
  TrendingDown,
  Activity,
  Clock,
  Zap,
  BarChart3,
  RefreshCw,
  Download,
  Sun,
  Battery,
  Leaf,
  Sparkles,
  Eye,
  DollarSign,
  Target,
  Warehouse,
  Users,
  Truck,
  ArrowDown,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface KPIData {
  inboundToday: number
  outboundToday: number
  onHandChill: number
  onHandFrozen: number
  openAlerts: number
  activeOrders: number
  revenue: number
  efficiency: number
}

interface SolarData {
  currentGeneration: number
  todayGeneration: number
  monthGeneration: number
  batteryLevel: number
  batteryStatus: 'CHARGING' | 'DISCHARGING' | 'IDLE'
  savingsMonth: number
  co2Saved: number
  panelEfficiency: number
}

export default function DashboardPageEnhanced() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today')
  const [refreshing, setRefreshing] = useState(false)

  const { data: kpis, refetch, isLoading: kpisLoading } = useQuery<KPIData>({
    queryKey: ['kpis'],
    queryFn: async () => {
      const res = await apiClient.get('/kpis')
      return res.data
    },
    refetchInterval: 5000,
  })

  const { data: solarData, isLoading: solarLoading } = useQuery<SolarData>({
    queryKey: ['solar-data-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/energy/solar')
      return response.data
    },
    refetchInterval: 5000,
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 1000)
  }

  if (kpisLoading || solarLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black bg-linear-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent animate-fade-in-down">
            Dashboard Kho Lạnh
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4" />
            Phân tích và giám sát kho hàng theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3 animate-fade-in-down" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2">
            <Button
              variant={timeRange === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('today')}
            >
              Hôm nay
            </Button>
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              Tuần
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              Tháng
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button size="sm" variant="gradient">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Nhập hàng hôm nay"
          value={kpis?.inboundToday || 0}
          icon={Package}
          trend={{ value: '+12.5%', direction: 'up' }}
          gradient="from-blue-500 to-cyan-500"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          description="Đơn hàng"
          className="animate-scale-in"
          style={{ animationDelay: '0.1s' }}
        />
        <StatCard
          title="Xuất hàng hôm nay"
          value={kpis?.outboundToday || 0}
          icon={PackageCheck}
          trend={{ value: '+8.2%', direction: 'up' }}
          gradient="from-green-500 to-emerald-500"
          iconBg="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
          description="Đơn hàng"
          className="animate-scale-in"
          style={{ animationDelay: '0.2s' }}
        />
        <StatCard
          title="Đơn đang xử lý"
          value={kpis?.activeOrders || 0}
          icon={Activity}
          trend={{ value: '-3.1%', direction: 'down' }}
          gradient="from-purple-500 to-pink-500"
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
          description="Đơn hàng"
          className="animate-scale-in"
          style={{ animationDelay: '0.3s' }}
        />
        <StatCard
          title="Cảnh báo"
          value={kpis?.openAlerts || 0}
          icon={AlertTriangle}
          trend={{ value: '0%', direction: 'neutral' }}
          gradient="from-orange-500 to-red-500"
          iconBg="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
          description="Chưa xử lý"
          className="animate-scale-in"
          style={{ animationDelay: '0.4s' }}
        />
        <StatCard
          title="Kho lạnh"
          value={`${((kpis?.onHandChill || 0) / 1000).toFixed(1)}K kg`}
          icon={Thermometer}
          trend={{ value: '+5.7%', direction: 'up' }}
          gradient="from-cyan-500 to-blue-500"
          iconBg="bg-cyan-100 dark:bg-cyan-900/30"
          iconColor="text-cyan-600 dark:text-cyan-400"
          description="Tồn kho"
          className="animate-scale-in"
          style={{ animationDelay: '0.5s' }}
        />
        <StatCard
          title="Kho đông"
          value={`${((kpis?.onHandFrozen || 0) / 1000).toFixed(1)}K kg`}
          icon={Warehouse}
          trend={{ value: '+4.3%', direction: 'up' }}
          gradient="from-indigo-500 to-purple-500"
          iconBg="bg-indigo-100 dark:bg-indigo-900/30"
          iconColor="text-indigo-600 dark:text-indigo-400"
          description="Tồn kho"
          className="animate-scale-in"
          style={{ animationDelay: '0.6s' }}
        />
        <StatCard
          title="Doanh thu"
          value={`$${((kpis?.revenue || 0) / 1000).toFixed(1)}K`}
          icon={DollarSign}
          trend={{ value: '+15.8%', direction: 'up' }}
          gradient="from-yellow-500 to-orange-500"
          iconBg="bg-yellow-100 dark:bg-yellow-900/30"
          iconColor="text-yellow-600 dark:text-yellow-400"
          description="Tháng này"
          className="animate-scale-in"
          style={{ animationDelay: '0.7s' }}
        />
        <StatCard
          title="Hiệu suất"
          value={`${kpis?.efficiency || 0}%`}
          icon={Target}
          trend={{ value: '+2.4%', direction: 'up' }}
          gradient="from-teal-500 to-green-500"
          iconBg="bg-teal-100 dark:bg-teal-900/30"
          iconColor="text-teal-600 dark:text-teal-400"
          description="Hoạt động"
          className="animate-scale-in"
          style={{ animationDelay: '0.8s' }}
        />
      </div>

      {/* Solar Energy Section */}
      <Card hover className="border-0 shadow-2xl overflow-hidden relative bg-linear-to-br from-yellow-50/50 via-orange-50/50 to-red-50/50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"></div>
        
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-xl">
                <Sun className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-3xl font-black bg-linear-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Hệ thống năng lượng mặt trời
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                  Giám sát năng lượng tái tạo - Tiết kiệm chi phí điện
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/energy')}
              variant="gradient"
              className="bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Eye className="w-4 h-4 mr-2" />
              Xem chi tiết
            </Button>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Solar Generation */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-yellow-200 dark:border-yellow-800/30 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Sun className="w-6 h-6 text-white" />
                  </div>
                  <Sparkles className="w-5 h-5 text-yellow-600 animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Phát điện hôm nay</p>
                <p className="text-4xl font-black bg-linear-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {solarData?.todayGeneration.toFixed(1) || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-medium">kWh</p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Hiện tại: <span className="font-bold text-yellow-600">{solarData?.currentGeneration.toFixed(1) || 0} kW</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Battery Status */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-green-200 dark:border-green-800/30 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                    <Battery className="w-6 h-6 text-white" />
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold ${solarData?.batteryStatus === 'CHARGING' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                    {solarData?.batteryStatus === 'CHARGING' ? '⚡ Sạc' : '🔋 Xả'}
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Dung lượng pin</p>
                <p className="text-4xl font-black bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {solarData?.batteryLevel || 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Trạng thái tốt</p>
                <div className="mt-4">
                  <Progress 
                    value={solarData?.batteryLevel || 0} 
                    variant="success" 
                    animated 
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Savings */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-blue-200 dark:border-blue-800/30 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Tiết kiệm tháng</p>
                <p className="text-4xl font-black bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {((solarData?.savingsMonth || 0) / 1000).toFixed(1)}tr
                </p>
                <p className="text-xs text-gray-500 mt-1 font-medium">VNĐ</p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400">
                    <ArrowDown className="w-3 h-3" />
                    <span>-35% chi phí điện</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CO2 Reduction */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-emerald-200 dark:border-emerald-800/30 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    🌱 Xanh
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Giảm CO₂</p>
                <p className="text-4xl font-black bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {solarData?.co2Saved || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-medium">kg tháng này</p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    ≈ {Math.round((solarData?.co2Saved || 0) / 20)} cây xanh 🌳
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Bar */}
          <div className="mt-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-600" />
                <span className="font-bold text-lg text-gray-800 dark:text-gray-200">Hiệu suất hệ thống</span>
              </div>
              <span className="text-3xl font-black text-yellow-600">{solarData?.panelEfficiency || 0}%</span>
            </div>
            <Progress 
              value={solarData?.panelEfficiency || 0} 
              variant="gradient" 
              animated 
              size="lg"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium">
              ✅ Hệ thống hoạt động tốt - Đang phát điện ổn định
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row - Quick Actions & Temperature */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card hover className="shadow-xl animate-slide-in-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-600" />
              Thao tác nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="gradient" className="h-28 flex-col gap-3 bg-linear-to-br from-blue-500 to-cyan-500">
                <Package className="w-8 h-8" />
                <span className="text-sm font-bold">Nhập hàng mới</span>
              </Button>
              <Button variant="gradient" className="h-28 flex-col gap-3 bg-linear-to-br from-green-500 to-emerald-500">
                <Truck className="w-8 h-8" />
                <span className="text-sm font-bold">Xuất hàng mới</span>
              </Button>
              <Button variant="gradient" className="h-28 flex-col gap-3 bg-linear-to-br from-purple-500 to-pink-500">
                <BarChart3 className="w-8 h-8" />
                <span className="text-sm font-bold">Xem báo cáo</span>
              </Button>
              <Button variant="gradient" className="h-28 flex-col gap-3 bg-linear-to-br from-orange-500 to-red-500">
                <AlertTriangle className="w-8 h-8" />
                <span className="text-sm font-bold">Xem cảnh báo</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card hover className="shadow-xl animate-slide-in-right">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-600" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'Đơn nhập IB-001 đã nhận', time: '2 phút' },
                { icon: Truck, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', text: 'Đơn xuất OB-045 đã gửi', time: '15 phút' },
                { icon: Thermometer, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'Kiểm tra nhiệt độ OK', time: '30 phút' },
                { icon: Users, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'Ca làm việc - 3 người', time: '1 giờ' },
                { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'Cảnh báo tồn thấp', time: '2 giờ' },
              ].map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer hover:scale-105">
                    <div className={`w-11 h-11 rounded-xl ${activity.bg} flex items-center justify-center shrink-0 shadow-md`}>
                      <Icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {activity.text}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                        🕐 {activity.time} trước
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
