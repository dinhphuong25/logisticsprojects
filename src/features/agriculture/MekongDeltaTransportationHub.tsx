import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Ship,
  Truck,
  Navigation,
  MapPin,
  Clock,
  Package,
  Thermometer,
  Droplets,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Fuel,
  Route,
  Calendar,
  Users,
  Star,
  Eye
} from 'lucide-react'

interface TransportRoute {
  id: string
  origin: {
    name: string
    province: string
    coordinates: { lat: number; lng: number }
    type: 'farm' | 'warehouse' | 'market' | 'port'
  }
  destination: {
    name: string
    province: string
    coordinates: { lat: number; lng: number }
    type: 'farm' | 'warehouse' | 'market' | 'port'
  }
  transport: {
    method: 'waterway' | 'road' | 'river_boat' | 'mixed'
    vehicle: string
    capacity: string
    driver: string
    license: string
  }
  cargo: {
    products: Array<{
      name: string
      quantity: number
      unit: string
      temperature: number
      humidity: number
    }>
    totalWeight: number
    value: number
  }
  schedule: {
    departure: string
    arrival: string
    estimated_duration: string
    actual_duration?: string
  }
  status: 'planned' | 'in_transit' | 'delayed' | 'completed' | 'cancelled'
  conditions: {
    temperature: number
    humidity: number
    weather: string
  }
  tracking: {
    currentLocation: string
    progress: number
    nextCheckpoint: string
    alerts: string[]
  }
  costs: {
    fuel: number
    tolls: number
    labor: number
    total: number
  }
  sustainability: {
    co2_emission: number
    fuel_efficiency: number
    route_optimization: number
  }
}

