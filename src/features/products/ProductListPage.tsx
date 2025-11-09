import React, { useState, useMemo } from 'react'
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  Award,
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Leaf,
  LayoutGrid,
  List
} from 'lucide-react'
import { useProductStore } from '../../stores/productStore'
import { ProductNavigation } from '../../components/navigation/ProductNavigation'

export const ProductListPage = () => {
  const { products, isLoading } = useProductStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTempClass, setSelectedTempClass] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'grade' | 'date'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)))
    return ['all', ...cats.sort()]
  }, [products])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.nameVi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesTemp = selectedTempClass === 'all' || product.tempClass === selectedTempClass
      return matchesSearch && matchesCategory && matchesTemp
    })

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'stock':
          comparison = a.stockLevel - b.stockLevel
          break
        case 'grade':
          comparison = (a.qualityGrade || 'C').localeCompare(b.qualityGrade || 'C')
          break
        case 'date':
          comparison = new Date(a.lastRestocked || '').getTime() - new Date(b.lastRestocked || '').getTime()
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [products, searchTerm, selectedCategory, selectedTempClass, sortBy, sortOrder])

  // Statistics
  const stats = useMemo(() => {
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockLevel), 0)
    const lowStock = products.filter(p => p.stockLevel <= p.reorderPoint).length
    const outOfStock = products.filter(p => p.stockLevel === 0).length
    const categories = new Set(products.map(p => p.category)).size
    
    return {
      total: products.length,
      totalValue,
      lowStock,
      outOfStock,
      categories,
      filtered: filteredProducts.length
    }
  }, [products, filteredProducts])

  const getTempIcon = (tempClass: string) => {
    switch (tempClass) {
      case 'FROZEN': return '❄️'
      case 'CHILL': return '🧊'
      case 'AMBIENT': return '🌡️'
      case 'DRY': return '☀️'
      default: return '📦'
    }
  }

  const getTempColor = (tempClass: string) => {
    switch (tempClass) {
      case 'FROZEN': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CHILL': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'AMBIENT': return 'bg-green-100 text-green-800 border-green-200'
      case 'DRY': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'A': return 'bg-green-100 text-green-800 border-green-200'
      case 'B+': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'B': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStockStatus = (product: typeof products[0]) => {
    if (product.stockLevel === 0) return { status: 'Hết hàng', color: 'text-red-600', icon: AlertCircle }
    if (product.stockLevel <= product.reorderPoint) return { status: 'Sắp hết', color: 'text-yellow-600', icon: AlertCircle }
    return { status: 'Đủ hàng', color: 'text-green-600', icon: CheckCircle }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const selectAllProducts = () => {
    setSelectedProducts(
      selectedProducts.length === filteredProducts.length 
        ? [] 
        : filteredProducts.map(p => p.id)
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-4"></div>
                    <div className="h-12 w-12 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ProductNavigation />
      
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center">
                <div className="p-3 bg-white/20 rounded-xl mr-4 backdrop-blur-sm">
                  <Package className="text-white" size={36} />
                </div>
                <div>
                  <div>Danh Sách Sản Phẩm ĐBSCL</div>
                  <p className="text-blue-100 mt-1 text-sm font-normal">
                    Quản lý và theo dõi tất cả sản phẩm nông nghiệp Đồng bằng sông Cửu Long
                  </p>
                </div>
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <a 
                href="/products/create"
                className="flex items-center px-5 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <Plus size={20} className="mr-2" />
                Thêm sản phẩm
              </a>
              <button className="flex items-center px-5 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl font-semibold">
                <Upload size={20} className="mr-2" />
                Import
              </button>
              <button className="flex items-center px-5 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all shadow-lg hover:shadow-xl font-semibold">
                <Download size={20} className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Statistics Cards with Gradients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {/* Total Products */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <Package className="h-10 w-10 opacity-80" />
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                Tổng
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{formatNumber(stats.total)}</p>
            <p className="text-blue-100 text-sm font-medium">Sản phẩm</p>
          </div>

          {/* Total Value */}
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="h-10 w-10 opacity-80" />
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                VND
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{(stats.totalValue / 1000000000).toFixed(3)}B</p>
            <p className="text-green-100 text-sm font-medium">Giá trị tồn kho</p>
          </div>

          {/* Low Stock */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <AlertCircle className="h-10 w-10 opacity-80" />
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                Cảnh báo
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.lowStock}</p>
            <p className="text-amber-100 text-sm font-medium">Sắp hết hàng</p>
          </div>

          {/* Out of Stock */}
          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <TrendingDown className="h-10 w-10 opacity-80" />
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                Nguy cơ
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.outOfStock}</p>
            <p className="text-red-100 text-sm font-medium">Hết hàng</p>
          </div>

          {/* Categories */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <Filter className="h-10 w-10 opacity-80" />
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                Loại
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.categories}</p>
            <p className="text-purple-100 text-sm font-medium">Danh mục</p>
          </div>

          {/* Filtered */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <Eye className="h-10 w-10 opacity-80" />
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                Hiển thị
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.filtered}</p>
            <p className="text-cyan-100 text-sm font-medium">Đang xem</p>
          </div>
        </div>

        {/* Enhanced Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Filter className="mr-2 text-blue-600" size={20} />
              Tìm kiếm & Lọc
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="🔍 Tìm kiếm sản phẩm, SKU, xuất xứ, nông trại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition-all font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? '📦 Tất cả danh mục' : `📦 ${cat}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature Filter */}
            <div className="relative">
              <select
                value={selectedTempClass}
                onChange={(e) => setSelectedTempClass(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition-all font-medium"
              >
                <option value="all">🌡️ Tất cả nhiệt độ</option>
                <option value="FROZEN">❄️ Đông lạnh (-18°C)</option>
                <option value="CHILL">🧊 Mát (0-8°C)</option>
                <option value="AMBIENT">🌡️ Thường (18-25°C)</option>
                <option value="DRY">☀️ Khô (20-30°C)</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'stock' | 'grade' | 'date')}
                className="flex-1 px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition-all font-medium"
              >
                <option value="name">📝 Tên</option>
                <option value="price">💰 Giá</option>
                <option value="stock">📊 Tồn kho</option>
                <option value="grade">⭐ Chất lượng</option>
                <option value="date">📅 Ngày nhập</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-gray-700 bg-white"
                title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 mt-4">
              <div className="flex items-center">
                <CheckCircle className="mr-2 text-blue-600" size={20} />
                <span className="text-blue-800 font-semibold">
                  Đã chọn {selectedProducts.length} sản phẩm
                </span>
              </div>
              <div className="flex space-x-3">
                <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold">
                  <Edit size={16} className="inline mr-2" />
                  Cập nhật hàng loạt
                </button>
                <button className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-semibold">
                  <Trash2 size={16} className="inline mr-2" />
                  Xóa đã chọn
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Grid/List View Toggle */}
        {viewMode === 'grid' ? (
          /* Grid View - Beautiful Product Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product)
              const StatusIcon = stockStatus.icon
              
              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group"
                >
                  {/* Product Image with Overlay */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Checkbox */}
                    <div className="absolute top-3 left-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-5 h-5 rounded border-2 border-white text-blue-600 focus:ring-2 focus:ring-blue-500 bg-white/90 backdrop-blur-sm"
                      />
                    </div>
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 right-3 flex flex-col space-y-2">
                      {product.isPopular && (
                        <div className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold flex items-center shadow-lg backdrop-blur-sm">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Phổ biến
                        </div>
                      )}
                      {product.blockchain?.verified && (
                        <div className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold flex items-center shadow-lg backdrop-blur-sm">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Blockchain
                        </div>
                      )}
                    </div>

                    {/* Bottom Product Name */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg line-clamp-2">{product.nameVi || product.name}</h3>
                      <p className="text-white/80 text-sm">{product.sku}</p>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-5 space-y-4">
                    {/* Price and Stock Status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{formatPrice(product.price)}</div>
                        <div className="text-sm text-gray-500">/{product.unit}</div>
                      </div>
                      <div className={`flex items-center px-3 py-1.5 rounded-lg ${stockStatus.color} bg-opacity-10`}>
                        <StatusIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm font-semibold">{stockStatus.status}</span>
                      </div>
                    </div>

                    {/* Category and Temperature */}
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                        📦 {product.category}
                      </span>
                      <span className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${getTempColor(product.tempClass)}`}>
                        {getTempIcon(product.tempClass)} {product.tempClass}
                      </span>
                    </div>

                    {/* Origin & Farm */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="font-medium">{product.origin}</span>
                      </div>
                      {product.farm && (
                        <div className="flex items-center">
                          <Leaf className="h-4 w-4 mr-2 text-green-500" />
                          <span>{product.farm.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Stock Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-sm">
                        <span className="text-gray-500">Tồn kho:</span>
                        <span className="ml-2 font-bold text-gray-900">{formatNumber(product.stockLevel)}</span>
                      </div>
                      {product.qualityGrade && (
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getGradeColor(product.qualityGrade)}`}>
                          <Award className="h-3 w-3 inline mr-1" />
                          {product.qualityGrade}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-3">
                      <a
                        href={`/products/${product.id}`}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg text-center"
                      >
                        <Edit className="h-4 w-4 inline mr-2" />
                        Chi tiết
                      </a>
                      <button className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List View - Table Format */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={selectAllProducts}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Tồn kho
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Nhiệt độ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Chất lượng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product)
                  const StatusIcon = stockStatus.icon
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.image}
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {product.nameVi || product.name}
                              {product.isPopular && (
                                <Star className="ml-2 h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{product.sku}</div>
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {product.origin}
                              {product.farm && (
                                <span className="ml-2">• {product.farm.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </div>
                        <div className="text-sm text-gray-500">/{product.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatNumber(product.stockLevel)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Tối thiểu: {formatNumber(product.reorderPoint)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTempColor(product.tempClass)}`}>
                          <span className="mr-1">{getTempIcon(product.tempClass)}</span>
                          {product.tempClass}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">{product.tempRange}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.qualityGrade && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getGradeColor(product.qualityGrade)}`}>
                            <Award className="h-3 w-3 mr-1" />
                            {product.qualityGrade}
                          </span>
                        )}
                        {product.blockchain?.verified && (
                          <div className="flex items-center mt-1">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-xs text-green-600">Blockchain</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center text-sm font-medium ${stockStatus.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {stockStatus.status}
                        </span>
                        {product.lastRestocked && (
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(product.lastRestocked).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enhanced Empty State */}
        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
            <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
              <Package className="h-16 w-16 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500 mb-6 text-lg">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả phù hợp
            </p>
            <a 
              href="/products/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <Plus size={20} className="mr-2" />
              Thêm sản phẩm mới
            </a>
          </div>
        )}
      </div>
    </div>
  )
}