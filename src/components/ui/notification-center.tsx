/**
 * 🔔 Advanced Notification Center - Trung tâm thông báo thông minh
 * Real-time notifications, Priority system, Action buttons
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  X,
  Check,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Filter,
  Search,
  MoreVertical,
  Archive,
  Trash2,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Button } from './button'
import { Badge } from './badge'
import { Input } from './input'
import { Card } from './card'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive' | 'outline'
  }>
  metadata?: {
    orderId?: string
    productId?: string
    userId?: string
  }
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'priority'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)

  // Generate mock notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'error',
        title: 'Cảnh báo tồn kho thấp',
        message: 'Phi lê cá hồi Na Uy sắp hết hàng (còn 15 đơn vị)',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isRead: false,
        priority: 'critical',
        actions: [
          {
            label: 'Tạo đơn hàng',
            onClick: () => toast.success('Đang tạo đơn đặt hàng...'),
            variant: 'default'
          },
          {
            label: 'Xem sản phẩm',
            onClick: () => toast.info('Đang mở sản phẩm...'),
            variant: 'outline'
          }
        ],
        metadata: { productId: 'FISH-SAL-001' }
      },
      {
        id: '2',
        type: 'warning',
        title: 'Cảnh báo nhiệt độ',
        message: 'Nhiệt độ khu vực A đang tăng cao vượt ngưỡng (8°C)',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        isRead: false,
        priority: 'high',
        actions: [
          {
            label: 'Kiểm tra ngay',
            onClick: () => toast.info('Đang mở giám sát nhiệt độ...'),
            variant: 'default'
          }
        ]
      },
      {
        id: '3',
        type: 'success',
        title: 'Hoàn thành đơn hàng',
        message: 'Đơn xuất kho #OB-2025-145 đã được giao thành công',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isRead: true,
        priority: 'medium',
        metadata: { orderId: 'OB-2025-145' }
      },
      {
        id: '4',
        type: 'info',
        title: 'Cập nhật hệ thống',
        message: 'Các tính năng mới có sẵn trong phân tích bảng điều khiển',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isRead: true,
        priority: 'low'
      },
      {
        id: '5',
        type: 'warning',
        title: 'Cảnh báo hết hạn',
        message: '5 sản phẩm sẽ hết hạn trong 3 ngày tới',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        isRead: false,
        priority: 'high',
        actions: [
          {
            label: 'Xem danh sách',
            onClick: () => toast.info('Đang mở danh sách hết hạn...'),
            variant: 'default'
          }
        ]
      }
    ]
    setNotifications(mockNotifications)
  }, [])

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newNotif: Notification = {
          id: Date.now().toString(),
          type: ['success', 'warning', 'error', 'info'][Math.floor(Math.random() * 4)] as any,
          title: 'Phát hiện hoạt động mới',
          message: 'Có điều gì đó đã xảy ra trong kho của bạn',
          timestamp: new Date(),
          isRead: false,
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any
        }
        setNotifications(prev => [newNotif, ...prev].slice(0, 20))
        
        if (isSoundEnabled) {
          // Play notification sound
          toast.info(newNotif.title, {
            description: newNotif.message,
            duration: 4000
          })
        }
      }
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [isSoundEnabled])

  const unreadCount = notifications.filter(n => !n.isRead).length
  const priorityCount = notifications.filter(n => n.priority === 'critical' || n.priority === 'high').length

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.isRead) return false
    if (filter === 'priority' && n.priority !== 'critical' && n.priority !== 'high') return false
    if (searchTerm && !n.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !n.message.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    toast.success('Đã đánh dấu tất cả là đã đọc')
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast.success('Đã xóa thông báo')
  }

  const clearAll = () => {
    setNotifications([])
    toast.success('Đã xóa tất cả thông báo')
  }

  return (
    <>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-screen w-full sm:w-[480px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Thông báo
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {unreadCount} chưa đọc, {priorityCount} ưu tiên
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                    >
                      {isSoundEnabled ? (
                        <Volume2 className="w-5 h-5" />
                      ) : (
                        <VolumeX className="w-5 h-5" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm thông báo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    Tất cả ({notifications.length})
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('unread')}
                  >
                    Chưa đọc ({unreadCount})
                  </Button>
                  <Button
                    variant={filter === 'priority' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('priority')}
                  >
                    Ưu tiên ({priorityCount})
                  </Button>
                </div>
              </div>

              {/* Actions Bar */}
              {notifications.length > 0 && (
                <div className="px-6 py-3 border-b dark:border-gray-800 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Đánh dấu đã đọc
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa tất cả
                  </Button>
                </div>
              )}

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Bell className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Không có thông báo
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Bạn đã xem hết rồi! Quay lại sau để nhận cập nhật mới.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y dark:divide-gray-800">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  const [showActions, setShowActions] = useState(false)

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
      case 'medium':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
      case 'low':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getPriorityText = () => {
    switch (notification.priority) {
      case 'critical':
        return 'KHẨN CẤP'
      case 'high':
        return 'CAO'
      case 'medium':
        return 'TRUNG BÌNH'
      case 'low':
        return 'THẤP'
    }
  }

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds} giây trước`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} phút trước`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} giờ trước`
    return `${Math.floor(hours / 24)} ngày trước`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
        !notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {notification.title}
              </h4>
              {!notification.isRead && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-6 w-6 p-0"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 mb-2">
            <Badge className={`text-xs ${getPriorityColor()}`}>
              {getPriorityText()}
            </Badge>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(notification.timestamp)}
            </span>
          </div>

          {/* Action Buttons */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {notification.actions.map((action, idx) => (
                <Button
                  key={idx}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2 mt-2 pt-2 border-t dark:border-gray-700"
              >
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkRead(notification.id)}
                    className="text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Đánh dấu đã đọc
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  <Archive className="w-3 h-3 mr-1" />
                  Lưu trữ
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(notification.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Xóa
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
