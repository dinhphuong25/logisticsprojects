import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  Package,
  Thermometer,
  Clock,
  Weight,
  Maximize,
  DollarSign,
  FileText,
  MapPin,
  Award,
  Upload,
  X,
} from 'lucide-react'

interface ProductFormData {
  sku: string
  name: string
  nameVi: string
  description: string
  category: string
  subcategory: string
  unit: string
  tempClass: 'FROZEN' | 'CHILL' | 'DRY'
  tempRange: string
  shelfLifeDays: number
  weight: number
  cubic: number
  price: number
  supplier: string
  origin: string
  certifications: string[]
  stockLevel: number
  reorderPoint: number
  image: string
}

// Mock fetch existing product
const fetchProduct = async (productId: string): Promise<ProductFormData> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Return mock data based on productId
  const products: Record<string, ProductFormData> = {
    'prod-001': {
      sku: 'FISH-SAL-001',
      name: 'Norwegian Salmon Fillet',
      nameVi: 'Cá hồi Na Uy phi lê',
      description: 'Cá hồi tươi nhập khẩu từ Na Uy, giàu Omega-3, thịt hồng tươi',
      category: 'Hải sản',
      subcategory: 'Cá tươi',
      unit: 'KG',
      tempClass: 'FROZEN',
      tempRange: '-18°C đến -22°C',
      shelfLifeDays: 365,
      weight: 2.5,
      cubic: 0.008,
      price: 580000,
      supplier: 'Fresh Seafood Co.',
      origin: 'Na Uy',
      certifications: ['MSC', 'ASC', 'HACCP'],
      stockLevel: 450,
      reorderPoint: 100,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
    },
  }

  return products[productId] || products['prod-001']
}

