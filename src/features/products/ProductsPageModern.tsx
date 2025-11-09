import React, { useState, useMemo } from 'react'
import { Search, Grid, List, ShoppingCart, Eye, Package, Thermometer, Star, Award, MapPin } from 'lucide-react'
import { useProductStore } from '../../stores/productStore'

export const ProductsPageModern = () => {
  const { products, isLoading } = useProductStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'grade'>('name')
  const [tempFilter, setTempFilter] = useState<'all' | 'FROZEN' | 'CHILL' | 'AMBIENT' | 'DRY'>('all')

  // Lấy danh sách categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)))
    return ['all', ...cats]
  }, [products])

  // Lọc và sắp xếp sản phẩm
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.nameVi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.origin.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesTemp = tempFilter === 'all' || product.tempClass === tempFilter
      return matchesSearch && matchesCategory && matchesTemp
    })

    // Sắp xếp
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price':
          return b.price - a.price
        case 'stock':
          return b.stockLevel - a.stockLevel
        case 'grade':
          return (b.qualityGrade || 'C').localeCompare(a.qualityGrade || 'C')
        default:
          return 0
      }
    })

    return filtered
  }, [products, searchTerm, selectedCategory, tempFilter, sortBy])

  const getTempColor = (tempClass: string) => {
    switch (tempClass) {
      case 'FROZEN': return 'bg-blue-500'
      case 'CHILL': return 'bg-cyan-500' 
      case 'AMBIENT': return 'bg-green-500'
      case 'DRY': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-green-600 bg-green-100'
      case 'A': return 'text-blue-600 bg-blue-100'
      case 'B+': return 'text-yellow-600 bg-yellow-100'
      case 'B': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' VNĐ'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản Lý Sản Phẩm ĐBSCL</h1>
              <p className="text-gray-600 mt-1">Hệ thống quản lý nông sản Đồng bằng sông Cửu Long</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                {filteredProducts.length} sản phẩm
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Tất cả danh mục' : cat}
                </option>
              ))}
            </select>

            {/* Temperature */}
            <select
              value={tempFilter}
              onChange={(e) => setTempFilter(e.target.value as 'all' | 'FROZEN' | 'CHILL' | 'AMBIENT' | 'DRY')}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả nhiệt độ</option>
              <option value="FROZEN">Đông lạnh (-18°C)</option>
              <option value="CHILL">Mát (0-8°C)</option>
              <option value="AMBIENT">Thường (15-25°C)</option>
              <option value="DRY">Khô (20-30°C)</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'stock' | 'grade')}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="price">Sắp xếp theo giá</option>
              <option value="stock">Sắp xếp theo tồn kho</option>
              <option value="grade">Sắp xếp theo chất lượng</option>
            </select>
          </div>
        </div>

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex space-x-2">
                    <div className={`${getTempColor(product.tempClass)} text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center`}>
                      <Thermometer size={12} className="mr-1" />
                      {product.tempClass}
                    </div>
                    {product.qualityGrade && (
                      <div className={`${getGradeColor(product.qualityGrade)} px-2 py-1 rounded-full text-xs font-semibold flex items-center`}>
                        <Award size={12} className="mr-1" />
                        {product.qualityGrade}
                      </div>
                    )}
                  </div>
                  {product.isPopular && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                      <Star size={12} className="mr-1" />
                      HOT
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{product.nameVi || product.name}</h3>
                    <p className="text-sm text-gray-500">{product.name}</p>
                  </div>

                  {/* Origin & Farm */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin size={14} className="mr-1" />
                    <span>{product.origin}</span>
                    {product.farm && (
                      <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                        {product.farm.name}
                      </span>
                    )}
                  </div>

                  {/* Price & Stock */}
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</div>
                      <div className="text-sm text-gray-500">/{product.unit}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{product.stockLevel.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">còn lại</div>
                    </div>
                  </div>

                  {/* Certifications */}
                  {product.certifications && product.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.certifications.slice(0, 2).map(cert => (
                        <span key={cert} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {cert}
                        </span>
                      ))}
                      {product.certifications.length > 2 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          +{product.certifications.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                      <ShoppingCart size={16} className="mr-2" />
                      Đặt hàng
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Sản phẩm</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Danh mục</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Giá</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Tồn kho</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Nhiệt độ</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Chất lượng</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover mr-4"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">{product.nameVi || product.name}</div>
                            <div className="text-sm text-gray-500">{product.origin}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{product.category}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-blue-600">{formatPrice(product.price)}</div>
                        <div className="text-sm text-gray-500">/{product.unit}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <Package size={16} className="mr-2 text-gray-400" />
                          <span className="font-semibold">{product.stockLevel.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className={`${getTempColor(product.tempClass)} text-white px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center`}>
                          <Thermometer size={12} className="mr-1" />
                          {product.tempClass}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {product.qualityGrade && (
                          <div className={`${getGradeColor(product.qualityGrade)} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center`}>
                            <Award size={12} className="mr-1" />
                            {product.qualityGrade}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
                            Đặt hàng
                          </button>
                          <button className="bg-gray-100 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-200 transition-colors">
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-600">
              Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}