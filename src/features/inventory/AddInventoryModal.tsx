import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { toast } from 'sonner'
import { X, Plus, Package, MapPin, Calendar, Hash, Barcode } from 'lucide-react'

interface AddInventoryModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Product {
  id: string
  sku: string
  name: string
  nameVi: string
  tempClass: string
}

interface Location {
  id: string
  code: string
  zoneId: string
  status: string
  currentQty: number
  maxQty: number
}

interface Zone {
  id: string
  name: string
  type: string
}

export function AddInventoryModal({ isOpen, onClose }: AddInventoryModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    productId: '',
    locationId: '',
    lotNo: '',
    mfgDate: '',
    expDate: '',
    qty: '',
    originCountry: 'VN',
    supplier: '',
  })

  // Fetch products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await apiClient.get('/products')
      return res.data
    },
    enabled: isOpen,
  })

  // Fetch locations
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const res = await apiClient.get('/locations')
      return res.data
    },
    enabled: isOpen,
  })

  // Fetch zones
  const { data: zones = [] } = useQuery<Zone[]>({
    queryKey: ['zones'],
    queryFn: async () => {
      const res = await apiClient.get('/zones')
      return res.data
    },
    enabled: isOpen,
  })

  const addInventoryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // First, create or find the lot
      const lotData = {
        productId: data.productId,
        lotNo: data.lotNo,
        mfgDate: data.mfgDate,
        expDate: data.expDate,
        originCountry: data.originCountry,
        supplier: data.supplier,
        totalQty: parseInt(data.qty),
        availableQty: parseInt(data.qty),
        allocatedQty: 0,
        status: 'AVAILABLE',
      }

      const lotRes = await apiClient.post('/lots', lotData)
      const lot = lotRes.data

      // Then create inventory entry
      const inventoryData = {
        lotId: lot.id,
        locationId: data.locationId,
        qty: parseInt(data.qty),
        updatedAt: new Date().toISOString(),
      }

      await apiClient.post('/inventory', inventoryData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      toast.success('✅ Đã thêm sản phẩm vào tồn kho thành công!', {
        description: `${formData.qty} kg đã được thêm vào vị trí`,
      })
      onClose()
      resetForm()
    },
    onError: (error) => {
      toast.error('❌ Không thể thêm sản phẩm', {
        description: error instanceof Error ? error.message : 'Vui lòng thử lại',
      })
    },
  })

  const resetForm = () => {
    setFormData({
      productId: '',
      locationId: '',
      lotNo: '',
      mfgDate: '',
      expDate: '',
      qty: '',
      originCountry: 'VN',
      supplier: '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.productId) {
      toast.error('Vui lòng chọn sản phẩm')
      return
    }
    if (!formData.locationId) {
      toast.error('Vui lòng chọn vị trí')
      return
    }
    if (!formData.lotNo) {
      toast.error('Vui lòng nhập mã lô')
      return
    }
    if (!formData.qty || parseInt(formData.qty) <= 0) {
      toast.error('Vui lòng nhập số lượng hợp lệ')
      return
    }

    const location = locations.find(l => l.id === formData.locationId)
    if (location) {
      const newTotal = location.currentQty + parseInt(formData.qty)
      if (newTotal > location.maxQty) {
        toast.error('⚠️ Vượt quá dung lượng vị trí', {
          description: `Vị trí chỉ còn trống ${location.maxQty - location.currentQty} kg`,
        })
        return
      }
    }

    addInventoryMutation.mutate(formData)
  }

  const selectedLocation = locations.find(l => l.id === formData.locationId)
  const selectedProduct = products.find(p => p.id === formData.productId)

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Thêm sản phẩm vào kho
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nhập thông tin sản phẩm và vị trí lưu trữ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Package className="w-4 h-4 text-blue-600" />
              Sản phẩm <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 transition-all"
              required
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  [{product.sku}] {product.nameVi} ({product.tempClass})
                </option>
              ))}
            </select>
            {selectedProduct && (
              <p className="text-xs text-gray-500 ml-1">
                🌡️ Loại: {selectedProduct.tempClass === 'FROZEN' ? 'Đông lạnh' : 'Mát'}
              </p>
            )}
          </div>

          {/* Location Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-green-600" />
              Vị trí lưu trữ <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 transition-all"
              required
            >
              <option value="">-- Chọn vị trí --</option>
              {locations
                .filter(loc => loc.status !== 'BLOCKED')
                .map((location) => {
                  const zone = zones.find(z => z.id === location.zoneId)
                  const available = location.maxQty - location.currentQty
                  return (
                    <option key={location.id} value={location.id}>
                      {location.code} - {zone?.name} (Còn trống: {available} kg)
                    </option>
                  )
                })}
            </select>
            {selectedLocation && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-500">
                  📦 Dung lượng: {selectedLocation.currentQty}/{selectedLocation.maxQty} kg
                </span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                    style={{ width: `${(selectedLocation.currentQty / selectedLocation.maxQty) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Lot Number */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Barcode className="w-4 h-4 text-purple-600" />
                Mã lô <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.lotNo}
                onChange={(e) => setFormData({ ...formData, lotNo: e.target.value })}
                placeholder="LOT-20251105-001"
                className="border-2"
                required
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Hash className="w-4 h-4 text-orange-600" />
                Số lượng (kg) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                placeholder="1000"
                min="1"
                className="border-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Manufacturing Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4 text-blue-600" />
                Ngày sản xuất
              </label>
              <Input
                type="date"
                value={formData.mfgDate}
                onChange={(e) => setFormData({ ...formData, mfgDate: e.target.value })}
                className="border-2"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4 text-red-600" />
                Hạn sử dụng
              </label>
              <Input
                type="date"
                value={formData.expDate}
                onChange={(e) => setFormData({ ...formData, expDate: e.target.value })}
                className="border-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Origin Country */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Xuất xứ
              </label>
              <Input
                type="text"
                value={formData.originCountry}
                onChange={(e) => setFormData({ ...formData, originCountry: e.target.value })}
                placeholder="VN"
                className="border-2"
              />
            </div>

            {/* Supplier */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Nhà cung cấp
              </label>
              <Input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="ABC Company"
                className="border-2"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={addInventoryMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              disabled={addInventoryMutation.isPending}
            >
              {addInventoryMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm vào kho
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
