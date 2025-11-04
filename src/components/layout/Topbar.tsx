import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { Button } from '@/components/ui/button'
import { Moon, Sun, LogOut, Building2, Globe, Activity } from 'lucide-react'

export default function Topbar() {
  const { i18n } = useTranslation()
  const { user, logout } = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const { currentWarehouse } = useWarehouseStore()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi'
    i18n.changeLanguage(newLang)
  }

  return (
    <header className="fixed top-0 right-0 left-56 h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border-b border-white/20 dark:border-gray-700/30 z-50 shadow-xl shadow-blue-500/5">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-1/4 w-40 h-40 bg-linear-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -top-20 right-1/2 w-32 h-32 bg-linear-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 h-full px-6 flex items-center justify-between">
        {/* Warehouse Info & System Status */}
        <div className="flex items-center gap-3">
          {currentWarehouse && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-800/50">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  {i18n.language === 'vi' ? currentWarehouse.nameVi : currentWarehouse.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{currentWarehouse.code}</p>
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50">
            <div className="relative">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="text-xs font-semibold text-green-900 dark:text-green-300">
                Hệ thống hoạt động
              </p>
              <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                Tất cả cảm biến đang hoạt động
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleLanguage}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Button>
          
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggle}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </Button>

          {/* User Menu */}
          <div className="ml-4 group relative">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer backdrop-blur-xl">
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</p>
                  <div className="relative group/badge">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                        Tài khoản xác thực
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 justify-end mt-0.5">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">{user?.role}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
                    Online
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-xl text-lg group-hover:scale-110 transition-transform duration-300">
                  {user?.name?.[0] || 'U'}
                </div>
                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout}
            className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
