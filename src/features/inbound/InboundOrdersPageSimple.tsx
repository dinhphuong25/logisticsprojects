import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
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

interface InboundOrder {
  id: string
  orderNo: string
  supplier: string
  carrier: string
  trailerNo?: string
  status: 'PENDING' | 'SCHEDULED' | 'RECEIVING' | 'QC' | 'PUTAWAY' | 'COMPLETED' | 'CANCELLED'
  products: {
    id: string
    name: string
    sku: string
    expectedQty: number
    receivedQty: number
    unit: string
  }[]
  totalQty: number
  receivedQty: number
  eta: string
  receivedDate?: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  notes?: string
}

// Mock data function
const fetchInboundOrders = async (): Promise<InboundOrder[]> => {
  await new Promise(resolve => setTimeout(resolve, 400))
  
  const suppliers = ['Fresh Seafood Co.', 'Global Meat Import', 'Asia Vegetables Ltd.', 'Premium Dairy Corp.']
  const carriers = ['DHL Express', 'FedEx Logistics', 'VN Transport', 'Fast Shipping Co.']
  const products = [
    { name: 'Cá hồi đông lạnh', sku: 'FISH-001', unit: 'KG' },
    { name: 'Thịt bò Wagyu', sku: 'BEEF-001', unit: 'KG' },
    { name: 'Tôm sú đông lạnh', sku: 'SHRIMP-001', unit: 'KG' },
    { name: 'Sữa tươi Úc', sku: 'MILK-001', unit: 'Lít' },
    { name: 'Phô mai Pháp', sku: 'CHEESE-001', unit: 'KG' },
  ]
  const statuses: InboundOrder['status'][] = ['PENDING', 'SCHEDULED', 'RECEIVING', 'QC', 'PUTAWAY', 'COMPLETED']
  const priorities: InboundOrder['priority'][] = ['HIGH', 'MEDIUM', 'LOW']

  return Array.from({ length: 15 }, (_, i) => {
    const status = statuses[i % statuses.length]
    const eta = new Date()
    eta.setDate(eta.getDate() + (i % 7) - 3)
    
    const selectedProducts = [
      { 
        id: `p-${i}-1`, 
        ...products[i % products.length],
        expectedQty: 500 + Math.floor(Math.random() * 500),
        receivedQty: status === 'COMPLETED' ? 500 + Math.floor(Math.random() * 500) : 
                     ['RECEIVING', 'QC', 'PUTAWAY'].includes(status) ? Math.floor(Math.random() * 300) : 0
      }
    ]

    const totalQty = selectedProducts.reduce((sum, p) => sum + p.expectedQty, 0)
    const receivedQty = selectedProducts.reduce((sum, p) => sum + p.receivedQty, 0)

    return {
      id: `ib-${i + 1}`,
      orderNo: `IB-${String(20251102 + i).padStart(8, '0')}-${String(i + 1).padStart(3, '0')}`,
      supplier: suppliers[i % suppliers.length],
      carrier: carriers[i % carriers.length],
      trailerNo: `TRL-${Math.floor(1000 + Math.random() * 9000)}`,
      status,
      products: selectedProducts,
      totalQty,
      receivedQty,
      eta: eta.toISOString(),
      receivedDate: status === 'COMPLETED' ? new Date().toISOString() : undefined,
      priority: priorities[i % priorities.length],
      notes: i % 3 === 0 ? 'Cần kiểm tra nhiệt độ kỹ lưỡng' : undefined,
    }
  })
}

// Update order status
const updateOrderStatus = async (orderId: string, status: string) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return { success: true, orderId, status }
}

export default function InboundOrdersPageSimple() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter] = useState<string>('ALL')

  const { data: orders, isLoading, refetch } = useQuery<InboundOrder[]>({
    queryKey: ['inbound-orders'],
    queryFn: fetchInboundOrders,
    refetchInterval: 30000,
  })

  const receiveOrderMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string, status: string }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái đơn hàng')
      refetch()
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái')
    },
  })

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

  // Filter orders by search term and status
  const filteredOrders = orders?.filter(order => {
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

  const getPriorityBadge = (priority: InboundOrder['priority']) => {
    const config = {
      HIGH: { label: 'Ưu tiên cao', className: 'bg-red-500 text-white' },
      MEDIUM: { label: 'Trung bình', className: 'bg-yellow-500 text-white' },
      LOW: { label: 'Thấp', className: 'bg-gray-500 text-white' },
    }
    return <Badge className={config[priority].className}>{config[priority].label}</Badge>
  }

  const statusCounts = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'PENDING').length || 0,
    scheduled: orders?.filter(o => o.status === 'SCHEDULED').length || 0,
    received: orders?.filter(o => o.status === 'COMPLETED').length || 0,
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
