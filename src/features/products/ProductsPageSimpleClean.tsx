import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Grid3x3, List, Eye, Edit, Package, Thermometer, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useProductStore } from '@/stores/productStore'

interface LocalEnhancedProduct {
  id: string
  name: string
  nameVi: string
  description: string
  category: string
  sku: string
  price: number
  stockLevel: number
  reorderPoint: number
  unit: string
  tempClass: 'DRY' | 'CHILL' | 'FROZEN' | 'AMBIENT'
  tempRange: string
  shelfLifeDays: number
  origin: string
  image: string
  isPopular?: boolean
  certifications: string[]
  farm?: {
    name: string
    farmer: string
    province: string
  }
  blockchain?: {
    verified: boolean
  }
  qualityGrade?: string
}

export default function ProductsPageSimpleClean() {
  const navigate = useNavigate()
  const { products } = useProductStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Temperature configuration
  const getTempClassConfig = (tempClass: string) => {
    const configs = {
      DRY: { label: 'Khô', icon: '🌾', color: 'bg-yellow-500 text-white' },
      CHILL: { label: 'Lạnh', icon: '❄️', color: 'bg-blue-500 text-white' },
      FROZEN: { label: 'Đông', icon: '🧊', color: 'bg-indigo-500 text-white' },
      AMBIENT: { label: 'Thường', icon: '🌡️', color: 'bg-green-500 text-white' }
    }
    return configs[tempClass as keyof typeof configs] || configs.AMBIENT
  }

  // Stock status
  const getStockStatus = (product: LocalEnhancedProduct) => {
    const ratio = product.stockLevel / product.reorderPoint
    if (ratio <= 1) {
      return { label: 'Sắp hết', color: 'bg-red-500', textColor: 'text-red-600' }
    } else if (ratio <= 2) {
      return { label: 'Thấp', color: 'bg-yellow-500', textColor: 'text-yellow-600' }
    }
    return { label: 'Đủ', color: 'bg-green-500', textColor: 'text-green-600' }
  }

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products as LocalEnhancedProduct[]

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [products, selectedCategory, searchTerm])

  // Stats
  const stats = useMemo(() => {
    const total = filteredProducts.length
    const blockchainVerified = filteredProducts.filter(p => p.blockchain?.verified).length
    const lowStock = filteredProducts.filter(p => p.stockLevel <= p.reorderPoint).length
    
    return { total, blockchainVerified, lowStock }
  }, [filteredProducts])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Simple Header */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Quản Lý Sản Phẩm Nông Nghiệp ĐBSCL
            </h1>
            <p className="text-gray-600">
              Hệ thống quản lý sản phẩm nông nghiệp Đồng bằng sông Cửu Long
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.total}</p>
              <p className="text-sm text-gray-500">Tổng sản phẩm</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.blockchainVerified}</p>
              <p className="text-sm text-gray-500">Blockchain verified</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
              <p className="text-sm text-gray-500">Sắp hết hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-gray-300"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {['Tất cả', 'Ngũ cốc ĐBSCL', 'Trái cây ĐBSCL', 'Thực phẩm chế biến ĐBSCL'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedCategory(filter === 'Tất cả' ? 'all' : filter)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  (filter === 'Tất cả' && selectedCategory === 'all') || selectedCategory === filter
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          {/* View Controls */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {/* Add Product Button */}
            <Button 
              onClick={() => navigate('/products/create')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const tempConfig = getTempClassConfig(product.tempClass)
            const stockStatus = getStockStatus(product)

            return (
              <Card key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.nameVi}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Temperature Badge */}
                  <div className={`absolute top-2 right-2 ${tempConfig.color} px-2 py-1 rounded text-xs font-medium`}>
                    {tempConfig.icon} {tempConfig.label}
                  </div>
                  
                  {/* Popular Badge */}
                  {product.isPopular && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                      ⭐ Hot
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                    {product.nameVi}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-1">{product.name}</p>

                  {/* Price & SKU */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Giá bán</p>
                      <p className="text-xl font-bold text-emerald-600">
                        {(product.price / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">SKU</p>
                      <p className="text-sm font-mono text-gray-700">
                        {product.sku}
                      </p>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Tồn kho</span>
                      <span className={`text-xs font-medium ${stockStatus.textColor}`}>
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
                      {product.stockLevel} {product.unit}
                    </p>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Thermometer className="w-3 h-3 text-blue-500" />
                        <span className="text-gray-600">Nhiệt độ</span>
                      </div>
                      <p className="font-medium text-gray-900">{product.tempRange}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3 text-green-500" />
                        <span className="text-gray-600">Xuất xứ</span>
                      </div>
                      <p className="font-medium text-gray-900">{product.origin}</p>
                    </div>
                  </div>

                  {/* Certifications */}
                  {product.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.certifications.slice(0, 2).map((cert) => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
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
                      className="px-3"
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
              <Card key={product.id} className="border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Image */}
                    <div className="relative w-32 h-32 bg-gray-100 flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.nameVi}
                        className="w-full h-full object-cover"
                      />
                      {product.isPopular && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                          ⭐ Hot
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {product.nameVi}
                            </h3>
                            <Badge className={tempConfig.color}>
                              {tempConfig.icon} {tempConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{product.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">SKU</p>
                          <p className="font-mono font-medium text-xs">{product.sku}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Giá</p>
                          <p className="font-bold text-emerald-600">{(product.price / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tồn kho</p>
                          <p className={`font-medium ${stockStatus.textColor}`}>
                            {product.stockLevel} {product.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Nhiệt độ</p>
                          <p className="font-medium text-xs">{product.tempRange}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Xuất xứ</p>
                          <p className="font-medium text-xs">{product.origin}</p>
                        </div>
                        <div className="flex items-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Xem
                          </Button>
                          <Button size="sm" variant="outline" className="px-2">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Certifications */}
                      {product.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.certifications.map((cert) => (
                            <Badge key={cert} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-lg font-medium">Không tìm thấy sản phẩm nào</p>
          <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  )
}