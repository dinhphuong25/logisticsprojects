import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Edit,
  Package,
  Thermometer,
  Clock,
  Weight,
  Maximize,
  DollarSign,
  MapPin,
  Award,
  TrendingUp,
  Barcode,
  Box,
  Truck,
  FileText,
} from 'lucide-react'
import { useProductStore } from '../../stores/productStore'
import { ProductNavigation } from '../../components/navigation/ProductNavigation'

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { products } = useProductStore()

  // Find product from store
  const product = useMemo(() => {
    return products.find(p => p.id === productId)
  }, [products, productId])

  const isLoading = false // No loading state since we're using store

  // Calculate stats
  const stats = useMemo(() => {
    if (!product) return null

    const stockPercentage = (product.stockLevel / (product.reorderPoint * 3)) * 100
    let stockStatus: 'low' | 'medium' | 'good' = 'good'
    if (product.stockLevel <= product.reorderPoint) {
      stockStatus = 'low'
    } else if (stockPercentage <= 50) {
      stockStatus = 'medium'
    }

    const lastRestocked = product.lastRestocked || new Date().toISOString()
    const daysInStock = Math.floor((Date.now() - new Date(lastRestocked).getTime()) / (1000 * 60 * 60 * 24))
    const totalValue = product.stockLevel * product.price

    return {
      stockStatus,
      stockPercentage: Math.min(stockPercentage, 100),
      daysInStock,
      totalValue,
      lastRestocked
    }
  }, [product])

  const getTempConfig = (tempClass: string) => {
    const configs = {
      FROZEN: { icon: '🧊', label: 'Đông lạnh', color: 'from-purple-400 to-pink-400' },
      CHILL: { icon: '❄️', label: 'Mát', color: 'from-blue-400 to-cyan-400' },
      DRY: { icon: '📦', label: 'Khô', color: 'from-orange-400 to-amber-400' },
    }
    return configs[tempClass as keyof typeof configs] || configs.DRY
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải chi tiết sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Không tìm thấy sản phẩm</p>
        </div>
      </div>
    )
  }

  const tempConfig = getTempConfig(product.tempClass)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ProductNavigation />
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/products')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Chi tiết sản phẩm
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Thông tin đầy đủ về {product.nameVi}
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/products/${productId}/edit`)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          <Edit className="w-4 h-4 mr-2" />
          Chỉnh sửa
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image & Basic Info */}
        <div className="space-y-6">
          {/* Product Image */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="relative aspect-square">
              <img
                src={product.image}
                alt={product.nameVi}
                className="w-full h-full object-cover"
              />
              <div className={`absolute top-4 right-4 bg-gradient-to-r ${tempConfig.color} text-white px-4 py-2 rounded-full font-bold shadow-lg`}>
                {tempConfig.icon} {tempConfig.label}
              </div>
              {product.isPopular && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  ⭐ Hot
                </div>
              )}
            </div>
          </Card>

          {/* Stock Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Trạng thái tồn kho
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Tồn kho hiện tại</span>
                  <Badge className={
                    stats?.stockStatus === 'low' ? 'bg-red-500' :
                    stats?.stockStatus === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }>
                    {stats?.stockStatus === 'low' ? 'Sắp hết' :
                     stats?.stockStatus === 'medium' ? 'Thấp' : 'Đủ'}
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {product.stockLevel.toLocaleString()} {product.unit}
                </p>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      stats?.stockStatus === 'low' ? 'bg-red-500' :
                      stats?.stockStatus === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${stats?.stockPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Điểm đặt hàng lại: {product.reorderPoint} {product.unit}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày nhập gần nhất</p>
                  <p className="font-semibold text-sm">
                    {new Date(stats?.lastRestocked || new Date()).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-xs text-gray-500">
                    ({stats?.daysInStock} ngày trước)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tổng giá trị</p>
                  <p className="font-bold text-sm text-emerald-600">
                    {stats?.totalValue.toLocaleString()} đ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle & Right Columns - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Info */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {product.nameVi}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">{product.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Giá bán</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {product.price.toLocaleString()}đ
                  </p>
                  <p className="text-sm text-gray-500">/{product.unit}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Mô tả sản phẩm
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* SKU & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Barcode className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-500">Mã SKU</span>
                    </div>
                    <p className="font-mono text-xl font-bold text-gray-900 dark:text-white">
                      {product.sku}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Box className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-500">Danh mục</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {product.category}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temperature & Storage */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-blue-600" />
                Điều kiện bảo quản
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                  <Thermometer className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nhiệt độ</p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
                    {product.tempRange}
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                  <Clock className="w-8 h-8 text-amber-600 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hạn sử dụng</p>
                  <p className="text-lg font-bold text-amber-900 dark:text-amber-300">
                    {product.shelfLifeDays} ngày
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4">
                  <Package className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Đơn vị</p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-300">
                    {product.unit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Properties */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center gap-2">
                <Weight className="w-5 h-5 text-purple-600" />
                Thông số vật lý
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6">
                  <Weight className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trọng lượng</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                    {product.weight} kg
                  </p>
                </div>
                <div className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg p-6">
                  <Maximize className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Thể tích</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                    {product.cubic} m³
                  </p>
                </div>
                <div className="text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-6">
                  <DollarSign className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Giá / kg</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                    {Math.round(product.price / product.weight).toLocaleString()}đ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier & Origin */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" />
                Nhà cung cấp & Xuất xứ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-500">Xuất xứ</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {product.origin}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-gray-500">Nông trại</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {product.farm?.name || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              {product.certifications.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold">Chứng nhận</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.certifications.map((cert) => (
                      <Badge
                        key={cert}
                        variant="outline"
                        className="px-4 py-2 text-sm border-2 border-yellow-400 text-yellow-700 dark:text-yellow-400"
                      >
                        <Award className="w-4 h-4 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}
