import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  MapPin,
  FileText,
  Thermometer,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Camera,
  ClipboardCheck,
  PackageCheck,
  Box,
  TrendingUp,
  Eye,
  Save
} from 'lucide-react'

interface InboundProduct {
  id: string
  name: string
  sku: string
  expectedQty: number
  receivedQty: number
  damagedQty: number
  unit: string
  batchNo?: string
  expiryDate?: string
  temperature?: number
  zone?: string
  notes?: string
}

interface InboundOrder {
  id: string
  orderNo: string
  supplier: string
  supplierContact: string
  carrier: string
  carrierContact: string
  trailerNo: string
  driverName: string
  driverPhone: string
  status: 'PENDING' | 'SCHEDULED' | 'RECEIVING' | 'QC' | 'PUTAWAY' | 'COMPLETED' | 'CANCELLED'
  products: InboundProduct[]
  eta: string
  arrivedAt?: string
  receivedAt?: string
  completedAt?: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  notes?: string
  receivedBy?: string
  qcBy?: string
  putawayBy?: string
}

const fetchInboundOrder = async (orderId: string): Promise<InboundOrder> => {
  await new Promise(resolve => setTimeout(resolve, 600))
  
  const suppliers = [
    { name: 'Fresh Seafood Co.', contact: '+84 912 345 678' },
    { name: 'Global Meat Import', contact: '+84 913 456 789' },
    { name: 'Premium Dairy Corp.', contact: '+84 914 567 890' }
  ]
  
  const carriers = [
    { name: 'DHL Express', contact: '1900 2045' },
    { name: 'FedEx Logistics', contact: '1900 3456' }
  ]
  
  const products: InboundProduct[] = [
    {
      id: 'p1',
      name: 'Cá hồi đông lạnh',
      sku: 'FISH-001',
      expectedQty: 889,
      receivedQty: 0,
      damagedQty: 0,
      unit: 'KG',
      batchNo: 'BATCH-2025-001',
      expiryDate: '2026-01-15',
      temperature: -18.5,
      zone: 'FRZ-A'
    },
    {
      id: 'p2',
      name: 'Thịt bò Wagyu',
      sku: 'BEEF-001',
      expectedQty: 913,
      receivedQty: 0,
      damagedQty: 0,
      unit: 'KG',
      batchNo: 'BATCH-2025-002',
      expiryDate: '2026-02-20',
      temperature: -20.2,
      zone: 'FRZ-B'
    }
  ]
  
  const supplier = suppliers[parseInt(orderId.slice(-1)) % suppliers.length]
  const carrier = carriers[parseInt(orderId.slice(-1)) % carriers.length]
  
  const status = orderId === 'ib-1' ? 'SCHEDULED' : 
                 orderId === 'ib-2' ? 'RECEIVING' : 'SCHEDULED'
  
  return {
    id: orderId,
    orderNo: `IB-20251102-001`,
    supplier: supplier.name,
    supplierContact: supplier.contact,
    carrier: carrier.name,
    carrierContact: carrier.contact,
    trailerNo: 'TRL-3088',
    driverName: 'Nguyễn Văn A',
    driverPhone: '+84 901 234 567',
    status,
    products,
    eta: '2025-11-01T14:00:00',
    arrivedAt: status === 'SCHEDULED' || status === 'RECEIVING' ? new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() : undefined,
    priority: 'HIGH',
    notes: 'Cần kiểm tra nhiệt độ kỹ lưỡng',
    receivedBy: status === 'RECEIVING' ? 'Đình Phương' : undefined
  }
}

