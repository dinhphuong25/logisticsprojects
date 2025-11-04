import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check, X, Info, AlertTriangle } from 'lucide-react'

export interface ToastProps {
  id: string
  title?: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose: (id: string) => void
}

const iconMap = {
  success: Check,
  error: X,
  info: Info,
  warning: AlertTriangle,
}

const colorMap = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
}

const iconColorMap = {
  success: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40',
  error: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40',
  info: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40',
  warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40',
}

export function Toast({
  id,
  title,
  message,
  type = 'info',
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isExiting, setIsExiting] = React.useState(false)
  const Icon = iconMap[type]

  const handleClose = React.useCallback(() => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 300)
  }, [id, onClose])

  React.useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, handleClose])

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300',
        colorMap[type],
        isExiting
          ? 'opacity-0 translate-x-full'
          : 'opacity-100 translate-x-0 animate-slide-in-right'
      )}
    >
      {/* Icon */}
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', iconColorMap[type])}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {title && (
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
            {title}
          </p>
        )}
        <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      {/* Progress Bar */}
      {duration && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-b-xl overflow-hidden">
          <div
            className={cn(
              'h-full transition-all ease-linear',
              type === 'success' && 'bg-green-500',
              type === 'error' && 'bg-red-500',
              type === 'info' && 'bg-blue-500',
              type === 'warning' && 'bg-yellow-500'
            )}
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastProps[]
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}