export function MekongDeltaTransportationHub() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedMethod, setSelectedMethod] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [, setSelectedRoute] = useState<TransportRoute | null>(null)

  // Mock transport routes data
  const routes: TransportRoute[] = useMemo(() => [
    {
      id: 'ROUTE-001',
      origin: {
        name: 'Hợp tác xã Thạnh Phú',
        province: 'Sóc Trăng',
        coordinates: { lat: 9.6003, lng: 105.9800 },
        type: 'farm'
      },
      destination: {
        name: 'Chợ đầu mối Hóc Môn',
        province: 'TP.HCM',
        coordinates: { lat: 10.8624, lng: 106.5967 },
        type: 'market'
      },
      transport: {
        method: 'mixed',
        vehicle: 'Sà lan + Xe tải',
        capacity: '25 tấn',
        driver: 'Nguyễn Văn Hải',
        license: '79C-12345'
      },
      cargo: {
        products: [
          { name: 'Gạo ST25', quantity: 20, unit: 'tấn', temperature: 28, humidity: 13 },
          { name: 'Gạo Jasmine', quantity: 5, unit: 'tấn', temperature: 28, humidity: 14 }
        ],
        totalWeight: 25,
        value: 1250000000
      },
      schedule: {
        departure: '2025-11-07T06:00:00',
        arrival: '2025-11-08T14:00:00',
        estimated_duration: '32 giờ'
      },
      status: 'in_transit',
      conditions: {
        temperature: 29,
        humidity: 78,
        weather: 'Nắng ít mây'
      },
      tracking: {
        currentLocation: 'Kênh Vĩnh Tế, An Giang',
        progress: 65,
        nextCheckpoint: 'Cảng Cái Cui',
        alerts: ['Nhiệt độ hàng hóa ổn định']
      },
      costs: {
        fuel: 2500000,
        tolls: 150000,
        labor: 800000,
        total: 3450000
      },
      sustainability: {
        co2_emission: 45.2,
        fuel_efficiency: 8.5,
        route_optimization: 92
      }
    },
    {
      id: 'ROUTE-002',
      origin: {
        name: 'Vườn xoài Minh Châu',
        province: 'Đồng Tháp',
        coordinates: { lat: 10.4583, lng: 105.6344 },
        type: 'farm'
      },
      destination: {
        name: 'Cảng Cát Lái',
        province: 'TP.HCM',
        coordinates: { lat: 10.7442, lng: 106.8138 },
        type: 'port'
      },
      transport: {
        method: 'road',
        vehicle: 'Xe lạnh',
        capacity: '15 tấn',
        driver: 'Lê Minh Tâm',
        license: '67C-67890'
      },
      cargo: {
        products: [
          { name: 'Xoài Cát Chu', quantity: 12, unit: 'tấn', temperature: 12, humidity: 88 },
          { name: 'Xoài Keo', quantity: 3, unit: 'tấn', temperature: 12, humidity: 85 }
        ],
        totalWeight: 15,
        value: 675000000
      },
      schedule: {
        departure: '2025-11-07T20:00:00',
        arrival: '2025-11-08T08:00:00',
        estimated_duration: '12 giờ'
      },
      status: 'planned',
      conditions: {
        temperature: 26,
        humidity: 85,
        weather: 'Mưa nhẹ'
      },
      tracking: {
        currentLocation: 'Đang chuẩn bị',
        progress: 0,
        nextCheckpoint: 'Cầu Cao Lãnh',
        alerts: []
      },
      costs: {
        fuel: 1800000,
        tolls: 320000,
        labor: 600000,
        total: 2720000
      },
      sustainability: {
        co2_emission: 28.6,
        fuel_efficiency: 7.2,
        route_optimization: 88
      }
    },
    {
      id: 'ROUTE-003',
      origin: {
        name: 'Trại nuôi Phú Hưng',
        province: 'An Giang',
        coordinates: { lat: 10.3611, lng: 105.4344 },
        type: 'farm'
      },
      destination: {
        name: 'Nhà máy chế biến Vĩnh Hoàn',
        province: 'An Giang',
        coordinates: { lat: 10.3880, lng: 105.4350 },
        type: 'warehouse'
      },
      transport: {
        method: 'river_boat',
        vehicle: 'Ghe bầu lạnh',
        capacity: '8 tấn',
        driver: 'Phạm Văn Dũng',
        license: 'AG-123'
      },
      cargo: {
        products: [
          { name: 'Cá tra sống', quantity: 8, unit: 'tấn', temperature: 25, humidity: 100 }
        ],
        totalWeight: 8,
        value: 520000000
      },
      schedule: {
        departure: '2025-11-07T05:30:00',
        arrival: '2025-11-07T07:00:00',
        estimated_duration: '1.5 giờ',
        actual_duration: '1.3 giờ'
      },
      status: 'completed',
      conditions: {
        temperature: 27,
        humidity: 92,
        weather: 'Sương mù nhẹ'
      },
      tracking: {
        currentLocation: 'Đã giao hàng',
        progress: 100,
        nextCheckpoint: 'Hoàn thành',
        alerts: ['Giao hàng thành công']
      },
      costs: {
        fuel: 200000,
        tolls: 0,
        labor: 150000,
        total: 350000
      },
      sustainability: {
        co2_emission: 5.2,
        fuel_efficiency: 12.8,
        route_optimization: 95
      }
    }
  ], [])

  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      const matchesStatus = selectedStatus === 'all' || route.status === selectedStatus
      const matchesMethod = selectedMethod === 'all' || route.transport.method === selectedMethod
      const matchesSearch = searchTerm === '' || 
        route.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.origin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.transport.driver.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesStatus && matchesMethod && matchesSearch
    })
  }, [routes, selectedStatus, selectedMethod, searchTerm])

  const getTransportIcon = (method: string) => {
    switch (method) {
      case 'waterway': return <Ship className="w-5 h-5 text-blue-600" />
      case 'road': return <Truck className="w-5 h-5 text-gray-600" />
      case 'river_boat': return <Navigation className="w-5 h-5 text-teal-600" />
      case 'mixed': return <Route className="w-5 h-5 text-purple-600" />
      default: return <Package className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800'
      case 'in_transit': return 'bg-yellow-100 text-yellow-800'
      case 'delayed': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return 'Đã lên kế hoạch'
      case 'in_transit': return 'Đang vận chuyển'
      case 'delayed': return 'Chậm trễ'
      case 'completed': return 'Hoàn thành'
      case 'cancelled': return 'Đã hủy'
      default: return status
    }
  }



  const stats = useMemo(() => {
    const totalRoutes = filteredRoutes.length
    const inTransit = filteredRoutes.filter(r => r.status === 'in_transit').length
    const completed = filteredRoutes.filter(r => r.status === 'completed').length
    const totalValue = filteredRoutes.reduce((sum, r) => sum + r.cargo.value, 0)
    const avgEfficiency = filteredRoutes.reduce((sum, r) => sum + r.sustainability.fuel_efficiency, 0) / totalRoutes || 0

    return { totalRoutes, inTransit, completed, totalValue, avgEfficiency }
  }, [filteredRoutes])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Ship className="w-8 h-8 text-blue-600" />
            Trung Tâm Vận Tải Đồng Bằng Sông Cửu Long
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý và theo dõi vận chuyển nông sản qua đường thủy và đường bộ
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng tuyến</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalRoutes}</p>
              </div>
              <Route className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang vận chuyển</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inTransit}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Giá trị hàng hóa</p>
                <p className="text-xl font-bold text-purple-600">
                  {(stats.totalValue / 1000000000).toFixed(1)}B đ
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hiệu suất nhiên liệu</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.avgEfficiency.toFixed(1)} km/l
                </p>
              </div>
              <Fuel className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Tìm kiếm theo mã tuyến, địa điểm, tài xế..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white min-w-[150px]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="planned">Đã lên kế hoạch</option>
              <option value="in_transit">Đang vận chuyển</option>
              <option value="completed">Hoàn thành</option>
              <option value="delayed">Chậm trễ</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white min-w-[150px]"
            >
              <option value="all">Tất cả phương tiện</option>
              <option value="waterway">Đường thủy</option>
              <option value="road">Đường bộ</option>
              <option value="river_boat">Ghe bầu</option>
              <option value="mixed">Hỗn hợp</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Routes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRoutes.map((route) => (
          <Card key={route.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTransportIcon(route.transport.method)}
                  <div>
                    <CardTitle className="text-lg">{route.id}</CardTitle>
                    <p className="text-sm text-gray-600">{route.transport.vehicle}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(route.status)}>
                  {getStatusText(route.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Route Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Từ:</span>
                  <span>{route.origin.name}, {route.origin.province}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Đến:</span>
                  <span>{route.destination.name}, {route.destination.province}</span>
                </div>
              </div>

              {/* Progress Bar for In Transit */}
              {route.status === 'in_transit' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tiến độ</span>
                    <span>{route.tracking.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${route.tracking.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">
                    Vị trí: {route.tracking.currentLocation}
                  </div>
                </div>
              )}

              {/* Cargo Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Tổng trọng lượng</div>
                  <div className="font-semibold">{route.cargo.totalWeight} tấn</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Giá trị</div>
                  <div className="font-semibold text-green-600">
                    {(route.cargo.value / 1000000).toLocaleString()} tr
                  </div>
                </div>
              </div>

              {/* Environmental Conditions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="text-xs text-gray-600">Nhiệt độ</div>
                    <div className="font-semibold">{route.conditions.temperature}°C</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-xs text-gray-600">Độ ẩm</div>
                    <div className="font-semibold">{route.conditions.humidity}%</div>
                  </div>
                </div>
              </div>

              {/* Driver & Schedule */}
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>Tài xế: {route.transport.driver}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>
                    Khởi hành: {new Date(route.schedule.departure).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Sustainability Score */}
              <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">Tối ưu tuyến đường</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {route.sustainability.route_optimization}%
                </span>
              </div>

              {/* Alerts */}
              {route.tracking.alerts.length > 0 && (
                <div className="space-y-1">
                  {route.tracking.alerts.map((alert, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      <AlertCircle className="w-3 h-3" />
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedRoute(route)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Chi tiết
                </Button>
                {route.status === 'in_transit' && (
                  <Button variant="outline" size="sm">
                    Theo dõi
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRoutes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Ship className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg font-medium">Không tìm thấy tuyến vận chuyển nào</p>
            <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}