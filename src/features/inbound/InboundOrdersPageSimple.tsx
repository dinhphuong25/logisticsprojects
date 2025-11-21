import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  PackageOpen,
  Plus,
  Search,
  Clock,
  CheckCircle,
  Truck,
  Package,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import type { InboundOrder } from '@/types'

type InboundStatus = InboundOrder['status']
type InboundPriority = Required<Pick<InboundOrder, 'priority'>>['priority']

interface InboundOrderView extends InboundOrder {
  products: {
    id: string
    name: string
    sku: string
    expectedQty: number
    receivedQty: number
    unit: string
  }[]
  priority: InboundPriority
}

const mapInboundOrder = (order: InboundOrder): InboundOrderView => ({
  ...order,
  priority: order.priority ?? 'MEDIUM',
  products: order.lines?.map((line) => ({
    id: line.id,
    name: line.product?.name || 'Sản phẩm',
    sku: line.product?.sku || line.productId,
    expectedQty: line.expectedQty,
    receivedQty: line.receivedQty,
    unit: line.product?.unit || line.unit || 'KG',
  })) ?? [],
})

export default function InboundOrdersPageSimple() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter] = useState<string>('ALL')

  const { data: orders, isLoading, refetch } = useQuery<InboundOrder[]>({
    queryKey: ['inbound-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/inbound')
      return res.data as InboundOrder[]
    },
    refetchInterval: 30000,
  })

  const receiveOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: InboundStatus }) => {
      await apiClient.put(`/inbound/${orderId}`, { status })
      return { orderId, status }
    },
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái đơn hàng')
      queryClient.invalidateQueries({ queryKey: ['inbound-orders'] })
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái')
    },
  })

  const mappedOrders = useMemo(() => (orders ?? []).map(mapInboundOrder), [orders])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  const filteredOrders = mappedOrders.filter(order => {
    const matchesSearch = order.orderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.carrier?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  const getStatusBadge = (status: InboundOrder['status']) => {
    const statusConfig = {
      PENDING: { 
        label: 'Chờ xử lý', 
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock
      },
      SCHEDULED: { 
        label: 'Đã lên lịch', 
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Truck
      },
      RECEIVING: { 
        label: 'Đang nhận hàng', 
        className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        icon: PackageOpen
      },
      QC: { 
        label: 'Kiểm tra chất lượng', 
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        icon: CheckCircle2
      },
      PUTAWAY: { 
        label: 'Đang cất kho', 
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        icon: Package
      },
      COMPLETED: { 
        label: 'Hoàn thành', 
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle
      },
      CANCELLED: { 
        label: 'Đã hủy', 
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle
      },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: InboundPriority = 'MEDIUM') => {
    const config: Record<InboundPriority, { label: string; className: string }> = {
      HIGH: { label: 'Ưu tiên cao', className: 'bg-red-500 text-white' },
      MEDIUM: { label: 'Trung bình', className: 'bg-yellow-500 text-white' },
      LOW: { label: 'Thấp', className: 'bg-gray-500 text-white' },
    }
    const data = config[priority] ?? config.MEDIUM
    return <Badge className={data.className}>{data.label}</Badge>
  }

  const statusCounts = {
    total: mappedOrders.length,
    pending: mappedOrders.filter(o => o.status === 'PENDING').length,
    scheduled: mappedOrders.filter(o => o.status === 'SCHEDULED').length,
    received: mappedOrders.filter(o => o.status === 'COMPLETED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Đơn nhập hàng
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Quản lý lô hàng đến và tiếp nhận
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/inbound/create')} 
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo đơn nhập
          </Button>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Chờ xử lý</p>
            <p className="text-3xl font-bold text-yellow-600">{statusCounts.pending}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Đang vận chuyển</p>
            <p className="text-3xl font-bold text-blue-600">{statusCounts.scheduled}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Đã nhận</p>
            <p className="text-3xl font-bold text-green-600">{statusCounts.received}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <PackageOpen className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng cộng</p>
            <p className="text-3xl font-bold text-purple-600">{statusCounts.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã đơn, nhà cung cấp, đơn vị vận chuyển..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardTitle className="flex items-center gap-2">
            <PackageOpen className="w-5 h-5 text-green-600" />
            Danh sách đơn nhập hàng ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Không tìm thấy đơn hàng nào' : 'Chưa có đơn nhập hàng'}
              </p>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {order.orderNo}
                        </h3>
                        {getStatusBadge(order.status)}
                        {getPriorityBadge(order.priority)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Nhà cung cấp</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.supplier}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Đơn vị vận chuyển</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.carrier}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Sản phẩm</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.products[0]?.name}
                          </p>
                          <p className="text-xs text-gray-500">{order.products[0]?.sku}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Số lượng</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.receivedQty > 0 
                              ? `${order.receivedQty}/${order.totalQty} ${order.products[0]?.unit}`
                              : `${order.totalQty} ${order.products[0]?.unit}`
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Ngày dự kiến</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(order.eta).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      {order.trailerNo && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                Trailer: <span className="font-medium text-gray-900 dark:text-white">{order.trailerNo}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="whitespace-nowrap"
                        onClick={() => navigate(`/inbound/${order.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Chi tiết
                      </Button>
                      {order.status === 'SCHEDULED' && (
                        <Button 
                          size="sm" 
                          className="whitespace-nowrap bg-green-600 hover:bg-green-700"
                          onClick={() => receiveOrderMutation.mutate({ orderId: order.id, status: 'RECEIVING' })}
                          disabled={receiveOrderMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Nhận hàng
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
