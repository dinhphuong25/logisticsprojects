import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Topbar />
      
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}
      
      <div className="flex flex-1">
        <Sidebar />
        <main className={cn(
          "flex-1 p-4 sm:p-6 mt-16 flex flex-col transition-all duration-300",
          sidebarCollapsed ? "ml-0 lg:ml-16" : "ml-0 lg:ml-56"
        )}>
          <div className="max-w-full mx-auto w-full flex-1">
            {children}
          </div>
          
          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                ĐỔI MỚI SÁNG TẠO VÀ KHỞI NGHIỆP
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                SẢN PHẨM CỦA <span className="font-bold text-blue-600 dark:text-blue-400">NHÓM 3 - VENTURE</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                © 2025 All Rights Reserved. Hệ thống quản lý kho lạnh thông minh
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
