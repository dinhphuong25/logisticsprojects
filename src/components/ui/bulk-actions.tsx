import { useState } from 'react'
import { CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface BulkAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: (selectedIds: string[]) => void
  variant?: 'default' | 'destructive' | 'outline'
  confirmMessage?: string
}

interface BulkActionsProps {
  items: Array<{ id: string; [key: string]: unknown }>
  actions: BulkAction[]
  onSelectionChange?: (selectedIds: string[]) => void
}

/**
 * Bulk Actions Component
 * Allow users to perform actions on multiple items at once
 */
export function BulkActions({ items, actions, onSelectionChange }: BulkActionsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const allSelected = items.length > 0 && selectedIds.size === items.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = new Set(items.map(item => item.id))
      setSelectedIds(allIds)
      onSelectionChange?.(Array.from(allIds))
    }
  }

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
    onSelectionChange?.(Array.from(newSelected))
  }

  const handleAction = (action: BulkAction) => {
    if (action.confirmMessage) {
      if (window.confirm(action.confirmMessage)) {
        action.action(Array.from(selectedIds))
        setSelectedIds(new Set())
        onSelectionChange?.([])
      }
    } else {
      action.action(Array.from(selectedIds))
      setSelectedIds(new Set())
      onSelectionChange?.([])
    }
  }

  const isSelected = (id: string) => selectedIds.has(id)

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-10 flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg shadow-lg animate-slide-in">
          <Badge className="bg-blue-600 text-white px-3 py-1.5 text-sm font-semibold">
            {selectedIds.size} đã chọn
          </Badge>
          
          <div className="flex gap-2 flex-1">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={() => handleAction(action)}
                  className="whitespace-nowrap"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {action.label}
                </Button>
              )
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedIds(new Set())
              onSelectionChange?.([])
            }}
          >
            Hủy chọn
          </Button>
        </div>
      )}

      {/* Select All Checkbox */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <button
          onClick={toggleAll}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {allSelected ? (
            <CheckSquare className="w-5 h-5 text-blue-600" />
          ) : someSelected ? (
            <div className="w-5 h-5 border-2 border-blue-600 bg-blue-600 rounded flex items-center justify-center">
              <div className="w-2 h-0.5 bg-white" />
            </div>
          ) : (
            <Square className="w-5 h-5" />
          )}
          <span>
            {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            {someSelected && ` (${selectedIds.size}/${items.length})`}
          </span>
        </button>
      </div>

      {/* Render Prop for Items */}
      <div>
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <button
              onClick={() => toggleItem(item.id)}
              className="flex-shrink-0"
            >
              {isSelected(item.id) ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors" />
              )}
            </button>
            
            {/* Item content goes here - can be customized */}
            <div className="flex-1">
              {/* This is where you would render item details */}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