const updateProduct = async (productId: string, data: ProductFormData) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return { success: true, productId, data }
}

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [certInput, setCertInput] = useState('')
  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    nameVi: '',
    description: '',
    category: '',
    subcategory: '',
    unit: 'KG',
    tempClass: 'FROZEN',
    tempRange: '-18°C đến -22°C',
    shelfLifeDays: 365,
    weight: 0,
    cubic: 0,
    price: 0,
    supplier: '',
    origin: '',
    certifications: [],
    stockLevel: 0,
    reorderPoint: 100,
    image: '',
  })

  const { data: existingProduct, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId || ''),
  })

  useEffect(() => {
    if (existingProduct) {
      setFormData(existingProduct)
    }
  }, [existingProduct])

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) => updateProduct(productId || '', data),
    onSuccess: () => {
      toast.success('Cập nhật sản phẩm thành công!', {
        description: `${formData.nameVi} đã được cập nhật`,
      })
      setTimeout(() => navigate(`/products/${productId}`), 1000)
    },
    onError: () => {
      toast.error('Không thể cập nhật sản phẩm', {
        description: 'Vui lòng thử lại sau',
      })
    },
  })

  const handleChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddCertification = () => {
    if (certInput.trim() && !formData.certifications.includes(certInput.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, certInput.trim()],
      }))
      setCertInput('')
    }
  }

  const handleRemoveCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.sku || !formData.nameVi || !formData.category) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    if (formData.price <= 0 || formData.weight <= 0) {
      toast.error('Giá và trọng lượng phải lớn hơn 0')
      return
    }

    updateMutation.mutate(formData)
  }

  const categories = [
    { value: 'Hải sản', subcategories: ['Cá tươi', 'Tôm', 'Mực', 'Hàu sò'] },
    { value: 'Thịt', subcategories: ['Thịt bò', 'Thịt heo', 'Thịt gà', 'Thịt cừu'] },
    { value: 'Sữa & Phô mai', subcategories: ['Sữa tươi', 'Phô mai', 'Bơ', 'Sữa chua'] },
    { value: 'Rau củ', subcategories: ['Rau tươi', 'Rau đông lạnh', 'Củ quả'] },
    { value: 'Trái cây', subcategories: ['Trái cây tươi', 'Trái cây đông lạnh'] },
  ]

  const suppliers = [
    'Fresh Seafood Co.',
    'Global Meat Import',
    'Premium Dairy Corp.',
    'Asia Vegetables Ltd.',
    'Tropical Fruits Co.',
    'Ocean Fresh Import',
  ]

  const tempRanges = {
    FROZEN: ['-18°C đến -22°C', '-20°C đến -25°C', '-18°C'],
    CHILL: ['0°C đến 4°C', '2°C đến 6°C', '4°C đến 8°C'],
    DRY: ['15°C đến 25°C', 'Nhiệt độ phòng'],
  }

  const sampleImages = [
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80',
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&q=80',
    'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
    'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&q=80',
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
    'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&q=80',
    'https://images.unsplash.com/photo-1582515073490-39981397c445?w=400&q=80',
    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80',
  ]

  const getTempIcon = (temp: string) => {
    const icons = { FROZEN: '🧊', CHILL: '❄️', DRY: '📦' }
    return icons[temp as keyof typeof icons]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/products/${productId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Chỉnh sửa sản phẩm
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Cập nhật thông tin cho {formData.nameVi}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mã SKU <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="VD: FISH-SAL-001"
                      value={formData.sku}
                      onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                      required
                      disabled
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">SKU không thể thay đổi</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tên tiếng Việt <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="VD: Cá hồi Na Uy phi lê"
                      value={formData.nameVi}
                      onChange={(e) => handleChange('nameVi', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tên tiếng Anh
                  </label>
                  <Input
                    placeholder="VD: Norwegian Salmon Fillet"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mô tả sản phẩm
                  </label>
                  <textarea
                    className="w-full min-h-[100px] px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    placeholder="Mô tả chi tiết về sản phẩm..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full h-10 px-3 border rounded-lg bg-white dark:bg-gray-800"
                      value={formData.category}
                      onChange={(e) => {
                        handleChange('category', e.target.value)
                        handleChange('subcategory', '')
                      }}
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Danh mục con
                    </label>
                    <select
                      className="w-full h-10 px-3 border rounded-lg bg-white dark:bg-gray-800"
                      value={formData.subcategory}
                      onChange={(e) => handleChange('subcategory', e.target.value)}
                      disabled={!formData.category}
                    >
                      <option value="">Chọn danh mục con</option>
                      {categories
                        .find((c) => c.value === formData.category)
                        ?.subcategories.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Temperature & Storage */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-purple-600" />
                  Nhiệt độ & Bảo quản
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Loại nhiệt độ <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['FROZEN', 'CHILL', 'DRY'] as const).map((temp) => (
                        <button
                          key={temp}
                          type="button"
                          onClick={() => {
                            handleChange('tempClass', temp)
                            handleChange('tempRange', tempRanges[temp][0])
                          }}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            formData.tempClass === temp
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{getTempIcon(temp)}</div>
                          <div className="text-xs font-medium">
                            {temp === 'FROZEN' ? 'Đông lạnh' : temp === 'CHILL' ? 'Mát' : 'Khô'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Khoảng nhiệt độ
                    </label>
                    <select
                      className="w-full h-10 px-3 border rounded-lg bg-white dark:bg-gray-800"
                      value={formData.tempRange}
                      onChange={(e) => handleChange('tempRange', e.target.value)}
                    >
                      {tempRanges[formData.tempClass].map((range) => (
                        <option key={range} value={range}>
                          {range}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      HSD (ngày)
                    </label>
                    <Input
                      type="number"
                      value={formData.shelfLifeDays}
                      onChange={(e) => handleChange('shelfLifeDays', parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical Properties */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Weight className="w-5 h-5 text-green-600" />
                  Thông số vật lý
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Đơn vị tính
                    </label>
                    <select
                      className="w-full h-10 px-3 border rounded-lg bg-white dark:bg-gray-800"
                      value={formData.unit}
                      onChange={(e) => handleChange('unit', e.target.value)}
                    >
                      <option value="KG">KG</option>
                      <option value="Lít">Lít</option>
                      <option value="Thùng">Thùng</option>
                      <option value="Cái">Cái</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Trọng lượng (kg)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Maximize className="w-4 h-4 inline mr-1" />
                      Thể tích (m³)
                    </label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.cubic}
                      onChange={(e) => handleChange('cubic', parseFloat(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Giá (VNĐ)
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleChange('price', parseInt(e.target.value))}
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supplier & Origin */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Nhà cung cấp & Xuất xứ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nhà cung cấp
                    </label>
                    <select
                      className="w-full h-10 px-3 border rounded-lg bg-white dark:bg-gray-800"
                      value={formData.supplier}
                      onChange={(e) => handleChange('supplier', e.target.value)}
                    >
                      <option value="">Chọn nhà cung cấp</option>
                      {suppliers.map((sup) => (
                        <option key={sup} value={sup}>
                          {sup}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Xuất xứ
                    </label>
                    <Input
                      placeholder="VD: Na Uy, Úc, Việt Nam..."
                      value={formData.origin}
                      onChange={(e) => handleChange('origin', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    <Award className="w-4 h-4 inline mr-1" />
                    Chứng nhận
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Thêm chứng nhận..."
                      value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertification())}
                    />
                    <Button type="button" onClick={handleAddCertification}>
                      Thêm
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.certifications.map((cert) => (
                      <Badge
                        key={cert}
                        variant="outline"
                        className="px-3 py-1 flex items-center gap-2"
                      >
                        {cert}
                        <button
                          type="button"
                          onClick={() => handleRemoveCertification(cert)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Image & Stock */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card className="border-0 shadow-lg sticky top-6">
              <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-pink-600" />
                  Hình ảnh sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    URL hình ảnh
                  </label>
                  <Input
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => handleChange('image', e.target.value)}
                  />
                </div>

                {formData.image && (
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400?text=No+Image'
                      }}
                    />
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-2">Hoặc chọn ảnh mẫu:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {sampleImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleChange('image', img)}
                        className={`aspect-square rounded border-2 overflow-hidden hover:border-blue-500 transition-colors ${
                          formData.image === img ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img src={img} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Thông tin tồn kho
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Số lượng hiện tại
                  </label>
                  <Input
                    type="number"
                    value={formData.stockLevel}
                    onChange={(e) => handleChange('stockLevel', parseInt(e.target.value))}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Điểm đặt hàng lại
                  </label>
                  <Input
                    type="number"
                    value={formData.reorderPoint}
                    onChange={(e) => handleChange('reorderPoint', parseInt(e.target.value))}
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cảnh báo khi tồn kho thấp hơn giá trị này
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/products/${productId}`)}
                className="w-full"
              >
                Hủy bỏ
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
