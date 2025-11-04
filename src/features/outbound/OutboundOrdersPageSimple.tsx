import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  PackageCheck,
  Truck,
  Search,
  RefreshCw,
  Package,
  Clock,
  CheckCircle,
  Play,
  Eye,
  Plus,
} from 'lucide-react'

interface OutboundOrder {
  id: string
  orderNo: string
  customer: string
  status: 'PENDING' | 'PICKING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  products: string[]
  totalQty: number
  totalWeight: number
  requestedDate: string
  shippedDate?: string
  destination: string
  driver?: string
  vehiclePlate?: string
  zone: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

// Mock data function
const fetchOutboundOrders = async (): Promise<OutboundOrder[]> => {
  await new Promise(resolve => setTimeout(resolve, 400))
  
  const customers = ['Siêu thị BigC', 'Nhà hàng Golden Gate', 'Khách sạn Sheraton', 'Công ty FoodMart', 'Chuỗi Metro']
  const products = ['Cá hồi đông lạnh', 'Thịt bò tươi', 'Tôm đông lạnh', 'Sữa tươi', 'Rau củ quả']
  const drivers = ['Nguyễn Văn A', 'Trần Văn B', 'Lê Văn C', 'Phạm Văn D']
  const zones = ['CHILL-A', 'CHILL-B', 'FROZEN-A', 'FROZEN-B']
  const statuses: OutboundOrder['status'][] = ['PENDING', 'PICKING', 'PACKED', 'SHIPPED', 'DELIVERED']
  const priorities: OutboundOrder['priority'][] = ['HIGH', 'MEDIUM', 'LOW']

  return Array.from({ length: 20 }, (_, i) => {
    const status = statuses[i % statuses.length]
    const requestedDate = new Date()
    requestedDate.setDate(requestedDate.getDate() - Math.floor(Math.random() * 7))
    
    return {
      id: `ob-${i + 1}`,
      orderNo: `OB-${String(i + 1).padStart(5, '0')}`,
      customer: customers[i % customers.length],
      status,
      products: [products[i % products.length], products[(i + 1) % products.length]],
      totalQty: 50 + Math.floor(Math.random() * 200),
      totalWeight: 100 + Math.floor(Math.random() * 500),
      requestedDate: requestedDate.toISOString(),
      shippedDate: status === 'SHIPPED' || status === 'DELIVERED' ? new Date().toISOString() : undefined,
      destination: `${['Hà Nội', 'TP HCM', 'Đà Nẵng', 'Hải Phòng'][i % 4]}`,
      driver: status === 'SHIPPED' || status === 'DELIVERED' ? drivers[i % drivers.length] : undefined,
      vehiclePlate: status === 'SHIPPED' || status === 'DELIVERED' ? `29A-${Math.floor(10000 + Math.random() * 90000)}` : undefined,
      zone: zones[i % zones.length],
      priority: priorities[i % priorities.length],
    }
  })
}

// Update order status mutation
const updateOrderStatus = async ({ orderId, status }: { orderId: string, status: string }) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return { success: true, orderId, status }
}

