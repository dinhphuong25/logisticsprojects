import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Search,
  Download,
  Grid3x3,
  CheckCircle,
  AlertCircle,
  Package,
  Layers,
  Box,
  Maximize2,
  Filter,
  RefreshCw,
  Eye,
  Settings,
  Zap,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

interface Location {
  id: string
  code: string
  rack: string
  level: string
  slot: string
  zoneId: string
  maxQty: number
  currentQty: number
  cubic: number
  status: 'EMPTY' | 'OCCUPIED' | 'FULL' | 'RESERVED' | 'BLOCKED'
}

interface Zone {
  id: string
  name: string
  type: string
}

export default function LocationManagementPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await apiClient.get('/locations')
      return response.data
    },
  })

  const { data: zones = [] } = useQuery<Zone[]>({
    queryKey: ['zones'],
    queryFn: async () => {
      const response = await apiClient.get('/zones')
      return response.data
    },
  })

  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Location> }) => {
      await apiClient.put(`/locations/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      toast.success('Đã cập nhật vị trí thành công')
    },
    onError: () => {
      toast.error('Không thể cập nhật vị trí')
    },
  })

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch = loc.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesZone = selectedZone === 'all' || loc.zoneId === selectedZone
    const matchesStatus = selectedStatus === 'all' || loc.status === selectedStatus
    return matchesSearch && matchesZone && matchesStatus
  })

  const stats = {
    total: locations.length,
    empty: locations.filter((l) => l.status === 'EMPTY').length,
    occupied: locations.filter((l) => l.status === 'OCCUPIED').length,
    full: locations.filter((l) => l.status === 'FULL').length,
    reserved: locations.filter((l) => l.status === 'RESERVED').length,
    blocked: locations.filter((l) => l.status === 'BLOCKED').length,
    utilization: locations.length > 0 
      ? Math.round(
          (locations.reduce((sum, l) => sum + l.currentQty, 0) /
            locations.reduce((sum, l) => sum + l.maxQty, 0)) *
            100
        )
      : 0,
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['locations'] })
    setTimeout(() => setIsRefreshing(false), 1000)
    toast.success('Đã làm mới dữ liệu!')
  }

  const getStatusColor = (status: string) => {
    const colors = {
      EMPTY: 'bg-gray-100 dark:bg-gray-800 border-gray-300',
      OCCUPIED: 'bg-blue-100 dark:bg-blue-900/30 border-blue-400',
      FULL: 'bg-green-100 dark:bg-green-900/30 border-green-400',
      RESERVED: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400',
      BLOCKED: 'bg-red-100 dark:bg-red-900/30 border-red-400',
    }
    return colors[status as keyof typeof colors] || colors.EMPTY
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FULL':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'OCCUPIED':
        return <Package className="w-4 h-4 text-blue-600" />
      case 'BLOCKED':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <MapPin className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-teal-500/10 to-green-500/10 rounded-3xl blur-3xl -z-10"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-teal-500 to-green-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-all"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-teal-500 to-green-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Grid3x3 className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 via-teal-600 to-green-600 dark:from-blue-400 dark:via-teal-400 dark:to-green-400 bg-clip-text text-transparent">
                  Quản lý vị trí
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Giám sát và quản lý vị trí lưu trữ trong kho
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-2 hover:border-blue-500 hover:text-blue-600 transition-all"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('compact')}
                className="h-8 px-3"
              >
                <Layers className="w-4 h-4" />
              </Button>
            </div>

            <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all">
              <Download className="w-4 h-4 mr-2" />
              Xuất sơ đồ
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Enhanced Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Total Locations */}
        <Card className="relative overflow-hidden border-2 border-blue-200 dark:border-blue-800 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Grid3x3 className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Tổng vị trí
            </p>
            <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {stats.total}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">100%</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Empty */}
        <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-slate-500/10 group-hover:from-gray-500/20 group-hover:to-slate-500/20 transition-all"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-slate-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <Eye className="w-5 h-5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Trống
            </p>
            <p className="text-3xl font-black text-gray-600 dark:text-gray-300">
              {stats.empty}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-gray-400">
                {Math.round((stats.empty / stats.total) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Occupied */}
        <Card className="relative overflow-hidden border-2 border-blue-200 dark:border-blue-800 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-white" />
              </div>
              <Zap className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Có hàng
            </p>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {stats.occupied}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge className="text-xs bg-blue-500">
                {Math.round((stats.occupied / stats.total) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Full */}
        <Card className="relative overflow-hidden border-2 border-green-200 dark:border-green-800 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-all"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <Box className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Đầy
            </p>
            <p className="text-3xl font-black text-green-600 dark:text-green-400">
              {stats.full}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge className="text-xs bg-green-500">
                {Math.round((stats.full / stats.total) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Reserved */}
        <Card className="relative overflow-hidden border-2 border-yellow-200 dark:border-yellow-800 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 group-hover:from-yellow-500/20 group-hover:to-orange-500/20 transition-all"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Đặt chỗ
            </p>
            <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">
              {stats.reserved}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge className="text-xs bg-yellow-500">
                {Math.round((stats.reserved / stats.total) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Utilization */}
        <Card className="relative overflow-hidden border-2 border-purple-200 dark:border-purple-800 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Maximize2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Sử dụng
            </p>
            <p className="text-3xl font-black text-purple-600 dark:text-purple-400">
              {stats.utilization}%
            </p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 rounded-full"
                style={{ width: `${stats.utilization}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Enhanced */}
      <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Bộ lọc tìm kiếm</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-hover:text-blue-500" />
                <Input
                  placeholder="Tìm mã vị trí... (A-01-01)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium"
                />
              </div>
            </div>

            {/* Zone Filter */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all"></div>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="relative w-full h-12 px-4 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all font-medium cursor-pointer appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.5rem 1.5rem',
                }}
              >
                <option value="all">🏢 Tất cả khu vực</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    📦 {zone.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all"></div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="relative w-full h-12 px-4 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-medium cursor-pointer appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.5rem 1.5rem',
                }}
              >
                <option value="all">🎯 Tất cả trạng thái</option>
                <option value="EMPTY">⚪ Trống</option>
                <option value="OCCUPIED">🔵 Có hàng</option>
                <option value="FULL">🟢 Đầy</option>
                <option value="RESERVED">🟡 Đặt chỗ</option>
                <option value="BLOCKED">🔴 Bị khóa</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedZone !== 'all' || selectedStatus !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Đang lọc:</span>
                {searchTerm && (
                  <Badge className="bg-blue-500 hover:bg-blue-600 cursor-pointer" onClick={() => setSearchTerm('')}>
                    Tìm kiếm: "{searchTerm}" ✕
                  </Badge>
                )}
                {selectedZone !== 'all' && (
                  <Badge className="bg-teal-500 hover:bg-teal-600 cursor-pointer" onClick={() => setSelectedZone('all')}>
                    Khu vực: {zones.find(z => z.id === selectedZone)?.name} ✕
                  </Badge>
                )}
                {selectedStatus !== 'all' && (
                  <Badge className="bg-purple-500 hover:bg-purple-600 cursor-pointer" onClick={() => setSelectedStatus('all')}>
                    Trạng thái: {selectedStatus} ✕
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedZone('all')
                    setSelectedStatus('all')
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Locations Grid - Enhanced 3D Cards */}
      <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-teal-50 to-green-50 dark:from-blue-900/20 dark:via-teal-900/20 dark:to-green-900/20 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg">
                <Grid3x3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-black">
                  Sơ đồ vị trí
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Hiển thị {filteredLocations.length} vị trí
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-3 py-1.5 text-sm font-bold shadow-lg">
                {filteredLocations.length} / {stats.total}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
            {filteredLocations.map((location, index) => {
              const utilization = (location.currentQty / location.maxQty) * 100
              const zone = zones.find((z) => z.id === location.zoneId)

              return (
                <div
                  key={location.id}
                  className={`group relative border-2 rounded-lg p-2.5 cursor-pointer hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 min-h-[140px] flex flex-col ${getStatusColor(
                    location.status
                  )}`}
                  style={{
                    animationDelay: `${index * 0.02}s`,
                    animation: 'slideUp 0.5s ease-out forwards',
                  }}
                  onClick={() => {
                    toast.info(`📍 Vị trí: ${location.code}`, {
                      description: `🏢 Khu vực: ${zone?.name || 'N/A'}\n📦 Dung lượng: ${location.currentQty}/${location.maxQty}\n🎯 Trạng thái: ${location.status}\n📊 Sử dụng: ${utilization.toFixed(1)}%`,
                      duration: 5000,
                    })
                  }}
                >
                  {/* 3D Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-800/50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"></div>
                  
                  {/* Status Icon */}
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center transform group-hover:scale-125 group-hover:rotate-12 transition-all z-10">
                    {getStatusIcon(location.status)}
                  </div>

                  {/* Location Code */}
                  <div className="relative font-mono font-black text-xs mb-1.5 text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {location.code}
                  </div>

                  {/* Zone Badge */}
                  <div className="relative mb-2">
                    <Badge 
                      variant="secondary" 
                      className="text-[10px] font-semibold px-1.5 py-0.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow-sm truncate max-w-full block"
                    >
                      {zone?.name || 'N/A'}
                    </Badge>
                  </div>

                  {/* Capacity Bar with Animation */}
                  <div className="relative space-y-1.5 mt-auto">
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{ width: `${utilization}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                    <div className="text-[10px] text-center font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                      {location.currentQty}/{location.maxQty}
                      <span className="ml-0.5 text-[9px] text-gray-500">({utilization.toFixed(0)}%)</span>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/0 via-teal-500/0 to-green-500/0 group-hover:from-blue-500/20 group-hover:via-teal-500/20 group-hover:to-green-500/20 transition-all duration-300 pointer-events-none"></div>
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {filteredLocations.length === 0 && (
            <div className="text-center py-16">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-full blur-3xl"></div>
                <MapPin className="relative w-20 h-20 mx-auto mb-6 text-gray-400 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                Không tìm thấy vị trí nào
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                Thử thay đổi bộ lọc hoặc tìm kiếm khác
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedZone('all')
                  setSelectedStatus('all')
                }}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Đặt lại bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend - Enhanced with Colors */}
      <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-red-900/20 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl font-black">Chú thích trạng thái</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { 
                status: 'EMPTY', 
                label: 'Trống', 
                gradient: 'from-gray-400 to-slate-500',
                count: stats.empty
              },
              { 
                status: 'OCCUPIED', 
                label: 'Có hàng', 
                gradient: 'from-blue-500 to-indigo-600',
                count: stats.occupied
              },
              { 
                status: 'FULL', 
                label: 'Đầy', 
                gradient: 'from-green-500 to-emerald-600',
                count: stats.full
              },
              { 
                status: 'RESERVED', 
                label: 'Đặt chỗ', 
                gradient: 'from-yellow-500 to-orange-500',
                count: stats.reserved
              },
              { 
                status: 'BLOCKED', 
                label: 'Bị khóa', 
                gradient: 'from-red-500 to-pink-600',
                count: stats.blocked
              },
            ].map(({ status, label, gradient, count }) => (
              <div 
                key={status} 
                className="group relative p-4 border-2 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-teal-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all"></div>
                
                <div className="relative flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    {getStatusIcon(status)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
                      {label}
                    </div>
                    <div className="text-xl font-black bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                      {count}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 via-teal-50 to-green-50 dark:from-blue-900/20 dark:via-teal-900/20 dark:to-green-900/20 rounded-xl border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 text-sm">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                💡 <strong>Tip:</strong> Click vào vị trí để xem chi tiết. Hover để xem hiệu ứng 3D!
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
