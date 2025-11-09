import { useState } from 'react'
import { useProductStore } from '@/stores/productStore'
import { MEKONG_DELTA_CONFIG } from '@/lib/mekong-delta-config'
import { 
  Filter, X, RotateCcw, TrendingUp, Calendar, 
  MapPin, Package, Thermometer, Shield, Star, Eye,
  ChevronDown, ChevronUp, Sliders
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface AdvancedFiltersProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function AdvancedFilters({ isOpen, onClose, className }: AdvancedFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basic', 'location', 'quality'])
  )
  
  const {
    filters,
    setFilter,
    resetFilters,
    getProductStats,
    products
  } = useProductStore()
  
  const stats = getProductStats()
  
  // Get unique values for dropdowns
  const categories = Array.from(new Set((products || []).map(p => p.category))).sort()
  const provinces = MEKONG_DELTA_CONFIG.provinces
  const seasons = MEKONG_DELTA_CONFIG.climate.seasons
  
  // Calculate price range
  const prices = (products || []).map(p => p.price).filter(p => p > 0)
  const minPrice = Math.min(...prices, 0)
  const maxPrice = Math.max(...prices, 1000000)
  
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }
  
  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search' || key === 'currentPage' || key === 'viewMode' || 
          key === 'pageSize' || key === 'sortBy' || key === 'sortOrder') {
        return false
      }
      if (Array.isArray(value)) {
        return value.some(v => v !== 0 && v !== maxPrice)
      }
      return value !== 'all' && value !== ''
    }).length
  }
  
  const filterSections = [
    {
      id: 'basic',
      title: 'Cơ bản',
      icon: <Package className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Package className="w-4 h-4" />
              Danh mục sản phẩm
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value)}
              className="w-full h-10 px-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category} ({stats.categories[category] || 0})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Thermometer className="w-4 h-4" />
              Nhiệt độ bảo quản
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'FROZEN', label: '🧊 Đông lạnh', color: 'bg-blue-100 text-blue-800' },
                { value: 'CHILL', label: '❄️ Mát', color: 'bg-cyan-100 text-cyan-800' },
                { value: 'DRY', label: '📦 Khô', color: 'bg-gray-100 text-gray-800' },
                { value: 'AMBIENT', label: '🌡️ Thường', color: 'bg-green-100 text-green-800' }
              ].map((temp) => (
                <button
                  key={temp.value}
                  onClick={() => setFilter('tempClass', 
                    filters.tempClass === temp.value ? 'all' : temp.value
                  )}
                  className={cn(
                    "p-2 rounded-lg border text-sm font-medium transition-all",
                    filters.tempClass === temp.value
                      ? `${temp.color} border-current`
                      : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  )}
                >
                  {temp.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <TrendingUp className="w-4 h-4" />
              Trạng thái tồn kho
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'in_stock', label: '✅ Còn hàng', count: stats.total - stats.lowStock },
                { value: 'low_stock', label: '⚠️ Sắp hết', count: stats.lowStock },
                { value: 'out_of_stock', label: '❌ Hết hàng', count: 0 }
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilter('stockStatus', 
                    filters.stockStatus === status.value ? 'all' : status.value
                  )}
                  className={cn(
                    "p-2 rounded-lg border text-sm transition-all text-left",
                    filters.stockStatus === status.value
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="font-medium">{status.label}</div>
                  <div className="text-xs text-gray-500">{status.count} sản phẩm</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'location',
      title: 'Địa lý & Xuất xứ',
      icon: <MapPin className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <MapPin className="w-4 h-4" />
              Tỉnh/Thành phố
            </label>
            <select
              value={filters.province}
              onChange={(e) => setFilter('province', e.target.value)}
              className="w-full h-10 px-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <option value="all">Tất cả tỉnh thành</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province} ({stats.provinces[province] || 0})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4" />
              Mùa vụ
            </label>
            <div className="grid grid-cols-1 gap-2">
              {seasons.map((season) => (
                <button
                  key={season}
                  onClick={() => setFilter('season', 
                    filters.season === season ? 'all' : season
                  )}
                  className={cn(
                    "p-2 rounded-lg border text-sm transition-all text-left",
                    filters.season === season
                      ? "bg-green-100 text-green-800 border-green-300"
                      : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  )}
                >
                  🌾 {season}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'quality',
      title: 'Chất lượng & Xác thực',
      icon: <Star className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Star className="w-4 h-4" />
              Cấp độ chất lượng
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'A+', label: '⭐ A+ Cao cấp', color: 'bg-yellow-100 text-yellow-800' },
                { value: 'A', label: '🌟 A Tốt', color: 'bg-blue-100 text-blue-800' },
                { value: 'B', label: '📋 B Trung bình', color: 'bg-gray-100 text-gray-800' },
                { value: 'C', label: '📄 C Cơ bản', color: 'bg-gray-100 text-gray-600' }
              ].map((grade) => (
                <button
                  key={grade.value}
                  onClick={() => setFilter('qualityGrade', 
                    filters.qualityGrade === grade.value ? 'all' : grade.value
                  )}
                  className={cn(
                    "p-2 rounded-lg border text-sm font-medium transition-all",
                    filters.qualityGrade === grade.value
                      ? `${grade.color} border-current`
                      : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  )}
                >
                  {grade.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Shield className="w-4 h-4" />
              Trạng thái Blockchain
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setFilter('blockchainStatus', 
                  filters.blockchainStatus === 'verified' ? 'all' : 'verified'
                )}
                className={cn(
                  "w-full p-3 rounded-lg border transition-all text-left",
                  filters.blockchainStatus === 'verified'
                    ? "bg-green-100 text-green-800 border-green-300"
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-medium">✅ Đã xác thực</span>
                  </div>
                  <Badge variant="secondary">{stats.blockchainVerified}</Badge>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Sản phẩm đã được xác thực trên blockchain
                </div>
              </button>
              
              <button
                onClick={() => setFilter('blockchainStatus', 
                  filters.blockchainStatus === 'unverified' ? 'all' : 'unverified'
                )}
                className={cn(
                  "w-full p-3 rounded-lg border transition-all text-left",
                  filters.blockchainStatus === 'unverified'
                    ? "bg-orange-100 text-orange-800 border-orange-300"
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">⏳ Chưa xác thực</span>
                  </div>
                  <Badge variant="secondary">{stats.total - stats.blockchainVerified}</Badge>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Sản phẩm chưa được xác thực
                </div>
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'price',
      title: 'Giá cả & Giá trị',
      icon: <Sliders className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-3">
              <Sliders className="w-4 h-4" />
              Khoảng giá
            </label>
            <div className="space-y-3">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilter('priceRange', value as [number, number])}
                max={maxPrice}
                min={minPrice}
                step={1000}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{filters.priceRange[0].toLocaleString('vi-VN')}đ</span>
                <span>{filters.priceRange[1].toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Giá từ"
                  value={filters.priceRange[0]}
                  onChange={(e) => setFilter('priceRange', [
                    parseInt(e.target.value) || 0, 
                    filters.priceRange[1]
                  ])}
                  className="text-sm"
                />
                <Input
                  type="number"
                  placeholder="Giá đến"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilter('priceRange', [
                    filters.priceRange[0], 
                    parseInt(e.target.value) || maxPrice
                  ])}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Giá trung bình:</span>
                <span className="font-medium">{Math.round(stats.averagePrice).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng giá trị kho:</span>
                <span className="font-medium">{(stats.totalValue / 1000000000).toFixed(1)}B đ</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]
  
  if (!isOpen) return null
  
  return (
    <div className={cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm", className)}>
      <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Bộ lọc nâng cao</h2>
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {getActiveFilterCount()} bộ lọc
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Đặt lại
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {filterSections.map((section) => (
            <Card key={section.id} className="border-gray-200 dark:border-gray-700">
              <Collapsible
                open={expandedSections.has(section.id)}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        {section.icon}
                        {section.title}
                      </div>
                      {expandedSections.has(section.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {section.content}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
        
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t px-6 py-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Đặt lại tất cả
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Áp dụng bộ lọc
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}