import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SmartSearch } from '@/components/ui/smart-search'
import { AdvancedFilters } from '@/components/ui/advanced-filters'
import { useProductStore, type EnhancedProduct } from '@/stores/productStore'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { useUIStore } from '@/stores/uiStore'
import { getCurrentSeason } from '@/lib/mekong-delta-config'
import { blockchainService } from '@/lib/blockchain'
import {
  Package, Plus, Edit, Eye, Grid3x3, List, 
  RefreshCw, Star, MapPin, Thermometer, Clock, 
  CheckCircle, Shield, Sprout, Download, Upload,
  TrendingUp, BarChart3, Zap, Waves, Filter, Settings
} from 'lucide-react'

export function ProductsPageSimple() {
  const navigate = useNavigate()
  
  // Global state
  const {
    filteredProducts,
    selectedProducts,
    filters,
    isLoading,
    isSyncing,
    totalCount,
    setFilter,
    selectProduct,
    selectAll,
    clearSelection,
    refreshProducts,
    syncWithBlockchain,
    getProductStats,
    bulkUpdateProducts
  } = useProductStore()
  
  const { currentWarehouse } = useWarehouseStore()
  const { addNotification, setLoading } = useUIStore()
  
  // UI States
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Initialize products on mount
  useEffect(() => {
    refreshProducts()
  }, [refreshProducts])

  // Get current stats
  const stats = getProductStats()
  const currentSeason = getCurrentSeason()

  // Helper functions
  const getTempClassConfig = (tempClass: string) => {
    const configs = {
      FROZEN: { 
        icon: '🧊', 
        label: 'Đông lạnh', 
        color: 'bg-blue-100 text-blue-800',
        gradient: 'from-blue-500 to-cyan-500'
      },
      CHILL: { 
        icon: '❄️', 
        label: 'Mát', 
        color: 'bg-cyan-100 text-cyan-800',
        gradient: 'from-cyan-500 to-blue-500'
      },
      DRY: { 
        icon: '📦', 
        label: 'Khô', 
        color: 'bg-gray-100 text-gray-800',
        gradient: 'from-gray-500 to-slate-500'
      },
      AMBIENT: { 
        icon: '🌡️', 
        label: 'Thường', 
        color: 'bg-green-100 text-green-800',
        gradient: 'from-green-500 to-emerald-500'
      }
    }
    return configs[tempClass as keyof typeof configs] || configs.DRY
  }

  const getStockStatus = (product: EnhancedProduct) => {
    const ratio = product.stockLevel / product.reorderPoint
    if (ratio <= 0.5) return { label: 'Hết hàng', color: 'bg-red-500', textColor: 'text-red-600' }
    if (ratio <= 1) return { label: 'Sắp hết', color: 'bg-orange-500', textColor: 'text-orange-600' }
    if (ratio <= 2) return { label: 'Còn ít', color: 'bg-yellow-500', textColor: 'text-yellow-600' }
    return { label: 'Đầy đủ', color: 'bg-green-500', textColor: 'text-green-600' }
  }

  // Action handlers
  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Chưa chọn sản phẩm',
        message: 'Vui lòng chọn ít nhất một sản phẩm'
      })
      return
    }

    setLoading(`bulk-${action}`, true)

    try {
      switch (action) {
        case 'blockchain-verify':
          await syncWithBlockchain(selectedProducts)
          break
        case 'export':
          // Export logic here
          break
        case 'update-stock':
          // Bulk stock update logic here
          break
      }
      
      clearSelection()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Lỗi thao tác',
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra'
      })
    } finally {
      setLoading(`bulk-${action}`, false)
    }
  }

  const handleQRScan = async (code: string) => {
    try {
      const verified = await blockchainService.verifyProduct(code)
      if (verified) {
        addNotification({
          type: 'success',
          title: 'QR Code hợp lệ',
          message: `Sản phẩm ${code} đã được xác thực`
        })
      } else {
        addNotification({
          type: 'warning',
          title: 'QR Code không hợp lệ',
          message: 'Không tìm thấy thông tin sản phẩm'
        })
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Lỗi quét QR',
        message: 'Không thể xác thực sản phẩm'
      })
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-green-600 to-blue-800 text-white rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Waves className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                🌾 Sản Phẩm Nông Nghiệp ĐBSCL
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  Smart System
                </Badge>
              </h1>
              <p className="text-blue-100 mt-2 text-lg">
                Quản lý nông sản từ ruộng đến bàn ăn - Blockchain truy xuất nguồn gốc
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">{currentSeason}</div>
              <div className="text-sm text-blue-100">Mùa vụ hiện tại</div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <Package className="w-6 h-6 mx-auto mb-2 text-blue-200" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-blue-100">Tổng SP</div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <Waves className="w-6 h-6 mx-auto mb-2 text-green-200" />
            <div className="text-2xl font-bold">{Object.keys(stats.categories).length}</div>
            <div className="text-xs text-blue-100">Nông sản ĐBSCL</div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <Shield className="w-6 h-6 mx-auto mb-2 text-purple-200" />
            <div className="text-2xl font-bold">{stats.blockchainVerified}</div>
            <div className="text-xs text-blue-100">Blockchain</div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-yellow-200" />
            <div className="text-2xl font-bold">
              {Object.values(stats.categories).reduce((sum, count) => 
                sum + (count > 10 ? 1 : 0), 0)}
            </div>
            <div className="text-xs text-blue-100">Cao cấp A+</div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-emerald-200" />
            <div className="text-2xl font-bold">{(stats.totalValue / 1000000000).toFixed(1)}B</div>
            <div className="text-xs text-blue-100">Giá trị (tỷ)</div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-orange-200" />
            <div className="text-2xl font-bold text-red-300">
              {stats.lowStock}
            </div>
            <div className="text-xs text-blue-100">Sắp hết</div>
          </div>
        </div>
      </div>

      {/* Smart Search & Controls */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <SmartSearch 
                placeholder="Tìm kiếm thông minh với AI... (VD: gạo ST25 Sóc Trăng, blockchain verified, sắp hết hàng)"
                showFilters={true}
                onFiltersToggle={() => setShowAdvancedFilters(true)}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('viewMode', 'grid')}
                  className="h-8 px-3"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('viewMode', 'list')}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <Button
                variant="outline"
                onClick={refreshProducts}
                disabled={isLoading}
                className="h-10 px-4"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Đang tải...' : 'Làm mới'}
              </Button>

              <Button
                onClick={() => navigate('/products/create')}
                className="h-10 px-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm sản phẩm
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {selectedProducts.length} đã chọn
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Bỏ chọn
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAll}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Chọn tất cả
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('blockchain-verify')}
                    disabled={isSyncing}
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    {isSyncing ? 'Đang xác thực...' : 'Xác thực Blockchain'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('export')}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Xuất Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('update-stock')}
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Cập nhật số lượng
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-300 rounded-t-lg"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-gray-500 mb-4">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <Button onClick={() => setShowAdvancedFilters(true)} variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Mở bộ lọc nâng cao
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-6 ${
          filters.viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        }`}>
          {filteredProducts.map((product) => {
            const tempConfig = getTempClassConfig(product.tempClass)
            const stockStatus = getStockStatus(product)
            const isSelected = selectedProducts.includes(product.id)
            
            return (
              <Card
                key={product.id}
                className={`group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-0 overflow-hidden cursor-pointer ${
                  isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'bg-white dark:bg-gray-800'
                }`}
                onClick={() => selectProduct(product.id)}
              >
                {filters.viewMode === 'grid' ? (
                  <>
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
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                          {product.nameVi}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{product.name}</p>
                      </div>

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
                          {product.stockLevel.toLocaleString()} {product.unit} / Tái đặt: {product.reorderPoint.toLocaleString()}
                        </p>
                      </div>

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

                      {/* Enhanced Agricultural Info */}
                      {product.farm && (
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1">
                                <Sprout className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                                  {product.farm?.name}
                                </span>
                              </div>
                              {product.qualityGrade && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs px-1.5 py-0 ${
                                    product.qualityGrade === 'A+' 
                                      ? 'border-yellow-400 text-yellow-600 bg-yellow-50' 
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {product.qualityGrade}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              📍 {product.farm?.province} • 
                              {product.harvest?.season && ` 🌾 ${product.harvest.season}`}
                            </p>
                          </div>

                          {product.blockchain && (
                            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                              <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-blue-600" />
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                  {product.blockchain?.verified ? 'Đã xác thực' : 'Chưa xác thực'}
                                </span>
                              </div>
                              {product.blockchain?.verified && (
                                <div className="text-green-500">
                                  <CheckCircle className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {product.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.certifications.slice(0, 3).map((cert) => (
                            <Badge key={cert} variant="outline" className="text-xs px-2 py-0.5">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/products/${product.id}`)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  // List view
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4">
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
                              {product.stockLevel.toLocaleString()} {product.unit}
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
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/products/${product.id}`)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Xem
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-emerald-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Advanced Filters */}
      <AdvancedFilters 
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
      />
    </div>
  )
}