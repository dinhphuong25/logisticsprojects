import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Thermometer,
  Package,
  AlertCircle,
  CheckCircle,
  X,
  Activity,
  TrendingUp,
  TrendingDown,
  Box,
  Layers,
  BarChart3,
  Search,
  Filter,
  Grid3x3,
  Map,
  Eye,
  Settings,
  Zap,
  Wind,
  Droplets
} from 'lucide-react'
import { toast } from 'sonner'

interface Zone {
  id: string
  code: string
  name: string
  nameVi: string
  type: 'CHILL' | 'FROZEN' | 'DRY'
  tempMin: number
  tempMax: number
  tempCurrent: number
  tempTarget: number
  humidity: number
  capacity: number
  used: number
  products: number
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ALERT'
  floor: number
  area: number // m²
  racks: number
  lastMaintenance: string
  powerConsumption: number // kW
}

const fetchZones = async (): Promise<Zone[]> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return [
    {
      id: 'ZONE-001',
      code: 'CHL-A',
      name: 'Chill Zone A',
      nameVi: 'Khu lạnh A',
      type: 'CHILL',
      tempMin: 0,
      tempMax: 8,
      tempCurrent: 4.2,
      tempTarget: 4,
      humidity: 75,
      capacity: 15000,
      used: 12500,
      products: 450,
      status: 'ACTIVE',
      floor: 1,
      area: 250,
      racks: 24,
      lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      powerConsumption: 45.5
    },
    {
      id: 'ZONE-002',
      code: 'CHL-B',
      name: 'Chill Zone B',
      nameVi: 'Khu lạnh B',
      type: 'CHILL',
      tempMin: 0,
      tempMax: 8,
      tempCurrent: 5.8,
      tempTarget: 5,
      humidity: 72,
      capacity: 12000,
      used: 8500,
      products: 320,
      status: 'ACTIVE',
      floor: 1,
      area: 200,
      racks: 20,
      lastMaintenance: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      powerConsumption: 38.2
    },
    {
      id: 'ZONE-003',
      code: 'FRZ-A',
      name: 'Frozen Zone A',
      nameVi: 'Khu đông lạnh A',
      type: 'FROZEN',
      tempMin: -25,
      tempMax: -18,
      tempCurrent: -20.5,
      tempTarget: -20,
      humidity: 65,
      capacity: 20000,
      used: 18500,
      products: 680,
      status: 'ACTIVE',
      floor: 2,
      area: 350,
      racks: 32,
      lastMaintenance: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      powerConsumption: 85.3
    },
    {
      id: 'ZONE-004',
      code: 'FRZ-B',
      name: 'Frozen Zone B',
      nameVi: 'Khu đông lạnh B',
      type: 'FROZEN',
      tempMin: -25,
      tempMax: -18,
      tempCurrent: -15.2,
      tempTarget: -20,
      humidity: 68,
      capacity: 18000,
      used: 15200,
      products: 520,
      status: 'ALERT',
      floor: 2,
      area: 300,
      racks: 28,
      lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      powerConsumption: 78.9
    },
    {
      id: 'ZONE-005',
      code: 'DRY-A',
      name: 'Dry Zone A',
      nameVi: 'Khu khô A',
      type: 'DRY',
      tempMin: 15,
      tempMax: 25,
      tempCurrent: 20.5,
      tempTarget: 20,
      humidity: 45,
      capacity: 8000,
      used: 6200,
      products: 280,
      status: 'ACTIVE',
      floor: 1,
      area: 180,
      racks: 16,
      lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      powerConsumption: 12.5
    },
    {
      id: 'ZONE-006',
      code: 'CHL-C',
      name: 'Chill Zone C',
      nameVi: 'Khu lạnh C',
      type: 'CHILL',
      tempMin: 0,
      tempMax: 8,
      tempCurrent: 3.8,
      tempTarget: 4,
      humidity: 78,
      capacity: 10000,
      used: 4500,
      products: 180,
      status: 'ACTIVE',
      floor: 2,
      area: 150,
      racks: 14,
      lastMaintenance: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      powerConsumption: 32.8
    },
    {
      id: 'ZONE-007',
      code: 'FRZ-C',
      name: 'Frozen Zone C',
      nameVi: 'Khu đông lạnh C',
      type: 'FROZEN',
      tempMin: -25,
      tempMax: -18,
      tempCurrent: -22.3,
      tempTarget: -22,
      humidity: 62,
      capacity: 16000,
      used: 12800,
      products: 450,
      status: 'ACTIVE',
      floor: 3,
      area: 280,
      racks: 26,
      lastMaintenance: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      powerConsumption: 72.4
    },
    {
      id: 'ZONE-008',
      code: 'MNT-A',
      name: 'Maintenance Zone',
      nameVi: 'Khu vực bảo trì',
      type: 'DRY',
      tempMin: 10,
      tempMax: 30,
      tempCurrent: 22.0,
      tempTarget: 20,
      humidity: 50,
      capacity: 5000,
      used: 0,
      products: 0,
      status: 'MAINTENANCE',
      floor: 1,
      area: 100,
      racks: 10,
      lastMaintenance: new Date().toISOString(),
      powerConsumption: 0
    }
  ]
}

