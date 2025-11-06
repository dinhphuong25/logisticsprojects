import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  Plus,
  Edit,
  Search,
  Clock,
  Box,
  Grid3x3,
  List,
  Filter,
  X,
  Thermometer,
  AlertCircle,
  RefreshCw,
  Eye,
  Star,
  MapPin,
} from 'lucide-react'
import { getAllProducts, type Product } from '@/lib/products-data'

// Fetch products from shared catalog
const fetchProducts = async (): Promise<Product[]> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return getAllProducts()
}

/**
 * Old mock data removed - now using centralized product catalog from @/lib/products-data
 * This ensures consistency across Inbound, Outbound, and Products modules
 * All products are now managed in a single source of truth
 */

export default function ProductsPageSimple() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [tempFilter, setTempFilter] = useState<string>('all')

  const { data: products = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    refetchInterval: 60000,
  })

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesTemp = tempFilter === 'all' || product.tempClass === tempFilter
      
      return matchesSearch && matchesCategory && matchesTemp
    })
  }, [products, searchTerm, selectedCategory, tempFilter])

  // Calculate stats
  const stats = useMemo(() => {
    const categories = [...new Set(products.map(p => p.category))]
    const lowStock = products.filter(p => p.stockLevel <= p.reorderPoint).length
    
    return {
      total: products.length,
      frozen: products.filter(p => p.tempClass === 'FROZEN').length,
      chilled: products.filter(p => p.tempClass === 'CHILL').length,
      categories: categories.length,
      lowStock,
    }
  }, [products])

  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products])

  const getTempClassConfig = (tempClass: string) => {
    const configs = {
      CHILL: {
        label: 'Mát',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: '❄️',
        gradient: 'from-blue-400 to-cyan-400',
      },
      FROZEN: {
        label: 'Đông lạnh',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        icon: '🧊',
        gradient: 'from-purple-400 to-pink-400',
      },
      DRY: {
        label: 'Khô',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        icon: '📦',
        gradient: 'from-orange-400 to-amber-400',
      },
    }
    return configs[tempClass as keyof typeof configs] || configs.DRY
  }

  const getStockStatus = (product: Product) => {
    const percentage = (product.stockLevel / (product.reorderPoint * 3)) * 100
    if (product.stockLevel <= product.reorderPoint) {
      return { label: 'Sắp hết', color: 'bg-red-500', textColor: 'text-red-600' }
    } else if (percentage <= 50) {
      return { label: 'Thấp', color: 'bg-yellow-500', textColor: 'text-yellow-600' }
    }
    return { label: 'Đủ', color: 'bg-green-500', textColor: 'text-green-600' }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Quản lý sản phẩm
          </h1>
          <p className="text-xs md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
            Danh mục sản phẩm với thông tin chi tiết và hình ảnh
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 shadow-lg scale-105'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Grid3x3 className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 shadow-lg scale-105'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <List className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>

          <Button onClick={() => refetch()} variant="outline" size="sm" className="text-xs md:text-sm">
            <RefreshCw className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>

          <Button 
            onClick={() => navigate('/products/create')}
            size="sm"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xs md:text-sm"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
            <span className="hidden sm:inline">Thêm</span>
            <span className="sm:hidden">+</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardContent className="p-3 md:p-5">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <Package className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Tổng SP</p>
            <p className="text-xl md:text-3xl font-bold text-emerald-600">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-3 md:p-5">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <div className="text-2xl md:text-3xl">🧊</div>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Đông lạnh</p>
            <p className="text-xl md:text-3xl font-bold text-purple-600">{stats.frozen}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-3 md:p-5">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <div className="text-2xl md:text-3xl">❄️</div>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Mát</p>
            <p className="text-xl md:text-3xl font-bold text-blue-600">{stats.chilled}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardContent className="p-3 md:p-5">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <Box className="w-6 h-6 md:w-8 md:h-8 text-amber-600" />
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Danh mục</p>
            <p className="text-xl md:text-3xl font-bold text-amber-600">{stats.categories}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
          <CardContent className="p-3 md:p-5">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Sắp hết</p>
            <p className="text-xl md:text-3xl font-bold text-red-600">{stats.lowStock}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Tìm kiếm theo tên, SKU, danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11"
              />
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-11 px-4"
            >
              <Filter className="w-4 h-4 mr-2" />
              Bộ lọc
              {(selectedCategory !== 'all' || tempFilter !== 'all') && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                  {[selectedCategory !== 'all', tempFilter !== 'all'].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Danh mục</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 px-3 border rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nhiệt độ bảo quản</label>
                <select
                  value={tempFilter}
                  onChange={(e) => setTempFilter(e.target.value)}
                  className="w-full h-10 px-3 border rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="all">Tất cả</option>
                  <option value="FROZEN">🧊 Đông lạnh</option>
                  <option value="CHILL">❄️ Mát</option>
                  <option value="DRY">📦 Khô</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedCategory('all')
                    setTempFilter('all')
                  }}
                  className="h-10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const tempConfig = getTempClassConfig(product.tempClass)
            const stockStatus = getStockStatus(product)
            
            return (
              <Card
                key={product.id}
                className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-0 overflow-hidden bg-white dark:bg-gray-800"
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.nameVi}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className={`absolute top-3 right-3 bg-gradient-to-r ${tempConfig.gradient} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                    {tempConfig.icon} {tempConfig.label}
                  </div>
                  {product.isPopular && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      Hot
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-center gap-2 text-white text-xs">
                      <MapPin className="w-3 h-3" />
                      {product.origin}
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                      {product.nameVi}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{product.name}</p>
                  </div>

                  {/* Price & SKU */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Giá</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {product.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">SKU</p>
                      <p className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                        {product.sku}
                      </p>
                    </div>
                  </div>

                  {/* Stock Level */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Tồn kho</span>
                      <span className={`text-xs font-bold ${stockStatus.textColor}`}>
                        {stockStatus.label}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stockStatus.color} transition-all duration-300`}
                        style={{ width: `${Math.min((product.stockLevel / (product.reorderPoint * 3)) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {product.stockLevel} {product.unit} / Tái đặt: {product.reorderPoint} {product.unit}
                    </p>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                      <Thermometer className="w-3 h-3 text-blue-500 mb-1" />
                      <p className="text-gray-500 dark:text-gray-400">Nhiệt độ</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{product.tempRange}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                      <Clock className="w-3 h-3 text-amber-500 mb-1" />
                      <p className="text-gray-500 dark:text-gray-400">HSD</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{product.shelfLifeDays} ngày</p>
                    </div>
                  </div>

                  {/* Certifications */}
                  {product.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.certifications.slice(0, 3).map((cert) => (
                        <Badge key={cert} variant="outline" className="text-xs px-2 py-0.5">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Chi tiết
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        // List View
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const tempConfig = getTempClassConfig(product.tempClass)
            const stockStatus = getStockStatus(product)

            return (
              <Card
                key={product.id}
                className="hover:shadow-lg transition-all duration-200 border-0 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.nameVi}
                        className="w-full h-full object-cover"
                      />
                      {product.isPopular && (
                        <div className="absolute top-2 left-2 bg-yellow-400 text-white px-2 py-0.5 rounded text-xs font-bold">
                          <Star className="w-3 h-3 inline fill-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 py-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {product.nameVi}
                            </h3>
                            <Badge className={tempConfig.color}>
                              {tempConfig.icon} {tempConfig.label}
                            </Badge>
                            {product.isPopular && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1 fill-yellow-800" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{product.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-8 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">SKU</p>
                          <p className="font-mono font-bold text-xs">{product.sku}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Danh mục</p>
                          <p className="font-semibold">{product.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Giá</p>
                          <p className="font-bold text-emerald-600">{(product.price / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tồn kho</p>
                          <p className={`font-bold ${stockStatus.textColor}`}>
                            {product.stockLevel} {product.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Nhiệt độ</p>
                          <p className="font-semibold text-xs">{product.tempRange}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">HSD</p>
                          <p className="font-semibold">{product.shelfLifeDays}d</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Xuất xứ</p>
                          <p className="font-semibold text-xs">{product.origin}</p>
                        </div>
                        <div className="flex items-end gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Xem
                          </Button>
                          <Button size="sm" variant="outline" className="text-emerald-600">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {filteredProducts.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg font-medium">Không tìm thấy sản phẩm nào</p>
            <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
