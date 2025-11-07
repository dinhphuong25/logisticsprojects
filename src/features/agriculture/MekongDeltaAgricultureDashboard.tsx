import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QRScanner } from '@/components/ui/qr-scanner'
import { MEKONG_DELTA_CONFIG, getCurrentSeason } from '@/lib/mekong-delta-config'
import {
  Waves,
  Sprout,
  Fish,
  Apple,
  Wheat,
  Thermometer,
  Droplets,
  MapPin,
  Calendar,
  Truck,
  TrendingUp,
  Star,
  Scan,
  Eye,
  Package,
  Award
} from 'lucide-react'

interface AgriculturalProduct {
  id: string
  name: string
  category: 'grains' | 'fruits' | 'aquaculture' | 'vegetables'
  variety: string
  farm: {
    name: string
    province: string
    coordinates: { lat: number; lng: number }
    farmer: string
    certification: string[]
  }
  harvest: {
    date: string
    season: string
    quantity: number
    unit: string
  }
  quality: {
    grade: string
    moisture: number
    size: string
    defects: number
  }
  storage: {
    temperature: number
    humidity: number
    conditions: string
  }
  transportation: {
    method: string
    route: string[]
    estimatedTime: string
  }
  market: {
    destination: string
    price: number
    demand: 'high' | 'medium' | 'low'
  }
  blockchain: {
    verified: boolean
    traceabilityCode: string
  }
}

