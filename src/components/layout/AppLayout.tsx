import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 ml-56 mt-16 flex flex-col">
          <div className="max-w-full mx-auto w-full flex-1">
            {children}
          </div>
          
          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                © 2025 <span className="font-bold text-blue-600 dark:text-blue-400">Nhóm 3 - VENTURE</span> | Cold Chain WMS Project
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Hệ thống quản lý kho lạnh thông minh
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