export default function OutboundOrdersPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter] = useState<string>('ALL')
  const [showStartModal, setShowStartModal] = useState<{ show: boolean, order: OutboundOrder | null }>({
    show: false,
    order: null
  })

  const { data: orders, isLoading, refetch } = useQuery<OutboundOrder[]>({
    queryKey: ['outbound-orders'],
    queryFn: fetchOutboundOrders,
    refetchInterval: 30000,
  })

  const startOrderMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      setShowStartModal({ show: false, order: null })
      refetch()
    },
  })

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400">Đang tải đơn xuất hàng...</p>
        </div>
      </div>
    )
  }

  // Filter orders by search term and status
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.orderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.destination?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  const getPriorityBadge = (priority: OutboundOrder['priority']) => {
    const config = {
      HIGH: { label: 'Ưu tiên cao', className: 'bg-red-500 text-white' },
      MEDIUM: { label: 'Trung bình', className: 'bg-yellow-500 text-white' },
      LOW: { label: 'Thấp', className: 'bg-gray-500 text-white' },
    }
    return <Badge className={config[priority].className}>{config[priority].label}</Badge>
  }

  const getStatusBadge = (status: OutboundOrder['status']) => {
    const statusConfig = {
      PENDING: { 
        label: 'Chờ xử lý', 
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock
      },
      PICKING: { 
        label: 'Đang lấy hàng', 
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Package
      },
      PACKED: { 
        label: 'Đã đóng gói', 
        className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        icon: PackageCheck
      },
      SHIPPED: { 
        label: 'Đang vận chuyển', 
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        icon: Truck
      },
      DELIVERED: { 
        label: 'Đã giao', 
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle
      },
      CANCELLED: { 
        label: 'Đã hủy', 
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: Clock
      },
    }
    
    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon
    
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const statusCounts = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'PENDING').length || 0,
    picking: orders?.filter(o => o.status === 'PICKING').length || 0,
    packed: orders?.filter(o => o.status === 'PACKED').length || 0,
    shipped: orders?.filter(o => o.status === 'SHIPPED').length || 0,
    delivered: orders?.filter(o => o.status === 'DELIVERED').length || 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
            Đơn xuất hàng
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Quản lý và theo dõi đơn hàng xuất kho
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/outbound/create')} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo đơn mới
          </Button>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <PackageCheck className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng đơn</p>
            <p className="text-3xl font-bold text-purple-600">{statusCounts.total}</p>
          </CardContent>
        </Card>

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
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Đang lấy hàng</p>
            <p className="text-3xl font-bold text-blue-600">{statusCounts.picking}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <PackageCheck className="w-8 h-8 text-teal-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Đã đóng gói</p>
            <p className="text-3xl font-bold text-teal-600">{statusCounts.packed}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Truck className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Đang vận chuyển</p>
            <p className="text-3xl font-bold text-indigo-600">{statusCounts.shipped}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Đã giao hàng</p>
            <p className="text-3xl font-bold text-green-600">{statusCounts.delivered}</p>
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
                placeholder="Tìm kiếm theo mã đơn, khách hàng..."
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
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardTitle className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-purple-600" />
            Danh sách đơn xuất hàng ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Không tìm thấy đơn hàng nào' : 'Chưa có đơn xuất hàng'}
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
                          <p className="text-xs text-gray-500 mb-1">Khách hàng</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.customer}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Điểm đến</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.destination}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Số lượng / Trọng lượng</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.totalQty} SP / {order.totalWeight} kg
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Ngày yêu cầu</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(order.requestedDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Khu vực</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.zone}
                          </p>
                        </div>
                      </div>
                      {(order.driver || order.vehiclePlate) && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-6 text-sm">
                            {order.driver && (
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  Tài xế: <span className="font-medium text-gray-900 dark:text-white">{order.driver}</span>
                                </span>
                              </div>
                            )}
                            {order.vehiclePlate && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Xe: <span className="font-medium text-gray-900 dark:text-white">{order.vehiclePlate}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="whitespace-nowrap"
                        onClick={() => navigate(`/outbound/${order.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Chi tiết
                      </Button>
                      {order.status === 'PENDING' && (
                        <Button 
                          size="sm" 
                          className="whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                          onClick={() => setShowStartModal({ show: true, order })}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Bắt đầu
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

      {/* Start Order Modal */}
      {showStartModal.show && showStartModal.order && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                Xác nhận bắt đầu xử lý
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    Bắt đầu xử lý đơn hàng {showStartModal.order.orderNo}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Đơn hàng sẽ chuyển sang trạng thái "Đang lấy hàng". Bạn có chắc chắn muốn tiếp tục?
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Khách hàng:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{showStartModal.order.customer}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tổng sản phẩm:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{showStartModal.order.totalQty} SP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Khu vực:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{showStartModal.order.zone}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowStartModal({ show: false, order: null })}
                  disabled={startOrderMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    startOrderMutation.mutate({ orderId: showStartModal.order!.id, status: 'PICKING' })
                  }}
                  disabled={startOrderMutation.isPending}
                >
                  {startOrderMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Xác nhận
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
