import { useState, useEffect, useRef } from 'react'
// import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Box,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Thermometer,
  Package,
  AlertTriangle,
  Video,
  Users,
  Truck,
  Activity,
  Eye,
  MapPin,
  UserCheck,
  Camera,
  Radio,
} from 'lucide-react'

interface Zone {
  id: string
  name: string
  type: string
  tempMin: number
  tempMax: number
  capacity: number
  used: number
}

interface Worker {
  id: string
  name: string
  position: { x: number; y: number }
  status: 'active' | 'idle' | 'break'
  task: string
}

interface CameraView {
  id: string
  name: string
  position: { x: number; y: number }
  angle: number
  status: 'online' | 'offline'
}

interface ActivityLog {
  id: string
  type: 'inbound' | 'outbound' | 'movement' | 'alert'
  zone: string
  timestamp: string
  description: string
}

export default function WarehouseVisualizationPage() {
  // const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d')
  const [rotation, setRotation] = useState({ x: 30, y: 45 })
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showCameras, setShowCameras] = useState(true)
  const [showWorkers, setShowWorkers] = useState(true)
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Mock data cho workers
  const [workers, setWorkers] = useState<Worker[]>([
    { id: 'w1', name: 'Nguyễn Văn A', position: { x: 150, y: 200 }, status: 'active', task: 'Picking Order #001' },
    { id: 'w2', name: 'Trần Thị B', position: { x: 450, y: 300 }, status: 'active', task: 'Loading Truck #5' },
    { id: 'w3', name: 'Lê Văn C', position: { x: 300, y: 450 }, status: 'idle', task: 'Standby' },
  ])

  // Mock data cho cameras
  const [cameras] = useState<CameraView[]>([
    { id: 'cam1', name: 'Camera 1 - Entrance', position: { x: 100, y: 100 }, angle: 45, status: 'online' },
    { id: 'cam2', name: 'Camera 2 - Zone A', position: { x: 250, y: 250 }, angle: 90, status: 'online' },
    { id: 'cam3', name: 'Camera 3 - Zone B', position: { x: 400, y: 250 }, angle: 180, status: 'online' },
    { id: 'cam4', name: 'Camera 4 - Loading Bay', position: { x: 550, y: 400 }, angle: 270, status: 'offline' },
  ])

  // Mock activities - Real-time updates
  const [activities, setActivities] = useState<ActivityLog[]>([
    { id: '1', type: 'inbound', zone: 'Zone A', timestamp: new Date().toISOString(), description: 'Receiving Order IB-001' },
    { id: '2', type: 'outbound', zone: 'Zone B', timestamp: new Date().toISOString(), description: 'Shipping Order OB-002' },
  ])

  const { data: zones = [] } = useQuery<Zone[]>({
    queryKey: ['zones'],
    queryFn: async () => {
      const response = await apiClient.get('/zones')
      return response.data
    },
  })

  // Animate workers moving
  useEffect(() => {
    const animateWorkers = () => {
      setWorkers((prev) =>
        prev.map((worker) => {
          // Boundary limits
          const newX = Math.max(50, Math.min(650, worker.position.x + (Math.random() - 0.5) * 5))
          const newY = Math.max(50, Math.min(550, worker.position.y + (Math.random() - 0.5) * 5))
          
          return {
            ...worker,
            position: { x: newX, y: newY },
          }
        })
      )
    }

    const interval = setInterval(animateWorkers, 500)
    return () => clearInterval(interval)
  }, [])

  // Simulate real-time activities
  useEffect(() => {
    const addActivity = () => {
      const types: ActivityLog['type'][] = ['inbound', 'outbound', 'movement', 'alert']
      const activities_desc = [
        'Forklift moving pallets',
        'Temperature check completed',
        'New shipment arrived',
        'Loading truck departing',
        'Inventory count in progress',
        'Worker safety check',
      ]
      
      const newActivity: ActivityLog = {
        id: Date.now().toString(),
        type: types[Math.floor(Math.random() * types.length)],
        zone: `Zone ${String.fromCharCode(65 + Math.floor(Math.random() * 2))}`,
        timestamp: new Date().toISOString(),
        description: activities_desc[Math.floor(Math.random() * activities_desc.length)],
      }

      setActivities((prev) => [newActivity, ...prev].slice(0, 10))
    }

    const interval = setInterval(addActivity, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#f8fafc')
      gradient.addColorStop(1, '#e2e8f0')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      // Draw warehouse zones with 3D effect
      zones.forEach((zone, index) => {
        const x = 100 + (index % 2) * 300
        const y = 150 + Math.floor(index / 2) * 250
        const width = 250
        const height = 200
        const depth = 30

        // 3D shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
        ctx.beginPath()
        ctx.moveTo(x + depth, y - depth)
        ctx.lineTo(x + width + depth, y - depth)
        ctx.lineTo(x + width, y)
        ctx.lineTo(x, y)
        ctx.closePath()
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(x + width, y)
        ctx.lineTo(x + width + depth, y - depth)
        ctx.lineTo(x + width + depth, y + height - depth)
        ctx.lineTo(x + width, y + height)
        ctx.closePath()
        ctx.fill()

        // Zone box with activity animation
        const utilization = (zone.used / zone.capacity) * 100
        let color = '#10b981'
        if (utilization > 80) color = '#ef4444'
        else if (utilization > 50) color = '#f59e0b'

        // Pulsing effect when activity detected
        const hasActivity = activities.some((a) => a.zone === zone.name && Date.now() - new Date(a.timestamp).getTime() < 10000)
        const pulse = hasActivity ? Math.sin(Date.now() / 300) * 0.15 + 0.85 : 1

        ctx.fillStyle = color + '30'
        ctx.fillRect(x, y, width, height)
        
        if (hasActivity) {
          ctx.fillStyle = color + '40'
          ctx.fillRect(x, y, width, height)
        }

        ctx.strokeStyle = color
        ctx.lineWidth = 3 * pulse
        ctx.strokeRect(x, y, width, height)

        // Zone label with icon
        ctx.fillStyle = '#1f2937'
        ctx.font = 'bold 18px Inter'
        ctx.fillText(zone.type === 'FROZEN' ? '🧊' : '❄️', x + 10, y + 30)
        ctx.fillText(zone.name, x + 40, y + 30)

        // Temperature with animated indicator
        ctx.fillStyle = '#6b7280'
        ctx.font = '13px Inter'
        ctx.fillText(`🌡️ ${zone.tempMin}°C ~ ${zone.tempMax}°C`, x + 10, y + 55)

        // Animated capacity bar
        const barY = y + 70
        ctx.fillStyle = '#e5e7eb'
        ctx.fillRect(x + 10, barY, width - 20, 25)
        
        const barWidth = (width - 20) * (utilization / 100)
        const barGradient = ctx.createLinearGradient(x + 10, 0, x + 10 + barWidth, 0)
        barGradient.addColorStop(0, color)
        barGradient.addColorStop(1, color + 'cc')
        ctx.fillStyle = barGradient
        ctx.fillRect(x + 10, barY, barWidth, 25)

        // Capacity text
        ctx.fillStyle = '#1f2937'
        ctx.font = 'bold 13px Inter'
        ctx.fillText(`${utilization.toFixed(0)}% Full`, x + 10, barY + 40)
        ctx.font = '11px Inter'
        ctx.fillStyle = '#6b7280'
        ctx.fillText(`${zone.used} / ${zone.capacity} units`, x + 10, barY + 55)

        // Activity pulse indicator
        if (hasActivity) {
          const pulseSize = Math.sin(Date.now() / 200) * 5 + 15
          ctx.fillStyle = '#3b82f6'
          ctx.beginPath()
          ctx.arc(x + width - 30, y + 30, pulseSize, 0, Math.PI * 2)
          ctx.fill()
          
          ctx.fillStyle = 'white'
          ctx.font = 'bold 14px Inter'
          ctx.textAlign = 'center'
          ctx.fillText('⚡', x + width - 30, y + 35)
          ctx.textAlign = 'left'
        }
      })

      // Draw camera surveillance zones
      if (showCameras) {
        cameras.forEach((camera) => {
          const { x, y } = camera.position

          // Camera vision cone with gradient
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate((camera.angle * Math.PI) / 180)

          if (camera.status === 'online') {
            const coneGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 180)
            coneGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)')
            coneGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)')
            coneGradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
            ctx.fillStyle = coneGradient
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.arc(0, 0, 180, -Math.PI / 4, Math.PI / 4)
            ctx.closePath()
            ctx.fill()

            // Scanning beam effect
            const scanAngle = (Date.now() / 20) % (Math.PI / 2) - Math.PI / 4
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(Math.cos(scanAngle) * 180, Math.sin(scanAngle) * 180)
            ctx.stroke()
          }

          ctx.restore()

          // Camera device
          ctx.fillStyle = camera.status === 'online' ? '#10b981' : '#ef4444'
          ctx.beginPath()
          ctx.arc(x, y, 18, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = 'white'
          ctx.lineWidth = 3
          ctx.stroke()

          ctx.fillStyle = 'white'
          ctx.font = 'bold 14px Inter'
          ctx.textAlign = 'center'
          ctx.fillText('📷', x, y + 5)
          ctx.textAlign = 'left'

          // Status indicator
          if (camera.status === 'online') {
            const blink = Math.sin(Date.now() / 400) > 0
            if (blink) {
              ctx.fillStyle = 'rgba(16, 185, 129, 0.4)'
              ctx.beginPath()
              ctx.arc(x, y, 25, 0, Math.PI * 2)
              ctx.fill()
            }
          }

          // Camera label
          ctx.fillStyle = '#1f2937'
          ctx.font = '11px Inter'
          ctx.fillText(camera.name.split('-')[0], x - 30, y + 35)
        })
      }

      // Draw workers with animation
      if (showWorkers) {
        workers.forEach((worker) => {
          const { x, y } = worker.position

          // Worker shadow (ellipse)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
          ctx.beginPath()
          ctx.ellipse(x, y + 35, 22, 6, 0, 0, Math.PI * 2)
          ctx.fill()

          // Movement trail effect
          if (worker.status === 'active') {
            for (let i = 0; i < 3; i++) {
              const trailAlpha = 0.2 - i * 0.06
              const trailSize = 25 - i * 3
              ctx.fillStyle = `rgba(16, 185, 129, ${trailAlpha})`
              ctx.beginPath()
              ctx.arc(x, y, trailSize + Math.sin(Date.now() / 200 + i) * 3, 0, Math.PI * 2)
              ctx.fill()
            }
          }

          // Worker circle
          let statusColor = '#10b981'
          if (worker.status === 'idle') statusColor = '#f59e0b'
          if (worker.status === 'break') statusColor = '#ef4444'

          const workerGradient = ctx.createRadialGradient(x, y, 0, x, y, 22)
          workerGradient.addColorStop(0, statusColor)
          workerGradient.addColorStop(1, statusColor + 'cc')
          ctx.fillStyle = workerGradient
          ctx.beginPath()
          ctx.arc(x, y, 22, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = 'white'
          ctx.lineWidth = 3
          ctx.stroke()

          // Worker icon
          ctx.fillStyle = 'white'
          ctx.font = 'bold 18px Inter'
          ctx.textAlign = 'center'
          ctx.fillText('👷', x, y + 6)
          ctx.textAlign = 'left'

          // Activity ripple
          if (worker.status === 'active') {
            const rippleProgress = (Date.now() % 1500) / 1500
            ctx.strokeStyle = `rgba(16, 185, 129, ${1 - rippleProgress})`
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(x, y, 22 + rippleProgress * 35, 0, Math.PI * 2)
            ctx.stroke()
          }

          // Worker name tag
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
          const nameWidth = ctx.measureText(worker.name).width + 10
          ctx.fillRect(x - nameWidth / 2, y - 40, nameWidth, 16)
          ctx.fillStyle = '#1f2937'
          ctx.font = '10px Inter'
          ctx.textAlign = 'center'
          ctx.fillText(worker.name, x, y - 30)
          ctx.textAlign = 'left'
        })
      }

      // Animated forklift/truck
      const truckX = 50 + ((Date.now() / 40) % (canvas.width - 100))
      const truckY = 560
      
      // Truck shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(truckX + 2, truckY + 2, 70, 35)
      
      // Truck body
      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(truckX, truckY, 70, 35)
      ctx.fillStyle = '#2563eb'
      ctx.fillRect(truckX + 50, truckY, 20, 35)
      
      // Truck icon
      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px Inter'
      ctx.fillText('🚛', truckX + 20, truckY + 27)

      // Exhaust animation
      if (Math.floor(Date.now() / 200) % 2 === 0) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'
        ctx.beginPath()
        ctx.arc(truckX + 5, truckY + 17, 6, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [zones, showCameras, showWorkers, cameras, workers, activities])

  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'inbound':
        return <Truck className="w-4 h-4 text-blue-600" />
      case 'outbound':
        return <Package className="w-4 h-4 text-green-600" />
      case 'movement':
        return <Activity className="w-4 h-4 text-purple-600" />
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #1e3a8a, #7c3aed, #db2777)' }}>
            Trực quan hóa kho hàng 3D
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Giám sát thời gian thực với camera và theo dõi nhân viên
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showCameras ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowCameras(!showCameras)}
          >
            <Video className="w-4 h-4 mr-2" />
            Camera
          </Button>
          <Button
            variant={showWorkers ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowWorkers(!showWorkers)}
          >
            <Users className="w-4 h-4 mr-2" />
            Nhân viên
          </Button>
        </div>
      </div>

      {/* Bảng thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Khu vực hoạt động</p>
                <p className="text-2xl font-bold">{zones.length}</p>
              </div>
              <Box className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Camera đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">
                  {cameras.filter((c) => c.status === 'online').length}/{cameras.length}
                </p>
              </div>
              <Video className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nhân viên đang hoạt động</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {workers.filter((w) => w.status === 'active').length}/{workers.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Dung lượng</p>
                <p className="text-2xl font-bold">
                  {zones.length > 0
                    ? Math.round((zones.reduce((sum, z) => sum + z.used, 0) / zones.reduce((sum, z) => sum + z.capacity, 0)) * 100)
                    : 0}%
                </p>
              </div>
              <Package className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hoạt động trực tiếp</p>
                <p className="text-2xl font-bold text-orange-600">{activities.length}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 3D View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-purple-600" />
                  3D Warehouse View
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setRotation({ x: 30, y: 45 })}>
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsFullscreen(!isFullscreen)}>
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={600}
                  className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-inner"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                />
                
                {/* Legend Overlay */}
                <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span className="font-medium">Nhân viên đang làm việc</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span className="font-medium">Camera Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="font-medium">Activity Detected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      <span className="font-medium">Forklift/Truck</span>
                    </div>
                  </div>
                </div>

                {/* View Mode Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-purple-600 text-white">
                    <Eye className="w-3 h-3 mr-1" />
                    3D View
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Camera Feeds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Camera Surveillance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cameras.map((camera) => (
                <div
                  key={camera.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCamera === camera.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedCamera(camera.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span className="font-semibold text-sm">{camera.name}</span>
                    </div>
                    <Badge variant={camera.status === 'online' ? 'default' : 'destructive'} className="text-xs">
                      {camera.status === 'online' ? (
                        <>
                          <Radio className="w-3 h-3 mr-1 animate-pulse" />
                          Live
                        </>
                      ) : (
                        'Offline'
                      )}
                    </Badge>
                  </div>
                  <div className="bg-gray-900 rounded h-24 flex items-center justify-center relative overflow-hidden">
                    {camera.status === 'online' ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50"></div>
                        <div className="text-green-400 text-xs font-semibold z-10">
                          <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4 animate-pulse" />
                            <span>📹 LIVE FEED</span>
                          </div>
                        </div>
                        {/* Scanning line effect */}
                        <div 
                          className="absolute inset-x-0 h-1 bg-green-400/50"
                          style={{
                            top: `${((Date.now() / 20) % 100)}%`,
                            boxShadow: '0 0 10px rgba(74, 222, 128, 0.5)'
                          }}
                        ></div>
                      </>
                    ) : (
                      <div className="text-red-400 text-xs">⚠️ NO SIGNAL</div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Worker Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Worker Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workers.map((worker) => (
                <div key={worker.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        worker.status === 'active' ? 'bg-green-500 animate-pulse' :
                        worker.status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-semibold text-sm">{worker.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {worker.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {worker.task}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <Eye className="w-3 h-3" />
                    Position: ({Math.round(worker.position.x)}, {Math.round(worker.position.y)})
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Live Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-600" />
                Live Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors animate-slide-in">
                  <div className="mt-1">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>{activity.zone}</span>
                      <span>•</span>
                      <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
