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

  const { data: kpis, refetch } = useQuery<KPIData>({
    queryKey: ['kpis'],
    queryFn: async () => {
      const res = await apiClient.get('/kpis')
      return res.data
    },
    refetchInterval: 5000,
  })

  // Query solar data
  const { data: solarData } = useQuery<SolarData>({
    queryKey: ['solar-data-dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/energy/solar')
      return res.data
    },
    refetchInterval: 5000,
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Kho Lạnh
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Tổng quan hệ thống quản lý kho lạnh
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Button onClick={() => navigate('/reports')}>
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Hàng nhập hôm nay</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                    {kpis?.inboundToday ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Hàng xuất hôm nay</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                    {kpis?.outboundToday ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <PackageCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Tồn kho lạnh</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                    {kpis?.onHandChill ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Thermometer className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">Cảnh báo</p>
                  <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-2">
                    {kpis?.openAlerts ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Solar Energy Section */}
        {solarData && (
          <Card className="border-0 shadow-2xl overflow-hidden relative bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Sun className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                      Hệ thống năng lượng mặt trời
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Giám sát và quản lý năng lượng xanh
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
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phát điện hiện tại</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    {solarData.currentGeneration?.toFixed(1)} kW
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pin ({solarData.batteryLevel}%)</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {solarData.batteryStatus === 'CHARGING' ? 'Đang sạc' : 
                     solarData.batteryStatus === 'DISCHARGING' ? 'Đang xả' : 'Chờ'}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${solarData.batteryLevel}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}