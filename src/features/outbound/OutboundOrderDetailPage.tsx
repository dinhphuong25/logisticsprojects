import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  PackageCheck,
  Truck,
  ArrowLeft,
  Clock,
  CheckCircle,
  Package,
  User,
  MapPin,
  Calendar,
  Thermometer,
  Box,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Save,
} from 'lucide-react'

interface OutboundOrder {
  id: string
  orderNo: string
  customer: string
  status: 'PENDING' | 'PICKING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  products: {
    id: string
    name: string
    sku: string
    quantity: number
    weight: number
    temperature: string
    location: string
    picked?: number
  }[]
  totalQty: number
  totalWeight: number
  requestedDate: string
  shippedDate?: string
  deliveredDate?: string
  destination: string
  driver?: string
  vehiclePlate?: string
  zone: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  notes?: string
  contactPerson?: string
  contactPhone?: string
  estimatedDelivery?: string
}

// Mock data function with smart logic
const fetchOrderDetail = async (orderId: string): Promise<OutboundOrder> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Extract order number from ID (e.g., "ob-2" -> 2)
  const orderNum = parseInt(orderId.split('-')[1] || '1')
  
  // Smart product catalog based on order number
  const productCatalog = [
    [
      { id: 'p1', name: 'Cá hồi đông lạnh', sku: 'FISH-001', quantity: 100, weight: 150, temperature: '-18°C', location: 'FROZEN-A-01' },
      { id: 'p2', name: 'Thịt bò tươi', sku: 'BEEF-001', quantity: 50, weight: 75, temperature: '2-4°C', location: 'CHILL-B-03' },
      { id: 'p3', name: 'Tôm đông lạnh', sku: 'SHRIMP-001', quantity: 80, weight: 120, temperature: '-18°C', location: 'FROZEN-A-05' },
      { id: 'p4', name: 'Sữa tươi', sku: 'MILK-001', quantity: 200, weight: 150, temperature: '2-4°C', location: 'CHILL-A-02' },
    ],
    [
      { id: 'p5', name: 'Tôm sú đông lạnh', sku: 'SHRIMP-002', quantity: 60, weight: 90, temperature: '-18°C', location: 'FROZEN-B-02' },
      { id: 'p6', name: 'Gà tươi làm sạch', sku: 'CHICKEN-001', quantity: 120, weight: 180, temperature: '2-4°C', location: 'CHILL-A-05' },
      { id: 'p7', name: 'Cá ngừ đông lạnh', sku: 'FISH-002', quantity: 40, weight: 80, temperature: '-18°C', location: 'FROZEN-A-08' },
    ],
    [
      { id: 'p8', name: 'Thịt heo đông lạnh', sku: 'PORK-001', quantity: 90, weight: 135, temperature: '-18°C', location: 'FROZEN-B-04' },
      { id: 'p9', name: 'Phô mai nhập khẩu', sku: 'CHEESE-001', quantity: 150, weight: 100, temperature: '2-4°C', location: 'CHILL-B-07' },
      { id: 'p10', name: 'Bơ Úc đông lạnh', sku: 'BUTTER-001', quantity: 200, weight: 120, temperature: '-18°C', location: 'FROZEN-A-10' },
      { id: 'p11', name: 'Xúc xích đông lạnh', sku: 'SAUSAGE-001', quantity: 80, weight: 60, temperature: '-18°C', location: 'FROZEN-B-06' },
    ],
  ]

  // Customer data rotation
  const customers = [
    { name: 'Siêu thị BigC', contact: 'Nguyễn Văn A', phone: '0901234567', destination: 'Hà Nội - 123 Đường Láng, Quận Đống Đa' },
    { name: 'Nhà hàng Golden Gate', contact: 'Trần Thị B', phone: '0912345678', destination: 'TP HCM - 456 Nguyễn Huệ, Quận 1' },
    { name: 'Khách sạn Sheraton', contact: 'Lê Văn C', phone: '0923456789', destination: 'Đà Nẵng - 789 Bạch Đằng, Quận Hải Châu' },
    { name: 'Công ty FoodMart', contact: 'Phạm Thị D', phone: '0934567890', destination: 'Hà Nội - 321 Trần Duy Hưng, Quận Cầu Giấy' },
  ]

  const customerData = customers[orderNum % customers.length]
  const products = productCatalog[orderNum % productCatalog.length]
  
  // Smart status determination based on order number
  const statuses: OutboundOrder['status'][] = ['PENDING', 'PICKING', 'PACKED', 'SHIPPED', 'DELIVERED']
  const status = statuses[orderNum % statuses.length]
  
  // Smart picking progress for PICKING status
  const productsWithPicking = products.map(p => ({
    ...p,
    picked: status === 'PICKING' ? Math.floor(p.quantity * (0.3 + Math.random() * 0.5)) : 
            status === 'PACKED' || status === 'SHIPPED' || status === 'DELIVERED' ? p.quantity : 0
  }))

  // Priority based on total quantity
  const totalQty = products.reduce((sum, p) => sum + p.quantity, 0)
  const priority: OutboundOrder['priority'] = totalQty > 300 ? 'HIGH' : totalQty > 150 ? 'MEDIUM' : 'LOW'
  
  // Zone based on product temperature
  const hasFrozen = products.some(p => p.temperature.includes('-'))
  const zone = hasFrozen ? `FROZEN-${['A', 'B'][orderNum % 2]}` : `CHILL-${['A', 'B'][orderNum % 2]}`

  // Smart dates based on status
  const requestedDate = new Date()
  requestedDate.setDate(requestedDate.getDate() - orderNum)
  
  const shippedDate = ['SHIPPED', 'DELIVERED'].includes(status) 
    ? new Date(requestedDate.getTime() + 86400000).toISOString() 
    : undefined
    
  const deliveredDate = status === 'DELIVERED'
    ? new Date(requestedDate.getTime() + 172800000).toISOString()
    : undefined

  // Driver info for shipped orders
  const drivers = ['Nguyễn Văn Nam', 'Trần Văn Tài', 'Lê Văn Bình', 'Phạm Văn Đức']
  const driver = ['SHIPPED', 'DELIVERED'].includes(status) ? drivers[orderNum % drivers.length] : undefined
  const vehiclePlate = driver ? `29A-${(10000 + orderNum * 1111).toString().slice(0, 5)}` : undefined

  // Smart notes based on priority
  const notes = priority === 'HIGH' 
    ? 'ƯU TIÊN CAO: Giao hàng trước 8h sáng. Liên hệ trước 30 phút. Kiểm tra nhiệt độ kỹ.'
    : priority === 'MEDIUM'
    ? 'Giao hàng trong giờ hành chính. Liên hệ trước khi giao.'
    : 'Giao hàng bình thường. Có thể giao sau 14h.'

  return {
    id: orderId,
    orderNo: `OB-${String(orderNum).padStart(5, '0')}`,
    customer: customerData.name,
    status,
    products: productsWithPicking,
    totalQty,
    totalWeight: products.reduce((sum, p) => sum + p.weight, 0),
    requestedDate: requestedDate.toISOString(),
    shippedDate,
    deliveredDate,
    destination: customerData.destination,
    driver,
    vehiclePlate,
    zone,
    priority,
    notes,
    contactPerson: customerData.contact,
    contactPhone: customerData.phone,
    estimatedDelivery: new Date(requestedDate.getTime() + 86400000 * (orderNum % 3 + 1)).toISOString(),
  }
}

