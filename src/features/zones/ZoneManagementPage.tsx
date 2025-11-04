import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
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
} from 'lucide-react'
import { toast } from 'sonner'

interface Zone {
  id: string
  name: string
  nameVi: string
  type: 'CHILL' | 'FROZEN' | 'DRY'
  tempMin: number
  tempMax: number
  tempTarget: number
  capacity: number
  used: number
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
}

export default function ZoneManagementPage() {
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)

  const { data: zones = [] } = useQuery<Zone[]>({
    queryKey: ['zones'],
    queryFn: async () => {
      const response = await apiClient.get('/zones')
      return response.data
    },
  })

  const createZoneMutation = useMutation({
    mutationFn: async (zoneData: Partial<Zone>) => {
      await apiClient.post('/zones', zoneData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] })
      toast.success('Đã tạo khu vực thành công')
      setIsCreateModalOpen(false)
    },
    onError: () => {
      toast.error('Không thể tạo khu vực')
    },
  })

  const updateZoneMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Zone> }) => {
      await apiClient.put(`/zones/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] })
      toast.success('Đã cập nhật khu vực thành công')
      setEditingZone(null)
    },
    onError: () => {
      toast.error('Không thể cập nhật khu vực')
    },
  })

  const deleteZoneMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/zones/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] })
      toast.success('Đã xóa khu vực thành công')
    },
    onError: () => {
      toast.error('Không thể xóa khu vực')
    },
  })

  const getZoneTypeColor = (type: string) => {
    const colors = {
      CHILL: 'from-blue-500 to-cyan-500',
      FROZEN: 'from-indigo-500 to-purple-500',
      DRY: 'from-orange-500 to-yellow-500',
    }
    return colors[type as keyof typeof colors] || colors.CHILL
  }

  const getZoneTypeIcon = (type: string) => {
    const icons = {
      CHILL: '❄️',
      FROZEN: '🧊',
      DRY: '📦',
    }
    return icons[type as keyof typeof icons] || '📦'
  }

  const getStatusBadge = (status: string) => {
    const config = {
      ACTIVE: { variant: 'default' as const, label: 'Hoạt động', color: 'bg-green-500' },
      INACTIVE: { variant: 'secondary' as const, label: 'Ngừng hoạt động', color: 'bg-gray-500' },
      MAINTENANCE: { variant: 'destructive' as const, label: 'Bảo trì', color: 'bg-yellow-500' },
    }
    return config[status as keyof typeof config] || config.ACTIVE
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 via-cyan-800 to-teal-800 dark:from-blue-200 dark:via-cyan-200 dark:to-teal-200 bg-clip-text text-transparent">
            Quản lý khu vực
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Cấu hình và giám sát các khu vực kho
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo khu vực
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng khu vực</p>
                <p className="text-3xl font-bold">{zones.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đang hoạt động</p>
                <p className="text-3xl font-bold">
                  {zones.filter((z) => z.status === 'ACTIVE').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng dung lượng</p>
                <p className="text-3xl font-bold">
                  {zones.reduce((sum, z) => sum + z.capacity, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sử dụng</p>
                <p className="text-3xl font-bold">
                  {zones.length > 0
                    ? Math.round(
                        (zones.reduce((sum, z) => sum + z.used, 0) /
                          zones.reduce((sum, z) => sum + z.capacity, 0)) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => {
          const utilization = (zone.used / zone.capacity) * 100
          const statusConfig = getStatusBadge(zone.status)

          return (
            <Card key={zone.id} className="group hover:shadow-xl transition-all duration-300">
              <CardHeader className="relative">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getZoneTypeColor(zone.type)} opacity-10 rounded-bl-full`}></div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getZoneTypeIcon(zone.type)}</div>
                    <div>
                      <CardTitle className="text-xl">{zone.name}</CardTitle>
                      <p className="text-sm text-gray-500">{zone.nameVi}</p>
                    </div>
                  </div>
                  <Badge variant={statusConfig.variant} className={statusConfig.color}>
                    {statusConfig.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Temperature Range */}
                <div className="flex items-center gap-2 text-sm">
                  <Thermometer className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Nhiệt độ:</span>
                  <span className="font-semibold">
                    {zone.tempMin}°C ~ {zone.tempMax}°C
                  </span>
                </div>

                {/* Capacity Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Dung lượng</span>
                    <span className="font-semibold">
                      {zone.used.toLocaleString()} / {zone.capacity.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getZoneTypeColor(zone.type)} transition-all duration-500`}
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Đã sử dụng {utilization.toFixed(1)}%
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditingZone(zone)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => {
                      if (confirm(`Xóa khu vực ${zone.name}?`)) {
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

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || editingZone) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingZone ? 'Chỉnh sửa khu vực' : 'Tạo khu vực mới'}
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setEditingZone(null)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const data = {
                    name: formData.get('name') as string,
                    nameVi: formData.get('nameVi') as string,
                    type: formData.get('type') as 'CHILL' | 'FROZEN' | 'DRY',
                    tempMin: Number(formData.get('tempMin')),
                    tempMax: Number(formData.get('tempMax')),
                    tempTarget: Number(formData.get('tempTarget')),
                    capacity: Number(formData.get('capacity')),
                    status: formData.get('status') as string,
                  }

                  if (editingZone) {
                    updateZoneMutation.mutate({ id: editingZone.id, data } as any)
                  } else {
                    createZoneMutation.mutate(data as any)
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tên khu vực</label>
                    <Input
                      name="name"
                      defaultValue={editingZone?.name}
                      placeholder="CHILL ZONE A"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tên tiếng Việt</label>
                    <Input
                      name="nameVi"
                      defaultValue={editingZone?.nameVi}
                      placeholder="KHU LẠNH A"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Loại khu vực</label>
                    <select
                      name="type"
                      defaultValue={editingZone?.type || 'CHILL'}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="CHILL">❄️ Lạnh</option>
                      <option value="FROZEN">🧊 Đông lạnh</option>
                      <option value="DRY">📦 Khô</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Trạng thái</label>
                    <select
                      name="status"
                      defaultValue={editingZone?.status || 'ACTIVE'}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Ngừng hoạt động</option>
                      <option value="MAINTENANCE">Bảo trì</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nhiệt độ tối thiểu (°C)</label>
                    <Input
                      name="tempMin"
                      type="number"
                      step="0.1"
                      defaultValue={editingZone?.tempMin}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nhiệt độ tối đa (°C)</label>
                    <Input
                      name="tempMax"
                      type="number"
                      step="0.1"
                      defaultValue={editingZone?.tempMax}
                      placeholder="8"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nhiệt độ mục tiêu (°C)</label>
                    <Input
                      name="tempTarget"
                      type="number"
                      step="0.1"
                      defaultValue={editingZone?.tempTarget}
                      placeholder="4"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Dung lượng (đơn vị)</label>
                    <Input
                      name="capacity"
                      type="number"
                      defaultValue={editingZone?.capacity}
                      placeholder="10000"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsCreateModalOpen(false)
                      setEditingZone(null)
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    {editingZone ? 'Cập nhật' : 'Tạo'} khu vực
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
