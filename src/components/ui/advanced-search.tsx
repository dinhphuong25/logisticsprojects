import { useState } from 'react'
import { Search, Filter, X, ChevronDown, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks'

interface FilterOption {
  id: string
  label: string
  value: string
  type: 'select' | 'date' | 'range'
  options?: Array<{ value: string; label: string }>
}

interface AdvancedSearchProps {
  placeholder?: string
  onSearch: (term: string) => void
  filters?: FilterOption[]
  onFilterChange?: (filters: Record<string, string>) => void
}

/**
 * Advanced Search Component with Filters
 * Professional search with debouncing and advanced filters
 */
export function AdvancedSearch({
  placeholder = 'Tìm kiếm...',
  onSearch,
  filters = [],
  onFilterChange,
}: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  // Debounce search for better performance
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Call onSearch when debounced value changes
  useState(() => {
    onSearch(debouncedSearch)
  })

  const handleFilterChange = (filterId: string, value: string) => {
    const newFilters = { ...activeFilters }
    if (value) {
      newFilters[filterId] = value
    } else {
      delete newFilters[filterId]
    }
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearFilter = (filterId: string) => {
    handleFilterChange(filterId, '')
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    onFilterChange?.({})
  }

  const activeFilterCount = Object.keys(activeFilters).length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 h-12 text-base"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {filters.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative h-12 min-w-[120px]"
          >
            <Filter className="w-4 h-4 mr-2" />
            Lọc
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-blue-600 text-white px-2 py-0.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown
              className={`w-4 h-4 ml-2 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}
            />
          </Button>
        )}
      </div>

      {/* Active Filters Pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Đang lọc:</span>
          {Object.entries(activeFilters).map(([filterId, value]) => {
            const filter = filters.find((f) => f.id === filterId)
            const option = filter?.options?.find((o) => o.value === value)
            return (
              <Badge
                key={filterId}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                <span className="font-medium">{filter?.label}:</span>
                <span>{option?.label || value}</span>
                <button
                  onClick={() => clearFilter(filterId)}
                  className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )
          })}
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-slide-in">
          {filters.map((filter) => (
            <div key={filter.id} className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {filter.label}
              </label>
              {filter.type === 'select' && filter.options && (
                <select
                  value={activeFilters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Tất cả</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              {filter.type === 'date' && (
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={activeFilters[filter.id] || ''}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    className="w-full pl-10 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
