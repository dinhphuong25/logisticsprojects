import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  PackageCheck,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Search,
  AlertTriangle,
  User,
  MapPin,
  Phone,
  Calendar,
  Package,
} from 'lucide-react'
import { getAllProducts, getZoneForProduct, type Product as CatalogProduct } from '@/lib/products-data'

interface Product {
  id: string
  name: string
  nameVi?: string
  sku: string
  quantity: number
  weight: number
  temperature: string
  location: string
  stockLevel?: number
  unit?: string
}

interface OrderFormData {
  customer: string
  contactPerson: string
  contactPhone: string
  destination: string
  requestedDate: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  notes: string
  products: Product[]
}

// Convert catalog products to order products
const convertToOrderProduct = (catalogProduct: CatalogProduct): Product => {
  return {
    id: catalogProduct.id,
    name: catalogProduct.nameVi,
    sku: catalogProduct.sku,
    quantity: 0,
    weight: catalogProduct.weight,
    temperature: catalogProduct.tempRange,
    location: getZoneForProduct(catalogProduct.tempClass),
    stockLevel: catalogProduct.stockLevel,
    unit: catalogProduct.unit
  }
}

// Get product catalog from shared data
const PRODUCT_CATALOG: Product[] = getAllProducts().map(convertToOrderProduct)

// Mock customers for autocomplete
const CUSTOMERS = [
  { name: 'Siêu thị BigC', contact: 'Nguyễn Văn A', phone: '0901234567', address: 'Hà Nội - 123 Đường Láng, Quận Đống Đa' },
  { name: 'Nhà hàng Golden Gate', contact: 'Trần Thị B', phone: '0912345678', address: 'TP HCM - 456 Nguyễn Huệ, Quận 1' },
  { name: 'Khách sạn Sheraton', contact: 'Lê Văn C', phone: '0923456789', address: 'Đà Nẵng - 789 Bạch Đằng, Quận Hải Châu' },
  { name: 'Công ty FoodMart', contact: 'Phạm Thị D', phone: '0934567890', address: 'Hà Nội - 321 Trần Duy Hưng, Quận Cầu Giấy' },
  { name: 'Nhà hàng Seoul BBQ', contact: 'Kim Văn E', phone: '0945678901', address: 'TP HCM - 555 Lê Văn Sỹ, Quận 3' },
]

// Mock API call
const createOutboundOrder = async (data: OrderFormData) => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  const orderNo = `OB-${String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0')}`
  console.log('Creating order with data:', data) // Log for debugging
  return { success: true, orderNo, id: `ob-${Math.floor(Math.random() * 1000)}` }
}