export function MekongDeltaAgricultureDashboard() {
  const [selectedProvince, setSelectedProvince] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [, setSelectedProduct] = useState<AgriculturalProduct | null>(null)

  // Mock data cho nông sản ĐBSCL
  const products: AgriculturalProduct[] = useMemo(() => [
    {
      id: 'RICE-001',
      name: 'Gạo ST25',
      category: 'grains',
      variety: 'ST25 (Sóc Trăng)',
      farm: {
        name: 'Hợp tác xã Thạnh Phú',
        province: 'Sóc Trăng',
        coordinates: { lat: 9.6003, lng: 105.9800 },
        farmer: 'Nguyễn Văn Minh',
        certification: ['VietGAP', '3_Sao']
      },
      harvest: {
        date: '2025-01-15',
        season: 'Vụ Đông Xuân',
        quantity: 50,
        unit: 'tấn'
      },
      quality: {
        grade: 'A',
        moisture: 14,
        size: 'Dài 5.8mm',
        defects: 2
      },
      storage: {
        temperature: 28,
        humidity: 13,
        conditions: 'Kho khô, thoáng mát'
      },
      transportation: {
        method: 'Đường thủy + Đường bộ',
        route: ['Sóc Trăng', 'Cần Thơ', 'TP.HCM'],
        estimatedTime: '18 giờ'
      },
      market: {
        destination: 'Chợ đầu mối Hóc Môn',
        price: 28500,
        demand: 'high'
      },
      blockchain: {
        verified: true,
        traceabilityCode: 'ST25-RICE-2025-001'
      }
    },
    {
      id: 'MANGO-002',
      name: 'Xoài Cát Chu',
      category: 'fruits',
      variety: 'Cát Chu',
      farm: {
        name: 'Vườn xoài Minh Châu',
        province: 'Đồng Tháp',
        coordinates: { lat: 10.4583, lng: 105.6344 },
        farmer: 'Lê Thị Hồng',
        certification: ['VietGAP', 'Organic']
      },
      harvest: {
        date: '2025-03-20',
        season: 'Mùa khô',
        quantity: 15,
        unit: 'tấn'
      },
      quality: {
        grade: 'A+',
        moisture: 85,
        size: 'Loại 1 (350-450g)',
        defects: 1
      },
      storage: {
        temperature: 12,
        humidity: 88,
        conditions: 'Kho lạnh, kiểm soát độ ẩm'
      },
      transportation: {
        method: 'Đường bộ',
        route: ['Đồng Tháp', 'TP.HCM', 'Hà Nội'],
        estimatedTime: '24 giờ'
      },
      market: {
        destination: 'Xuất khẩu',
        price: 45000,
        demand: 'high'
      },
      blockchain: {
        verified: true,
        traceabilityCode: 'MANGO-CAT-2025-002'
      }
    },
    {
      id: 'FISH-003',
      name: 'Cá Tra',
      category: 'aquaculture',
      variety: 'Cá tra phi lê',
      farm: {
        name: 'Trại nuôi Phú Hưng',
        province: 'An Giang',
        coordinates: { lat: 10.3611, lng: 105.4344 },
        farmer: 'Trần Văn Thành',
        certification: ['VietGAP', 'ASC']
      },
      harvest: {
        date: '2025-02-10',
        season: 'Mùa mưa',
        quantity: 25,
        unit: 'tấn'
      },
      quality: {
        grade: 'A',
        moisture: 78,
        size: '1.2-1.5kg/con',
        defects: 0
      },
      storage: {
        temperature: -18,
        humidity: 95,
        conditions: 'Đông lạnh'
      },
      transportation: {
        method: 'Xe lạnh',
        route: ['An Giang', 'TP.HCM', 'Cảng Cát Lái'],
        estimatedTime: '12 giờ'
      },
      market: {
        destination: 'Xuất khẩu Mỹ',
        price: 65000,
        demand: 'high'
      },
      blockchain: {
        verified: true,
        traceabilityCode: 'FISH-TRA-2025-003'
      }
    }
  ], [])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesProvince = selectedProvince === 'all' || product.farm.province === selectedProvince
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farm.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesProvince && matchesCategory && matchesSearch
    })
  }, [products, selectedProvince, selectedCategory, searchTerm])

  const currentSeason = getCurrentSeason()

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'grains': return <Wheat className="w-5 h-5" />
      case 'fruits': return <Apple className="w-5 h-5" />
      case 'aquaculture': return <Fish className="w-5 h-5" />
      case 'vegetables': return <Sprout className="w-5 h-5" />
      default: return <Package className="w-5 h-5" />
    }
  }

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleScanResult = (value: string) => {
    setSearchTerm(value)
    setIsScannerOpen(false)
  }

  const stats = useMemo(() => {
    const totalQuantity = filteredProducts.reduce((sum, p) => sum + p.harvest.quantity, 0)
    const avgPrice = filteredProducts.reduce((sum, p) => sum + p.market.price, 0) / filteredProducts.length || 0
    const certifiedCount = filteredProducts.filter(p => p.farm.certification.length > 0).length
    const verifiedCount = filteredProducts.filter(p => p.blockchain.verified).length

    return { totalQuantity, avgPrice, certifiedCount, verifiedCount }
  }, [filteredProducts])

  return (
    <div className="space-y-6 p-6">
      {isScannerOpen && (
        <QRScanner
          onClose={() => setIsScannerOpen(false)}
          onScan={handleScanResult}
          title="Quét mã truy xuất nông sản"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Waves className="w-8 h-8 text-blue-600" />
            Nông Sản Đồng Bằng Sông Cửu Long
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý chuỗi cung ứng nông sản từ ruộng đến bàn ăn
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">{currentSeason}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalQuantity.toLocaleString()} tấn
          </div>
          <div className="text-sm text-gray-600">Tổng sản lượng</div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-blue-600">{filteredProducts.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Giá trung bình</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.avgPrice.toLocaleString()}đ
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chứng nhận</p>
                <p className="text-2xl font-bold text-purple-600">{stats.certifiedCount}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blockchain</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.verifiedCount}</p>
              </div>
              <Star className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Tìm kiếm nông sản, giống, nông trại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-20"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-1 top-1"
                  onClick={() => setIsScannerOpen(true)}
                >
                  <Scan className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white min-w-[150px]"
            >
              <option value="all">Tất cả tỉnh</option>
              {MEKONG_DELTA_CONFIG.provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white min-w-[150px]"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="grains">Ngũ cốc</option>
              <option value="fruits">Trái cây</option>
              <option value="aquaculture">Thủy sản</option>
              <option value="vegetables">Rau củ</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(product.category)}
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-gray-600">{product.variety}</p>
                  </div>
                </div>
                {product.blockchain.verified && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Star className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Farm Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{product.farm.name} - {product.farm.province}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{product.harvest.season} - {new Date(product.harvest.date).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {/* Quality & Storage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <span>Nhiệt độ</span>
                  </div>
                  <div className="text-lg font-semibold">{product.storage.temperature}°C</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>Độ ẩm</span>
                  </div>
                  <div className="text-lg font-semibold">{product.storage.humidity}%</div>
                </div>
              </div>

              {/* Quantity & Price */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold text-green-600">
                    {product.harvest.quantity} {product.harvest.unit}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {product.market.price.toLocaleString()}đ
                  </div>
                  <Badge className={getDemandColor(product.market.demand)}>
                    {product.market.demand === 'high' ? 'Cao' : product.market.demand === 'medium' ? 'Trung bình' : 'Thấp'}
                  </Badge>
                </div>
              </div>

              {/* Certifications */}
              <div className="flex flex-wrap gap-1">
                {product.farm.certification.map((cert) => (
                  <Badge key={cert} variant="outline" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>

              {/* Transportation */}
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>{product.transportation.method}</span>
                </div>
                <div className="mt-1">
                  Đến: {product.market.destination}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedProduct(product)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Chi tiết
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm(product.blockchain.traceabilityCode)}
                >
                  <Scan className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Waves className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg font-medium">Không tìm thấy nông sản nào</p>
            <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </CardContent>
        </Card>
      )}

      {/* Floating Scanner Button */}
      <button
        type="button"
        onClick={() => setIsScannerOpen(true)}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-teal-600 shadow-2xl shadow-blue-500/40 flex items-center justify-center text-white focus:outline-none focus:ring-4 focus:ring-blue-500/40"
      >
        <Scan className="w-6 h-6" />
      </button>
    </div>
  )
}