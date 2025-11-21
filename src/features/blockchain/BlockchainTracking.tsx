import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { QRScanner } from '@/components/ui/qr-scanner'
import { QRCodeModal } from '@/components/ui/qr-code-modal'
import { blockchainService, type BlockchainProduct } from '@/lib/blockchain'
import {
  Shield,
  Scan,
  ExternalLink,
  Clock,
  MapPin,
  Thermometer,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  Warehouse,
  Eye,
  Award,
  Hash,
  Calendar,
  AlertTriangle,
  Activity,
  Link2,
  Zap,
  TrendingUp,
  FileCheck,
  Fingerprint,
  Search,
  QrCode
} from 'lucide-react'

interface SupplyChainEvent {
  type: 'production' | 'transport' | 'storage' | 'inspection' | 'delivery'
  timestamp: number
  location: string
  temperature?: number
  notes?: string
  verifiedBy: string
  transactionHash: string
}

export function BlockchainTracking() {
  const [productId, setProductId] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean
    product?: BlockchainProduct
    error?: string
  } | null>(null)
  const [supplyChainHistory, setSupplyChainHistory] = useState<SupplyChainEvent[]>([])
  const [networkStatus, setNetworkStatus] = useState<{
    connected: boolean
    chainId?: number
    blockNumber?: number
    gasPrice?: string
  }>({ connected: false })

  useEffect(() => {
    checkNetworkStatus()
  }, [])

  const checkNetworkStatus = async () => {
    const status = await blockchainService.getNetworkStatus()
    setNetworkStatus(status)
  }

  const handleVerify = async (id: string = productId) => {
    if (!id.trim()) return

    setIsLoading(true)
    try {
      const result = await blockchainService.verifyProduct(id)
      setVerificationResult(result)

      if (result.verified && result.product) {
        const history = await blockchainService.getSupplyChainHistory(id)
        setSupplyChainHistory(history.events)
      } else {
        setSupplyChainHistory([])
      }
    } catch {
      setVerificationResult({
        verified: false,
        error: 'Lỗi kết nối blockchain'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleScanResult = (scannedData: string) => {
    try {
      const data = JSON.parse(scannedData)
      if (data.id) {
        setProductId(data.id)
        handleVerify(data.id)
      }
    } catch {
      // If not JSON, treat as plain product ID
      setProductId(scannedData)
      handleVerify(scannedData)
    }
    setIsScanning(false)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'production': return <Package className="w-4 h-4" />
      case 'transport': return <Truck className="w-4 h-4" />
      case 'storage': return <Warehouse className="w-4 h-4" />
      case 'inspection': return <Eye className="w-4 h-4" />
      case 'delivery': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'production': return 'bg-blue-500'
      case 'transport': return 'bg-yellow-500'
      case 'storage': return 'bg-green-500'
      case 'inspection': return 'bg-purple-500'
      case 'delivery': return 'bg-emerald-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {isScanning && (
          <QRScanner
            onClose={() => setIsScanning(false)}
            onScan={handleScanResult}
            title="Quét mã QR sản phẩm"
          />
        )}

        {/* QR Code Modal */}
        {showQRModal && verificationResult?.product && (
          <QRCodeModal
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            productData={{
              id: verificationResult.product.id,
              name: verificationResult.product.name,
              batchNumber: verificationResult.product.batchNumber,
              productionDate: verificationResult.product.productionDate
            }}
          />
        )}

        {/* Hero Header with Premium Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-6 sm:p-8 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Shield className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">Blockchain Tracking</h1>
                    <p className="text-indigo-100 text-base sm:text-lg mt-1">
                      Xác thực và theo dõi sản phẩm trên blockchain
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>Live Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Zap className="w-4 h-4" />
                    <span>Instant Verification</span>
                  </div>
                </div>
              </div>

              {/* Network Status Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 min-w-[260px]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-indigo-100">Blockchain Network</span>
                  <Badge className={`${networkStatus.connected ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
                    {networkStatus.connected ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        Connected
                      </span>
                    ) : (
                      'Disconnected'
                    )}
                  </Badge>
                </div>
                {networkStatus.connected && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-200">Block Height:</span>
                      <span className="font-mono font-bold">#{networkStatus.blockNumber?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-200">Chain ID:</span>
                      <span className="font-mono font-bold">{networkStatus.chainId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-200">Gas Price:</span>
                      <span className="font-mono font-bold text-xs">{networkStatus.gasPrice} Gwei</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Section - Enhanced */}
        <Card className="shadow-xl border-2 border-indigo-100 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Search className="w-5 h-5 text-indigo-600" />
                </div>
                Xác thực sản phẩm
              </CardTitle>
              <Badge className="bg-indigo-600 text-white">
                <Fingerprint className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Nhập mã sản phẩm hoặc quét QR code..."
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="pl-10 h-12 text-base border-2 focus:border-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsScanning(true)}
                  className="px-6 h-12 border-2 hover:bg-indigo-50 hover:border-indigo-300 w-full sm:w-auto"
                >
                  <Scan className="w-5 h-5 mr-2" />
                  Quét QR
                </Button>
                <Button
                  onClick={() => handleVerify()}
                  disabled={!productId.trim() || isLoading}
                  className="px-8 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Activity className="w-5 h-5 mr-2 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Xác thực
                    </>
                  )}
                </Button>
                {verificationResult?.verified && verificationResult.product && (
                  <Button
                    onClick={() => setShowQRModal(true)}
                    className="px-6 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 w-full sm:w-auto"
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    Tạo QR
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span>Nhập mã sản phẩm hoặc quét QR code để xác thực nguồn gốc và lịch sử sản phẩm</span>
            </div>
          </CardContent>
        </Card>

        {/* Verification Result - Premium Design */}
        {verificationResult && (
          <Card className={`border-0 shadow-2xl overflow-hidden ${
            verificationResult.verified 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50' 
              : 'bg-gradient-to-br from-red-50 to-pink-50'
          }`}>
            <CardHeader className={`border-b-2 ${
              verificationResult.verified ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'
            }`}>
              <CardTitle className="flex items-center gap-3 text-white">
                {verificationResult.verified ? (
                  <>
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <CheckCircle className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">Xác thực thành công! ✓</div>
                      <div className="text-sm text-green-100 font-normal">Sản phẩm được xác minh trên blockchain</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">Xác thực thất bại</div>
                      <div className="text-sm text-red-100 font-normal">Không tìm thấy thông tin trên blockchain</div>
                    </div>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-6">
              {verificationResult.verified && verificationResult.product ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Product Info - Left Column */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Product Header */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-100">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {verificationResult.product.name}
                          </h3>
                          <Badge className="bg-green-500 text-white text-sm px-3 py-1">
                            <FileCheck className="w-3 h-3 mr-1" />
                            Verified Product
                          </Badge>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Package className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Batch Number</span>
                          </div>
                          <div className="text-xl font-bold text-blue-900">{verificationResult.product.batchNumber}</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">Ngày sản xuất</span>
                          </div>
                          <div className="text-lg font-bold text-purple-900">
                            {new Date(verificationResult.product.productionDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Temperature & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {verificationResult.product.temperature && (
                        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-100">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Thermometer className="w-5 h-5 text-blue-600" />
                            </div>
                            <h4 className="font-bold text-gray-900">Nhiệt độ</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="text-4xl font-bold text-blue-600">
                              {verificationResult.product.temperature.current}°C
                            </div>
                            <div className="text-sm text-gray-600">
                              Range: {verificationResult.product.temperature.min}°C - {verificationResult.product.temperature.max}°C
                            </div>
                            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                                style={{
                                  width: `${((verificationResult.product.temperature.current - verificationResult.product.temperature.min) / 
                                           (verificationResult.product.temperature.max - verificationResult.product.temperature.min)) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {verificationResult.product.location && (
                        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-100">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <MapPin className="w-5 h-5 text-green-600" />
                            </div>
                            <h4 className="font-bold text-gray-900">Vị trí hiện tại</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-semibold text-gray-900">
                              {verificationResult.product.location.address}
                            </div>
                            <div className="text-xs text-gray-600">
                              Lat: {verificationResult.product.location.latitude}, 
                              Lng: {verificationResult.product.location.longitude}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expiry Date */}
                    {verificationResult.product.expiryDate && (
                      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-yellow-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                              <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">Ngày hết hạn</h4>
                              <div className="text-lg font-semibold text-yellow-700">
                                {new Date(verificationResult.product.expiryDate).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-yellow-500 text-white">
                            {Math.ceil((new Date(verificationResult.product.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} ngày còn lại
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    {/* Certifications */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Award className="w-5 h-5 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-gray-900">Chứng nhận & Tiêu chuẩn</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {verificationResult.product.certifications.map((cert) => (
                          <Badge key={cert} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-4 py-2">
                            <Award className="w-3 h-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Info - Right Column */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-2xl">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                          <Hash className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">Blockchain Data</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                          <span className="text-xs text-indigo-200 uppercase tracking-wide font-semibold">Transaction Hash</span>
                          <div className="flex items-center justify-between gap-2 mt-2">
                            <code className="text-xs bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded font-mono">
                              {blockchainService.formatTransaction(verificationResult.product.blockchain.transactionHash).short}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-white/20 h-8 w-8 p-0"
                              onClick={() => window.open(
                                blockchainService.formatTransaction(verificationResult.product!.blockchain.transactionHash).explorer,
                                '_blank'
                              )}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                          <span className="text-xs text-indigo-200 uppercase tracking-wide font-semibold">Block Number</span>
                          <div className="text-2xl font-bold font-mono mt-2">
                            #{verificationResult.product.blockchain.blockNumber.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                          <span className="text-xs text-indigo-200 uppercase tracking-wide font-semibold">Timestamp</span>
                          <div className="text-sm font-semibold mt-2">
                            {new Date(verificationResult.product.blockchain.timestamp).toLocaleString('vi-VN')}
                          </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Link2 className="w-4 h-4" />
                            <span className="text-xs text-indigo-200 uppercase tracking-wide font-semibold">Product ID</span>
                          </div>
                          <div className="text-lg font-bold font-mono">
                            {verificationResult.product.id}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/20">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Verified on Blockchain Network</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        Quick Stats
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Trạng thái</span>
                          <Badge className="bg-green-500 text-white">Hoạt động</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Verification</span>
                          <Badge className="bg-blue-500 text-white">✓ Verified</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Quality</span>
                          <Badge className="bg-purple-500 text-white">Premium</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 text-lg font-semibold">{verificationResult.error}</p>
                  <p className="text-gray-600 mt-2">Vui lòng kiểm tra lại mã sản phẩm hoặc thử quét QR code</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Supply Chain History - Premium Timeline */}
        {supplyChainHistory.length > 0 && (
          <Card className="shadow-2xl border-0 overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-gray-900 text-white border-b-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">Lịch sử chuỗi cung ứng</div>
                    <div className="text-sm text-slate-300 font-normal">Theo dõi hành trình sản phẩm từ nguồn gốc</div>
                  </div>
                </CardTitle>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-base px-4 py-2">
                  {supplyChainHistory.length} sự kiện
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-8 pb-6">
              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400"></div>
                
                <div className="space-y-6">
                  {supplyChainHistory.map((event, index) => (
                    <div key={index} className="relative pl-16 group">
                      {/* Timeline dot with animation */}
                      <div className={`absolute left-0 w-12 h-12 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 border-white z-10`}>
                        {getEventIcon(event.type)}
                      </div>
                      
                      {/* Event card */}
                      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-bold text-gray-900 capitalize">{event.type}</h4>
                              <Badge className={`${getEventColor(event.type)} text-white border-0`}>
                                Verified
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              {new Date(event.timestamp).toLocaleString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          
                          {/* Event number badge */}
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold text-lg">
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Location */}
                          <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs text-blue-700 font-semibold mb-1">Location</div>
                              <div className="text-sm font-medium text-gray-900">{event.location}</div>
                            </div>
                          </div>
                          
                          {/* Temperature */}
                          {event.temperature && (
                            <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                              <Thermometer className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="text-xs text-orange-700 font-semibold mb-1">Temperature</div>
                                <div className="text-2xl font-bold text-orange-900">{event.temperature}°C</div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Notes */}
                        {event.notes && (
                          <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200 mb-4">
                            <div className="text-sm text-gray-700 leading-relaxed">
                              💬 {event.notes}
                            </div>
                          </div>
                        )}
                        
                        {/* Footer with verifier and transaction */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-green-100 rounded">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Verified by</div>
                              <div className="text-sm font-semibold text-gray-900">{event.verifiedBy}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 rounded">
                              <Hash className="w-4 h-4 text-indigo-600" />
                            </div>
                            <code className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-mono border border-gray-200">
                              {blockchainService.formatTransaction(event.transactionHash).short}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => window.open(
                                blockchainService.formatTransaction(event.transactionHash).explorer,
                                '_blank'
                              )}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary footer */}
              <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-indigo-700 font-semibold">Trạng thái chuỗi cung ứng</div>
                      <div className="text-2xl font-bold text-indigo-900">Hoàn tất & Xác thực</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-indigo-700 mb-1">Tổng thời gian</div>
                    <div className="text-xl font-bold text-indigo-900">
                      {Math.ceil((Date.now() - supplyChainHistory[0].timestamp) / (1000 * 60 * 60 * 24))} ngày
                    </div>
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