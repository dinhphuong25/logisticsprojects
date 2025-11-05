import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Barcode,
  Clock,
  Box,
  Weight,
  Maximize,
  Grid3x3,
  List,
  Filter,
  X,
  Snowflake,
  FolderOpen,
  AlertTriangle,
} from 'lucide-react'

interface Product {
  id: string
  sku: string
  name: string
  nameVi: string
  unit: string
  tempClass: 'CHILL' | 'FROZEN' | 'DRY'
  shelfLifeDays: number
  weight: number
  cubic: number
  category: string
}

export default function ProductManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [tempFilter, setTempFilter] = useState<string>('all')

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiClient.get('/products')
      return response.data
    },
  })

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesTemp = tempFilter === 'all' || product.tempClass === tempFilter
    return matchesSearch && matchesCategory && matchesTemp
  })

  const categories = [...new Set(products.map((p) => p.category))]

  const getTempClassColor = (tempClass: string) => {
    const colors = {
      CHILL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      FROZEN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      DRY: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    }
    return colors[tempClass as keyof typeof colors] || colors.DRY
  }

  const getTempClassIcon = (tempClass: string) => {
    const icons = {
      CHILL: '❄️',
      FROZEN: '🧊',
      DRY: '📦',
    }
    return icons[tempClass as keyof typeof icons] || '📦'
  }

  return (
    <div className="space-y-6">
      {/* Header với Background Gradient - Mobile Optimized */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-emerald-500/5 to-cyan-500/5 rounded-xl sm:rounded-2xl lg:rounded-3xl blur-2xl sm:blur-3xl"></div>
        
        <div className="relative flex flex-col gap-3 sm:gap-4 p-4 sm:p-5 lg:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg sm:shadow-xl">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 rounded-xl sm:rounded-2xl blur-lg sm:blur-xl opacity-60 group-hover:opacity-80 transition-all"></div>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 dark:from-teal-400 dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent leading-tight">
                  Quản lý sản phẩm
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mt-0.5 sm:mt-1 line-clamp-1">
                  Danh mục sản phẩm với thông tin chi tiết và hình ảnh
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 sm:p-2.5 rounded-md sm:rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md sm:shadow-lg'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 sm:p-2.5 rounded-md sm:rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md sm:shadow-lg'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <Button className="flex-1 sm:flex-initial bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all h-9 sm:h-10 lg:h-11 px-3 sm:px-4 lg:px-5 text-sm sm:text-base">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              <span className="font-bold">Thêm sản phẩm</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-4">
        <Card className="group relative border-0 shadow-md sm:shadow-lg bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 hover:shadow-xl sm:hover:shadow-2xl hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 overflow-hidden active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-emerald-500/0 group-hover:from-teal-500/10 group-hover:to-emerald-500/10 transition-all"></div>
          <CardContent className="p-3 sm:p-4 lg:p-5 relative">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md sm:shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all flex-shrink-0">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <Badge className="bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30 font-bold text-[9px] sm:text-xs px-1.5 py-0.5">
                Tất cả
              </Badge>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-400 line-clamp-1">Tổng sản phẩm</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                {products.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative border-0 shadow-md sm:shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 hover:shadow-xl sm:hover:shadow-2xl hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 overflow-hidden active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all"></div>
          <CardContent className="p-3 sm:p-4 lg:p-5 relative">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md sm:shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all flex-shrink-0">
                <Snowflake className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30 font-bold text-[9px] sm:text-xs px-1.5 py-0.5 truncate max-w-[60px] sm:max-w-none">
                🧊
              </Badge>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-400 line-clamp-1">Đông lạnh</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {products.filter((p) => p.tempClass === 'FROZEN').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative border-0 shadow-md sm:shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 hover:shadow-xl sm:hover:shadow-2xl hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 overflow-hidden active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all"></div>
          <CardContent className="p-3 sm:p-4 lg:p-5 relative">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md sm:shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all flex-shrink-0">
                <Snowflake className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 font-bold text-[9px] sm:text-xs px-1.5 py-0.5">
                ❄️
              </Badge>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-400 line-clamp-1">Mát</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {products.filter((p) => p.tempClass === 'CHILL').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative border-0 shadow-md sm:shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 hover:shadow-xl sm:hover:shadow-2xl hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 overflow-hidden active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-amber-500/0 group-hover:from-orange-500/10 group-hover:to-amber-500/10 transition-all"></div>
          <CardContent className="p-3 sm:p-4 lg:p-5 relative">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md sm:shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all flex-shrink-0">
                <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30 font-bold text-[9px] sm:text-xs px-1.5 py-0.5 hidden sm:inline-flex">
                Cat
              </Badge>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-400 line-clamp-1">Danh mục</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                {categories.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative border-0 shadow-md sm:shadow-lg bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 hover:shadow-xl sm:hover:shadow-2xl hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 overflow-hidden active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-rose-500/0 group-hover:from-red-500/10 group-hover:to-rose-500/10 transition-all"></div>
          <CardContent className="p-3 sm:p-4 lg:p-5 relative">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md sm:shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <Badge className="bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30 font-bold animate-pulse text-[9px] sm:text-xs px-1.5 py-0.5">
                ⚠️
              </Badge>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-400 line-clamp-1">Sắp hết</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                0
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Tìm kiếm theo tên sản phẩm hoặc SKU..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-2 hover:border-emerald-500/50 overflow-hidden"
            >
              {/* Card Header với Gradient */}
              <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-6 pb-8">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-5xl filter drop-shadow-lg">{getTempClassIcon(product.tempClass)}</div>
                  <Badge className={getTempClassColor(product.tempClass) + ' font-semibold'}>
                    {product.tempClass}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {product.nameVi}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{product.name}</p>
              </div>

              <CardContent className="p-6 space-y-4 -mt-4">
                {/* SKU Card */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Barcode className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-gray-500">SKU</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {product.sku}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Box className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Danh mục</span>
                    </div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                      {product.category}
                    </p>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Hạn sử dụng</span>
                    </div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                      {product.shelfLifeDays} ngày
                    </p>
                  </div>
                </div>

                {/* Specs */}
                <div className="flex items-center justify-around py-3 border-t border-b">
                  <div className="text-center">
                    <Weight className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-500">Trọng lượng</p>
                    <p className="font-bold text-sm">{product.weight} {product.unit}</p>
                  </div>
                  <div className="h-10 w-px bg-gray-200"></div>
                  <div className="text-center">
                    <Maximize className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-500">Thể tích</p>
                    <p className="font-bold text-sm">{product.cubic} m³</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-400"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="hover:shadow-lg transition-all duration-200 border-l-4"
              style={{ borderLeftColor: product.tempClass === 'FROZEN' ? '#8b5cf6' : product.tempClass === 'CHILL' ? '#3b82f6' : '#f97316' }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">{getTempClassIcon(product.tempClass)}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg">{product.nameVi}</h3>
                        <Badge className={getTempClassColor(product.tempClass) + ' text-xs'}>
                          {product.tempClass}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{product.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">SKU</p>
                      <p className="font-mono font-bold text-sm">{product.sku}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Danh mục</p>
                      <p className="font-semibold text-sm">{product.category}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Hạn SD</p>
                      <p className="font-semibold text-sm">{product.shelfLifeDays} ngày</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Trọng lượng</p>
                      <p className="font-semibold text-sm">{product.weight} {product.unit}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Thể tích</p>
                      <p className="font-semibold text-sm">{product.cubic} m³</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No products found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
