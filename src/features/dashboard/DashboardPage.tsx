import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  PackageCheck,
  Thermometer,
  AlertTriangle,
  TrendingDown,
  Warehouse,
  Activity,
  DollarSign,
  Users,
  Truck,
  Clock,
  Target,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  RefreshCw,
  Download,
  Sun,
  Battery,
  Leaf,
  Sparkles,
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

interface ChartData {
  date: string
  inbound: number
  outbound: number
  temperature: number
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

export default function DashboardPage() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today')
  const [refreshing, setRefreshing] = useState(false)

  const { data: kpis, refetch, isLoading: kpisLoading, error: kpisError } = useQuery<KPIData>({
    queryKey: ['kpis'],
    queryFn: async () => {
      const res = await apiClient.get('/kpis')
      return res.data
    },
    refetchInterval: 5000,
    retry: 3,
  })

  // Query solar data
  const { data: solarData, isLoading: solarLoading, error: solarError } = useQuery<SolarData>({
    queryKey: ['solar-data-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/energy/solar')
      return response.data
    },
    refetchInterval: 5000,
    retry: 3,
  })

  // Mock chart data - must be before any conditional returns
  const [chartData] = useState<ChartData[]>([
    { date: '2025-10-28', inbound: 45, outbound: 38, temperature: 4.2 },
    { date: '2025-10-29', inbound: 52, outbound: 41, temperature: 4.1 },
    { date: '2025-10-30', inbound: 48, outbound: 45, temperature: 4.3 },
    { date: '2025-10-31', inbound: 61, outbound: 52, temperature: 4.0 },
    { date: '2025-11-01', inbound: 55, outbound: 48, temperature: 4.2 },
    { date: '2025-11-02', inbound: 58, outbound: 51, temperature: 4.1 },
  ])

  // Show error state
  if (kpisError || solarError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white font-bold mb-2">Lỗi tải dữ liệu</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {(kpisError as Error)?.message || (solarError as Error)?.message || 'Không thể kết nối đến server'}
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tải lại trang
          </Button>
        </div>
      </div>
    )
  }

  // Show loading state
  if (kpisLoading || solarLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const kpiCards = [
    {
      title: 'Nhập hàng hôm nay',
      value: kpis?.inboundToday || 0,
      change: '+12.5%',
      trend: 'up' as const,
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Xuất hàng hôm nay',
      value: kpis?.outboundToday || 0,
      change: '+8.2%',
      trend: 'up' as const,
      icon: PackageCheck,
      color: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Đơn hàng đang xử lý',
      value: kpis?.activeOrders || 0,
      change: '-3.1%',
      trend: 'down' as const,
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Cảnh báo chưa xử lý',
      value: kpis?.openAlerts || 0,
      change: '0%',
      trend: 'neutral' as const,
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Kho lạnh',
      value: `${((kpis?.onHandChill || 0) / 1000).toFixed(1)}K kg`,
      change: '+5.7%',
      trend: 'up' as const,
      icon: Thermometer,
      color: 'from-cyan-500 to-blue-500',
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      title: 'Kho đông',
      value: `${((kpis?.onHandFrozen || 0) / 1000).toFixed(1)}K kg`,
      change: '+4.3%',
      trend: 'up' as const,
      icon: Warehouse,
      color: 'from-indigo-500 to-purple-500',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'Doanh thu',
      value: `$${((kpis?.revenue || 0) / 1000).toFixed(1)}K`,
      change: '+15.8%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-500',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'Hiệu suất',
      value: `${kpis?.efficiency || 0}%`,
      change: '+2.4%',
      trend: 'up' as const,
      icon: Target,
      color: 'from-teal-500 to-green-500',
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
  ]

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-3 h-3" />
      case 'down':
        return <ArrowDown className="w-3 h-3" />
      default:
        return <Minus className="w-3 h-3" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #0ea5e9, #8b5cf6, #ec4899)' }}>
            Tổng quan bảng điều khiển
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Phân tích và giám sát kho hàng theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3">
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
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card
              key={index}
              className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
              
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${card.iconColor}`} />
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${getTrendColor(card.trend)} bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm`}
                  >
                    <span className="flex items-center gap-1">
                      {getTrendIcon(card.trend)}
                      {card.change}
                    </span>
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {card.value}
                  </p>
                </div>

                {/* Sparkline effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Solar Energy Section */}
      <Card className="border-0 shadow-2xl overflow-hidden relative bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"></div>
        
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Sun className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Hệ thống năng lượng mặt trời
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Giám sát năng lượng tái tạo - Tiết kiệm chi phí điện
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/energy')}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Xem chi tiết
            </Button>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Solar Generation */}
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800/30 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-5 h-5 text-yellow-600 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Phát điện hôm nay</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {solarData?.todayGeneration.toFixed(1) || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">kWh</p>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Hiện tại: <span className="font-bold text-yellow-600">{solarData?.currentGeneration.toFixed(1) || 0} kW</span>
                </p>
              </div>
            </div>

            {/* Battery Status */}
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-green-200 dark:border-green-800/30 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Battery className="w-6 h-6 text-white" />
                </div>
                <Badge className={solarData?.batteryStatus === 'CHARGING' ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-orange-500/20 text-orange-700 border-orange-500/30'}>
                  {solarData?.batteryStatus === 'CHARGING' ? 'Đang sạc' : 'Đang xả'}
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Dung lượng pin</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {solarData?.batteryLevel || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Trạng thái tốt</p>
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${solarData?.batteryLevel || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Savings */}
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-blue-200 dark:border-blue-800/30 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <TrendingDown className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tiết kiệm tháng này</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {((solarData?.savingsMonth || 0) / 1000).toFixed(1)}tr
              </p>
              <p className="text-xs text-gray-500 mt-1">VNĐ</p>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <ArrowDown className="w-3 h-3" />
                  <span className="font-semibold">-35% chi phí điện</span>
                </div>
              </div>
            </div>

            {/* CO2 Reduction */}
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800/30 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                  Xanh
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Giảm phát thải CO₂</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {solarData?.co2Saved || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">kg tháng này</p>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  ≈ {Math.round((solarData?.co2Saved || 0) / 20)} cây xanh
                </p>
              </div>
            </div>
          </div>

          {/* Performance Bar */}
          <div className="mt-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-gray-800 dark:text-gray-200">Hiệu suất hệ thống</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{solarData?.panelEfficiency || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 h-4 rounded-full transition-all duration-1000 relative"
                style={{ width: `${solarData?.panelEfficiency || 0}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Hệ thống hoạt động tốt - Đang phát điện ổn định</p>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2 border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Hoạt động kho hàng
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Trực tiếp
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple bar chart visualization */}
              <div className="space-y-3">
                {chartData.slice(-5).map((data, index) => {
                  const maxValue = Math.max(...chartData.map((d) => Math.max(d.inbound, d.outbound)))
                  const inboundWidth = (data.inbound / maxValue) * 100
                  const outboundWidth = (data.outbound / maxValue) * 100

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>{new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="font-semibold">{data.inbound + data.outbound} orders</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-xs text-blue-600 font-medium">Nhập</div>
                          <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                              style={{ width: `${inboundWidth}%` }}
                            >
                              <span className="text-xs font-semibold text-white">{data.inbound}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-xs text-green-600 font-medium">Xuất</div>
                          <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                              style={{ width: `${outboundWidth}%` }}
                            >
                              <span className="text-xs font-semibold text-white">{data.outbound}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  <span className="text-xs font-medium">Đơn nhập hàng</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <span className="text-xs font-medium">Đơn xuất hàng</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temperature Monitoring */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-cyan-600" />
              Trạng thái nhiệt độ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Temperature Gauge */}
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-b from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent"></div>
                <div className="relative z-10 text-center">
                  <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-blue-600">
                    4.2°C
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Nhiệt độ trung bình</p>
                </div>
              </div>
            </div>

            {/* Zone Temperatures */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                  <span className="text-sm font-medium">Khu vực lạnh A</span>
                </div>
                <span className="text-sm font-bold text-cyan-600">2.5°C</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-sm font-medium">Khu vực lạnh B</span>
                </div>
                <span className="text-sm font-bold text-blue-600">3.8°C</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="text-sm font-medium">Khu vực đông</span>
                </div>
                <span className="text-sm font-bold text-purple-600">-22°C</span>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              Xem tất cả cảm biến
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Thao tác nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-24 flex-col gap-2 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                <Package className="w-6 h-6" />
                <span className="text-sm font-semibold">Nhập hàng mới</span>
              </Button>
              <Button className="h-24 flex-col gap-2 bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                <Truck className="w-6 h-6" />
                <span className="text-sm font-semibold">Xuất hàng mới</span>
              </Button>
              <Button className="h-24 flex-col gap-2 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm font-semibold">Xem báo cáo</span>
              </Button>
              <Button className="h-24 flex-col gap-2 bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <AlertTriangle className="w-6 h-6" />
                <span className="text-sm font-semibold">Xem cảnh báo</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Đơn nhập hàng IB-001 đã nhận', time: '2 phút trước' },
                { icon: Truck, color: 'text-green-600', bg: 'bg-green-100', text: 'Đơn xuất hàng OB-045 đã gửi đi', time: '15 phút trước' },
                { icon: Thermometer, color: 'text-cyan-600', bg: 'bg-cyan-100', text: 'Kiểm tra nhiệt độ hoàn tất', time: '30 phút trước' },
                { icon: Users, color: 'text-purple-600', bg: 'bg-purple-100', text: 'Thay đổi ca làm việc - 3 người đang làm', time: '1 giờ trước' },
                { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', text: 'Cảnh báo hàng tồn thấp - SKU-003', time: '2 giờ trước' },
              ].map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className={`w-10 h-10 rounded-lg ${activity.bg} dark:${activity.bg}/20 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {activity.text}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.time}
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