export default function ZoneManagementPageSimple() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)

  const { data: zones, isLoading } = useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones,
    refetchInterval: 10000
  })

  const deleteZoneMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return { id }
    },
    onSuccess: (_, zoneId) => {
      queryClient.setQueryData(['zones'], (old: Zone[] | undefined) => {
        if (!old) return []
        return old.filter(zone => zone.id !== zoneId)
      })
      toast.success('Đã xóa khu vực thành công')
    },
    onError: () => {
      toast.error('Không thể xóa khu vực')
    }
  })

  const filteredZones = useMemo(() => {
    if (!zones) return []
    
    return zones.filter(zone => {
      const matchesSearch = 
        zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.nameVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.code.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = selectedType === 'ALL' || zone.type === selectedType
      const matchesStatus = selectedStatus === 'ALL' || zone.status === selectedStatus
      
      return matchesSearch && matchesType && matchesStatus
    })
  }, [zones, searchQuery, selectedType, selectedStatus])

  const stats = useMemo(() => {
    if (!zones) return { total: 0, active: 0, capacity: 0, used: 0, products: 0, power: 0, alert: 0 }
    
    return {
      total: zones.length,
      active: zones.filter(z => z.status === 'ACTIVE').length,
      capacity: zones.reduce((sum, z) => sum + z.capacity, 0),
      used: zones.reduce((sum, z) => sum + z.used, 0),
      products: zones.reduce((sum, z) => sum + z.products, 0),
      power: zones.reduce((sum, z) => sum + z.powerConsumption, 0),
      alert: zones.filter(z => z.status === 'ALERT').length
    }
  }, [zones])

  const getZoneTypeConfig = (type: string) => {
    const configs = {
      CHILL: {
        label: 'Lạnh',
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-600 dark:text-blue-400',
        icon: '❄️',
        borderColor: 'border-blue-500'
      },
      FROZEN: {
        label: 'Đông lạnh',
        color: 'from-indigo-500 to-purple-500',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
        textColor: 'text-indigo-600 dark:text-indigo-400',
        icon: '🧊',
        borderColor: 'border-indigo-500'
      },
      DRY: {
        label: 'Khô',
        color: 'from-orange-500 to-amber-500',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-600 dark:text-orange-400',
        icon: '📦',
        borderColor: 'border-orange-500'
      }
    }
    return configs[type as keyof typeof configs] || configs.CHILL
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      ACTIVE: {
        label: 'Hoạt động',
        color: 'bg-green-500 text-white',
        icon: CheckCircle,
        dotColor: 'bg-green-500'
      },
      INACTIVE: {
        label: 'Ngừng',
        color: 'bg-gray-500 text-white',
        icon: X,
        dotColor: 'bg-gray-500'
      },
      MAINTENANCE: {
        label: 'Bảo trì',
        color: 'bg-yellow-500 text-white',
        icon: Settings,
        dotColor: 'bg-yellow-500'
      },
      ALERT: {
        label: 'Cảnh báo',
        color: 'bg-red-500 text-white animate-pulse',
        icon: AlertCircle,
        dotColor: 'bg-red-500 animate-pulse'
      }
    }
    return configs[status as keyof typeof configs] || configs.ACTIVE
  }

  const getTempStatus = (zone: Zone) => {
    const diff = Math.abs(zone.tempCurrent - zone.tempTarget)
    if (diff > 2) return { color: 'text-red-600', icon: TrendingUp, label: 'Cao' }
    if (diff > 1) return { color: 'text-yellow-600', icon: TrendingUp, label: 'Hơi cao' }
    return { color: 'text-green-600', icon: CheckCircle, label: 'Tốt' }
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getDaysAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (24 * 60 * 60 * 1000))
    if (days === 0) return 'Hôm nay'
    return `${days} ngày trước`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Quản lý Khu vực Kho
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Giám sát và cấu hình {stats.total} khu vực với {stats.products.toLocaleString()} sản phẩm
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              Lưới
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <Map className="w-4 h-4 mr-2" />
              Bản đồ
            </Button>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo khu vực
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-8 h-8 text-blue-600" />
              <Badge className="bg-blue-500 text-white">{stats.total}</Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng khu vực</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-500 text-white">{stats.active}</Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hoạt động</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Box className="w-8 h-8 text-purple-600" />
              <Badge className="bg-purple-500 text-white">
                {((stats.used / stats.capacity) * 100).toFixed(0)}%
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sử dụng</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-orange-600" />
              <Badge className="bg-orange-500 text-white">{stats.products}</Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sản phẩm</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-yellow-600" />
              <Badge className="bg-yellow-500 text-white">{stats.power.toFixed(1)} kW</Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tiêu thụ điện</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Layers className="w-8 h-8 text-indigo-600" />
              <Badge className="bg-indigo-500 text-white">
                {stats.capacity.toLocaleString()}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Dung lượng</p>
          </CardContent>
        </Card>

        {stats.alert > 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 ring-2 ring-red-500 ring-offset-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 text-red-600 animate-pulse" />
                <Badge className="bg-red-500 text-white animate-pulse">{stats.alert}</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cảnh báo</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, mã khu vực..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="ALL">Tất cả loại</option>
              <option value="CHILL">❄️ Lạnh</option>
              <option value="FROZEN">🧊 Đông lạnh</option>
              <option value="DRY">📦 Khô</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="MAINTENANCE">Bảo trì</option>
              <option value="ALERT">Cảnh báo</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Zones Grid/Map View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredZones.map((zone) => {
            const typeConfig = getZoneTypeConfig(zone.type)
            const statusConfig = getStatusConfig(zone.status)
            const tempStatus = getTempStatus(zone)
            const utilization = (zone.used / zone.capacity) * 100
            const StatusIcon = statusConfig.icon
            const TempIcon = tempStatus.icon

            return (
              <Card 
                key={zone.id} 
                className={`border-0 shadow-xl hover:shadow-2xl transition-all group ${
                  zone.status === 'ALERT' ? 'ring-2 ring-red-500 ring-offset-2 animate-pulse' : ''
                }`}
              >
                <CardHeader className="relative pb-4">
                  {/* Background Decoration */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${typeConfig.color} opacity-10 rounded-bl-full`}></div>
                  
                  {/* Header Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-2xl ${typeConfig.bgColor} flex items-center justify-center text-2xl`}>
                          {typeConfig.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{zone.nameVi}</h3>
                            <Badge variant="outline" className={typeConfig.borderColor}>
                              {zone.code}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{zone.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Tầng {zone.floor}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Temperature Info */}
                  <div className={`p-4 rounded-xl ${typeConfig.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Thermometer className={`w-5 h-5 ${typeConfig.textColor}`} />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nhiệt độ</span>
                      </div>
                      <Badge variant="outline" className={`${tempStatus.color} border-2`}>
                        <TempIcon className="w-3 h-3 mr-1" />
                        {tempStatus.label}
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${typeConfig.textColor}`}>
                        {zone.tempCurrent}°C
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Target: {zone.tempTarget}°C
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Range: {zone.tempMin}°C ~ {zone.tempMax}°C
                    </div>
                  </div>

                  {/* Humidity */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Độ ẩm</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{zone.humidity}%</span>
                  </div>

                  {/* Capacity Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Dung lượng</span>
                      <span className={`font-bold ${getUtilizationColor(utilization)}`}>
                        {zone.used.toLocaleString()} / {zone.capacity.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${typeConfig.color} transition-all duration-1000`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>{utilization.toFixed(1)}% sử dụng</span>
                      <span>{zone.products} sản phẩm</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{zone.area}</div>
                      <div className="text-xs text-gray-500">m²</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{zone.racks}</div>
                      <div className="text-xs text-gray-500">Racks</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{zone.powerConsumption}</div>
                      <div className="text-xs text-gray-500">kW</div>
                    </div>
                  </div>

                  {/* Last Maintenance */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 border-t pt-3">
                    <Settings className="w-4 h-4" />
                    <span>Bảo trì: {getDaysAgo(zone.lastMaintenance)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => toast.info(`Đang xem chi tiết ${zone.nameVi}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingZone(zone)
                        setIsCreateModalOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => {
                        if (confirm(`Xóa khu vực ${zone.nameVi}?`)) {
                          deleteZoneMutation.mutate(zone.id)
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Map View - Warehouse Floor Plan */
        <div className="space-y-6">
          {/* Map Header */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Map className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bản đồ Kho lạnh</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Layout chi tiết theo tầng</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Hoạt động</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Cảnh báo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Bảo trì</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Floor Plans */}
          {[3, 2, 1].map(floor => {
            const floorZones = filteredZones.filter(z => z.floor === floor)
            if (floorZones.length === 0) return null

            return (
              <Card key={floor} className="border-0 shadow-xl">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 text-lg">
                        Tầng {floor}
                      </Badge>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">{floorZones.length}</span> khu vực • 
                        <span className="font-semibold ml-2">
                          {floorZones.reduce((sum, z) => sum + z.area, 0)} m²
                        </span> • 
                        <span className="font-semibold ml-2">
                          {floorZones.reduce((sum, z) => sum + z.products, 0)} sản phẩm
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Điện năng: {floorZones.reduce((sum, z) => sum + z.powerConsumption, 0).toFixed(1)} kW
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {/* Warehouse Floor Layout */}
                  <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 min-h-[400px]">
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-10 dark:opacity-5" style={{
                      backgroundImage: 'linear-gradient(0deg, #ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)',
                      backgroundSize: '40px 40px'
                    }}></div>

                    {/* Entrance Arrow */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                      <TrendingUp className="w-8 h-8 text-green-600 animate-bounce" />
                      <Badge className="bg-green-500 text-white">Lối vào</Badge>
                    </div>

                    {/* Zone Layout - Responsive Grid */}
                    <div className={`relative mt-16 grid gap-6 ${
                      floorZones.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
                      floorZones.length <= 4 ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-4' :
                      'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    }`}>
                      {floorZones.map((zone, index) => {
                        const typeConfig = getZoneTypeConfig(zone.type)
                        const statusConfig = getStatusConfig(zone.status)
                        const utilization = (zone.used / zone.capacity) * 100
                        const tempStatus = getTempStatus(zone)

                        return (
                          <div
                            key={zone.id}
                            className={`relative group cursor-pointer transition-all duration-300 hover:z-10 ${
                              zone.status === 'ALERT' ? 'animate-pulse' : ''
                            }`}
                            onClick={() => {
                              toast.info(
                                <div>
                                  <p className="font-bold">{zone.nameVi}</p>
                                  <p className="text-xs">🌡️ {zone.tempCurrent}°C • 📦 {zone.products} sản phẩm</p>
                                </div>
                              )
                            }}
                            style={{
                              animationDelay: `${index * 0.1}s`
                            }}
                          >
                            {/* Zone Card */}
                            <div className={`relative h-48 rounded-2xl border-4 ${typeConfig.borderColor} bg-gradient-to-br ${typeConfig.color} p-4 shadow-lg hover:shadow-2xl transition-all hover:scale-105`}>
                              {/* Status Indicator */}
                              <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${statusConfig.dotColor} border-4 border-white dark:border-gray-800 shadow-lg z-10`}></div>

                              {/* Zone Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="text-4xl mb-1">{typeConfig.icon}</div>
                                  <h4 className="text-lg font-bold text-white drop-shadow-lg">{zone.code}</h4>
                                  <p className="text-xs text-white/90">{zone.nameVi}</p>
                                </div>
                                <Badge className="bg-white/90 text-gray-900 font-bold">
                                  {zone.area} m²
                                </Badge>
                              </div>

                              {/* Temperature Display */}
                              <div className="mb-3 p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                                <div className="flex items-center justify-between text-white">
                                  <div className="flex items-center gap-1">
                                    <Thermometer className="w-4 h-4" />
                                    <span className="text-xs">Nhiệt độ</span>
                                  </div>
                                  <span className="text-lg font-bold">{zone.tempCurrent}°C</span>
                                </div>
                              </div>

                              {/* Capacity Bar */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-white text-xs">
                                  <span>Dung lượng</span>
                                  <span className="font-bold">{utilization.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-white transition-all duration-1000"
                                    style={{ width: `${utilization}%` }}
                                  />
                                </div>
                                <div className="text-xs text-white/80">
                                  {zone.products} sản phẩm • {zone.racks} racks
                                </div>
                              </div>

                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                                <div className="text-white space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Sử dụng:</span>
                                    <span className="font-bold">{zone.used.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Độ ẩm:</span>
                                    <span className="font-bold">{zone.humidity}%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Điện năng:</span>
                                    <span className="font-bold">{zone.powerConsumption} kW</span>
                                  </div>
                                  <Badge className={statusConfig.color}>
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Zone Label Below */}
                            <div className="mt-2 text-center">
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {zone.type === 'CHILL' ? '❄️ Khu lạnh' : zone.type === 'FROZEN' ? '🧊 Đông lạnh' : '📦 Khu khô'}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Floor Stats Summary */}
                    <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-600 dark:text-gray-400">Tổng sản phẩm:</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {floorZones.reduce((sum, z) => sum + z.products, 0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Box className="w-4 h-4 text-purple-600" />
                          <span className="text-gray-600 dark:text-gray-400">Sử dụng:</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {((floorZones.reduce((sum, z) => sum + z.used, 0) / 
                               floorZones.reduce((sum, z) => sum + z.capacity, 0)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary Footer */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-teal-950/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hiệu suất tổng thể</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {((stats.used / stats.capacity) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Khu vực hoạt động</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.active}/{stats.total}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng tiêu thụ điện</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.power.toFixed(1)} kW
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
