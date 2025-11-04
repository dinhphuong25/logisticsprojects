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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-800 dark:from-emerald-200 dark:via-teal-200 dark:to-cyan-200 bg-clip-text text-transparent">
            Sản phẩm
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Quản lý danh mục sản phẩm và thông số kỹ thuật
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 shadow'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 shadow'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                <p className="text-3xl font-bold">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Frozen Items</p>
                <p className="text-3xl font-bold">
                  {products.filter((p) => p.tempClass === 'FROZEN').length}
                </p>
              </div>
              <div className="text-4xl">🧊</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chilled Items</p>
                <p className="text-3xl font-bold">
                  {products.filter((p) => p.tempClass === 'CHILL').length}
                </p>
              </div>
              <div className="text-4xl">❄️</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-3xl font-bold">{categories.length}</p>
              </div>
              <Box className="w-8 h-8 text-teal-500" />
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
