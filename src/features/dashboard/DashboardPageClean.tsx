import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Package,
  PackageCheck,
  Thermometer,
  AlertTriangle,
  RefreshCw,
  Sun,
  Battery,
  Zap,
  Activity,
  Eye,
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

  const { data: solarData, isLoading: solarLoading, error: solarError } = useQuery<SolarData>({
    queryKey: ['solar-data-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/energy/solar')
      return response.data
    },
    refetchInterval: 5000,
    retry: 3,
  })

  // Show error state
  if (kpisError || solarError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Không thể kết nối đến server. Vui lòng thử lại sau.
          </p>
          <Button onClick={() => window.location.reload()} size="lg">
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
          <RefreshCw className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Dashboard Kho Lạnh
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Tổng quan hệ thống quản lý kho lạnh
            </p>
          </div>
          
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Inbound Card */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300"></div>
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">
                    Hàng nhập hôm nay
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {kpis?.inboundToday || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Đơn hàng</span>
                <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                  <span>+12%</span>
                  <Activity className="w-3 h-3" />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Outbound Card */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all duration-300"></div>
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <PackageCheck className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1">
                    Hàng xuất hôm nay
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {kpis?.outboundToday || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Đơn hàng</span>
                <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                  <span>+8%</span>
                  <Activity className="w-3 h-3" />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Card */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 group-hover:from-purple-500/10 group-hover:to-violet-500/10 transition-all duration-300"></div>
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Thermometer className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">
                    Tồn kho lạnh
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    {kpis?.onHandChill || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Sản phẩm</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                  <span>4°C</span>
                  <Thermometer className="w-3 h-3" />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Alerts Card */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 group-hover:from-red-500/10 group-hover:to-orange-500/10 transition-all duration-300"></div>
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">
                    Cảnh báo
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    {kpis?.openAlerts || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Cần xử lý</span>
                <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                  <span>Ưu tiên cao</span>
                  <AlertTriangle className="w-3 h-3" />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Solar Energy Section */}
        {solarData && (
          <Card className="border-0 shadow-2xl overflow-hidden relative bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/10 rounded-full blur-3xl"></div>
            
            <CardHeader className="relative pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-xl animate-pulse">
                    <Sun className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                      Hệ thống năng lượng mặt trời
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Giám sát và quản lý năng lượng xanh
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/energy')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Xem chi tiết
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Generation Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                      Phát điện hiện tại
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      {solarData.currentGeneration?.toFixed(1)} kW
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <Activity className="w-3 h-3" />
                      <span>Hoạt động tốt</span>
                    </div>
                  </div>
                </div>

                {/* Today Generation Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Sun className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                      Hôm nay
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {solarData.todayGeneration?.toFixed(1)} kWh
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <Activity className="w-3 h-3" />
                      <span>+15% so với hôm qua</span>
                    </div>
                  </div>
                </div>

                {/* Battery Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Battery className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                      Pin
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {solarData.batteryLevel}%
                    </p>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${solarData.batteryLevel}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Savings Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                      Tiết kiệm tháng này
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      ${solarData.savingsMonth?.toFixed(0)}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <Activity className="w-3 h-3" />
                      <span>CO₂: -{solarData.co2Saved}kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Orders */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 overflow-hidden group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                Đơn hàng đang xử lý
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {kpis?.activeOrders || 0}
              </p>
            </CardContent>
          </Card>

          {/* Frozen Inventory */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 overflow-hidden group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Thermometer className="w-5 h-5 text-white" />
                </div>
                <Activity className="w-5 h-5 text-cyan-500 animate-pulse" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                Tồn kho đông (-18°C)
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {kpis?.onHandFrozen || 0}
              </p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 overflow-hidden group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <Activity className="w-5 h-5 text-green-500 animate-pulse" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                Doanh thu hôm nay
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                ${kpis?.revenue?.toFixed(0) || 0}
              </p>
            </CardContent>
          </Card>

          {/* Efficiency */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 overflow-hidden group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <Activity className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                Hiệu suất hoạt động
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                {kpis?.efficiency || 0}%
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
