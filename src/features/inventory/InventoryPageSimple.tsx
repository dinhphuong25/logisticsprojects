import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QRScanner } from '@/components/ui/qr-scanner'
import {
  Search,
  Download,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  MapPin,
  Calendar,
  Box,
  Scan,
} from 'lucide-react'

interface InventoryItem {
  id: string
  sku: string
  productName: string
  productNameVi: string
  lotNo: string
  zone: string
  location: string
  quantity: number
  unit: string
  tempClass: 'FROZEN' | 'CHILL' | 'DRY'
  expDate: string
  receivedDate: string
  daysUntilExpiry: number
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EXPIRED'
  image: string
}

// Mock data với logic tính toán thông minh
const fetchInventory = async (): Promise<InventoryItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 600))

  const products = [
    { sku: 'FISH-SAL-001', name: 'Norwegian Salmon Fillet', nameVi: 'Cá hồi Na Uy', tempClass: 'FROZEN', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80', unit: 'KG' },
    { sku: 'SHRIMP-VAC-001', name: 'Black Tiger Prawns', nameVi: 'Tôm sú đông lạnh', tempClass: 'FROZEN', image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&q=80', unit: 'KG' },
    { sku: 'BEEF-WAG-001', name: 'Australian Wagyu Beef', nameVi: 'Thịt bò Wagyu Úc', tempClass: 'FROZEN', image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80', unit: 'KG' },
    { sku: 'PORK-BEL-001', name: 'Pork Belly Premium', nameVi: 'Ba chỉ heo cao cấp', tempClass: 'CHILL', image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&q=80', unit: 'KG' },
    { sku: 'MILK-AUS-001', name: 'Australian Fresh Milk', nameVi: 'Sữa tươi Úc', tempClass: 'CHILL', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80', unit: 'Lít' },
    { sku: 'CHEESE-FR-001', name: 'French Camembert', nameVi: 'Phô mai Pháp', tempClass: 'CHILL', image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&q=80', unit: 'KG' },
    { sku: 'VEG-MIX-001', name: 'Mixed Vegetables', nameVi: 'Rau củ hỗn hợp', tempClass: 'FROZEN', image: 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=400&q=80', unit: 'KG' },
    { sku: 'FRUIT-BER-001', name: 'Mixed Berries', nameVi: 'Trái cây berry', tempClass: 'FROZEN', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80', unit: 'KG' },
  ]

  const zones = [
    { name: 'Zone A-1', temp: 'FROZEN', locations: ['A1-01', 'A1-02', 'A1-03'] },
    { name: 'Zone A-2', temp: 'FROZEN', locations: ['A2-01', 'A2-02', 'A2-03'] },
    { name: 'Zone B-1', temp: 'CHILL', locations: ['B1-01', 'B1-02', 'B1-03'] },
    { name: 'Zone B-2', temp: 'CHILL', locations: ['B2-01', 'B2-02'] },
  ]

  const inventory: InventoryItem[] = []

  products.forEach((product, idx) => {
    // Mỗi sản phẩm có 2-4 lô hàng khác nhau
    const numLots = 2 + Math.floor(Math.random() * 3)
    
    for (let i = 0; i < numLots; i++) {
      const receivedDate = new Date()
      receivedDate.setDate(receivedDate.getDate() - (10 + i * 15 + Math.floor(Math.random() * 10)))
      
      // Tính expiry date dựa vào loại sản phẩm
      const shelfLifeDays = product.tempClass === 'FROZEN' ? 365 : 30
      const expDate = new Date(receivedDate)
      expDate.setDate(expDate.getDate() + shelfLifeDays)
      
      const daysUntilExpiry = Math.floor((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      // Xác định status dựa trên days until expiry
      let status: InventoryItem['status'] = 'NORMAL'
      if (daysUntilExpiry < 0) {
        status = 'EXPIRED'
      } else if (daysUntilExpiry <= 7) {
        status = 'CRITICAL'
      } else if (daysUntilExpiry <= 30) {
        status = 'WARNING'
      }

      // Chọn zone phù hợp với tempClass
      const suitableZones = zones.filter(z => z.temp === product.tempClass)
      const zone = suitableZones[i % suitableZones.length]
      const location = zone.locations[i % zone.locations.length]

      inventory.push({
        id: `inv-${idx}-${i}`,
        sku: product.sku,
        productName: product.name,
        productNameVi: product.nameVi,
        lotNo: `LOT-${String(20251001 + idx * 100 + i).padStart(8, '0')}`,
        zone: zone.name,
        location,
        quantity: 50 + Math.floor(Math.random() * 450),
        unit: product.unit,
        tempClass: product.tempClass as 'FROZEN' | 'CHILL' | 'DRY',
        expDate: expDate.toISOString(),
        receivedDate: receivedDate.toISOString(),
        daysUntilExpiry,
        status,
        image: product.image,
      })
    }
  })

  return inventory.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
}

export default function InventoryPageSimple() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [tempFilter, setTempFilter] = useState<string>('ALL')
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  const { data: inventory = [], isLoading, refetch } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: fetchInventory,
    refetchInterval: 60000,
  })

  const handleScanResult = (value: string) => {
    setSearchTerm(value)
    setIsScannerOpen(false)
  }

  // Filter inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = 
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productNameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lotNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
      const matchesTemp = tempFilter === 'ALL' || item.tempClass === tempFilter
      
      return matchesSearch && matchesStatus && matchesTemp
    })
  }, [inventory, searchTerm, statusFilter, tempFilter])

  // Calculate stats
  const stats = useMemo(() => {
    const totalQty = inventory.reduce((sum, item) => sum + item.quantity, 0)
    const expired = inventory.filter(item => item.status === 'EXPIRED').length
    const critical = inventory.filter(item => item.status === 'CRITICAL').length
    const warning = inventory.filter(item => item.status === 'WARNING').length
    
    return {
      totalItems: inventory.length,
      totalQty,
      expired,
      critical,
      warning,
    }
  }, [inventory])

  const getStatusBadge = (status: InventoryItem['status'], daysUntilExpiry: number) => {
    const configs = {
      EXPIRED: {
        label: 'Đã hết hạn',
        className: 'bg-red-500 text-white',
        icon: AlertTriangle,
      },
      CRITICAL: {
        label: `${daysUntilExpiry} ngày`,
        className: 'bg-orange-500 text-white',
        icon: AlertTriangle,
      },
      WARNING: {
        label: `${daysUntilExpiry} ngày`,
        className: 'bg-yellow-500 text-white',
        icon: Calendar,
      },
      NORMAL: {
        label: `${daysUntilExpiry} ngày`,
        className: 'bg-green-500 text-white',
        icon: Calendar,
      },
    }
    
    const config = configs[status]
    const Icon = config.icon
    
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getTempBadge = (tempClass: string) => {
    const configs = {
      FROZEN: { label: 'Đông lạnh', className: 'bg-purple-100 text-purple-700', icon: '🧊' },
      CHILL: { label: 'Mát', className: 'bg-blue-100 text-blue-700', icon: '❄️' },
      DRY: { label: 'Khô', className: 'bg-amber-100 text-amber-700', icon: '📦' },
    }
    const config = configs[tempClass as keyof typeof configs]
    return (
      <Badge className={config.className}>
        {config.icon} {config.label}
      </Badge>
    )
  }

  const handleExport = () => {
    const csvContent = [
      ['SKU', 'Sản phẩm', 'Lô hàng', 'Zone', 'Vị trí', 'Số lượng', 'Đơn vị', 'HSD', 'Trạng thái'].join(','),
      ...filteredInventory.map(item => [
        item.sku,
        item.productNameVi,
        item.lotNo,
        item.zone,
        item.location,
        item.quantity,
        item.unit,
        new Date(item.expDate).toLocaleDateString('vi-VN'),
        item.status,
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải tồn kho...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isScannerOpen && (
        <QRScanner
          onClose={() => setIsScannerOpen(false)}
          onScan={handleScanResult}
          title="Quét mã để tìm sản phẩm"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Quản lý tồn kho
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Theo dõi tồn kho theo lô hàng và vị trí lưu trữ
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsScannerOpen(true)}
            variant="outline"
            className="hidden md:inline-flex"
          >
            <Scan className="w-4 h-4 mr-2" />
            Quét mã
          </Button>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng mặt hàng</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalItems}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng số lượng</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.totalQty.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sắp hết hạn</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.warning}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cấp bách</p>
            <p className="text-3xl font-bold text-orange-600">{stats.critical}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Đã hết hạn</p>
            <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Tìm kiếm theo SKU, tên sản phẩm, lô hàng, zone, vị trí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-4 border rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="EXPIRED">Đã hết hạn</option>
              <option value="CRITICAL">Cấp bách</option>
              <option value="WARNING">Sắp hết hạn</option>
              <option value="NORMAL">Bình thường</option>
            </select>
            <select
              value={tempFilter}
              onChange={(e) => setTempFilter(e.target.value)}
              className="h-11 px-4 border rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="ALL">Tất cả nhiệt độ</option>
              <option value="FROZEN">🧊 Đông lạnh</option>
              <option value="CHILL">❄️ Mát</option>
              <option value="DRY">📦 Khô</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardTitle className="flex items-center gap-2">
            <Box className="w-5 h-5 text-blue-600" />
            Danh sách tồn kho ({filteredInventory.length} mặt hàng)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Không tìm thấy mặt hàng nào' : 'Chưa có tồn kho'}
              </p>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {filteredInventory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.productNameVi}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {item.productNameVi}
                            </h3>
                            {getTempBadge(item.tempClass)}
                            {getStatusBadge(item.status, item.daysUntilExpiry)}
                          </div>
                          <p className="text-sm text-gray-500">{item.productName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">SKU</p>
                          <p className="font-mono font-bold text-gray-900 dark:text-white">
                            {item.sku}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Lô hàng</p>
                          <p className="font-mono font-semibold text-gray-900 dark:text-white">
                            {item.lotNo}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Zone</p>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-500" />
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {item.zone}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Vị trí</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {item.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Số lượng</p>
                          <p className="text-lg font-bold text-blue-600">
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Hạn sử dụng</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(item.expDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Scanner Button */}
      <button
        type="button"
        onClick={() => setIsScannerOpen(true)}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 shadow-2xl shadow-blue-500/40 flex items-center justify-center text-white focus:outline-none focus:ring-4 focus:ring-blue-500/40"
      >
        <Scan className="w-6 h-6" />
      </button>
    </div>
  )
}
