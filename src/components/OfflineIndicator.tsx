import { useOnlineStatus } from '@/hooks'
import { WifiOff, Wifi } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Offline Indicator Component
 * Shows connection status to user
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const [show, setShow] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShow(true)
      setWasOffline(true)
    } else if (wasOffline) {
      // Show "back online" message briefly
      setTimeout(() => setShow(false), 3000)
      setWasOffline(false)
    }
  }, [isOnline, wasOffline])

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          isOnline
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
            : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
        }`}
      >
        {isOnline ? (
          <>
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full blur-md opacity-50 animate-pulse" />
              <Wifi className="w-6 h-6 relative z-10" />
            </div>
            <div>
              <p className="font-bold">Đã kết nối lại!</p>
              <p className="text-sm opacity-90">Bạn đã trở lại online</p>
            </div>
          </>
        ) : (
          <>
            <WifiOff className="w-6 h-6 animate-pulse" />
            <div>
              <p className="font-bold">Mất kết nối</p>
              <p className="text-sm opacity-90">Kiểm tra kết nối internet của bạn</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
