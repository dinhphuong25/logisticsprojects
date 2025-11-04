import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  PackageOpen,
  Plus,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  X
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { InboundOrder } from '@/types'

export default function InboundOrdersPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState({
    supplier: '',
    carrier: '',
    trailerNo: '',
    eta: '',
    productId: 'prod-1',
    expectedQty: '',
  })

  const { data: orders, isLoading } = useQuery<InboundOrder[]>({
    queryKey: ['inbound-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/inbound')
      return res.data
    },
  })

  const createOrderMutation = useMutation({
    mutationFn: async (data: {
      supplier: string
      carrier: string
      trailerNo: string
      eta: string
      productId: string
      expectedQty: string
    }) => {
      const orderNo = `IB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`
      
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
        supplier: data.supplier,
        carrier: data.carrier,
        trailerNo: data.trailerNo || '',
        eta: new Date(data.eta).toISOString(),
        status: 'PENDING',
        lines: [
          {
            id: `line-${Date.now()}`,
            productId: data.productId,
            expectedQty: parseInt(data.expectedQty),
            receivedQty: 0,
            product: { name: product.name, sku: product.sku, unit: 'KG' },
          }
        ],
        totalQty: parseInt(data.expectedQty),
        receivedQty: 0,
      }
      await apiClient.post('/inbound', newOrder)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-orders'] })
      toast.success('Đã tạo đơn nhập hàng thành công')
      setShowCreateDialog(false)
      setFormData({
        supplier: '',
        carrier: '',
        trailerNo: '',
        eta: '',
        productId: 'prod-1',
        expectedQty: '',
      })
    },
    onError: () => {
      toast.error('Không thể tạo đơn nhập hàng')
    },
  })

  const receiveOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await apiClient.put(`/inbound/${orderId}`, { status: 'COMPLETED' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-orders'] })
      toast.success('Đã nhận hàng thành công')
    },
    onError: () => {
      toast.error('Không thể nhận hàng')
    },
  })

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.supplier || !formData.carrier || !formData.eta || !formData.expectedQty) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    createOrderMutation.mutate(formData)
  }

  const filteredOrders = orders?.filter(order =>
    order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    pending: orders?.filter(o => o.status === 'PENDING').length || 0,
    inTransit: orders?.filter(o => o.status === 'SCHEDULED').length || 0,
    received: orders?.filter(o => o.status === 'COMPLETED').length || 0,
    total: orders?.length || 0,
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, icon: Clock, label: 'Chờ xử lý' },
      SCHEDULED: { variant: 'default' as const, icon: Truck, label: 'Đã lên lịch' },
      RECEIVING: { variant: 'default' as const, icon: PackageOpen, label: 'Đang nhận hàng' },
      QC: { variant: 'default' as const, icon: CheckCircle, label: 'Kiểm tra chất lượng' },
      PUTAWAY: { variant: 'default' as const, icon: CheckCircle, label: 'Đang cất kho' },
      COMPLETED: { variant: 'default' as const, icon: CheckCircle, label: 'Hoàn thành' },
      CANCELLED: { variant: 'destructive' as const, icon: AlertCircle, label: 'Đã hủy' },
    }
    
    const config = variants[status as keyof typeof variants] || variants.PENDING
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 dark:from-white dark:via-green-200 dark:to-emerald-200 bg-clip-text text-transparent">
            Đơn nhập hàng
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Quản lý lô hàng đến và tiếp nhận
          </p>
        </div>

        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo đơn nhập
        </Button>
      </div>

      {/* Create Order Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <PackageOpen className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Tạo đơn nhập hàng mới</h2>
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
                    Nhà cung cấp <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Tên nhà cung cấp"
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

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Số xe (Trailer)
                  </label>
                  <Input
                    value={formData.trailerNo}
                    onChange={(e) => setFormData({ ...formData, trailerNo: e.target.value })}
                    placeholder="VD: TRL-1234"
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Thời gian dự kiến đến (ETA) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.eta}
                    onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                    className="h-11"
                    required
                  />
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
                      className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="prod-1">🐟 Salmon Fillet (SKU-001)</option>
                      <option value="prod-2">🥩 Wagyu Beef (SKU-002)</option>
                      <option value="prod-3">🥬 Mixed Vegetables (SKU-003)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Số lượng dự kiến (KG) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.expectedQty}
                      onChange={(e) => setFormData({ ...formData, expectedQty: e.target.value })}
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
                  className="flex-1 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
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
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Chờ xử lý
            </CardTitle>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
            <p className="text-xs text-gray-500 mt-1">Chờ gửi đi</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Đang vận chuyển
            </CardTitle>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.inTransit}</div>
            <p className="text-xs text-gray-500 mt-1">Đang trên đường</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Đã nhận
            </CardTitle>
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.received}</div>
            <p className="text-xs text-gray-500 mt-1">Nhận hàng thành công</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Tổng cộng
            </CardTitle>
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <PackageOpen className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Tất cả đơn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Đơn nhập hàng</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Nhà cung cấp</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Ngày dự kiến</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNo}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>
                    {order.lines && order.lines.length > 0 ? (
                      <div>
                        <div className="text-sm">{order.lines[0].product?.name || '-'}</div>
                        <div className="text-xs text-gray-500">{order.lines[0].product?.sku || '-'}</div>
                        {order.lines.length > 1 && (
                          <div className="text-xs text-gray-400 mt-1">+{order.lines.length - 1} sản phẩm khác</div>
                        )}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{order.totalQty} KG</TableCell>
                  <TableCell>{formatDate(order.eta)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    {(order.status === 'SCHEDULED' || order.status === 'RECEIVING') && (
                      <Button
                        size="sm"
                        onClick={() => receiveOrderMutation.mutate(order.id)}
                        disabled={receiveOrderMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Nhận hàng
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders?.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">Không tìm thấy đơn hàng</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
