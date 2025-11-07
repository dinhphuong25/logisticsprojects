import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { 
  Search, 
  LayoutDashboard, 
  Package, 
  PackageOpen, 
  PackageCheck,
  Thermometer,
  AlertTriangle,
  BarChart3,
  Settings,
  Sun,
  Radio,
  Fuel,
  ShoppingBag,
  MapPin,
  Grid3x3,
  Shield,
} from 'lucide-react'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  action: () => void
  category: string
  keywords?: string[]
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Bảng điều khiển',
      description: 'Xem tổng quan hệ thống',
      icon: LayoutDashboard,
      category: 'Navigation',
      action: () => navigate('/dashboard'),
      keywords: ['dashboard', 'overview', 'home']
    },
    {
      id: 'nav-inventory',
      label: 'Tồn kho',
      description: 'Quản lý hàng tồn kho',
      icon: Package,
      category: 'Navigation',
      action: () => navigate('/inventory'),
      keywords: ['inventory', 'stock', 'warehouse']
    },
    {
      id: 'nav-products',
      label: 'Sản phẩm',
      description: 'Danh sách sản phẩm',
      icon: ShoppingBag,
      category: 'Navigation',
      action: () => navigate('/products'),
      keywords: ['products', 'items']
    },
    {
      id: 'nav-inbound',
      label: 'Nhập hàng',
      description: 'Quản lý đơn nhập',
      icon: PackageOpen,
      category: 'Navigation',
      action: () => navigate('/inbound'),
      keywords: ['inbound', 'receiving', 'import']
    },
    {
      id: 'nav-outbound',
      label: 'Xuất hàng',
      description: 'Quản lý đơn xuất',
      icon: PackageCheck,
      category: 'Navigation',
      action: () => navigate('/outbound'),
      keywords: ['outbound', 'shipping', 'export']
    },
    {
      id: 'nav-temperature',
      label: 'Nhiệt độ',
      description: 'Giám sát nhiệt độ',
      icon: Thermometer,
      category: 'Navigation',
      action: () => navigate('/temperature'),
      keywords: ['temperature', 'monitoring']
    },
    {
      id: 'nav-alerts',
      label: 'Cảnh báo',
      description: 'Xem thông báo cảnh báo',
      icon: AlertTriangle,
      category: 'Navigation',
      action: () => navigate('/alerts'),
      keywords: ['alerts', 'notifications', 'warnings']
    },
    {
      id: 'nav-reports',
      label: 'Báo cáo',
      description: 'Xem báo cáo thống kê',
      icon: BarChart3,
      category: 'Navigation',
      action: () => navigate('/reports'),
      keywords: ['reports', 'analytics', 'statistics']
    },
    {
      id: 'nav-energy',
      label: 'Năng lượng mặt trời',
      description: 'Quản lý hệ thống solar',
      icon: Sun,
      category: 'Navigation',
      action: () => navigate('/energy'),
      keywords: ['solar', 'energy', 'power']
    },
    {
      id: 'nav-generator',
      label: 'Máy phát điện',
      description: 'Giám sát máy phát',
      icon: Fuel,
      category: 'Navigation',
      action: () => navigate('/generator'),
      keywords: ['generator', 'power', 'backup']
    },
    {
      id: 'nav-remote',
      label: 'Điều khiển từ xa',
      description: 'Remote control panel',
      icon: Radio,
      category: 'Navigation',
      action: () => navigate('/remote-control'),
      keywords: ['remote', 'control', 'iot']
    },
    {
      id: 'nav-zones',
      label: 'Khu vực',
      description: 'Quản lý zones',
      icon: MapPin,
      category: 'Navigation',
      action: () => navigate('/zones'),
      keywords: ['zones', 'areas']
    },
    {
      id: 'nav-locations',
      label: 'Vị trí',
      description: 'Quản lý locations',
      icon: Grid3x3,
      category: 'Navigation',
      action: () => navigate('/locations'),
      keywords: ['locations', 'positions']
    },
    {
      id: 'nav-settings',
      label: 'Cài đặt',
      description: 'Cấu hình hệ thống',
      icon: Settings,
      category: 'Navigation',
      action: () => navigate('/settings'),
      keywords: ['settings', 'config']
    },
    {
      id: 'nav-blockchain',
      label: 'Blockchain Tracking',
      description: 'Xác thực và theo dõi sản phẩm blockchain',
      icon: Shield,
      category: 'Navigation',
      action: () => navigate('/blockchain'),
      keywords: ['blockchain', 'tracking', 'verify']
    },
    {
      id: 'nav-blockchain-register',
      label: 'Đăng ký Blockchain',
      description: 'Đăng ký sản phẩm mới trên blockchain',
      icon: Package,
      category: 'Navigation',
      action: () => navigate('/blockchain/register'),
      keywords: ['blockchain', 'register', 'new']
    },

    // Quick Actions
    {
      id: 'action-create-inbound',
      label: 'Tạo đơn nhập hàng',
      description: 'Tạo đơn nhập mới',
      icon: PackageOpen,
      category: 'Quick Actions',
      action: () => navigate('/inbound/create'),
      keywords: ['create', 'new', 'inbound']
    },
    {
      id: 'action-create-outbound',
      label: 'Tạo đơn xuất hàng',
      description: 'Tạo đơn xuất mới',
      icon: PackageCheck,
      category: 'Quick Actions',
      action: () => navigate('/outbound/create'),
      keywords: ['create', 'new', 'outbound']
    },
    {
      id: 'action-create-product',
      label: 'Thêm sản phẩm mới',
      description: 'Tạo sản phẩm mới',
      icon: ShoppingBag,
      category: 'Quick Actions',
      action: () => navigate('/products/create'),
      keywords: ['create', 'new', 'product']
    },
  ]

  const handleSelect = useCallback((item: CommandItem) => {
    setOpen(false)
    item.action()
    setSearch('')
  }, [])

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-gray-600 dark:text-gray-400"
      >
        <Search className="w-4 h-4" />
        <span>Tìm kiếm nhanh...</span>
        <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-white dark:bg-gray-900 border rounded">
          Ctrl K
        </kbd>
      </button>

      {/* Command Dialog */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0"
          onClick={() => setOpen(false)}
        >
          <div 
            className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl animate-in fade-in-0 slide-in-from-top-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Command 
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
              value={search}
              onValueChange={setSearch}
            >
              {/* Search Input */}
              <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <Command.Input
                  placeholder="Tìm kiếm hoặc nhập lệnh..."
                  className="flex-1 py-4 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
                <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 border rounded">
                  ESC
                </kbd>
              </div>

              {/* Command List */}
              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                <Command.Empty className="py-12 text-center text-gray-500">
                  Không tìm thấy kết quả.
                </Command.Empty>

                {/* Group by Category */}
                <Command.Group heading="Navigation" className="mb-2">
                  {commands
                    .filter(cmd => cmd.category === 'Navigation')
                    .map(cmd => (
                      <Command.Item
                        key={cmd.id}
                        value={cmd.label + ' ' + cmd.keywords?.join(' ')}
                        onSelect={() => handleSelect(cmd)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-blue-50 dark:aria-selected:bg-blue-900/20 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <cmd.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {cmd.label}
                          </div>
                          {cmd.description && (
                            <div className="text-xs text-gray-500 truncate">
                              {cmd.description}
                            </div>
                          )}
                        </div>
                      </Command.Item>
                    ))}
                </Command.Group>

                <Command.Group heading="Quick Actions" className="mb-2">
                  {commands
                    .filter(cmd => cmd.category === 'Quick Actions')
                    .map(cmd => (
                      <Command.Item
                        key={cmd.id}
                        value={cmd.label + ' ' + cmd.keywords?.join(' ')}
                        onSelect={() => handleSelect(cmd)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-green-50 dark:aria-selected:bg-green-900/20 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                          <cmd.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {cmd.label}
                          </div>
                          {cmd.description && (
                            <div className="text-xs text-gray-500 truncate">
                              {cmd.description}
                            </div>
                          )}
                        </div>
                      </Command.Item>
                    ))}
                </Command.Group>
              </Command.List>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Enter</kbd>
                    Select
                  </span>
                </div>
                <span>Command Palette v1.0</span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  )
}
