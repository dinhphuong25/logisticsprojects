import { useState, useRef, useEffect } from 'react'
import { useProductStore, useUIStore } from '@/stores'
import { useDebounce } from '@/hooks/useDebounce'
import { 
  Search, X, Clock, TrendingUp, Filter, Sparkles, 
  MapPin, Shield, Star, Package
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SearchSuggestion {
  type: 'product' | 'category' | 'province' | 'farm' | 'recent' | 'smart'
  value: string
  label: string
  icon?: React.ReactNode
  count?: number
  trend?: 'up' | 'down' | 'stable'
}

interface SmartSearchProps {
  className?: string
  placeholder?: string
  showFilters?: boolean
  onFiltersToggle?: () => void
}

export function SmartSearch({ 
  className, 
  placeholder = "Tìm kiếm sản phẩm thông minh...",
  showFilters = true,
  onFiltersToggle 
}: SmartSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localQuery, setLocalQuery] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const {
    filters,
    searchSuggestions,
    recentSearches,
    setSearch,
    applySmartFilter,
    setFilter,
    getProductStats
  } = useProductStore()
  
  const { addToSearchHistory } = useUIStore()
  
  // Debounce search to avoid too many API calls
  const debouncedQuery = useDebounce(localQuery, 300)
  
  useEffect(() => {
    setSearch(debouncedQuery)
  }, [debouncedQuery, setSearch])
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Generate smart suggestions
  const generateSmartSuggestions = (): SearchSuggestion[] => {
    const stats = getProductStats()
    const suggestions: SearchSuggestion[] = []
    
    // Recent searches
    recentSearches.slice(0, 3).forEach(search => {
      suggestions.push({
        type: 'recent',
        value: search,
        label: search,
        icon: <Clock className="w-4 h-4 text-gray-400" />
      })
    })
    
    // Smart suggestions based on current context
    if (!localQuery || localQuery.length < 2) {
      // Popular categories
      Object.entries(stats.categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .forEach(([category, count]) => {
          suggestions.push({
            type: 'category',
            value: category,
            label: category,
            icon: <Package className="w-4 h-4 text-blue-500" />,
            count,
            trend: 'up'
          })
        })
      
      // Popular provinces
      Object.entries(stats.provinces)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .forEach(([province, count]) => {
          suggestions.push({
            type: 'province',
            value: province,
            label: `Sản phẩm từ ${province}`,
            icon: <MapPin className="w-4 h-4 text-green-500" />,
            count
          })
        })
      
      // Smart filters
      if (stats.lowStock > 0) {
        suggestions.push({
          type: 'smart',
          value: 'low_stock',
          label: `${stats.lowStock} sản phẩm sắp hết hàng`,
          icon: <TrendingUp className="w-4 h-4 text-orange-500" />
        })
      }
      
      if (stats.blockchainVerified > 0) {
        suggestions.push({
          type: 'smart',
          value: 'blockchain_verified',
          label: `${stats.blockchainVerified} sản phẩm đã xác thực blockchain`,
          icon: <Shield className="w-4 h-4 text-purple-500" />
        })
      }
    } else {
      // Search-based suggestions
      searchSuggestions.forEach(suggestion => {
        suggestions.push({
          type: 'product',
          value: suggestion,
          label: suggestion,
          icon: <Search className="w-4 h-4 text-gray-400" />
        })
      })
    }
    
    return suggestions.slice(0, 8)
  }
  
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'product':
      case 'recent':
        setLocalQuery(suggestion.value)
        setSearch(suggestion.value)
        addToSearchHistory(suggestion.value)
        break
      case 'category':
        setFilter('category', suggestion.value)
        setLocalQuery('')
        break
      case 'province':
        setFilter('province', suggestion.value.replace('Sản phẩm từ ', ''))
        setLocalQuery('')
        break
      case 'smart':
        if (suggestion.value === 'low_stock') {
          setFilter('stockStatus', 'low_stock')
        } else if (suggestion.value === 'blockchain_verified') {
          setFilter('blockchainStatus', 'verified')
        } else {
          applySmartFilter(suggestion.value)
        }
        setLocalQuery('')
        break
    }
    setIsOpen(false)
  }
  
  const handleClear = () => {
    setLocalQuery('')
    setSearch('')
    inputRef.current?.focus()
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'Enter' && localQuery.trim()) {
      // Smart search interpretation
      applySmartFilter(localQuery)
      addToSearchHistory(localQuery)
      setIsOpen(false)
    }
  }
  
  const suggestions = generateSmartSuggestions()
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'search' && key !== 'currentPage' && key !== 'viewMode' && 
    key !== 'pageSize' && key !== 'sortBy' && key !== 'sortOrder' &&
    (Array.isArray(value) ? value.some(v => v !== 0 && v !== 1000000) : value !== 'all')
  )
  
  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-20 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {localQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          {showFilters && (
            <Button
              variant="ghost" 
              size="sm"
              onClick={onFiltersToggle}
              className={cn(
                "h-7 px-2 text-xs gap-1",
                hasActiveFilters 
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Filter className="h-3 w-3" />
              {hasActiveFilters && (
                <Badge variant="secondary" className="h-4 w-4 p-0 text-xs rounded-full">
                  {Object.values(filters).filter(v => 
                    v !== 'all' && v !== '' && !Array.isArray(v)
                  ).length}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* AI-Powered Suggestion Hint */}
      {!isOpen && !localQuery && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Sparkles className="h-3 w-3" />
            <span>AI tìm kiếm thông minh</span>
          </div>
        </div>
      )}
      
      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Gợi ý thông minh
            </div>
            
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                {suggestion.icon}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {suggestion.label}
                    </span>
                    {suggestion.trend === 'up' && (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                  {suggestion.count && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {suggestion.count} sản phẩm
                    </span>
                  )}
                </div>
                
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    suggestion.type === 'recent' && "bg-gray-100 text-gray-600",
                    suggestion.type === 'category' && "bg-blue-100 text-blue-600",
                    suggestion.type === 'province' && "bg-green-100 text-green-600",
                    suggestion.type === 'smart' && "bg-purple-100 text-purple-600",
                    suggestion.type === 'product' && "bg-orange-100 text-orange-600"
                  )}
                >
                  {suggestion.type === 'recent' && 'Gần đây'}
                  {suggestion.type === 'category' && 'Danh mục'}
                  {suggestion.type === 'province' && 'Khu vực'}
                  {suggestion.type === 'smart' && 'Thông minh'}
                  {suggestion.type === 'product' && 'Sản phẩm'}
                </Badge>
              </button>
            ))}
          </div>
          
          {/* Quick Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Thao tác nhanh
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => {
                  setFilter('stockStatus', 'low_stock')
                  setIsOpen(false)
                }}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded-md hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
              >
                <TrendingUp className="h-3 w-3" />
                Sắp hết hàng
              </button>
              <button
                onClick={() => {
                  setFilter('blockchainStatus', 'verified')
                  setIsOpen(false)
                }}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                <Shield className="h-3 w-3" />
                Blockchain
              </button>
              <button
                onClick={() => {
                  setFilter('qualityGrade', 'A+')
                  setIsOpen(false)
                }}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
              >
                <Star className="h-3 w-3" />
                Cao cấp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}