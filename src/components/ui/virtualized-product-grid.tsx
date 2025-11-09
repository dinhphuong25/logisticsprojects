import { useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import { useProductStore, type EnhancedProduct } from '@/stores/productStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Star, MapPin, Thermometer, Clock, CheckCircle, Shield, Sprout } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VirtualizedProductGridProps {
  className?: string
  itemHeight?: number
  itemsPerRow?: number
}

interface ProductItemProps {
  index: number
  style: React.CSSProperties
  data: {
    products: EnhancedProduct[]
    itemsPerRow: number
    onProductClick: (product: EnhancedProduct) => void
    onProductSelect: (productId: string) => void
    selectedProducts: string[]
  }
}

const ProductItem = ({ index, style, data }: ProductItemProps) => {
  const { products, itemsPerRow, onProductClick, onProductSelect, selectedProducts } = data
  const startIndex = index * itemsPerRow
  const rowProducts = products.slice(startIndex, startIndex + itemsPerRow)

  const getTempClassConfig = (tempClass: string) => {
    const configs = {
      FROZEN: { icon: '🧊', label: 'Đông lạnh', color: 'bg-blue-100 text-blue-800', gradient: 'from-blue-500 to-cyan-500' },
      CHILL: { icon: '❄️', label: 'Mát', color: 'bg-cyan-100 text-cyan-800', gradient: 'from-cyan-500 to-blue-500' },
      DRY: { icon: '📦', label: 'Khô', color: 'bg-gray-100 text-gray-800', gradient: 'from-gray-500 to-slate-500' },
      AMBIENT: { icon: '🌡️', label: 'Thường', color: 'bg-green-100 text-green-800', gradient: 'from-green-500 to-emerald-500' }
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

  return (
    <div style={style} className="px-3">
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)` }}>
        {rowProducts.map((product) => {
          const tempConfig = getTempClassConfig(product.tempClass)
          const stockStatus = getStockStatus(product)
          const isSelected = selectedProducts.includes(product.id)

          return (
            <Card
              key={product.id}
              className={cn(
                "group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-0 overflow-hidden cursor-pointer",
                isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'bg-white dark:bg-gray-800'
              )}
              onClick={() => onProductSelect(product.id)}
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.nameVi}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
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
                    {product.stockLevel.toLocaleString()} {product.unit}
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

                {product.certifications && product.certifications.length > 0 && (
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
                      onProductClick(product)
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
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export function VirtualizedProductGrid({ 
  className,
  itemHeight = 420,
  itemsPerRow = 4
}: VirtualizedProductGridProps) {
  const { filteredProducts, selectedProducts, selectProduct } = useProductStore()

  const memoizedData = useMemo(() => ({
    products: filteredProducts,
    itemsPerRow,
    onProductClick: (product: EnhancedProduct) => {
      // Navigate to product detail
      window.location.href = `/products/${product.id}`
    },
    onProductSelect: selectProduct,
    selectedProducts
  }), [filteredProducts, itemsPerRow, selectProduct, selectedProducts])

  const itemCount = Math.ceil(filteredProducts.length / itemsPerRow)

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không có sản phẩm nào để hiển thị</p>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <List
        height={600} // Fixed height for the virtualized container
        itemCount={itemCount}
        itemSize={itemHeight}
        itemData={memoizedData}
        className="virtualized-product-grid"
      >
        {ProductItem}
      </List>
    </div>
  )
}

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const startTime = performance.now()

  const measureRenderTime = (componentName: string) => {
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    if (renderTime > 100) { // Alert if render takes more than 100ms
      console.warn(`🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`)
    } else {
      console.log(`⚡ ${componentName} rendered in ${renderTime.toFixed(2)}ms`)
    }
  }

  return { measureRenderTime }
}

// Memory usage monitor
export const useMemoryMonitor = () => {
  const checkMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usage = {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      }
      
      if (usage.used > 100) { // Alert if using more than 100MB
        console.warn(`🧠 High memory usage: ${usage.used}MB / ${usage.limit}MB`)
      }
      
      return usage
    }
    return null
  }

  return { checkMemoryUsage }
}