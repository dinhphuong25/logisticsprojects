import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera, QrCode, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from './button'
import { toast } from 'sonner'

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
  title?: string
}

export function QRScanner({ onScan, onClose, title = 'Quét mã QR/Barcode' }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(
            devices.map((device) => ({
              id: device.id,
              label: device.label || `Camera ${device.id}`,
            }))
          )
          // Auto-select rear camera if available
          const rearCamera = devices.find((device) =>
            device.label.toLowerCase().includes('back')
          )
          setSelectedCamera(rearCamera?.id || devices[0].id)
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err)
        toast.error('Không thể truy cập camera')
      })

    return () => {
      stopScanning()
    }
  }, [])

  const startScanning = async () => {
    if (!selectedCamera) {
      toast.error('Vui lòng chọn camera')
      return
    }

    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Success callback
          toast.success(`Đã quét: ${decodedText}`)
          onScan(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // Error callback (can be ignored for continuous scanning)
          console.log('Scanning...', errorMessage)
        }
      )

      setIsScanning(true)
    } catch (err) {
      console.error('Error starting scanner:', err)
      toast.error('Không thể khởi động camera')
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        scannerRef.current = null
        setIsScanning(false)
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
  }

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-500">Hướng camera vào mã QR hoặc barcode</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Camera Selection */}
        {!isScanning && cameras.length > 1 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn camera:
            </label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Scanner Container */}
        <div ref={videoContainerRef} className="relative bg-black">
          <div id="qr-reader" className="w-full"></div>

          {/* Overlay */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner markers */}
              <div className="absolute top-1/4 left-1/4 w-16 h-16 border-t-4 border-l-4 border-blue-500"></div>
              <div className="absolute top-1/4 right-1/4 w-16 h-16 border-t-4 border-r-4 border-blue-500"></div>
              <div className="absolute bottom-1/4 left-1/4 w-16 h-16 border-b-4 border-l-4 border-blue-500"></div>
              <div className="absolute bottom-1/4 right-1/4 w-16 h-16 border-b-4 border-r-4 border-blue-500"></div>

              {/* Scanning line animation */}
              <div className="absolute top-1/4 left-1/4 right-1/4 h-0.5 bg-blue-500 animate-pulse"></div>
            </div>
          )}

          {/* Fullscreen button */}
          {isScanning && (
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-white" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white" />
              )}
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            {!isScanning ? (
              <Button
                onClick={startScanning}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Camera className="w-5 h-5 mr-2" />
                Bắt đầu quét
              </Button>
            ) : (
              <Button
                onClick={stopScanning}
                variant="outline"
                className="flex-1 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Dừng quét
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>

          {/* Tips */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-300 font-medium">
              💡 Mẹo: Đảm bảo mã trong khung hình và đủ ánh sáng
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
