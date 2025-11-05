import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import {
  LayoutDashboard,
  Package,
  Thermometer,
  AlertTriangle,
  Snowflake,
  PackageOpen,
  PackageCheck,
  Box,
  BarChart3,
  MapPin,
  Grid3x3,
  Settings,
  ShoppingBag,
  Sun,
  Radio,
  Zap,
} from 'lucide-react'

const navItems = [
  { 
    to: '/dashboard', 
    icon: LayoutDashboard, 
    label: 'Bảng điều khiển',
    category: 'main',
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    to: '/warehouse-3d', 
    icon: Box, 
    label: 'Kho 3D',
    category: 'main',
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    to: '/zones', 
    icon: MapPin, 
    label: 'Khu vực',
    category: 'warehouse',
    gradient: 'from-indigo-500 to-purple-500'
  },
  { 
    to: '/locations', 
    icon: Grid3x3, 
    label: 'Vị trí',
    category: 'warehouse',
    gradient: 'from-cyan-500 to-blue-500'
  },
  { 
    to: '/products', 
    icon: ShoppingBag, 
    label: 'Sản phẩm',
    category: 'inventory',
    gradient: 'from-emerald-500 to-teal-500'
  },
  { 
    to: '/inventory', 
    icon: Package, 
    label: 'Tồn kho',
    category: 'inventory',
    gradient: 'from-teal-500 to-cyan-500'
  },
  { 
    to: '/inbound', 
    icon: PackageOpen, 
    label: 'Nhập hàng',
    category: 'operations',
    gradient: 'from-blue-500 to-indigo-500'
  },
  { 
    to: '/outbound', 
    icon: PackageCheck, 
    label: 'Xuất hàng',
    category: 'operations',
    gradient: 'from-green-500 to-emerald-500'
  },
  { 
    to: '/energy', 
    icon: Sun, 
    label: 'Năng lượng mặt trời',
    category: 'energy',
    gradient: 'from-yellow-500 to-orange-500',
    isSpecial: true,
    badge: 'NEW'
  },
  { 
    to: '/remote-control', 
    icon: Radio, 
    label: 'Điều khiển từ xa',
    category: 'energy',
    gradient: 'from-orange-500 to-red-500',
    isSpecial: true,
    badge: 'HOT'
  },
  { 
    to: '/temperature', 
    icon: Thermometer, 
    label: 'Nhiệt độ',
    category: 'monitoring',
    gradient: 'from-cyan-500 to-blue-500'
  },
  { 
    to: '/alerts', 
    icon: AlertTriangle, 
    label: 'Cảnh báo',
    category: 'monitoring',
    gradient: 'from-red-500 to-pink-500'
  },
  { 
    to: '/reports', 
    icon: BarChart3, 
    label: 'Báo cáo',
    category: 'analytics',
    gradient: 'from-violet-500 to-purple-500'
  },
  { 
    to: '/settings', 
    icon: Settings, 
    label: 'Cài đặt',
    category: 'system',
    gradient: 'from-gray-500 to-slate-500'
  },
]

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore()

  // Auto close sidebar on mobile when clicking nav item
  const handleNavClick = () => {
    if (window.innerWidth < 1024) { // lg breakpoint
      setSidebarCollapsed(true)
    }
  }

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-gradient-to-b from-white/95 via-white/90 to-white/95 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95 backdrop-blur-2xl border-r border-white/20 dark:border-gray-700/30 z-40 shadow-2xl shadow-blue-500/10 transition-all duration-300",
        sidebarCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "w-56 translate-x-0"
      )}
    >
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden rounded-r-3xl">
        <div className="absolute -top-40 -left-40 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Logo */}
      <div className="relative z-10 p-4 border-b border-white/20 dark:border-gray-700/30">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-all duration-300"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Snowflake className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1">
              <h1 className="text-base font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                NHÓM 3
              </h1>
              <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 tracking-wide">
                VENTURE - ĐMST & KN
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-4 space-y-3 overflow-y-auto h-[calc(100vh-120px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navItems.map((item, index) => {
          const isEnergyMenu = item.category === 'energy'
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 hover:shadow-md',
                  isActive
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl shadow-${item.gradient.split('-')[1]}-500/40`
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60'
                )
              }
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {({ isActive }) => (
                <>
                  {/* Background Effect */}
                  {!isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 rounded-xl transition-all duration-300`}></div>
                  )}

                  {/* Icon */}
                  <div className={cn(
                    "relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                    isActive 
                      ? "bg-white/20" 
                      : isEnergyMenu 
                        ? `bg-gradient-to-br ${item.gradient} bg-opacity-20`
                        : "bg-gray-100 dark:bg-gray-800"
                  )}>
                    <item.icon className={cn(
                      'w-4 h-4 transition-all duration-300',
                      isActive 
                        ? 'text-white' 
                        : isEnergyMenu
                          ? `text-${item.gradient.split('-')[1]}-600`
                          : 'text-gray-600 dark:text-gray-400'
                    )} />
                    
                    {/* Special Energy Icon Effect */}
                    {isEnergyMenu && !isActive && (
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-400/20 animate-pulse"></div>
                    )}
                  </div>

                  {/* Label */}
                  {!sidebarCollapsed && (
                    <div className="relative z-10 flex-1">
                      <span className={cn(
                        "font-semibold text-xs transition-all duration-300",
                        isActive 
                          ? "text-white" 
                          : isEnergyMenu
                            ? `text-${item.gradient.split('-')[1]}-700 dark:text-${item.gradient.split('-')[1]}-300 font-bold`
                            : "group-hover:text-gray-900 dark:group-hover:text-gray-100"
                      )}>
                        {item.label}
                      </span>
                      
                      {/* Special Energy Subtitle */}
                      {isEnergyMenu && !isActive && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                          {item.to === '/energy' ? 'Green Energy' : 'Smart Control'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Badge */}
                  {item.badge && !sidebarCollapsed && (
                    <div className={cn(
                      "relative z-10 px-1.5 py-0.5 rounded text-[10px] font-bold",
                      item.badge === 'NEW' 
                        ? "bg-green-500 text-white animate-pulse"
                        : "bg-red-500 text-white"
                    )}>
                      {item.badge}
                    </div>
                  )}

                  {/* Active Pulse Dot */}
                  {isActive && !sidebarCollapsed && (
                    <div className="relative z-10 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                  )}

                  {/* Energy Menu Special Effects */}
                  {isEnergyMenu && !isActive && !sidebarCollapsed && (
                    <div className="absolute right-3 top-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        item.to === '/energy' ? "bg-yellow-500" : "bg-orange-500"
                      )}></div>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          )
        })}

        {/* Bottom Decorative Element */}
        {!sidebarCollapsed && (
          <div className="mt-6 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-gray-800 dark:text-gray-200">System Status</div>
                <div className="text-[9px] text-gray-600 dark:text-gray-400">All operational</div>
              </div>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </aside>
  )
}
