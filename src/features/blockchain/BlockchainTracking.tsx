import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { QRScanner } from '@/components/ui/qr-scanner'
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
  AlertTriangle
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
    <div className="space-y-6 p-6">
      {isScanning && (
        <QRScanner
          onClose={() => setIsScanning(false)}
          onScan={handleScanResult}
          title="Quét mã QR sản phẩm"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Blockchain Tracking
          </h1>
          <p className="text-gray-600 mt-2">
            Xác thực và theo dõi sản phẩm trên blockchain
          </p>
        </div>
        
        {/* Network Status */}
        <Card className="w-64">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Blockchain Network</span>
              <Badge variant={networkStatus.connected ? "default" : "destructive"}>
                {networkStatus.connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            {networkStatus.connected && (
              <div className="mt-2 text-xs text-gray-500">
                Block: #{networkStatus.blockNumber?.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            Xác thực sản phẩm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Nhập mã sản phẩm hoặc quét QR..."
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => setIsScanning(true)}
              className="px-4"
            >
              <Scan className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleVerify()}
              disabled={!productId.trim() || isLoading}
              className="px-6"
            >
              {isLoading ? 'Đang xác thực...' : 'Xác thực'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card className={`border-2 ${verificationResult.verified ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${verificationResult.verified ? 'text-green-700' : 'text-red-700'}`}>
              {verificationResult.verified ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Sản phẩm xác thực thành công
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  Xác thực thất bại
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verificationResult.verified && verificationResult.product ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{verificationResult.product.name}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Batch: {verificationResult.product.batchNumber}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        Sản xuất: {new Date(verificationResult.product.productionDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    
                    {verificationResult.product.expiryDate && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">
                          Hết hạn: {new Date(verificationResult.product.expiryDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                    
                    {verificationResult.product.temperature && (
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">
                          Nhiệt độ: {verificationResult.product.temperature.current}°C 
                          ({verificationResult.product.temperature.min}°C - {verificationResult.product.temperature.max}°C)
                        </span>
                      </div>
                    )}
                    
                    {verificationResult.product.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{verificationResult.product.location.address}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Certifications */}
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Chứng nhận
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {verificationResult.product.certifications.map((cert) => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Blockchain Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Thông tin Blockchain
                  </h3>
                  
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Transaction Hash</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {blockchainService.formatTransaction(verificationResult.product.blockchain.transactionHash).short}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                        onClick={() => window.open(
                          blockchainService.formatTransaction(verificationResult.product!.blockchain.transactionHash).explorer,
                          '_blank'
                        )}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Block Number</span>
                      <div className="text-sm font-mono mt-1">
                        #{verificationResult.product.blockchain.blockNumber.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Timestamp</span>
                      <div className="text-sm mt-1">
                        {new Date(verificationResult.product.blockchain.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-red-600">{verificationResult.error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Supply Chain History */}
      {supplyChainHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Lịch sử chuỗi cung ứng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supplyChainHistory.map((event, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className={`w-8 h-8 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-white`}>
                    {getEventIcon(event.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{event.type}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                      
                      {event.temperature && (
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-3 h-3" />
                          {event.temperature}°C
                        </div>
                      )}
                      
                      {event.notes && (
                        <p className="mt-2 text-gray-700">{event.notes}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          Xác thực bởi: {event.verifiedBy}
                        </span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {blockchainService.formatTransaction(event.transactionHash).short}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}