// Update order status
const updateOrderStatus = async (orderId: string, status: string) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return { success: true, orderId, status }
}

// Helper function for status badges
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

const getPriorityBadge = (priority: OutboundOrder['priority']) => {
  const config = {
    HIGH: { label: 'Ưu tiên cao', className: 'bg-red-500 text-white' },
    MEDIUM: { label: 'Trung bình', className: 'bg-yellow-500 text-white' },
    LOW: { label: 'Thấp', className: 'bg-gray-500 text-white' },
  }
  return <Badge className={config[priority].className}>{config[priority].label}</Badge>
}

export default function OutboundOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [showStartModal, setShowStartModal] = useState(false)

  const { data: order, isLoading, refetch } = useQuery<OutboundOrder>({
    queryKey: ['outbound-order', orderId],
    queryFn: () => fetchOrderDetail(orderId!),
    enabled: !!orderId,
  })

  const startOrderMutation = useMutation({
    mutationFn: () => updateOrderStatus(orderId!, 'PICKING'),
    onSuccess: () => {
      setShowStartModal(false)
      toast.success('Đã bắt đầu xử lý đơn hàng', {
        description: 'Đơn hàng đã chuyển sang trạng thái "Đang lấy hàng"'
      })
      refetch()
    },
    onError: () => {
      toast.error('Không thể xử lý đơn hàng', {
        description: 'Vui lòng thử lại sau'
      })
    }
  })

  // Memoized calculations for better performance
  const orderStats = useMemo(() => {
    if (!order) return null
    
    const totalProducts = order.products.length
    const totalPicked = order.products.reduce((sum, p) => sum + (p.picked || 0), 0)
    const totalRequired = order.totalQty
    const pickingProgress = totalRequired > 0 ? Math.round((totalPicked / totalRequired) * 100) : 0
    const remainingQty = totalRequired - totalPicked
    
    return {
      totalProducts,
      totalPicked,
      totalRequired,
      pickingProgress,
      remainingQty,
      isFullyPicked: pickingProgress === 100
    }
  }, [order])

  // Progress steps configuration
  const progressSteps = useMemo(() => [
    { status: 'PENDING', label: 'Chờ xử lý', icon: Clock },
    { status: 'PICKING', label: 'Lấy hàng', icon: Package },
    { status: 'PACKED', label: 'Đóng gói', icon: PackageCheck },
    { status: 'SHIPPED', label: 'Vận chuyển', icon: Truck },
    { status: 'DELIVERED', label: 'Hoàn thành', icon: CheckCircle },
  ], [])

  const currentStepIndex = useMemo(() => 
    progressSteps.findIndex(s => s.status === order?.status),
    [progressSteps, order?.status]
  )

  // Smart button actions based on status
  const actionButton = useMemo(() => {
    if (!order) return null

    switch (order.status) {
      case 'PENDING':
        return (
          <Button onClick={() => setShowStartModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Play className="w-4 h-4 mr-2" />
            Bắt đầu xử lý
          </Button>
        )
      case 'PICKING':
        return (
          <Button 
            onClick={() => startOrderMutation.mutate()}
            className="bg-green-600 hover:bg-green-700"
            disabled={!orderStats?.isFullyPicked}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Hoàn thành lấy hàng {orderStats && `(${orderStats.pickingProgress}%)`}
          </Button>
        )
      case 'PACKED':
        return (
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Truck className="w-4 h-4 mr-2" />
            Giao cho vận chuyển
          </Button>
        )
      case 'SHIPPED':
        return (
          <Button className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Xác nhận đã giao
          </Button>
        )
      default:
        return null
    }
  }, [order, orderStats, startOrderMutation])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <Button onClick={() => navigate('/outbound')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" onClick={() => navigate('/outbound')} className="w-full xs:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {order.orderNo}
              </h1>
              {getStatusBadge(order.status)}
              {getPriorityBadge(order.priority)}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Chi tiết đơn xuất hàng
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {actionButton}
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Lưu ghi chú
          </Button>
        </div>
      </div>

      {/* Picking Progress Bar (only show in PICKING status) */}
      {order.status === 'PICKING' && orderStats && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Tiến độ lấy hàng</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {orderStats.totalPicked} / {orderStats.totalRequired} sản phẩm ({orderStats.pickingProgress}%)
                </p>
              </div>
              <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                {orderStats.pickingProgress}%
              </Badge>
            </div>
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${orderStats.pickingProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Timeline */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            {progressSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index <= currentStepIndex
              const isCurrent = index === currentStepIndex
              
              return (
                <div key={step.status} className="flex items-center">
                  <div className="flex flex-col items-center w-24">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-400 dark:bg-gray-700'
                      }
                      ${isCurrent ? 'ring-4 ring-blue-200 dark:ring-blue-900 scale-110' : ''}
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm mt-2 font-medium ${
                      isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < progressSteps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 transition-all ${
                      index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products List */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardTitle className="flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-600" />
                Danh sách sản phẩm ({order.products.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y dark:divide-gray-700">
                {order.products.map((product) => {
                  const pickProgress = product.quantity > 0 ? Math.round(((product.picked || 0) / product.quantity) * 100) : 0
                  
                  return (
                    <div key={product.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-gray-900 dark:text-white">{product.name}</h4>
                            <Badge variant="outline" className="text-xs">{product.sku}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Số lượng:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {product.quantity} SP
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Trọng lượng:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {product.weight} kg
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Thermometer className="w-4 h-4 text-blue-500" />
                              <span className="font-medium text-blue-600">{product.temperature}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900 dark:text-white">{product.location}</span>
                            </div>
                          </div>
                          {order.status === 'PICKING' && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Đã lấy: {product.picked || 0}/{product.quantity}
                                </span>
                                <span className="font-medium text-blue-600">{pickProgress}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 transition-all"
                                  style={{ width: `${pickProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        {(order.status === 'PACKED' || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                          <Badge className="bg-green-500 text-white ml-4">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Hoàn thành
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Ghi chú đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg ${
                  order.priority === 'HIGH' 
                    ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500' 
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}>
                  <p className="text-gray-700 dark:text-gray-300">{order.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-blue-600" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tên khách hàng</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.customer}</p>
              </div>
              {order.contactPerson && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Người liên hệ</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.contactPerson}</p>
                </div>
              )}
              {order.contactPhone && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                  <a href={`tel:${order.contactPhone}`} className="font-medium text-blue-600 hover:underline">
                    {order.contactPhone}
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">Địa chỉ giao hàng</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                  <p className="font-medium text-gray-900 dark:text-white">{order.destination}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PackageCheck className="w-5 h-5 text-blue-600" />
                Tổng quan đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tổng sản phẩm</span>
                <span className="font-bold text-gray-900 dark:text-white">{order.totalQty} SP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tổng trọng lượng</span>
                <span className="font-bold text-gray-900 dark:text-white">{order.totalWeight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Khu vực kho</span>
                <Badge variant="outline">{order.zone}</Badge>
              </div>
              <div className="pt-3 border-t dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  Ngày yêu cầu
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(order.requestedDate).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {order.estimatedDelivery && (
                <div className="pt-3 border-t dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Truck className="w-4 h-4" />
                    Dự kiến giao hàng
                  </div>
                  <p className="font-medium text-blue-600">
                    {new Date(order.estimatedDelivery).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Info */}
          {(order.driver || order.vehiclePlate) && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Thông tin vận chuyển
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {order.driver && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tài xế</p>
                    <p className="font-medium text-gray-900 dark:text-white">{order.driver}</p>
                  </div>
                )}
                {order.vehiclePlate && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Biển số xe</p>
                    <Badge className="bg-blue-600 text-white text-lg px-3 py-1">{order.vehiclePlate}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Start Order Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowStartModal(false)}>
          <Card className="w-full max-w-md border-0 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                Xác nhận bắt đầu xử lý
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    Bắt đầu xử lý đơn hàng {order.orderNo}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Đơn hàng sẽ chuyển sang trạng thái "Đang lấy hàng". Bạn có chắc chắn muốn tiếp tục?
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Khách hàng:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{order.customer}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tổng sản phẩm:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{order.totalQty} SP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Khu vực:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{order.zone}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowStartModal(false)}
                  disabled={startOrderMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => startOrderMutation.mutate()}
                  disabled={startOrderMutation.isPending}
                >
                  {startOrderMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
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
