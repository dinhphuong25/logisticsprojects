import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  PackageOpen,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Search,
  AlertTriangle,
  Building2,
  Truck,
  Phone,
  Calendar,
  Package,
  Thermometer,
  MapPin,
} from 'lucide-react'
import { getAllProducts, getZoneForProduct, type Product as CatalogProduct } from '@/lib/products-data'

interface Product {
  id: string
  name: string
  nameVi?: string
  sku: string
  expectedQty: number
  unit: string
  temperature: string
  batchNo: string
  expiryDate: string
  zone: string
  stockLevel?: number
}

interface OrderFormData {
  supplier: string
  supplierContact: string
  carrier: string
  carrierContact: string
  trailerNo: string
  driverName: string
  driverPhone: string
  eta: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  notes: string
  products: Product[]
}

// Convert catalog products to inbound products
const convertToCatalogProduct = (catalogProduct: CatalogProduct) => {
  return {
    id: catalogProduct.id,
    name: catalogProduct.nameVi,
    sku: catalogProduct.sku,
    unit: catalogProduct.unit,
    temperature: catalogProduct.tempRange,
    zone: getZoneForProduct(catalogProduct.tempClass),
    stockLevel: catalogProduct.stockLevel
  }
}

// Get product catalog from shared data
const PRODUCT_CATALOG = getAllProducts().map(convertToCatalogProduct)

// Mock suppliers
const SUPPLIERS = [
  { name: 'Fresh Seafood Co.', contact: '+84 912 345 678' },
  { name: 'Global Meat Import', contact: '+84 913 456 789' },
  { name: 'Premium Dairy Corp.', contact: '+84 914 567 890' },
  { name: 'Asia Vegetables Ltd.', contact: '+84 915 678 901' },
  { name: 'Organic Farm Vietnam', contact: '+84 916 789 012' },
]

// Mock carriers
const CARRIERS = [
  { name: 'DHL Express', contact: '1900 2045' },
  { name: 'FedEx Logistics', contact: '1900 3456' },
  { name: 'VN Transport', contact: '1900 4567' },
  { name: 'Fast Shipping Co.', contact: '1900 5678' },
]

// Mock API call
const createInboundOrder = async (data: OrderFormData) => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  const orderNo = `IB-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`
  console.log('Creating inbound order with data:', data)
  return { success: true, orderNo, id: `ib-${Math.floor(Math.random() * 1000)}` }
}

