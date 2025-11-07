import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { blockchainService, type BlockchainProduct } from '@/lib/blockchain'
import {
  Plus,
  Package,
  QrCode,
  Shield,
  Download,
  Upload,
  Calendar,
  MapPin,
  Thermometer,
  Award
} from 'lucide-react'

interface ProductForm {
  name: string
  category: string
  manufacturer: string
  batchNumber: string
  productionDate: string
  expiryDate: string
  temperatureMin: number
  temperatureMax: number
  temperatureCurrent: number
  latitude: number
  longitude: number
  address: string
  certifications: string[]
}

export function BlockchainProductRegistration() {
  const [isLoading, setIsLoading] = useState(false)
  const [registeredProduct, setRegisteredProduct] = useState<BlockchainProduct | null>(null)
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>({
    name: '',
    category: '',
    manufacturer: '',
    batchNumber: '',
    productionDate: '',
    expiryDate: '',
    temperatureMin: 2,
    temperatureMax: 8,
    temperatureCurrent: 4,
    latitude: 21.0285,
    longitude: 105.8542,
    address: 'Hà Nội, Việt Nam',
    certifications: []
  })

  const handleInputChange = (field: keyof ProductForm, value: string | number | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCertificationAdd = (cert: string) => {
    if (cert.trim() && !form.certifications.includes(cert.trim())) {
      setForm(prev => ({
        ...prev,
        certifications: [...prev.certifications, cert.trim()]
      }))
    }
  }

  const handleCertificationRemove = (cert: string) => {
    setForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }))
  }

  const handleRegister = async () => {
    setIsLoading(true)
    try {
      const productData = {
        id: blockchainService.generateProductId(),
        name: form.name,
        category: form.category,
        manufacturer: form.manufacturer,
        batchNumber: form.batchNumber,
        productionDate: form.productionDate,
        expiryDate: form.expiryDate || undefined,
        temperature: {
          min: form.temperatureMin,
          max: form.temperatureMax,
          current: form.temperatureCurrent
        },
        location: {
          latitude: form.latitude,
          longitude: form.longitude,
          address: form.address
        },
        certifications: form.certifications
      }

      const blockchainProduct = await blockchainService.createProductRecord(productData)
      setRegisteredProduct(blockchainProduct)
      
      // Generate QR code
      const qrCode = blockchainService.generateQRCode(blockchainProduct)
      setQrCodeData(qrCode)
      
      // Reset form
      setForm({
        name: '',
        category: '',
        manufacturer: '',
        batchNumber: '',
        productionDate: '',
        expiryDate: '',
        temperatureMin: 2,
        temperatureMax: 8,
        temperatureCurrent: 4,
        latitude: 21.0285,
        longitude: 105.8542,
        address: 'Hà Nội, Việt Nam',
        certifications: []
      })
    } catch (error) {
      console.error('Registration failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (qrCodeData && registeredProduct) {
      const link = document.createElement('a')
      link.download = `QR-${registeredProduct.id}.png`
      link.href = qrCodeData
      link.click()
    }
  }

  const commonCategories = ['Dairy', 'Meat', 'Seafood', 'Vegetables', 'Fruits', 'Pharmaceuticals']
  const commonCertifications = ['HACCP', 'ISO 22000', 'Organic', 'FDA', 'CE', 'GMP']

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Blockchain Product Registration
          </h1>
          <p className="text-gray-600 mt-2">
            Đăng ký sản phẩm mới trên blockchain với QR tracking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Thông tin sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên sản phẩm</label>
                <Input
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nhập tên sản phẩm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Danh mục</label>
                <div className="space-y-2">
                  <Input
                    value={form.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="Nhập danh mục"
                  />
                  <div className="flex flex-wrap gap-1">
                    {commonCategories.map(cat => (
                      <Button
                        key={cat}
                        variant="outline"
                        size="sm"
                        className="text-xs h-6"
                        onClick={() => handleInputChange('category', cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nhà sản xuất</label>
                <Input
                  value={form.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  placeholder="Tên nhà sản xuất"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Số lô</label>
                <Input
                  value={form.batchNumber}
                  onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                  placeholder="Mã lô sản xuất"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Ngày sản xuất
                </label>
                <Input
                  type="date"
                  value={form.productionDate}
                  onChange={(e) => handleInputChange('productionDate', e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Ngày hết hạn
                </label>
                <Input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                />
              </div>
            </div>

            {/* Temperature */}
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Yêu cầu nhiệt độ (°C)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={form.temperatureMin}
                  onChange={(e) => handleInputChange('temperatureMin', Number(e.target.value))}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={form.temperatureMax}
                  onChange={(e) => handleInputChange('temperatureMax', Number(e.target.value))}
                />
                <Input
                  type="number"
                  placeholder="Hiện tại"
                  value={form.temperatureCurrent}
                  onChange={(e) => handleInputChange('temperatureCurrent', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Vị trí
              </label>
              <div className="space-y-2">
                <Input
                  value={form.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Địa chỉ"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Latitude"
                    value={form.latitude}
                    onChange={(e) => handleInputChange('latitude', Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Longitude"
                    value={form.longitude}
                    onChange={(e) => handleInputChange('longitude', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Chứng nhận
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {form.certifications.map(cert => (
                    <Badge
                      key={cert}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleCertificationRemove(cert)}
                    >
                      {cert} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {commonCertifications.map(cert => (
                    <Button
                      key={cert}
                      variant="outline"
                      size="sm"
                      className="text-xs h-6"
                      onClick={() => handleCertificationAdd(cert)}
                    >
                      + {cert}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleRegister}
              disabled={!form.name || !form.manufacturer || !form.batchNumber || isLoading}
              className="w-full"
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký Blockchain'}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {registeredProduct && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Package className="w-5 h-5" />
                Đăng ký thành công
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {registeredProduct.id}
                </div>
                <p className="text-sm text-gray-600">Product ID</p>
              </div>

              {qrCodeData && (
                <div className="text-center space-y-4">
                  <div className="inline-block p-4 bg-white rounded-lg shadow">
                    <img
                      src={qrCodeData}
                      alt="QR Code"
                      className="w-32 h-32 mx-auto"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={downloadQRCode}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Tải QR
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.print()}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      In QR
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  Blockchain Info
                </h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-500">TX Hash:</span>
                    <br />
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {blockchainService.formatTransaction(registeredProduct.blockchain.transactionHash).short}
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-500">Block:</span> #{registeredProduct.blockchain.blockNumber.toLocaleString()}
                  </div>
                  <div>
                    <span className="text-gray-500">Time:</span> {new Date(registeredProduct.blockchain.timestamp).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}