export default function CreateOutboundOrderPage() {
  const navigate = useNavigate()
  const [searchProduct, setSearchProduct] = useState('')
  const [searchCustomer, setSearchCustomer] = useState('')
  const [showProductCatalog, setShowProductCatalog] = useState(false)
  const [showCustomerList, setShowCustomerList] = useState(false)

  const [formData, setFormData] = useState<OrderFormData>({
    customer: '',
    contactPerson: '',
    contactPhone: '',
    destination: '',
    requestedDate: new Date().toISOString().split('T')[0],
    priority: 'MEDIUM',
    notes: '',
    products: []
  })

  const createMutation = useMutation({
    mutationFn: createOutboundOrder,
    onSuccess: (data) => {
      toast.success('Tạo đơn xuất hàng thành công!', {
        description: `Mã đơn hàng: ${data.orderNo}`
      })
      navigate(`/outbound/${data.id}`)
    },
    onError: () => {
      toast.error('Không thể tạo đơn hàng', {
        description: 'Vui lòng thử lại sau'
      })
    }
  })

  const filteredProducts = searchProduct
    ? PRODUCT_CATALOG.filter(p =>
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.nameVi?.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchProduct.toLowerCase())
      )
    : PRODUCT_CATALOG // Show all products when search is empty

  const filteredCustomers = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(searchCustomer.toLowerCase())
  )

  const addProduct = (product: Product) => {
    const exists = formData.products.find(p => p.id === product.id)
    if (exists) {
      toast.warning('Sản phẩm đã có trong đơn hàng')
      return
    }
    setFormData({
      ...formData,
      products: [...formData.products, { ...product, quantity: 1 }]
    })
    setSearchProduct('')
    setShowProductCatalog(false)
    toast.success(`Đã thêm ${product.name}`)
  }

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setFormData({
      ...formData,
      products: formData.products.map(p =>
        p.id === productId ? { ...p, quantity } : p
      )
    })
  }

  const removeProduct = (productId: string) => {
    setFormData({
      ...formData,
      products: formData.products.filter(p => p.id !== productId)
    })
    toast.info('Đã xóa sản phẩm khỏi đơn hàng')
  }

  const selectCustomer = (customer: typeof CUSTOMERS[0]) => {
    setFormData({
      ...formData,
      customer: customer.name,
      contactPerson: customer.contact,
      contactPhone: customer.phone,
      destination: customer.address
    })
    setSearchCustomer('')
    setShowCustomerList(false)
    toast.success(`Đã chọn khách hàng: ${customer.name}`)
  }

  const calculateTotals = () => {
    const totalQty = formData.products.reduce((sum, p) => sum + p.quantity, 0)
    const totalWeight = formData.products.reduce((sum, p) => sum + (p.quantity * p.weight), 0)
    return { totalQty, totalWeight: totalWeight.toFixed(2) }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.customer.trim()) {
      toast.error('Vui lòng nhập tên khách hàng')
      return
    }
    if (!formData.contactPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }
    if (!formData.destination.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng')
      return
    }
    if (formData.products.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 sản phẩm')
      return
    }

    createMutation.mutate(formData)
  }

  const totals = calculateTotals()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/outbound')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tạo đơn xuất hàng mới
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Điền thông tin đơn hàng và chọn sản phẩm
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/outbound')}
            >
              Hủy
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Tạo đơn hàng
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên khách hàng *
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Nhập hoặc tìm kiếm khách hàng..."
                      value={searchCustomer || formData.customer}
                      onChange={(e) => {
                        setSearchCustomer(e.target.value)
                        setFormData({ ...formData, customer: e.target.value })
                        setShowCustomerList(true)
                      }}
                      onFocus={() => setShowCustomerList(true)}
                      required
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {showCustomerList && searchCustomer && filteredCustomers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredCustomers.map((customer) => (
                        <button
                          key={customer.name}
                          type="button"
                          onClick={() => selectCustomer(customer)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b dark:border-gray-700 last:border-0"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{customer.contact} - {customer.phone}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Người liên hệ
                    </label>
                    <Input
                      placeholder="Nguyễn Văn A"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Số điện thoại *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="0901234567"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Địa chỉ giao hàng *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      placeholder="Nhập địa chỉ đầy đủ..."
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                      rows={2}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Thông tin đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ngày yêu cầu *
                    </label>
                    <Input
                      type="date"
                      value={formData.requestedDate}
                      onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mức độ ưu tiên
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' })}
                      className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="LOW">Thấp</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="HIGH">Cao</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ghi chú đơn hàng
                  </label>
                  <textarea
                    placeholder="Nhập ghi chú, yêu cầu đặc biệt..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  Danh sách sản phẩm ({formData.products.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Add Product */}
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Tìm kiếm sản phẩm theo tên hoặc SKU..."
                        value={searchProduct}
                        onChange={(e) => {
                          setSearchProduct(e.target.value)
                          setShowProductCatalog(true)
                        }}
                        onFocus={() => setShowProductCatalog(true)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSearchProduct('')
                        setShowProductCatalog(!showProductCatalog)
                      }}
                      className="whitespace-nowrap"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {showProductCatalog ? 'Ẩn' : 'Xem tất cả'}
                    </Button>
                  </div>
                  {showProductCatalog && filteredProducts.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-lg shadow-2xl max-h-96 overflow-auto">
                      <div className="sticky top-0 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 border-b border-blue-200 dark:border-blue-700 flex items-center justify-between">
                        <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          📦 Danh sách sản phẩm ({filteredProducts.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowProductCatalog(false)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          ✕
                        </button>
                      </div>
                      {filteredProducts.map((product) => {
                        const isAdded = formData.products.find(p => p.id === product.id)
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => addProduct(product)}
                            disabled={!!isAdded}
                            className={`w-full text-left px-4 py-3 transition-colors border-b dark:border-gray-700 last:border-0 ${
                              isAdded
                                ? 'bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-60'
                                : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                                    {product.nameVi || product.name}
                                  </p>
                                  {isAdded && (
                                    <Badge className="bg-green-500 text-white flex-shrink-0">
                                      ✓ Đã thêm
                                    </Badge>
                                  )}
                                  {!isAdded && product.stockLevel !== undefined && (
                                    <Badge className={`flex-shrink-0 ${
                                      product.stockLevel > 100 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                      product.stockLevel > 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                      product.stockLevel > 0 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                      Tồn: {product.stockLevel} {product.unit}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                  <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                    {product.sku}
                                  </span>
                                  <span>•</span>
                                  <span className="text-blue-600 dark:text-blue-400">{product.temperature}</span>
                                  <span>•</span>
                                  <span className="text-purple-600 dark:text-purple-400">{product.location}</span>
                                  <span>•</span>
                                  <span className="text-gray-500">{product.weight} kg/{product.unit}</span>
                                </div>
                              </div>
                              {!isAdded && (
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center">
                                  <Plus className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {showProductCatalog && filteredProducts.length === 0 && searchProduct && (
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 text-center">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Không tìm thấy sản phẩm "{searchProduct}"
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Thử tìm với từ khóa khác hoặc mã SKU
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSearchProduct('')
                          setShowProductCatalog(true)
                        }}
                        className="mt-3"
                      >
                        Xem tất cả sản phẩm
                      </Button>
                    </div>
                  )}
                </div>

                {/* Product List */}
                {formData.products.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Chưa có sản phẩm nào. Tìm kiếm và thêm sản phẩm vào đơn hàng.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.products.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {product.sku} • {product.temperature} • {product.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateProductQuantity(product.id, product.quantity - 1)}
                            className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            disabled={product.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => updateProductQuantity(product.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => updateProductQuantity(product.id, product.quantity + 1)}
                            className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            +
                          </button>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-16">
                            {(product.quantity * product.weight).toFixed(1)} kg
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:sticky lg:top-6 lg:self-start space-y-6">
            {/* Order Summary */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <CardTitle className="flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-blue-600" />
                  Tổng quan đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Tổng sản phẩm</span>
                    <span className="text-2xl font-bold text-blue-600">{totals.totalQty}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Tổng trọng lượng</span>
                    <span className="text-2xl font-bold text-green-600">{totals.totalWeight} kg</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Loại sản phẩm</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {formData.products.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Mức độ ưu tiên</span>
                    <Badge className={
                      formData.priority === 'HIGH' ? 'bg-red-500 text-white' :
                      formData.priority === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                    }>
                      {formData.priority === 'HIGH' ? 'Cao' :
                       formData.priority === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
                    </Badge>
                  </div>
                </div>

                {formData.products.length > 0 && (
                  <div className="pt-4 border-t dark:border-gray-700">
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Vui lòng kiểm tra kỹ thông tin trước khi tạo đơn hàng
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">💡 Hướng dẫn</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Nhập hoặc tìm kiếm khách hàng từ danh sách có sẵn</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Tìm và thêm sản phẩm vào đơn hàng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>Điều chỉnh số lượng từng sản phẩm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>Kiểm tra tổng quan và tạo đơn hàng</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
