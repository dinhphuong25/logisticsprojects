/**
 * Smart Notification System - Hệ thống thông báo thông minh
 * Tự động phát hiện và ưu tiên thông báo quan trọng
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SmartNotification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info' | 'ai_insight'
  title: string
  message: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  timestamp: Date
  read: boolean
  actionable: boolean
  actions?: Array<{
    label: string
    action: () => void
    primary?: boolean
  }>
  category: 'inventory' | 'temperature' | 'order' | 'quality' | 'ai' | 'system'
  aiGenerated?: boolean
  autoAction?: {
    label: string
    executeAt: Date
    action: () => void
  }
}

interface NotificationState {
  notifications: SmartNotification[]
  unreadCount: number
  preferences: {
    enableAI: boolean
    autoExecute: boolean
    priorityFilter: string[]
    categoryFilter: string[]
  }
  
  // Actions
  addNotification: (notification: Omit<SmartNotification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  dismissNotification: (id: string) => void
  clearAll: () => void
  updatePreferences: (preferences: Partial<NotificationState['preferences']>) => void
  executeAction: (id: string, actionIndex: number) => void
}

export const useSmartNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      preferences: {
        enableAI: true,
        autoExecute: false,
        priorityFilter: ['critical', 'high', 'medium', 'low'],
        categoryFilter: ['inventory', 'temperature', 'order', 'quality', 'ai', 'system']
      },

      addNotification: (notification) => {
        const newNotification: SmartNotification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          read: false
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100), // Keep last 100
          unreadCount: state.unreadCount + 1
        }))

        // Auto-execute if enabled and has auto action
        if (get().preferences.autoExecute && newNotification.autoAction) {
          const delay = newNotification.autoAction.executeAt.getTime() - Date.now()
          if (delay > 0) {
            setTimeout(() => {
              newNotification.autoAction?.action()
              get().markAsRead(newNotification.id)
            }, delay)
          }
        }

        // Play sound for critical notifications
        if (notification.priority === 'critical') {
          playNotificationSound()
        }

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png',
            badge: '/badge.png'
          })
        }
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0
        }))
      },

      dismissNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: state.notifications.find((n) => n.id === id && !n.read)
            ? state.unreadCount - 1
            : state.unreadCount
        }))
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      updatePreferences: (preferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences }
        }))
      },

      executeAction: (id, actionIndex) => {
        const notification = get().notifications.find((n) => n.id === id)
        if (notification && notification.actions && notification.actions[actionIndex]) {
          notification.actions[actionIndex].action()
          get().markAsRead(id)
        }
      }
    }),
    {
      name: 'smart-notifications-storage'
    }
  )
)

// Helper function
function playNotificationSound() {
  const audio = new Audio('/notification.mp3')
  audio.volume = 0.5
  audio.play().catch(() => {
    // Ignore if can't play
  })
}

// Request notification permission
export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

// Smart notification generator
export class SmartNotificationGenerator {
  /**
   * Tạo thông báo thông minh dựa trên context
   */
  static generateInventoryNotification(product: any): SmartNotification | null {
    const stockRatio = product.stockLevel / product.reorderPoint

    if (stockRatio < 0.5) {
      return {
        id: '',
        type: 'warning',
        priority: 'critical',
        title: '🚨 Cảnh báo tồn kho nguy cấp',
        message: `${product.nameVi} còn ${product.stockLevel} ${product.unit}, dưới 50% điểm đặt hàng!`,
        category: 'inventory',
        actionable: true,
        timestamp: new Date(),
        read: false,
        actions: [
          {
            label: 'Đặt hàng ngay',
            action: () => console.log('Create order'),
            primary: true
          },
          {
            label: 'Xem chi tiết',
            action: () => console.log('View details')
          }
        ],
        autoAction: {
          label: 'Tự động đặt hàng sau 1 giờ',
          executeAt: new Date(Date.now() + 3600000),
          action: () => console.log('Auto order')
        },
        aiGenerated: true
      }
    }

    return null
  }

  static generateTemperatureNotification(zone: any): SmartNotification | null {
    if (zone.currentTemp > zone.maxTemp || zone.currentTemp < zone.minTemp) {
      return {
        id: '',
        type: 'error',
        priority: 'critical',
        title: '❄️ Nhiệt độ ngoài ngưỡng!',
        message: `${zone.name}: ${zone.currentTemp}°C (Cho phép: ${zone.minTemp}-${zone.maxTemp}°C)`,
        category: 'temperature',
        actionable: true,
        timestamp: new Date(),
        read: false,
        actions: [
          {
            label: 'Điều chỉnh ngay',
            action: () => console.log('Adjust temp'),
            primary: true
          },
          {
            label: 'Gọi kỹ thuật',
            action: () => console.log('Call technician')
          }
        ],
        aiGenerated: true
      }
    }

    return null
  }

  static generateAIInsightNotification(insight: any): SmartNotification {
    return {
      id: '',
      type: 'ai_insight',
      priority: insight.priority as any,
      title: `🤖 AI Insight: ${insight.title}`,
      message: insight.description,
      category: 'ai',
      actionable: insight.actionable,
      timestamp: new Date(),
      read: false,
      actions: insight.suggestedActions?.map((action: string) => ({
        label: action,
        action: () => console.log(action)
      })),
      aiGenerated: true
    }
  }
}
