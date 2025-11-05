import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  PackageCheck,
  Clock,
  Package,
  CheckCircle,
  Truck,
  Search,
  AlertCircle,
  TrendingUp,
  Plus,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

interface OutboundOrder {
  id: string
  orderNo: string
  orderNumber?: string
  customer: string
  carrier?: string
  trailerNo?: string
  departureTime?: string
  status: string
  priority?: string
  product?: {
    name: string
    sku: string
  }
  quantity?: number
  totalQty?: number
  products?: Array<{
    name: string
    sku: string
    quantity: number
  }>
}

export default function OutboundOrdersPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState({
    customer: '',
    customerAddress: '',
    carrier: '',
    trailerNo: '',
    etd: '',
    priority: 'NORMAL',
    productId: 'prod-1',
    requestedQty: '',
  })

  const { data: orders = [] } = useQuery<OutboundOrder[]>({
    queryKey: ['outbound-orders'],
    queryFn: async () => {
      const response = await apiClient.get('/outbound')
      return response.data.outbounds || []
    },
  })

  const createOrderMutation = useMutation({
    mutationFn: async (data: {
      customer: string
      customerAddress: string
      carrier: string
      trailerNo: string
      etd: string
      priority: string
      productId: string
      requestedQty: string
    }) => {
      const orderNo = `OB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`
      
      // Get product info
      const productMap: Record<string, { name: string; sku: string }> = {
        'prod-1': { name: 'Salmon Fillet', sku: 'SKU-001' },
        'prod-2': { name: 'Wagyu Beef', sku: 'SKU-002' },
        'prod-3': { name: 'Mixed Vegetables', sku: 'SKU-003' },
      }
      
      const product = productMap[data.productId]
      
      const newOrder = {
        orderNo,
        warehouseId: 'wh-1',
        customer: data.customer,
        customerAddress: data.customerAddress,
        carrier: data.carrier,
        trailerNo: data.trailerNo || '',
        etd: new Date(data.etd).toISOString(),
        departureTime: new Date(data.etd).toISOString(),
        status: 'RELEASED',
        priority: data.priority,
        lines: [
          {
            id: `line-${Date.now()}`,
            productId: data.productId,
            requestedQty: parseInt(data.requestedQty),
            pickedQty: 0,
            product: { name: product.name, sku: product.sku },
          }
        ],
        totalQty: parseInt(data.requestedQty),
        pickedQty: 0,
        shippedQty: 0,
      }
      await apiClient.post('/outbound', newOrder)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outbound-orders'] })
      toast.success('Đã tạo đơn xuất hàng thành công')
      setShowCreateDialog(false)
      setFormData({
        customer: '',
        customerAddress: '',
        carrier: '',
        trailerNo: '',
        etd: '',
        priority: 'NORMAL',
        productId: 'prod-1',
        requestedQty: '',
      })
    },
    onError: () => {
      toast.error('Không thể tạo đơn xuất hàng')
    },
  })

  const pickOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await apiClient.put(`/outbound/${orderId}`, { status: 'PICKING' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outbound-orders'] })
      toast.success('🚀 Đã bắt đầu xử lý đơn hàng', {
        description: 'Đơn hàng đang được lấy hàng và chuẩn bị',
        duration: 3000,
      })
    },
    onError: () => {
      toast.error('❌ Không thể bắt đầu xử lý đơn hàng', {
        description: 'Vui lòng thử lại sau',
        duration: 3000,
      })
    },
  })

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customer || !formData.customerAddress || !formData.carrier || !formData.etd || !formData.requestedQty) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    createOrderMutation.mutate(formData)
  }

  const shipOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await apiClient.put(`/outbound/${orderId}`, { status: 'SHIPPED' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outbound-orders'] })
      toast.success('✅ Đã gửi đơn hàng thành công', {
        description: 'Đơn hàng đang trên đường vận chuyển',
        duration: 3000,
      })
    },
    onError: () => {
      toast.error('❌ Không thể gửi đơn hàng', {
        description: 'Vui lòng kiểm tra và thử lại',
        duration: 3000,
      })
    },
  })

  const filteredOrders = orders.filter(
    (order) =>
      (order.orderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.customer?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    released: orders.filter((o) => o.status === 'RELEASED').length,
    picking: orders.filter((o) => o.status === 'PICKING').length,
    shipped: orders.filter((o) => o.status === 'SHIPPED').length,
    total: orders.length,
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
      PENDING: { label: 'Chờ xử lý', variant: 'secondary', icon: Clock },
      RELEASED: { label: 'Đã phát hành', variant: 'secondary', icon: Clock },
      PICKING: { label: 'Đang lấy hàng', variant: 'default', icon: Package },
      PICKED: { label: 'Đã lấy hàng', variant: 'default', icon: CheckCircle },
      PACKING: { label: 'Đang đóng gói', variant: 'default', icon: Package },
      LOADED: { label: 'Đã xếp hàng', variant: 'default', icon: Truck },
      SHIPPED: { label: 'Đã gửi đi', variant: 'outline', icon: CheckCircle },
      CANCELLED: { label: 'Đã hủy', variant: 'destructive', icon: AlertCircle },
      shipped: { label: 'Đã gửi đi', variant: 'outline', icon: CheckCircle },
    }

    const config = statusMap[status.toLowerCase()] || statusMap.released
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null

    const priorityMap: Record<string, { variant: 'default' | 'destructive'; className: string }> = {
      high: { variant: 'destructive', className: 'bg-red-500' },
      urgent: { variant: 'destructive', className: 'bg-red-600' },
      normal: { variant: 'default', className: 'bg-blue-500' },
    }

    const config = priorityMap[priority.toLowerCase()] || priorityMap.normal

    return (
      <Badge variant={config.variant} className={`${config.className} text-white`}>
        {priority.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 via-pink-800 to-red-800 dark:from-purple-200 dark:via-pink-200 dark:to-red-200 bg-clip-text text-transparent">
            Đơn xuất hàng
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Quản lý lấy hàng, đóng gói và vận chuyển
          </p>
        </div>

        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo đơn
        </Button>
      </div>

      {/* Create Order Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <PackageCheck className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Tạo đơn xuất hàng mới</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateDialog(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateOrder} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Khách hàng <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    placeholder="Tên khách hàng"
                    className="h-11"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Đơn vị vận chuyển <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.carrier}
                    onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                    placeholder="Tên công ty vận chuyển"
                    className="h-11"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    placeholder="Địa chỉ đầy đủ"
                    className="h-11"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Số xe (Trailer)
                  </label>
                  <Input
                    value={formData.trailerNo}
                    onChange={(e) => setFormData({ ...formData, trailerNo: e.target.value })}
                    placeholder="VD: TRL-2001"
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Thời gian xuất phát (ETD) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.etd}
                    onChange={(e) => setFormData({ ...formData, etd: e.target.value })}
                    className="h-11"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Mức độ ưu tiên <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="NORMAL">🟢 Bình thường</option>
                    <option value="HIGH">🟡 Cao</option>
                    <option value="URGENT">🔴 Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-5">
                <h3 className="text-base font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  Thông tin sản phẩm
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.productId}
                      onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                      className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="prod-1">🐟 Salmon Fillet (SKU-001)</option>
                      <option value="prod-2">🥩 Wagyu Beef (SKU-002)</option>
                      <option value="prod-3">🥬 Mixed Vegetables (SKU-003)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Số lượng yêu cầu (KG) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.requestedQty}
                      onChange={(e) => setFormData({ ...formData, requestedQty: e.target.value })}
                      placeholder="VD: 500"
                      className="h-11"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-5 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 h-11"
                  disabled={createOrderMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                >
                  {createOrderMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang tạo...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Tạo đơn
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-slide-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đã phát hành</p>
                <p className="text-3xl font-bold">{stats.released}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đang lấy hàng</p>
                <p className="text-3xl font-bold">{stats.picking}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đã gửi đi</p>
                <p className="text-3xl font-bold">{stats.shipped}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng đơn</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm theo mã đơn hoặc khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Mã đơn</th>
                  <th className="text-left p-4 font-medium">Khách hàng</th>
                  <th className="text-left p-4 font-medium">Sản phẩm</th>
                  <th className="text-left p-4 font-medium">Số lượng</th>
                  <th className="text-left p-4 font-medium">Ưu tiên</th>
                  <th className="text-left p-4 font-medium">Xuất phát</th>
                  <th className="text-left p-4 font-medium">Trạng thái</th>
                  <th className="text-left p-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>Không tìm thấy đơn hàng</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-4">
                        <span className="font-mono text-sm">{order.orderNo || order.orderNumber}</span>
                      </td>
                      <td className="p-4">{order.customer}</td>
                      <td className="p-4">
                        {order.product ? (
                          <div>
                            <div className="font-medium">{order.product.name}</div>
                            <div className="text-xs text-gray-500">{order.product.sku}</div>
                          </div>
                        ) : order.products ? (
                          <div className="text-sm">
                            {order.products.length} sản phẩm
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-4">{order.quantity || order.totalQty || '-'}</td>
                      <td className="p-4">{getPriorityBadge(order.priority)}</td>
                      <td className="p-4">
                        {order.departureTime ? new Date(order.departureTime).toLocaleString() : '-'}
                      </td>
                      <td className="p-4">{getStatusBadge(order.status)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {/* Smart button logic based on status */}
                          {(() => {
                            const status = order.status?.toUpperCase()
                            
                            // Đơn chờ xử lý hoặc đã phát hành - Hiển thị nút Bắt đầu
                            if (status === 'PENDING' || status === 'RELEASED' || status === 'CHỜ XỬ LÝ') {
                              return (
                                <Button
                                  size="sm"
                                  onClick={() => pickOrderMutation.mutate(order.id)}
                                  disabled={pickOrderMutation.isPending}
                                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                  <Package className="w-4 h-4 mr-1" />
                                  Bắt đầu
                                </Button>
                              )
                            }
                            
                            // Đang lấy hàng - Hiển thị trạng thái đang xử lý
                            if (status === 'PICKING' || status === 'ĐANG LẤY HÀNG') {
                              return (
                                <Badge className="bg-blue-500 text-white px-4 py-1.5 text-xs font-semibold">
                                  <Package className="w-3 h-3 mr-1 animate-pulse" />
                                  Đang xử lý...
                                </Badge>
                              )
                            }
                            
                            // Đã lấy hàng hoặc đã xếp hàng - Hiển thị nút Gửi đi
                            if (status === 'PICKED' || status === 'LOADED' || status === 'PACKING') {
                              return (
                                <Button
                                  size="sm"
                                  onClick={() => shipOrderMutation.mutate(order.id)}
                                  disabled={shipOrderMutation.isPending}
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                  <Truck className="w-4 h-4 mr-1" />
                                  Gửi đi
                                </Button>
                              )
                            }
                            
                            // Đã gửi đi - Hiển thị badge hoàn thành
                            if (status === 'SHIPPED' || status === 'ĐÃ GỬI ĐI') {
                              return (
                                <Badge className="bg-green-500 text-white px-4 py-1.5 text-xs font-semibold">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Hoàn thành
                                </Badge>
                              )
                            }
                            
                            // Đã hủy - Hiển thị badge hủy
                            if (status === 'CANCELLED' || status === 'ĐÃ HỦY') {
                              return (
                                <Badge className="bg-gray-500 text-white px-4 py-1.5 text-xs font-semibold">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Đã hủy
                                </Badge>
                              )
                            }
                            
                            // Mặc định - Không hiển thị gì hoặc hiển thị trạng thái
                            return (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                -
                              </span>
                            )
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
