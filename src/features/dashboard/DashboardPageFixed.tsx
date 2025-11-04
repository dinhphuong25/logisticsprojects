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
  Activity,
  Clock,
  RefreshCw,
  Download,
  Sun,
  Battery,
  Leaf,
  DollarSign,
  Target,
  Warehouse,
  Eye,
  Zap,
  TrendingDown,
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

export default function DashboardPageFixed() {
  const navigate = useNavigate()
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  const kpiCards = [
    {
      title: 'Nhập hàng hôm nay',
      value: kpis?.inboundToday || 0,
      change: '+12%',
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Xuất hàng hôm nay',
      value: kpis?.outboundToday || 0,
      change: '+8%',
      icon: PackageCheck,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Đơn đang xử lý',
      value: kpis?.activeOrders || 0,
      change: '-3%',
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Cảnh báo',
      value: kpis?.openAlerts || 0,
      change: '0%',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: 'Kho lạnh',
      value: `${((kpis?.onHandChill || 0) / 1000).toFixed(1)}K kg`,
      change: '+5%',
      icon: Thermometer,
      color: 'text-cyan-600',
      bg: 'bg-cyan-100 dark:bg-cyan-900/20',
    },
    {
      title: 'Kho đông',
      value: `${((kpis?.onHandFrozen || 0) / 1000).toFixed(1)}K kg`,
      change: '+4%',
      icon: Warehouse,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100 dark:bg-indigo-900/20',
    },
    {
      title: 'Doanh thu',
      value: `$${((kpis?.revenue || 0) / 1000).toFixed(1)}K`,
      change: '+15%',
      icon: DollarSign,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      title: 'Hiệu suất',
      value: `${kpis?.efficiency || 0}%`,
      change: '+2%',
      icon: Target,
      color: 'text-teal-600',
      bg: 'bg-teal-100 dark:bg-teal-900/20',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard Kho Lạnh
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Phân tích và giám sát kho hàng theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button size="sm">
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
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {card.change}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Solar Energy Section */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Sun className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Hệ thống năng lượng mặt trời</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Giám sát năng lượng tái tạo - Tiết kiệm chi phí điện
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/energy')} size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Xem chi tiết
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Solar Generation */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-white" />
                  </div>
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Phát điện hôm nay
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {solarData?.todayGeneration.toFixed(1) || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">kWh</p>
              </CardContent>
            </Card>

            {/* Battery */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Battery className="w-5 h-5 text-white" />
                  </div>
                  <Badge>{solarData?.batteryStatus === 'CHARGING' ? 'Sạc' : 'Xả'}</Badge>
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Pin
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {solarData?.batteryLevel || 0}%
                </p>
              </CardContent>
            </Card>

            {/* Savings */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Tiết kiệm
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {((solarData?.savingsMonth || 0) / 1000).toFixed(1)}tr
                </p>
                <p className="text-xs text-gray-500 mt-1">VNĐ</p>
              </CardContent>
            </Card>

            {/* CO2 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <Badge variant="secondary">Xanh</Badge>
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Giảm CO₂
                </p>
                <p className="text-3xl font-bold text-emerald-600">
                  {solarData?.co2Saved || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">kg tháng này</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Bar */}
          <div className="mt-6 bg-white/60 dark:bg-gray-900/60 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold">Hiệu suất hệ thống</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {solarData?.panelEfficiency || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all"
                style={{ width: `${solarData?.panelEfficiency || 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
