import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { X, Download, Share2, Copy, CheckCircle } from 'lucide-react'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  productData: {
    id: string
    name: string
    batchNumber?: string
    productionDate?: number | string
  }
}

export function QRCodeModal({ isOpen, onClose, productData }: QRCodeModalProps) {
  const [copied, setCopied] = React.useState(false)

  if (!isOpen) return null

  // Create QR code data with all product information
  const qrData = JSON.stringify({
    id: productData.id,
    name: productData.name,
    batch: productData.batchNumber,
    production: productData.productionDate,
    timestamp: Date.now(),
    url: `${window.location.origin}/blockchain?id=${productData.id}`
  })

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = 512
    canvas.height = 512

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, 512, 512)
        ctx.drawImage(img, 0, 0, 512, 512)
        
        const pngFile = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.download = `QR_${productData.id}_${Date.now()}.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/blockchain?id=${productData.id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code - ${productData.name}`,
          text: `Xác thực sản phẩm: ${productData.name}`,
          url: url
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      // Fallback: copy URL
      await navigator.clipboard.writeText(url)
      alert('Link đã được copy vào clipboard!')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-sm mx-4 shadow-2xl border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30 animate-in zoom-in-95 duration-300">
        <CardHeader className="border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative overflow-hidden py-3">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                <Share2 className="w-4 h-4" />
              </div>
              QR Code
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-white/20 text-white h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 pb-4">
          {/* Product Info - Minimal */}
          <div className="mb-3 p-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <h3 className="font-bold text-sm text-indigo-900 mb-1 truncate">{productData.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <code className="bg-white px-1.5 py-0.5 rounded">{productData.id}</code>
              {productData.batchNumber && (
                <code className="bg-white px-1.5 py-0.5 rounded">{productData.batchNumber}</code>
              )}
            </div>
          </div>

          {/* QR Code Display - Compact */}
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white rounded-lg shadow-md border-2 border-indigo-200">
              <QRCodeSVG
                id="qr-code-svg"
                value={qrData}
                size={160}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#4F46E5"
              />
            </div>

            <p className="text-center text-xs text-gray-500">
              Quét mã để xác thực blockchain
            </p>
          </div>

          {/* Action Buttons - Mini */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Button
              onClick={handleDownload}
              className="gap-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs py-1.5 h-auto"
            >
              <Download className="w-3.5 h-3.5" />
              Tải
            </Button>

            <Button
              onClick={handleCopy}
              className="gap-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs py-1.5 h-auto"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  OK
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </Button>

            <Button
              onClick={handleShare}
              className="gap-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs py-1.5 h-auto"
            >
              <Share2 className="w-3.5 h-3.5" />
              Chia sẻ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
