import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Search,
  Download,
  Grid3x3,
  CheckCircle,
  AlertCircle,
  Package,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-900 via-green-800 to-emerald-800 dark:from-teal-200 dark:via-green-200 dark:to-emerald-200 bg-clip-text text-transparent">
            Quản lý vị trí
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Giám sát và quản lý vị trí lưu trữ trong kho
          </p>
        </div>

        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Xuất sơ đồ
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng vị trí</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Grid3x3 className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Trống</p>
                <p className="text-3xl font-bold text-gray-600">{stats.empty}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Có hàng</p>
                <p className="text-3xl font-bold text-blue-600">{stats.occupied}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đầy</p>
                <p className="text-3xl font-bold text-green-600">{stats.full}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm mã vị trí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">Tất cả khu vực</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="EMPTY">Trống</option>
                <option value="OCCUPIED">Có hàng</option>
                <option value="FULL">Đầy</option>
                <option value="RESERVED">Đặt chỗ</option>
                <option value="BLOCKED">Bị khóa</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations Grid */}
      <Card>
        <CardHeader>
          <CardTitle>
            Vị trí ({filteredLocations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredLocations.map((location) => {
              const utilization = (location.currentQty / location.maxQty) * 100
              const zone = zones.find((z) => z.id === location.zoneId)

              return (
                <div
                  key={location.id}
                  className={`relative border-2 rounded-lg p-3 cursor-pointer hover:shadow-lg transition-all ${getStatusColor(
                    location.status
                  )}`}
                  onClick={() => {
                    toast.info(`Vị trí: ${location.code}`, {
                      description: `Khu vực: ${zone?.name || 'N/A'}\nDung lượng: ${location.currentQty}/${location.maxQty}\nTrạng thái: ${location.status}`,
                    })
                  }}
                >
                  {/* Status Icon */}
                  <div className="absolute top-1 right-1">
                    {getStatusIcon(location.status)}
                  </div>

                  {/* Location Code */}
                  <div className="font-mono font-bold text-sm mb-2">
                    {location.code}
                  </div>

                  {/* Zone Badge */}
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {zone?.name || 'N/A'}
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                    <div className="text-xs text-center text-gray-600 dark:text-gray-400">
                      {location.currentQty}/{location.maxQty}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredLocations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Không tìm thấy vị trí nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Chú thích trạng thái</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {[
              { status: 'EMPTY', label: 'Trống', icon: MapPin },
              { status: 'OCCUPIED', label: 'Có hàng', icon: Package },
              { status: 'FULL', label: 'Đầy', icon: CheckCircle },
              { status: 'RESERVED', label: 'Đặt chỗ', icon: AlertCircle },
              { status: 'BLOCKED', label: 'Bị khóa', icon: AlertCircle },
            ].map(({ status, label, icon: Icon }) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-6 h-6 border-2 rounded ${getStatusColor(status)} flex items-center justify-center`}>
                  {getStatusIcon(status)}
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