export default function InboundOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editMode, setEditMode] = useState(false)
  const [productQuantities, setProductQuantities] = useState<Record<string, { received: number, damaged: number }>>({})

  const { data: order, isLoading } = useQuery({
    queryKey: ['inbound-order', orderId],
    queryFn: () => fetchInboundOrder(orderId!),
    enabled: !!orderId
  })

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await new Promise(resolve => setTimeout(resolve, 800))
      return { success: true, status: newStatus }
    },
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['inbound-order', orderId] })
      toast.success(`Đã cập nhật trạng thái: ${getStatusLabel(newStatus)}`)
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái')
    }
  })

  const saveQuantitiesMutation = useMutation({
    mutationFn: async (data: typeof productQuantities) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true, data }
    },
    onSuccess: () => {
      toast.success('Đã lưu số lượng nhận hàng')
      setEditMode(false)
      queryClient.invalidateQueries({ queryKey: ['inbound-order', orderId] })
    },
    onError: () => {
      toast.error('Không thể lưu dữ liệu')
    }
  })

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { label: 'Chờ xử lý', color: 'bg-gray-500', icon: Clock },
      SCHEDULED: { label: 'Đã lên lịch', color: 'bg-blue-500', icon: Calendar },
      RECEIVING: { label: 'Đang nhận hàng', color: 'bg-yellow-500 animate-pulse', icon: Truck },
      QC: { label: 'Kiểm tra chất lượng', color: 'bg-orange-500', icon: ClipboardCheck },
      PUTAWAY: { label: 'Đang xếp kho', color: 'bg-purple-500', icon: PackageCheck },
      COMPLETED: { label: 'Hoàn thành', color: 'bg-green-500', icon: CheckCircle },
      CANCELLED: { label: 'Đã hủy', color: 'bg-red-500', icon: XCircle }
    }
    return configs[status as keyof typeof configs] || configs.PENDING
  }

  const getStatusLabel = (status: string) => {
    return getStatusConfig(status).label
  }

  const getPriorityConfig = (priority: string) => {
    const configs = {
      HIGH: { label: 'Cao', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-500' },
      MEDIUM: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-500' },
      LOW: { label: 'Thấp', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-500' }
    }
    return configs[priority as keyof typeof configs] || configs.MEDIUM
  }

  const canReceive = order?.status === 'SCHEDULED'
  const canQC = order?.status === 'RECEIVING'
  const canPutaway = order?.status === 'QC'
  const canComplete = order?.status === 'PUTAWAY'

  const handleStartReceiving = () => {
    if (order?.status === 'SCHEDULED') {
      updateStatusMutation.mutate('RECEIVING')
    }
  }

  const handleStartQC = () => {
    if (order?.status === 'RECEIVING') {
      updateStatusMutation.mutate('QC')
    }
  }

  const handleStartPutaway = () => {
    if (order?.status === 'QC') {
      updateStatusMutation.mutate('PUTAWAY')
    }
  }

  const handleComplete = () => {
    if (order?.status === 'PUTAWAY') {
      updateStatusMutation.mutate('COMPLETED')
    }
  }

  const handleSaveQuantities = () => {
    saveQuantitiesMutation.mutate(productQuantities)
  }

  const totalExpected = order?.products.reduce((sum, p) => sum + p.expectedQty, 0) || 0
  const totalReceived = order?.products.reduce((sum, p) => {
    const qty = productQuantities[p.id]?.received || p.receivedQty
    return sum + qty
  }, 0) || 0
  const totalDamaged = order?.products.reduce((sum, p) => {
    const qty = productQuantities[p.id]?.damaged || p.damagedQty
    return sum + qty
  }, 0) || 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <PackageCheck className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500">Không tìm thấy đơn nhập hàng</p>
      </div>
    )
  }

  const statusConfig = getStatusConfig(order.status)
  const priorityConfig = getPriorityConfig(order.priority)
  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/inbound')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {order.orderNo}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Chi tiết đơn nhập hàng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={`${statusConfig.color} text-white px-4 py-2`}>
            <StatusIcon className="w-4 h-4 mr-2" />
            {statusConfig.label}
          </Badge>
          <Badge className={`${priorityConfig.color} border-2`}>
            {priorityConfig.label}
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Trạng thái hiện tại: <strong>{statusConfig.label}</strong></span>
            </div>
            <div className="flex gap-2">
              {canReceive && (
                <Button
                  onClick={handleStartReceiving}
                  disabled={updateStatusMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Bắt đầu nhận hàng
                </Button>
              )}
              {canQC && (
                <Button
                  onClick={handleStartQC}
                  disabled={updateStatusMutation.isPending}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                >
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Bắt đầu kiểm tra QC
                </Button>
              )}
              {canPutaway && (
                <Button
                  onClick={handleStartPutaway}
                  disabled={updateStatusMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <PackageCheck className="w-4 h-4 mr-2" />
                  Bắt đầu xếp kho
                </Button>
              )}
              {canComplete && (
                <Button
                  onClick={handleComplete}
                  disabled={updateStatusMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Hoàn thành
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Timeline */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Tiến trình xử lý
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -z-10">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000"
                style={{
                  width: order.status === 'PENDING' ? '0%' :
                         order.status === 'SCHEDULED' ? '20%' :
                         order.status === 'RECEIVING' ? '40%' :
                         order.status === 'QC' ? '60%' :
                         order.status === 'PUTAWAY' ? '80%' :
                         order.status === 'COMPLETED' ? '100%' : '0%'
                }}
              />
            </div>

            {/* Steps */}
            {[
              { status: 'SCHEDULED', label: 'Lên lịch', icon: Calendar },
              { status: 'RECEIVING', label: 'Nhận hàng', icon: Truck },
              { status: 'QC', label: 'Kiểm tra', icon: ClipboardCheck },
              { status: 'PUTAWAY', label: 'Xếp kho', icon: PackageCheck },
              { status: 'COMPLETED', label: 'Hoàn thành', icon: CheckCircle }
            ].map((step, index) => {
              const StepIcon = step.icon
              const isActive = order.status === step.status
              const isCompleted = ['PENDING', 'SCHEDULED', 'RECEIVING', 'QC', 'PUTAWAY', 'COMPLETED'].indexOf(order.status) >
                                 ['PENDING', 'SCHEDULED', 'RECEIVING', 'QC', 'PUTAWAY', 'COMPLETED'].indexOf(step.status)

              return (
                <div key={step.status} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                    isCompleted ? 'bg-green-500 border-green-300' :
                    isActive ? 'bg-blue-500 border-blue-300 animate-pulse' :
                    'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                  }`}>
                    <StepIcon className={`w-5 h-5 ${
                      isCompleted || isActive ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  <p className={`text-xs mt-2 font-medium ${
                    isActive ? 'text-blue-600 dark:text-blue-400' :
                    isCompleted ? 'text-green-600 dark:text-green-400' :
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier Info */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-blue-600" />
              Nhà cung cấp
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tên công ty</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">{order.supplier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Liên hệ</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">{order.supplierContact}</p>
            </div>
          </CardContent>
        </Card>

        {/* Carrier Info */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="w-5 h-5 text-green-600" />
              Đơn vị vận chuyển
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Công ty vận tải</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">{order.carrier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Số xe</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">{order.trailerNo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tài xế</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">{order.driverName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{order.driverPhone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Info */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-purple-600" />
              Thời gian
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dự kiến đến</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {new Date(order.eta).toLocaleString('vi-VN')}
              </p>
            </div>
            {order.arrivedAt && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Thực tế đến</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {new Date(order.arrivedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            )}
            {order.receivedBy && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Người nhận</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{order.receivedBy}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Danh sách sản phẩm ({order.products.length})
            </CardTitle>
            {order.status === 'RECEIVING' && !editMode && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditMode(true)}
                className="border-blue-500 text-blue-600"
              >
                <Edit className="w-4 h-4 mr-2" />
                Nhập số lượng
              </Button>
            )}
            {editMode && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditMode(false)}
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveQuantities}
                  disabled={saveQuantitiesMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Lưu
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {order.products.map((product) => {
              const receivedQty = productQuantities[product.id]?.received ?? product.receivedQty
              const damagedQty = productQuantities[product.id]?.damaged ?? product.damagedQty
              const percentage = (receivedQty / product.expectedQty) * 100

              return (
                <div
                  key={product.id}
                  className="p-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Product Info */}
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>SKU: <strong>{product.sku}</strong></span>
                        <span>Batch: <strong>{product.batchNo}</strong></span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {product.temperature}°C
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {product.zone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            HSD: {product.expiryDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantities */}
                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Dự kiến</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {product.expectedQty}
                          </p>
                          <p className="text-xs text-gray-500">{product.unit}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Đã nhận</p>
                          {editMode ? (
                            <Input
                              type="number"
                              min="0"
                              max={product.expectedQty}
                              value={receivedQty}
                              onChange={(e) => setProductQuantities(prev => ({
                                ...prev,
                                [product.id]: {
                                  received: parseInt(e.target.value) || 0,
                                  damaged: prev[product.id]?.damaged || 0
                                }
                              }))}
                              className="w-24"
                            />
                          ) : (
                            <>
                              <p className={`text-2xl font-bold ${
                                receivedQty === product.expectedQty ? 'text-green-600' :
                                receivedQty > 0 ? 'text-yellow-600' : 'text-gray-400'
                              }`}>
                                {receivedQty}
                              </p>
                              <p className="text-xs text-gray-500">{product.unit}</p>
                            </>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Hỏng</p>
                          {editMode ? (
                            <Input
                              type="number"
                              min="0"
                              value={damagedQty}
                              onChange={(e) => setProductQuantities(prev => ({
                                ...prev,
                                [product.id]: {
                                  received: prev[product.id]?.received || 0,
                                  damaged: parseInt(e.target.value) || 0
                                }
                              }))}
                              className="w-24"
                            />
                          ) : (
                            <>
                              <p className={`text-2xl font-bold ${
                                damagedQty > 0 ? 'text-red-600' : 'text-gray-400'
                              }`}>
                                {damagedQty}
                              </p>
                              <p className="text-xs text-gray-500">{product.unit}</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Tiến độ</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              percentage >= 100 ? 'bg-green-500' :
                              percentage >= 50 ? 'bg-yellow-500' :
                              percentage > 0 ? 'bg-blue-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-teal-950/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Box className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng dự kiến</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalExpected} KG
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đã nhận</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalReceived} KG
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hỏng</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalDamaged} KG
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card className="border-0 shadow-xl border-l-4 border-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">Ghi chú</p>
                <p className="text-gray-600 dark:text-gray-400">{order.notes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
