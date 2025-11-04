import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Edit,
  Package,
  Thermometer,
  Clock,
  Weight,
  Maximize,
  DollarSign,
  MapPin,
  Award,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Barcode,
  Box,
  Truck,
  FileText,
} from 'lucide-react'

interface Product {
  id: string
  sku: string
  name: string
  nameVi: string
  description: string
  image: string
  unit: string
  tempClass: 'CHILL' | 'FROZEN' | 'DRY'
  tempRange: string
  shelfLifeDays: number
  weight: number
  cubic: number
  category: string
  subcategory: string
  stockLevel: number
  reorderPoint: number
  price: number
  supplier: string
  origin: string
  certifications: string[]
  isPopular: boolean
  lastRestocked: string
}

// Mock data function với rotation logic
const fetchProductDetail = async (productId: string): Promise<Product> => {
  await new Promise(resolve => setTimeout(resolve, 500))

  const products: Product[] = [
    {
      id: 'prod-001',
      sku: 'FISH-SAL-001',
      name: 'Norwegian Salmon Fillet',
      nameVi: 'Cá hồi Na Uy phi lê',
      description: 'Cá hồi tươi nhập khẩu từ Na Uy, giàu Omega-3, thịt hồng tươi, được nuôi trong môi trường nước lạnh sạch. Sản phẩm đạt chứng nhận MSC và ASC về nuôi trồng thủy sản bền vững.',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
      unit: 'KG',
      tempClass: 'FROZEN',
      tempRange: '-18°C đến -22°C',
      shelfLifeDays: 365,
      weight: 2.5,
      cubic: 0.008,
      category: 'Hải sản',
      subcategory: 'Cá tươi',
      stockLevel: 450,
      reorderPoint: 100,
      price: 580000,
      supplier: 'Fresh Seafood Co.',
      origin: 'Na Uy',
      certifications: ['MSC', 'ASC', 'HACCP'],
      isPopular: true,
      lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'prod-002',
      sku: 'SHRIMP-VAC-001',
      name: 'Black Tiger Prawns',
      nameVi: 'Tôm sú đông lạnh',
      description: 'Tôm sú size 16/20, đông lạnh ngay sau đánh bắt, tươi ngon. Nuôi theo tiêu chuẩn BAP, đảm bảo an toàn thực phẩm và môi trường.',
      image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80',
      unit: 'KG',
      tempClass: 'FROZEN',
      tempRange: '-18°C đến -20°C',
      shelfLifeDays: 540,
      weight: 1.0,
      cubic: 0.005,
      category: 'Hải sản',
      subcategory: 'Tôm',
      stockLevel: 320,
      reorderPoint: 80,
      price: 450000,
      supplier: 'Ocean Fresh Import',
      origin: 'Việt Nam',
      certifications: ['BAP', 'HACCP', 'ISO 22000'],
      isPopular: true,
      lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'prod-003',
      sku: 'FISH-TUN-001',
      name: 'Yellowfin Tuna Steak',
      nameVi: 'Cá ngừ vây vàng',
      description: 'Thịt cá ngừ cao cấp, thích hợp cho sashimi và nướng. Đánh bắt bền vững theo tiêu chuẩn MSC.',
      image: 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=800&q=80',
      unit: 'KG',
      tempClass: 'FROZEN',
      tempRange: '-20°C đến -25°C',
      shelfLifeDays: 730,
      weight: 3.0,
      cubic: 0.01,
      category: 'Hải sản',
      subcategory: 'Cá tươi',
      stockLevel: 180,
      reorderPoint: 50,
      price: 680000,
      supplier: 'Premium Seafood Ltd.',
      origin: 'Nhật Bản',
      certifications: ['MSC', 'Friend of the Sea'],
      isPopular: false,
      lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'prod-004',
      sku: 'BEEF-WAG-001',
      name: 'Australian Wagyu Beef',
      nameVi: 'Thịt bò Wagyu Úc',
      description: 'Thịt bò Wagyu cao cấp, vân mỡ đẹp, độ mềm tuyệt hảo. Chăn nuôi theo tiêu chuẩn Úc, đạt chứng nhận USDA và Halal.',
      image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80',
      unit: 'KG',
      tempClass: 'FROZEN',
      tempRange: '-18°C',
      shelfLifeDays: 365,
      weight: 5.0,
      cubic: 0.015,
      category: 'Thịt',
      subcategory: 'Thịt bò',
      stockLevel: 280,
      reorderPoint: 70,
      price: 1250000,
      supplier: 'Global Meat Import',
      origin: 'Úc',
      certifications: ['USDA', 'Halal', 'HACCP'],
      isPopular: true,
      lastRestocked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'prod-005',
      sku: 'PORK-BEL-001',
      name: 'Pork Belly Premium',
      nameVi: 'Ba chỉ heo cao cấp',
      description: 'Ba chỉ heo tươi, tỷ lệ nạc thăn vàng, thích hợp nướng BBQ. Chăn nuôi theo tiêu chuẩn VietGAP.',
      image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800&q=80',
      unit: 'KG',
      tempClass: 'CHILL',
      tempRange: '0°C đến 4°C',
      shelfLifeDays: 14,
      weight: 2.0,
      cubic: 0.006,
      category: 'Thịt',
      subcategory: 'Thịt heo',
      stockLevel: 420,
      reorderPoint: 100,
      price: 185000,
      supplier: 'Fresh Meat Corp.',
      origin: 'Việt Nam',
      certifications: ['VietGAP', 'ISO 22000'],
      isPopular: true,
      lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'prod-006',
      sku: 'LAMB-NZ-001',
      name: 'New Zealand Lamb Rack',
      nameVi: 'Sườn cừu New Zealand',
      description: 'Sườn cừu New Zealand, thịt mềm, ít mùi, giàu protein. Chăn nuôi thả rông trên đồng cỏ.',
      image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80',
      unit: 'KG',
      tempClass: 'FROZEN',
      tempRange: '-18°C',
      shelfLifeDays: 365,
      weight: 1.5,
      cubic: 0.005,
      category: 'Thịt',
      subcategory: 'Thịt cừu',
      stockLevel: 150,
      reorderPoint: 40,
      price: 820000,
      supplier: 'Premium Meat Suppliers',
      origin: 'New Zealand',
      certifications: ['Halal', 'Grass Fed'],
      isPopular: false,
      lastRestocked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'prod-007',
      sku: 'MILK-AUS-001',
      name: 'Australian Fresh Milk',
      nameVi: 'Sữa tươi Úc nguyên kem',
      description: 'Sữa tươi Úc 100% nguyên chất, giàu canxi và vitamin D. Không chứa chất bảo quản.',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80',
      unit: 'Lít',
      tempClass: 'CHILL',
      tempRange: '2°C đến 6°C',
      shelfLifeDays: 10,
      weight: 1.03,
      cubic: 0.001,
      category: 'Sữa & Phô mai',
      subcategory: 'Sữa tươi',
      stockLevel: 580,
      reorderPoint: 150,
      price: 45000,
      supplier: 'Premium Dairy Corp.',
      origin: 'Úc',
      certifications: ['Organic', 'Non-GMO'],
      isPopular: true,
      lastRestocked: new Date().toISOString(),
    },
    {
      id: 'prod-008',
      sku: 'CHEESE-FR-001',
      name: 'French Camembert Cheese',
      nameVi: 'Phô mai Camembert Pháp',
      description: 'Phô mai Camembert truyền thống, vị béo ngậy, hương thơm đặc trưng. Làm từ sữa bò tươi.',
      image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&q=80',
      unit: 'KG',
      tempClass: 'CHILL',
      tempRange: '4°C đến 8°C',
      shelfLifeDays: 60,
      weight: 0.25,
      cubic: 0.0005,
      category: 'Sữa & Phô mai',
      subcategory: 'Phô mai',
      stockLevel: 220,
      reorderPoint: 60,
      price: 380000,
      supplier: 'European Dairy Ltd.',
      origin: 'Pháp',
      certifications: ['AOC', 'EU Organic'],
      isPopular: false,
      lastRestocked: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'prod-009',
      sku: 'VEG-MIX-001',
      name: 'Mixed Vegetables Pack',
      nameVi: 'Rau củ đông lạnh hỗn hợp',
      description: 'Hỗn hợp rau củ đông lạnh: cà rốt, đậu Hà Lan, ngô, đậu que. Trồng theo tiêu chuẩn VietGAP.',
      image: 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=800&q=80',
      unit: 'KG',
      tempClass: 'FROZEN',
      tempRange: '-18°C',
      shelfLifeDays: 730,
      weight: 1.0,
      cubic: 0.003,
      category: 'Rau củ',
      subcategory: 'Rau đông lạnh',
      stockLevel: 680,
      reorderPoint: 200,
      price: 65000,
      supplier: 'Asia Vegetables Ltd.',
      origin: 'Đà Lạt, Việt Nam',
      certifications: ['VietGAP', 'GlobalGAP'],
      isPopular: true,
      lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'prod-010',
      sku: 'VEG-BRO-001',
      name: 'Organic Broccoli',
      nameVi: 'Súp lơ xanh hữu cơ',
      description: 'Súp lơ xanh tươi, trồng hữu cơ, giàu vitamin C và chất xơ.',
      image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=800&q=80',
      unit: 'KG',
      tempClass: 'CHILL',
      tempRange: '0°C đến 4°C',
      shelfLifeDays: 14,
      weight: 0.5,
      cubic: 0.002,
      category: 'Rau củ',
      subcategory: 'Rau tươi',
      stockLevel: 340,
      reorderPoint: 100,
      price: 85000,
      supplier: 'Organic Farm Co.',
      origin: 'Đà Lạt, Việt Nam',
      certifications: ['Organic', 'VietGAP'],
      isPopular: false,
      lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'prod-011',
      sku: 'FRUIT-BER-001',
      name: 'Mixed Berries Premium',
      nameVi: 'Trái cây họ berry đông lạnh',
      description: 'Hỗn hợp dâu tây, việt quất, mâm xôi đông lạnh cao cấp. Giàu chất chống oxi hóa.',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80',
      unit: 'KG',
      tempClass: 'FROZEN',
      tempRange: '-18°C đến -20°C',
      shelfLifeDays: 730,
      weight: 1.0,
      cubic: 0.003,
      category: 'Trái cây',
      subcategory: 'Trái cây đông lạnh',
      stockLevel: 290,
      reorderPoint: 80,
      price: 320000,
      supplier: 'Premium Fruits Import',
      origin: 'Mỹ',
      certifications: ['USDA Organic', 'Non-GMO'],
      isPopular: true,
      lastRestocked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'prod-012',
      sku: 'FRUIT-MAN-001',
      name: 'Mango Chunks Frozen',
      nameVi: 'Xoài cắt lát đông lạnh',
      description: 'Xoài cắt lát đông lạnh, giữ nguyên vị ngọt tự nhiên.',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80',
      unit: 'KG',
      tempClass: 'FROZEN',
      tempRange: '-18°C',
      shelfLifeDays: 365,
      weight: 1.0,
      cubic: 0.003,
      category: 'Trái cây',
      subcategory: 'Trái cây đông lạnh',
      stockLevel: 410,
      reorderPoint: 120,
      price: 95000,
      supplier: 'Tropical Fruits Co.',
      origin: 'Việt Nam',
      certifications: ['VietGAP'],
      isPopular: true,
      lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Find product or return first one as fallback
  const product = products.find(p => p.id === productId) || products[0]
  return product
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product-detail', productId],
    queryFn: () => fetchProductDetail(productId || ''),
  })

  // Calculate stats
  const stats = useMemo(() => {
    if (!product) return null

    const stockPercentage = (product.stockLevel / (product.reorderPoint * 3)) * 100
    let stockStatus: 'low' | 'medium' | 'good' = 'good'
    if (product.stockLevel <= product.reorderPoint) {
      stockStatus = 'low'
    } else if (stockPercentage <= 50) {
      stockStatus = 'medium'
    }

    const daysInStock = Math.floor((Date.now() - new Date(product.lastRestocked).getTime()) / (1000 * 60 * 60 * 24))
    const totalValue = product.stockLevel * product.price

    return {
      stockStatus,
      stockPercentage: Math.min(stockPercentage, 100),
      daysInStock,
      totalValue,
    }
  }, [product])

  const getTempConfig = (tempClass: string) => {
    const configs = {
      FROZEN: { icon: '🧊', label: 'Đông lạnh', color: 'from-purple-400 to-pink-400' },
      CHILL: { icon: '❄️', label: 'Mát', color: 'from-blue-400 to-cyan-400' },
      DRY: { icon: '📦', label: 'Khô', color: 'from-orange-400 to-amber-400' },
    }
    return configs[tempClass as keyof typeof configs] || configs.DRY
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải chi tiết sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Không tìm thấy sản phẩm</p>
        </div>
      </div>
    )
  }

  const tempConfig = getTempConfig(product.tempClass)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/products')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Chi tiết sản phẩm
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Thông tin đầy đủ về {product.nameVi}
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/products/${productId}/edit`)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          <Edit className="w-4 h-4 mr-2" />
          Chỉnh sửa
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image & Basic Info */}
        <div className="space-y-6">
          {/* Product Image */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="relative aspect-square">
              <img
                src={product.image}
                alt={product.nameVi}
                className="w-full h-full object-cover"
              />
              <div className={`absolute top-4 right-4 bg-gradient-to-r ${tempConfig.color} text-white px-4 py-2 rounded-full font-bold shadow-lg`}>
                {tempConfig.icon} {tempConfig.label}
              </div>
              {product.isPopular && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  ⭐ Hot
                </div>
              )}
            </div>
          </Card>

          {/* Stock Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Trạng thái tồn kho
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Tồn kho hiện tại</span>
                  <Badge className={
                    stats?.stockStatus === 'low' ? 'bg-red-500' :
                    stats?.stockStatus === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }>
                    {stats?.stockStatus === 'low' ? 'Sắp hết' :
                     stats?.stockStatus === 'medium' ? 'Thấp' : 'Đủ'}
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {product.stockLevel.toLocaleString()} {product.unit}
                </p>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      stats?.stockStatus === 'low' ? 'bg-red-500' :
                      stats?.stockStatus === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${stats?.stockPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Điểm đặt hàng lại: {product.reorderPoint} {product.unit}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày nhập gần nhất</p>
                  <p className="font-semibold text-sm">
                    {new Date(product.lastRestocked).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-xs text-gray-500">
                    ({stats?.daysInStock} ngày trước)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tổng giá trị</p>
                  <p className="font-bold text-sm text-emerald-600">
                    {stats?.totalValue.toLocaleString()} đ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle & Right Columns - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Info */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {product.nameVi}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">{product.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Giá bán</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {product.price.toLocaleString()}đ
                  </p>
                  <p className="text-sm text-gray-500">/{product.unit}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Mô tả sản phẩm
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* SKU & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Barcode className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-500">Mã SKU</span>
                    </div>
                    <p className="font-mono text-xl font-bold text-gray-900 dark:text-white">
                      {product.sku}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Box className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-500">Danh mục</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {product.category}
                    </p>
                    <p className="text-sm text-gray-500">{product.subcategory}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temperature & Storage */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-blue-600" />
                Điều kiện bảo quản
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                  <Thermometer className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nhiệt độ</p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
                    {product.tempRange}
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                  <Clock className="w-8 h-8 text-amber-600 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hạn sử dụng</p>
                  <p className="text-lg font-bold text-amber-900 dark:text-amber-300">
                    {product.shelfLifeDays} ngày
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4">
                  <Package className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Đơn vị</p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-300">
                    {product.unit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Properties */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center gap-2">
                <Weight className="w-5 h-5 text-purple-600" />
                Thông số vật lý
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6">
                  <Weight className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trọng lượng</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                    {product.weight} kg
                  </p>
                </div>
                <div className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg p-6">
                  <Maximize className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Thể tích</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                    {product.cubic} m³
                  </p>
                </div>
                <div className="text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-6">
                  <DollarSign className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Giá / kg</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                    {Math.round(product.price / product.weight).toLocaleString()}đ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier & Origin */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" />
                Nhà cung cấp & Xuất xứ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-500">Nhà cung cấp</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {product.supplier}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-gray-500">Xuất xứ</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {product.origin}
                  </p>
                </div>
              </div>

              {product.certifications.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold">Chứng nhận</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.certifications.map((cert) => (
                      <Badge
                        key={cert}
                        variant="outline"
                        className="px-4 py-2 text-sm border-2 border-yellow-400 text-yellow-700 dark:text-yellow-400"
                      >
                        <Award className="w-4 h-4 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
