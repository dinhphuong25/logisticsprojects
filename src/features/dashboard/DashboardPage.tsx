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

  const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    notation: 'compact',
    maximumFractionDigits: 1,
  })

  const compactNumber = new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })

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

  const heroHighlights = [
    {
      label: 'Doanh thu hôm nay',
      value: currencyFormatter.format(kpis?.revenue ?? 0),
      meta: '↑ 15.8% so với hôm qua',
    },
    {
      label: 'Đơn đang xử lý',
      value: compactNumber.format(kpis?.activeOrders ?? 0),
      meta: 'Cần hoàn tất trước 18h',
    },
    {
      label: 'Nhập hàng',
      value: compactNumber.format(kpis?.inboundToday ?? 0),
      meta: 'Lịch trình đúng 94%',
    },
    {
      label: 'Hiệu suất',
      value: `${kpis?.efficiency ?? 0}%`,
      meta: 'Mục tiêu 95%',
    },
  ]

  const liveHealth = [
    {
      label: 'Cảnh báo mở',
      value: kpis?.openAlerts ?? 0,
      status: kpis?.openAlerts ? 'Cần xử lý sớm' : 'Ổn định',
      accentText: 'text-orange-600',
      accentBg: 'bg-orange-100',
      icon: AlertTriangle,
    },
    {
      label: 'Kho lạnh',
      value: `${((kpis?.onHandChill || 0) / 1000).toFixed(1)}K kg`,
      status: 'Nguồn hàng ổn định',
      accentText: 'text-cyan-600',
      accentBg: 'bg-cyan-100',
      icon: Thermometer,
    },
    {
      label: 'Kho đông',
      value: `${((kpis?.onHandFrozen || 0) / 1000).toFixed(1)}K kg`,
      status: 'Đầy 78% dung lượng',
      accentText: 'text-indigo-600',
      accentBg: 'bg-indigo-100',
      icon: Warehouse,
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
    <div className="space-y-6 animate-fade-in px-2 sm:px-0">
      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 text-white">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-500/30 to-transparent" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-500/40 blur-3xl" />
          <CardContent className="relative space-y-6 p-6 sm:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-100">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
                  EcoFresh Pulse
                </p>
                <div className="space-y-2">
                  <h1 className="text-3xl font-black leading-tight sm:text-4xl">Trung tâm điều khiển chuỗi lạnh</h1>
                  <p className="text-sm text-white/70">
                    Theo dõi cảm biến, đơn hàng và năng lượng theo thời gian thực – mọi dữ liệu hội tụ trong một bảng điều khiển.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['today', 'week', 'month'] as Array<typeof timeRange>).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className={`h-9 px-4 text-xs ${
                      timeRange === range ? 'bg-white text-slate-900' : 'border-white/40 text-white/80 hover:text-white'
                    }`}
                  >
                    {range === 'today' ? 'Hôm nay' : range === 'week' ? 'Tuần' : 'Tháng'}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-9 px-3 border-white/40 text-white/80 hover:text-white"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button size="sm" className="h-9 bg-white/20 px-4 text-xs font-semibold text-white hover:bg-white/30">
                  <Download className="mr-2 h-4 w-4" />
                  Báo cáo
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.8)]"></span>
              Hệ thống hoạt động · tất cả cảm biến đang online
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {heroHighlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">{item.label}</p>
                  <p className="mt-2 text-xl font-black sm:text-2xl">{item.value}</p>
                  <p className="text-xs text-white/70">{item.meta}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm">
          <CardContent className="space-y-4 p-6">
            <div>
              <p className="text-sm font-semibold text-slate-500">Tình trạng trực tiếp</p>
              <h3 className="text-xl font-black text-slate-900">EcoFresh Pulse</h3>
            </div>
            <div className="space-y-4">
              {liveHealth.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={`${item.label}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.accentBg}`}>
                        <Icon className={`h-4 w-4 ${item.accentText}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.status}</p>
                      </div>
                    </div>
                    <p className="text-lg font-black text-slate-900">{item.value}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card
              key={index}
              className="rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{card.title}</p>
                    <p className="text-2xl font-black text-slate-900">{card.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconBg}`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-1 font-semibold ${getTrendColor(card.trend)}`}>
                    {getTrendIcon(card.trend)}
                    {card.change}
                  </span>
                  <span className="text-slate-400">So với hôm qua</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      {/* Solar Energy Section - Mobile First */}
      <Card className="border-0 shadow-lg overflow-hidden relative bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20 p-2 sm:p-0">
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-80 sm:h-80 bg-yellow-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-56 sm:h-56 bg-orange-500/5 rounded-full blur-2xl"></div>
        
        <CardHeader className="relative z-10 p-3 sm:p-6">
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-md flex-shrink-0">
                  <Sun className="w-4 h-4 sm:w-6 sm:h-6 text-white animate-pulse" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent leading-tight">
                    Năng lượng mặt trời
                  </CardTitle>
                  <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                    Giám sát thời gian thực
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/energy')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-xs h-8 px-2 sm:px-4 flex-shrink-0"
              >
                <Eye className="w-3.5 h-3.5 sm:mr-2" />
                <span className="hidden sm:inline">Chi tiết</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 p-3 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            {/* Solar Generation */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-5 border border-yellow-200 dark:border-yellow-800/30 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600 animate-pulse" />
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Phát điện hôm nay</p>
              <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {solarData?.todayGeneration.toFixed(1) || 0}
              </p>
              <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5">kWh</p>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">
                  Hiện tại: <span className="font-bold text-yellow-600">{solarData?.currentGeneration.toFixed(1) || 0} kW</span>
                </p>
              </div>
            </div>

            {/* Battery Status */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-5 border border-green-200 dark:border-green-800/30 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Battery className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <Badge className={`text-[9px] sm:text-xs px-1 sm:px-1.5 ${solarData?.batteryStatus === 'CHARGING' ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-orange-500/20 text-orange-700 border-orange-500/30'}`}>
                  {solarData?.batteryStatus === 'CHARGING' ? 'Sạc' : 'Xả'}
                </Badge>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Dung lượng pin</p>
              <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {solarData?.batteryLevel || 0}%
              </p>
              <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5">Trạng thái tốt</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${solarData?.batteryLevel || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Savings */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-5 border border-blue-200 dark:border-blue-800/30 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tiết kiệm tháng này</p>
              <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {((solarData?.savingsMonth || 0) / 1000).toFixed(1)}tr
              </p>
              <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5">VNĐ</p>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-0.5 text-[9px] sm:text-xs text-green-600 dark:text-green-400">
                  <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="font-semibold">-35% chi phí</span>
                </div>
              </div>
            </div>

            {/* CO2 Reduction */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-5 border border-emerald-200 dark:border-emerald-800/30 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[9px] sm:text-xs px-1 sm:px-1.5">
                  Xanh
                </Badge>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Giảm CO₂</p>
              <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {solarData?.co2Saved || 0}
              </p>
              <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5">kg tháng này</p>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">
                  ≈ {Math.round((solarData?.co2Saved || 0) / 20)} cây
                </p>
              </div>
            </div>
          </div>

          {/* Performance Bar */}
          <div className="mt-3 sm:mt-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200 dark:border-gray-700/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600" />
                <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">Hiệu suất</span>
              </div>
              <span className="text-lg sm:text-xl font-black text-yellow-600">{solarData?.panelEfficiency || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 h-full rounded-full transition-all duration-1000 relative"
                style={{ width: `${solarData?.panelEfficiency || 0}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
            <p className="text-[9px] sm:text-xs text-gray-500 mt-1 sm:mt-1.5">Đang hoạt động ổn định</p>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Analytics Row - Mobile First */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 sm:gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-1.5 text-sm sm:text-lg">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <span>Hoạt động kho</span>
              </CardTitle>
              <Badge variant="outline" className="text-[9px] sm:text-xs px-1 sm:px-2">
                <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              {/* Simple bar chart visualization */}
              <div className="space-y-1.5 sm:space-y-2">
                {chartData.slice(-5).map((data, index) => {
                  const maxValue = Math.max(...chartData.map((d) => Math.max(d.inbound, d.outbound)))
                  const inboundWidth = (data.inbound / maxValue) * 100
                  const outboundWidth = (data.outbound / maxValue) * 100

                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">
                        <span>{new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="font-bold">{data.inbound + data.outbound}</span>
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-8 sm:w-12 text-[9px] sm:text-xs text-blue-600 font-bold flex-shrink-0">Nhập</div>
                          <div className="flex-1 h-4 sm:h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 flex items-center justify-end pr-1.5 sm:pr-2"
                              style={{ width: `${inboundWidth}%` }}
                            >
                              <span className="text-[10px] sm:text-xs font-semibold text-white">{data.inbound}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-10 sm:w-12 md:w-16 text-[10px] sm:text-xs text-green-600 font-medium flex-shrink-0">Xuất</div>
                          <div className="flex-1 h-5 sm:h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 flex items-center justify-end pr-1.5 sm:pr-2"
                              style={{ width: `${outboundWidth}%` }}
                            >
                              <span className="text-[10px] sm:text-xs font-semibold text-white">{data.outbound}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-3 border-t">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex-shrink-0"></div>
                  <span className="text-[9px] sm:text-xs font-bold">Nhập</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex-shrink-0"></div>
                  <span className="text-[9px] sm:text-xs font-bold">Xuất</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temperature Monitoring */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-1.5 text-sm sm:text-lg">
              <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 flex-shrink-0" />
              <span>Nhiệt độ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-6">
            {/* Temperature Gauge */}
            <div className="relative">
              <div className="w-full h-28 sm:h-40 bg-gradient-to-b from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg sm:rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent"></div>
                <div className="relative z-10 text-center">
                  <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-blue-600">
                    4.2°C
                  </div>
                  <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 mt-1">TB</p>
                </div>
              </div>
            </div>

            {/* Zone Temperatures */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between p-2 sm:p-2.5 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse flex-shrink-0"></div>
                  <span className="text-[10px] sm:text-xs font-bold truncate">Khu A</span>
                </div>
                <span className="text-[10px] sm:text-xs font-black text-cyan-600 flex-shrink-0 ml-2">2.5°C</span>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></div>
                  <span className="text-[10px] sm:text-xs font-bold truncate">Khu B</span>
                </div>
                <span className="text-[10px] sm:text-xs font-black text-blue-600 flex-shrink-0 ml-2">3.8°C</span>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse flex-shrink-0"></div>
                  <span className="text-[10px] sm:text-xs font-bold truncate">Đông</span>
                </div>
                <span className="text-[10px] sm:text-xs font-black text-purple-600 flex-shrink-0 ml-2">-22°C</span>
              </div>
            </div>

            <Button variant="outline" className="w-full text-[10px] sm:text-xs h-8 px-2">
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
              Xem tất cả
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Quick Actions & Recent Activity - Mobile Optimized */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 sm:gap-6">
        {/* Quick Actions */}
        <Card className="border-0 shadow-lg sm:shadow-xl">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
              <span>Thao tác</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button className="h-16 sm:h-20 flex-col gap-1 sm:gap-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 active:scale-95 transition-transform">
                <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">Nhập</span>
              </Button>
              <Button className="h-16 sm:h-20 flex-col gap-1 sm:gap-1.5 bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 active:scale-95 transition-transform">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">Xuất</span>
              </Button>
              <Button className="h-16 sm:h-20 flex-col gap-1 sm:gap-1.5 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:scale-95 transition-transform">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">Báo cáo</span>
              </Button>
              <Button className="h-16 sm:h-20 flex-col gap-1 sm:gap-1.5 bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:scale-95 transition-transform">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">Cảnh báo</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg sm:shadow-xl">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
              <span>Hoạt động</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-1.5 sm:space-y-2">
              {[
                { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Nhập IB-001 đã nhận', time: '2 phút' },
                { icon: Truck, color: 'text-green-600', bg: 'bg-green-100', text: 'Xuất OB-045 đã gửi', time: '15 phút' },
                { icon: Thermometer, color: 'text-cyan-600', bg: 'bg-cyan-100', text: 'Kiểm tra nhiệt độ', time: '30 phút' },
                { icon: Users, color: 'text-purple-600', bg: 'bg-purple-100', text: 'Thay đổi ca - 3 người', time: '1 giờ' },
                { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', text: 'Tồn thấp SKU-003', time: '2 giờ' },
              ].map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:scale-98">
                    <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg ${activity.bg} dark:${activity.bg}/20 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                        {activity.text}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
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
