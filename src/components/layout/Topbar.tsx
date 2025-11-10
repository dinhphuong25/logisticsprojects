import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/button'
import { CommandPalette } from '@/components/ui/command-palette'
import { NotificationCenter } from '@/components/ui/notification-center'
import { LogOut, Building2, Activity, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Topbar() {
  const { i18n } = useTranslation()
  const { user, logout } = useAuthStore()
  const { currentWarehouse } = useWarehouseStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <header className={cn(
      "fixed top-0 right-0 h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border-b border-white/20 dark:border-gray-700/30 z-50 shadow-xl shadow-blue-500/5 transition-all duration-300",
      sidebarCollapsed ? "left-0 lg:left-16" : "left-0 lg:left-56"
    )}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-1/4 w-40 h-40 bg-linear-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -top-20 right-1/2 w-32 h-32 bg-linear-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 h-full px-3 sm:px-6 flex items-center justify-between">
        {/* Left side - Menu Toggle + Warehouse Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Menu Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105 flex-shrink-0"
          >
            {sidebarCollapsed ? (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400 lg:hidden" />
            )}
            {!sidebarCollapsed && (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400 hidden lg:block" />
            )}
          </Button>

          {/* Warehouse Info & System Status */}
          {currentWarehouse && (
            <div className="hidden md:flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-xl bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-800/50">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm flex-shrink-0">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                  {i18n.language === 'vi' ? currentWarehouse.nameVi : currentWarehouse.name}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">{currentWarehouse.code}</p>
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50">
            <div className="relative flex-shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-green-900 dark:text-green-300 truncate">
                Hệ thống hoạt động
              </p>
              <p className="text-[9px] sm:text-[10px] text-green-600 dark:text-green-400 font-medium truncate">
                Tất cả cảm biến đang hoạt động
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Command Palette */}
          <CommandPalette />
          
          {/* Notification Center */}
          <NotificationCenter />
          
          {/* User Menu */}
          <div className="ml-2 sm:ml-4 group relative">
            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer backdrop-blur-xl">
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-1.5 justify-end">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-[100px]">{user?.name}</p>
                  <div className="relative group/badge">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm flex-shrink-0">
                      <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 justify-end mt-0.5">
                  <span className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 capitalize truncate">{user?.role}</span>
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
                    Online
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-xl text-base sm:text-lg group-hover:scale-110 transition-transform duration-300">
                  {user?.name?.[0] || 'U'}
                </div>
                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout}
            className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200 w-9 h-9 sm:w-10 sm:h-10"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
