import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { Outlet } from 'react-router-dom'
import { useUIStore } from '@/stores'
import { cn } from '@/lib/utils'

export default function AppLayout() {
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
            <Outlet />
          </div>
          
          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                MÔN HỌC ĐỔI MỚI SÁNG TẠO VÀ KHỞI NGHIỆP
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Được thực hiện bởi <span className="font-bold text-blue-600 dark:text-blue-400">NHÓM 3</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                © 2025 All Rights Reserved
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