export default function CreateInboundOrderPage() {
  const navigate = useNavigate()
  const [searchProduct, setSearchProduct] = useState('')
  const [searchSupplier, setSearchSupplier] = useState('')
  const [searchCarrier, setSearchCarrier] = useState('')
  const [showProductCatalog, setShowProductCatalog] = useState(false)
  const [showSupplierList, setShowSupplierList] = useState(false)
  const [showCarrierList, setShowCarrierList] = useState(false)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [formData, setFormData] = useState<OrderFormData>({
    supplier: '',
    supplierContact: '',
    carrier: '',
    carrierContact: '',
    trailerNo: '',
    driverName: '',
    driverPhone: '',
    eta: tomorrow.toISOString().split('T')[0],
    priority: 'MEDIUM',
    notes: '',
    products: []
  })

  const createMutation = useMutation({
    mutationFn: createInboundOrder,
    onSuccess: (data) => {
      toast.success('Tạo đơn nhập hàng thành công!', {
        description: `Mã đơn hàng: ${data.orderNo}`
      })
      navigate(`/inbound/${data.id}`)
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
        p.sku.toLowerCase().includes(searchProduct.toLowerCase())
      )
    : PRODUCT_CATALOG // Show all products when search is empty

  const filteredSuppliers = SUPPLIERS.filter(s =>
    s.name.toLowerCase().includes(searchSupplier.toLowerCase())
  )

  const filteredCarriers = CARRIERS.filter(c =>
    c.name.toLowerCase().includes(searchCarrier.toLowerCase())
  )

  const generateBatchNo = () => {
    const date = new Date()
    return `BATCH-${date.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`
  }

  const generateExpiryDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 6) // 6 months from now
    return date.toISOString().split('T')[0]
  }

  const addProduct = (product: typeof PRODUCT_CATALOG[0]) => {
    const exists = formData.products.find(p => p.id === product.id)
    if (exists) {
      toast.warning('Sản phẩm đã có trong đơn hàng')
      return
    }

    const newProduct: Product = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      temperature: product.temperature,
      zone: product.zone,
      expectedQty: 500,
      batchNo: generateBatchNo(),
      expiryDate: generateExpiryDate(),
      stockLevel: product.stockLevel
    }

    setFormData({
      ...formData,
      products: [...formData.products, newProduct]
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
        p.id === productId ? { ...p, expectedQty: quantity } : p
      )
    })
  }

  const updateProductField = (productId: string, field: keyof Product, value: string) => {
    setFormData({
      ...formData,
      products: formData.products.map(p =>
        p.id === productId ? { ...p, [field]: value } : p
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

  const selectSupplier = (supplier: typeof SUPPLIERS[0]) => {
    setFormData({
      ...formData,
      supplier: supplier.name,
      supplierContact: supplier.contact
    })
    setSearchSupplier('')
    setShowSupplierList(false)
    toast.success(`Đã chọn nhà cung cấp: ${supplier.name}`)
  }

  const selectCarrier = (carrier: typeof CARRIERS[0]) => {
    setFormData({
      ...formData,
      carrier: carrier.name,
      carrierContact: carrier.contact
    })
    setSearchCarrier('')
    setShowCarrierList(false)
    toast.success(`Đã chọn đơn vị vận chuyển: ${carrier.name}`)
  }

  const calculateTotals = () => {
    const totalQty = formData.products.reduce((sum, p) => sum + p.expectedQty, 0)
    return { totalQty }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.supplier.trim()) {
      toast.error('Vui lòng chọn nhà cung cấp')
      return
    }
    if (!formData.carrier.trim()) {
      toast.error('Vui lòng chọn đơn vị vận chuyển')
      return
    }
    if (!formData.trailerNo.trim()) {
      toast.error('Vui lòng nhập số xe')
      return
    }
    if (!formData.driverName.trim()) {
      toast.error('Vui lòng nhập tên tài xế')
      return
    }
    if (!formData.driverPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại tài xế')
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
            <Button type="button" variant="outline" onClick={() => navigate('/inbound')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tạo đơn nhập hàng mới
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Điền thông tin nhà cung cấp và sản phẩm dự kiến nhận
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/inbound')}
            >
              Hủy
            </Button>
            <Button 
              type="submit"
              className="bg-green-600 hover:bg-green-700"
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
            {/* Supplier Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Thông tin nhà cung cấp
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên nhà cung cấp *
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Tìm kiếm nhà cung cấp..."
                      value={searchSupplier || formData.supplier}
                      onChange={(e) => {
                        setSearchSupplier(e.target.value)
                        setFormData({ ...formData, supplier: e.target.value })
                        setShowSupplierList(true)
                      }}
                      onFocus={() => setShowSupplierList(true)}
                      required
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {showSupplierList && searchSupplier && filteredSuppliers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredSuppliers.map((supplier) => (
                        <button
                          key={supplier.name}
                          type="button"
                          onClick={() => selectSupplier(supplier)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b dark:border-gray-700 last:border-0"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">{supplier.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{supplier.contact}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Số điện thoại liên hệ *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="+84 912 345 678"
                      value={formData.supplierContact}
                      onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carrier & Transport Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  Thông tin vận chuyển
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Đơn vị vận chuyển *
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Tìm kiếm đơn vị vận chuyển..."
                      value={searchCarrier || formData.carrier}
                      onChange={(e) => {
                        setSearchCarrier(e.target.value)
                        setFormData({ ...formData, carrier: e.target.value })
                        setShowCarrierList(true)
                      }}
                      onFocus={() => setShowCarrierList(true)}
                      required
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {showCarrierList && searchCarrier && filteredCarriers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredCarriers.map((carrier) => (
                        <button
                          key={carrier.name}
                          type="button"
                          onClick={() => selectCarrier(carrier)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b dark:border-gray-700 last:border-0"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">{carrier.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{carrier.contact}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Số xe *
                    </label>
                    <Input
                      placeholder="TRL-3088"
                      value={formData.trailerNo}
                      onChange={(e) => setFormData({ ...formData, trailerNo: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tên tài xế *
                    </label>
                    <Input
                      placeholder="Nguyễn Văn A"
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SĐT tài xế *
                    </label>
                    <Input
                      placeholder="0901234567"
                      value={formData.driverPhone}
                      onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
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
                      Ngày dự kiến đến *
                    </label>
                    <Input
                      type="date"
                      value={formData.eta}
                      onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
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
                    placeholder="Nhập ghi chú, yêu cầu kiểm tra đặc biệt..."
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
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-600" />
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
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-green-500 dark:border-green-400 rounded-lg shadow-2xl max-h-96 overflow-auto">
                      <div className="sticky top-0 bg-green-50 dark:bg-green-900/30 px-4 py-2 border-b border-green-200 dark:border-green-700 flex items-center justify-between">
                        <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                          📦 Danh sách sản phẩm ({filteredProducts.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowProductCatalog(false)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
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
                                : 'hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                                    {product.name}
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
                                  <span className="text-purple-600 dark:text-purple-400">Zone: {product.zone}</span>
                                </div>
                              </div>
                              {!isAdded && (
                                <div className="flex-shrink-0 w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center">
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
                  <div className="space-y-4">
                    {formData.products.map((product, index) => (
                      <div
                        key={product.id}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {product.sku} • <Thermometer className="inline w-3 h-3" /> {product.temperature}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeProduct(product.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Số lượng dự kiến</label>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => updateProductQuantity(product.id, product.expectedQty - 50)}
                                    className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                                    disabled={product.expectedQty <= 50}
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={product.expectedQty}
                                    onChange={(e) => updateProductQuantity(product.id, parseInt(e.target.value) || 1)}
                                    className="w-20 text-center p-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateProductQuantity(product.id, product.expectedQty + 50)}
                                    className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                                  >
                                    +
                                  </button>
                                  <span className="text-xs text-gray-500">{product.unit}</span>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Batch No</label>
                                <Input
                                  value={product.batchNo}
                                  onChange={(e) => updateProductField(product.id, 'batchNo', e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Hạn sử dụng</label>
                                <Input
                                  type="date"
                                  value={product.expiryDate}
                                  onChange={(e) => updateProductField(product.id, 'expiryDate', e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>

                              <div>
                                <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                  <MapPin className="w-3 h-3" /> Zone
                                </label>
                                <Input
                                  value={product.zone}
                                  onChange={(e) => updateProductField(product.id, 'zone', e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
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
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardTitle className="flex items-center gap-2">
                  <PackageOpen className="w-5 h-5 text-green-600" />
                  Tổng quan đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Tổng số lượng</span>
                    <span className="text-2xl font-bold text-green-600">{totals.totalQty}</span>
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
                    <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Vui lòng kiểm tra kỹ thông tin trước khi tạo đơn hàng
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">💡 Hướng dẫn</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">1.</span>
                    <span>Chọn nhà cung cấp từ danh sách có sẵn</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">2.</span>
                    <span>Nhập thông tin vận chuyển và tài xế</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">3.</span>
                    <span>Thêm sản phẩm và điều chỉnh số lượng dự kiến</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">4.</span>
                    <span>Cập nhật Batch No và hạn sử dụng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">5.</span>
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
