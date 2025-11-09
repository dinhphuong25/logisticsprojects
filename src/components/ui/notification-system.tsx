import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useProductStore } from '@/stores/productStore'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { Bell, X, Shield, Package, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface NotificationSystemProps {
  className?: string
}

export function NotificationSystem({ className }: NotificationSystemProps) {
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    removeNotification,
    markAllNotificationsAsRead
  } = useUIStore()
  
  const { getLowStock, getExpiringSoon } = useProductStore()
  const { currentWarehouse } = useWarehouseStore()

  // Auto-check for critical conditions every 30 seconds
  useEffect(() => {
    const checkCriticalConditions = () => {
      const lowStockProducts = getLowStock()
      const expiringSoonProducts = getExpiringSoon()
      
      // Low stock notifications
      if (lowStockProducts.length > 0) {
        const { addNotification } = useUIStore.getState()
        addNotification({
          type: 'warning',
          title: 'Cảnh báo tồn kho thấp',
          message: `${lowStockProducts.length} sản phẩm sắp hết hàng`
        })
      }
      
      // Expiring soon notifications
      if (expiringSoonProducts.length > 0) {
        const { addNotification } = useUIStore.getState()
        addNotification({
          type: 'error',
          title: 'Cảnh báo hết hạn',
          message: `${expiringSoonProducts.length} sản phẩm sắp hết hạn`
        })
      }
    }

    const interval = setInterval(checkCriticalConditions, 30000)
    return () => clearInterval(interval)
  }, [getLowStock, getExpiringSoon])

  // Real-time warehouse sync notifications
  useEffect(() => {
    if (currentWarehouse) {
      const { addNotification } = useUIStore.getState()
      addNotification({
        type: 'info',
        title: 'Kho hoạt động',
        message: `Đã kết nối với kho ${currentWarehouse.name}`
      })
    }
  }, [currentWarehouse?.id])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'warning':
        return <TrendingDown className="w-4 h-4 text-orange-600" />
      case 'info':
        return <Package className="w-4 h-4 text-blue-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
      case 'warning':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className={cn("fixed top-4 right-4 z-50 space-y-2 max-w-sm", className)}>
      {/* Notification Header */}
      {unreadCount > 0 && (
        <Card className="shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">
                  {unreadCount} thông báo mới
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllNotificationsAsRead}
                className="text-xs h-6 px-2"
              >
                Đánh dấu đã đọc
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      {notifications.slice(0, 5).map((notification) => (
        <Card
          key={notification.id}
          className={cn(
            "shadow-lg border-l-4 transition-all duration-300 hover:scale-105",
            getNotificationColor(notification.type),
            !notification.read && "ring-2 ring-blue-200 dark:ring-blue-800"
          )}
          onClick={() => !notification.read && markNotificationAsRead(notification.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {getNotificationIcon(notification.type)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {notification.title}
                  </h4>
                  {!notification.read && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5">
                      Mới
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleString('vi-VN')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeNotification(notification.id)
                    }}
                    className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Show more notifications indicator */}
      {notifications.length > 5 && (
        <Card className="shadow-lg">
          <CardContent className="p-3 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              +{notifications.length - 5} thông báo khác
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Smart notification hooks for different events
export const useSmartNotifications = () => {
  const { addNotification } = useUIStore()

  const notifyLowStock = (productName: string, currentStock: number, reorderPoint: number) => {
    addNotification({
      type: 'warning',
      title: 'Cảnh báo tồn kho',
      message: `${productName} còn ${currentStock} (tái đặt: ${reorderPoint})`
    })
  }

  const notifyBlockchainVerified = (productName: string, traceabilityCode: string) => {
    addNotification({
      type: 'success',
      title: 'Blockchain xác thực',
      message: `${productName} (${traceabilityCode}) đã được xác thực`
    })
  }

  const notifyExpiringSoon = (productName: string, daysLeft: number) => {
    addNotification({
      type: 'error',
      title: 'Sắp hết hạn',
      message: `${productName} sẽ hết hạn trong ${daysLeft} ngày`
    })
  }

  const notifyNewProduct = (productName: string) => {
    addNotification({
      type: 'info',
      title: 'Sản phẩm mới',
      message: `Đã thêm ${productName} vào hệ thống`
    })
  }

  const notifyBulkAction = (action: string, count: number, success: boolean) => {
    addNotification({
      type: success ? 'success' : 'error',
      title: success ? 'Thành công' : 'Lỗi',
      message: `${success ? 'Đã' : 'Không thể'} ${action} ${count} sản phẩm`
    })
  }

  const notifyWeatherAlert = (province: string, condition: string) => {
    addNotification({
      type: 'warning',
      title: 'Cảnh báo thời tiết',
      message: `${condition} tại ${province} - Có thể ảnh hưởng đến vận chuyển`
    })
  }

  const notifyPriceChange = (productName: string, oldPrice: number, newPrice: number) => {
    const isIncrease = newPrice > oldPrice
    addNotification({
      type: isIncrease ? 'info' : 'warning',
      title: 'Thay đổi giá',
      message: `${productName}: ${oldPrice.toLocaleString()}đ → ${newPrice.toLocaleString()}đ`
    })
  }

  return {
    notifyLowStock,
    notifyBlockchainVerified,
    notifyExpiringSoon,
    notifyNewProduct,
    notifyBulkAction,
    notifyWeatherAlert,
    notifyPriceChange
  }
}