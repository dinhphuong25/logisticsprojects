import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MEKONG_DELTA_CONFIG } from '@/lib/mekong-delta-config'
import {
  Cloud,
  CloudRain,
  Sun,
  Droplets,
  Wind,
  Eye,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  Waves,
  RefreshCw,
  Thermometer,
  Gauge,
  Sunrise,
  Sunset,
  Navigation,
  Zap,
  Activity
} from 'lucide-react'

interface WeatherData {
  province: string
  temperature: {
    current: number
    min: number
    max: number
    feels_like: number
  }
  humidity: number
  rainfall: {
    current: number
    forecast: number[]
  }
  wind: {
    speed: number
    direction: string
  }
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy'
  uv_index: number
  visibility: number
  pressure: number
  season: 'dry' | 'wet'
  agricultural_impact: {
    irrigation_need: 'low' | 'medium' | 'high'
    pest_risk: 'low' | 'medium' | 'high'
    harvest_condition: 'excellent' | 'good' | 'poor'
  }
}

interface CropAdvice {
  crop: string
  advice: string
  action: 'plant' | 'harvest' | 'protect' | 'irrigate' | 'fertilize'
  priority: 'high' | 'medium' | 'low'
}

export function MekongDeltaWeatherMonitoring() {
  const [selectedProvince, setSelectedProvince] = useState('Cần Thơ')
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [alerts, setAlerts] = useState<string[]>([])
  const [cropAdvices, setCropAdvices] = useState<CropAdvice[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Generate realistic weather data with slight variations
  const generateWeatherData = (): WeatherData[] => {
    const baseTemp = 30 + Math.random() * 4
    const timeVariation = Math.sin(Date.now() / 10000) * 2
    
    return [
      {
        province: 'Cần Thơ',
        temperature: { 
          current: Math.round(baseTemp + timeVariation), 
          min: 26, 
          max: 35, 
          feels_like: Math.round(baseTemp + timeVariation + 6) 
        },
        humidity: 75 + Math.round(Math.random() * 10),
        rainfall: { current: 0, forecast: [0, 5, 12, 8, 0, 0, 3] },
        wind: { speed: 10 + Math.round(Math.random() * 5), direction: 'Đông Nam' },
        condition: 'sunny',
        uv_index: 8 + Math.round(Math.random() * 2),
        visibility: 10,
        pressure: 1012 + Math.round(Math.random() * 3),
        season: 'dry',
        agricultural_impact: {
          irrigation_need: 'high',
          pest_risk: 'medium',
          harvest_condition: 'excellent'
        }
      },
      {
        province: 'An Giang',
        temperature: { 
          current: Math.round(baseTemp - 2 + timeVariation), 
          min: 24, 
          max: 33, 
          feels_like: Math.round(baseTemp - 2 + timeVariation + 5) 
        },
        humidity: 80 + Math.round(Math.random() * 8),
        rainfall: { current: 2, forecast: [8, 15, 20, 12, 5, 0, 0] },
        wind: { speed: 6 + Math.round(Math.random() * 5), direction: 'Tây Nam' },
        condition: 'cloudy',
        uv_index: 5 + Math.round(Math.random() * 2),
        visibility: 8,
        pressure: 1010 + Math.round(Math.random() * 3),
        season: 'wet',
        agricultural_impact: {
          irrigation_need: 'low',
          pest_risk: 'high',
          harvest_condition: 'good'
        }
      },
      {
        province: 'Đồng Tháp',
        temperature: { 
          current: Math.round(baseTemp - 1 + timeVariation), 
          min: 25, 
          max: 34, 
          feels_like: Math.round(baseTemp - 1 + timeVariation + 5) 
        },
        humidity: 72 + Math.round(Math.random() * 8),
        rainfall: { current: 0, forecast: [0, 0, 8, 15, 22, 10, 5] },
        wind: { speed: 8 + Math.round(Math.random() * 5), direction: 'Đông' },
        condition: 'sunny',
        uv_index: 7 + Math.round(Math.random() * 2),
        visibility: 12,
        pressure: 1013 + Math.round(Math.random() * 3),
        season: 'dry',
        agricultural_impact: {
          irrigation_need: 'medium',
          pest_risk: 'low',
          harvest_condition: 'excellent'
        }
      },
      {
        province: 'Tiền Giang',
        temperature: { 
          current: Math.round(baseTemp + 1 + timeVariation), 
          min: 26, 
          max: 35, 
          feels_like: Math.round(baseTemp + 1 + timeVariation + 6) 
        },
        humidity: 76 + Math.round(Math.random() * 8),
        rainfall: { current: 0, forecast: [0, 3, 7, 5, 0, 0, 2] },
        wind: { speed: 9 + Math.round(Math.random() * 5), direction: 'Đông Nam' },
        condition: 'sunny',
        uv_index: 8 + Math.round(Math.random() * 2),
        visibility: 11,
        pressure: 1013 + Math.round(Math.random() * 3),
        season: 'dry',
        agricultural_impact: {
          irrigation_need: 'high',
          pest_risk: 'medium',
          harvest_condition: 'excellent'
        }
      },
      {
        province: 'Bến Tre',
        temperature: { 
          current: Math.round(baseTemp + timeVariation), 
          min: 26, 
          max: 34, 
          feels_like: Math.round(baseTemp + timeVariation + 6) 
        },
        humidity: 78 + Math.round(Math.random() * 8),
        rainfall: { current: 0, forecast: [0, 4, 9, 6, 0, 0, 3] },
        wind: { speed: 11 + Math.round(Math.random() * 5), direction: 'Đông' },
        condition: 'sunny',
        uv_index: 8 + Math.round(Math.random() * 2),
        visibility: 10,
        pressure: 1012 + Math.round(Math.random() * 3),
        season: 'dry',
        agricultural_impact: {
          irrigation_need: 'high',
          pest_risk: 'low',
          harvest_condition: 'excellent'
        }
      },
      {
        province: 'Vĩnh Long',
        temperature: { 
          current: Math.round(baseTemp + timeVariation), 
          min: 25, 
          max: 34, 
          feels_like: Math.round(baseTemp + timeVariation + 5) 
        },
        humidity: 74 + Math.round(Math.random() * 8),
        rainfall: { current: 0, forecast: [0, 2, 10, 8, 3, 0, 0] },
        wind: { speed: 10 + Math.round(Math.random() * 5), direction: 'Đông Nam' },
        condition: 'sunny',
        uv_index: 8 + Math.round(Math.random() * 2),
        visibility: 11,
        pressure: 1013 + Math.round(Math.random() * 3),
        season: 'dry',
        agricultural_impact: {
          irrigation_need: 'medium',
          pest_risk: 'low',
          harvest_condition: 'excellent'
        }
      }
    ]
  }

  // Realtime update simulation
  useEffect(() => {
    // Initial load
    const loadWeatherData = () => {
      setIsRefreshing(true)
      const data = generateWeatherData()
      setWeatherData(data)
      setLastUpdate(new Date())
      
      // Mock alerts with dynamic data
      const selectedData = data.find(d => d.province === selectedProvince)
      const newAlerts: string[] = []
      
      if (selectedData && selectedData.temperature.current > 33) {
        newAlerts.push(`⚠️ Cảnh báo nắng nóng tại ${selectedData.province}, nhiệt độ ${selectedData.temperature.current}°C`)
      }
      if (selectedData && selectedData.rainfall.forecast.some(r => r > 15)) {
        newAlerts.push(`🌧️ Dự báo mưa lớn tại ${selectedData.province} trong 3-5 ngày tới`)
      }
      if (selectedData && selectedData.agricultural_impact.harvest_condition === 'excellent') {
        newAlerts.push(`✅ Điều kiện tuyệt vời cho thu hoạch tại ${selectedData.province}`)
      }
      if (selectedData && selectedData.agricultural_impact.pest_risk === 'high') {
        newAlerts.push(`🐛 Cảnh báo nguy cơ sâu bệnh cao tại ${selectedData.province}`)
      }
      
      setAlerts(newAlerts)
      
      // Mock crop advice
      setCropAdvices([
        {
          crop: 'Lúa Đông Xuân',
          advice: 'Thời tiết khô hanh, cần tưới nước đầy đủ cho ruộng lúa',
          action: 'irrigate',
          priority: 'high'
        },
        {
          crop: 'Xoài Cát Chu',
          advice: 'Điều kiện nắng tốt cho việc thu hoạch xoài chín',
          action: 'harvest',
          priority: 'medium'
        },
        {
          crop: 'Cá Tra',
          advice: 'Nhiệt độ nước cao, cần theo dõi chất lượng nước ao nuôi',
          action: 'protect',
          priority: 'high'
        },
        {
          crop: 'Rau màu',
          advice: 'Thời tiết thuận lợi cho việc trồng rau vụ mới',
          action: 'plant',
          priority: 'medium'
        },
        {
          crop: 'Thanh long',
          advice: 'Cần bón phân kali để tăng độ ngọt cho trái',
          action: 'fertilize',
          priority: 'low'
        }
      ])
      
      setTimeout(() => setIsRefreshing(false), 500)
    }

    loadWeatherData()

    // Auto refresh every 30 seconds for realtime feel
    const interval = setInterval(loadWeatherData, 30000)
    
    return () => clearInterval(interval)
  }, [selectedProvince])

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    const data = generateWeatherData()
    setWeatherData(data)
    setLastUpdate(new Date())
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const selectedWeather = weatherData.find(w => w.province === selectedProvince)

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-12 h-12 text-yellow-400 drop-shadow-lg" />
      case 'cloudy': return <Cloud className="w-12 h-12 text-gray-400 drop-shadow-lg" />
      case 'rainy': return <CloudRain className="w-12 h-12 text-blue-400 drop-shadow-lg" />
      default: return <Sun className="w-12 h-12 text-yellow-400 drop-shadow-lg" />
    }
  }

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'Nắng đẹp'
      case 'cloudy': return 'Nhiều mây'
      case 'rainy': return 'Mưa'
      case 'stormy': return 'Bão'
      default: return 'Nắng đẹp'
    }
  }

  const getConditionGradient = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'from-yellow-400 via-orange-400 to-red-400'
      case 'cloudy': return 'from-gray-400 via-gray-500 to-gray-600'
      case 'rainy': return 'from-blue-400 via-blue-500 to-indigo-500'
      default: return 'from-yellow-400 via-orange-400 to-red-400'
    }
  }

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200' 
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'irrigate': return <Droplets className="w-4 h-4" />
      case 'harvest': return <Calendar className="w-4 h-4" />
      case 'protect': return <AlertTriangle className="w-4 h-4" />
      case 'plant': return <Sun className="w-4 h-4" />
      case 'fertilize': return <TrendingUp className="w-4 h-4" />
      default: return <Eye className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-gradient-to-r from-red-50 to-transparent'
      case 'medium': return 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-transparent'
      case 'low': return 'border-l-green-500 bg-gradient-to-r from-green-50 to-transparent'
      default: return 'border-l-gray-500 bg-gradient-to-r from-gray-50 to-transparent'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white p-8 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-10 h-10 animate-pulse" />
                  <h1 className="text-4xl font-bold">Giám Sát Thời Tiết ĐBSCL</h1>
                </div>
                <p className="text-blue-100 text-lg">
                  Theo dõi thời tiết realtime và tác động đến nông nghiệp
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>Live Update</span>
                  </div>
                  <div className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    Cập nhật: {formatTime(lastUpdate)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleManualRefresh}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-white/30"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
                
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="px-4 py-2.5 border-2 border-white/30 rounded-xl bg-white/20 backdrop-blur-sm text-white font-medium min-w-[180px] focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  {MEKONG_DELTA_CONFIG.provinces.map(province => (
                    <option key={province} value={province} className="text-gray-900">
                      {province}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Alerts - Enhanced */}
        {alerts.length > 0 && (
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                Cảnh báo thời tiết
                <Badge className="ml-2 bg-orange-600 text-white">{alerts.length} thông báo</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-orange-100"
                  >
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0 animate-pulse" />
                    <span className="text-sm text-gray-700 font-medium">{alert}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Weather Display - Redesigned */}
        {selectedWeather && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hero Weather Card */}
            <Card className={`lg:col-span-2 overflow-hidden shadow-2xl border-0`}>
              <div className={`bg-gradient-to-br ${getConditionGradient(selectedWeather.condition)} p-8 text-white relative`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-6 h-6" />
                      <h2 className="text-2xl font-bold">{selectedWeather.province}</h2>
                    </div>
                    <Badge className="bg-white/30 backdrop-blur-sm text-white border-white/50">
                      {getConditionText(selectedWeather.condition)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                        {getWeatherIcon(selectedWeather.condition)}
                      </div>
                      <div>
                        <div className="text-7xl font-bold mb-2">
                          {selectedWeather.temperature.current}°
                        </div>
                        <div className="text-xl opacity-90">
                          Cảm giác như {selectedWeather.temperature.feels_like}°C
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Sunrise className="w-5 h-5" />
                        <span className="text-lg">Min: {selectedWeather.temperature.min}°C</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sunset className="w-5 h-5" />
                        <span className="text-lg">Max: {selectedWeather.temperature.max}°C</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 bg-white">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Độ ẩm</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{selectedWeather.humidity}%</div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Gió</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{selectedWeather.wind.speed} km/h</div>
                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {selectedWeather.wind.direction}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Tầm nhìn</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">{selectedWeather.visibility} km</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700">UV Index</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">{selectedWeather.uv_index}</div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-700">Áp suất</span>
                    </div>
                    <div className="text-2xl font-bold text-indigo-900">{selectedWeather.pressure} hPa</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Mùa</span>
                    </div>
                    <div className="text-lg font-bold text-green-900">
                      {selectedWeather.season === 'dry' ? '🌞 Khô' : '🌧️ Mưa'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200 col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium text-amber-700">Trạng thái</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-sm font-semibold text-amber-900">Live Monitoring</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agricultural Impact - Enhanced */}
            <Card className="shadow-xl border-2 border-green-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Waves className="w-6 h-6" />
                  Tác động nông nghiệp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-700">Nhu cầu tưới</span>
                      </div>
                      <Badge className={`${getImpactColor(selectedWeather.agricultural_impact.irrigation_need)} border font-semibold`}>
                        {selectedWeather.agricultural_impact.irrigation_need === 'high' ? '🔴 Cao' : 
                         selectedWeather.agricultural_impact.irrigation_need === 'medium' ? '🟡 TB' : '🟢 Thấp'}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <span className="font-medium text-gray-700">Sâu bệnh</span>
                      </div>
                      <Badge className={`${getImpactColor(selectedWeather.agricultural_impact.pest_risk)} border font-semibold`}>
                        {selectedWeather.agricultural_impact.pest_risk === 'high' ? '🔴 Cao' : 
                         selectedWeather.agricultural_impact.pest_risk === 'medium' ? '🟡 TB' : '🟢 Thấp'}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-700">Thu hoạch</span>
                      </div>
                      <Badge className={`${getImpactColor(selectedWeather.agricultural_impact.harvest_condition)} border font-semibold`}>
                        {selectedWeather.agricultural_impact.harvest_condition === 'excellent' ? '⭐ Tuyệt vời' : 
                         selectedWeather.agricultural_impact.harvest_condition === 'good' ? '✅ Tốt' : '❌ Kém'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                    <div className="text-sm text-gray-600 mb-2 font-medium">Mùa hiện tại</div>
                    <Badge className={`${selectedWeather.season === 'dry' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-blue-400 to-indigo-400'} text-white text-lg px-4 py-2`}>
                      {selectedWeather.season === 'dry' ? '☀️ Mùa khô' : '🌧️ Mùa mưa'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rainfall Forecast - Premium Design */}
        {selectedWeather && (
          <Card className="shadow-2xl border-0 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
            <CardHeader className="bg-white/10 backdrop-blur-sm border-b border-white/20">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <CloudRain className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">Dự báo mưa 7 ngày tới</div>
                    <div className="text-sm text-blue-100 font-normal">Cập nhật realtime theo khu vực</div>
                  </div>
                </CardTitle>
                <Badge className="bg-white/30 backdrop-blur-sm text-white border-white/50 px-3 py-1.5">
                  <Activity className="w-3 h-3 mr-1 animate-pulse" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-8 pb-6">
              {/* Chart Area */}
              <div className="relative">
                {/* Background Grid */}
                <div className="absolute inset-0 grid grid-rows-4 gap-0 opacity-20">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="border-b border-white/30"></div>
                  ))}
                </div>
                
                {/* Rainfall Bars */}
                <div className="relative flex items-end justify-between gap-2 h-64 px-4">
                  {selectedWeather.rainfall.forecast.map((rain, index) => {
                    const maxRain = Math.max(...selectedWeather.rainfall.forecast)
                    const heightPercent = maxRain > 0 ? (rain / maxRain) * 100 : 0
                    const today = new Date()
                    const forecastDate = new Date(today)
                    forecastDate.setDate(today.getDate() + index)
                    const dayName = forecastDate.toLocaleDateString('vi-VN', { weekday: 'short' })
                    const dateNum = forecastDate.getDate()
                    
                    // Color intensity based on rain amount
                    let barColor = 'from-blue-300 via-blue-400 to-blue-500'
                    if (rain > 15) barColor = 'from-blue-600 via-indigo-600 to-purple-600'
                    else if (rain > 8) barColor = 'from-blue-400 via-blue-500 to-indigo-500'
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1 group relative">
                        {/* Hover tooltip */}
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 whitespace-nowrap">
                          <div className="text-xs font-bold text-gray-900">{rain}mm mưa</div>
                          <div className="text-xs text-gray-600">{dayName}, {dateNum}/11</div>
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                        </div>
                        
                        {/* Droplet icon for rainy days */}
                        {rain > 5 && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <CloudRain className="w-5 h-5 text-white animate-pulse" />
                          </div>
                        )}
                        
                        {/* Bar */}
                        <div 
                          className={`w-full bg-gradient-to-t ${barColor} rounded-t-xl transition-all duration-700 hover:shadow-2xl hover:shadow-blue-500/50 cursor-pointer relative overflow-hidden group-hover:scale-110`}
                          style={{ 
                            height: `${Math.max(heightPercent, 8)}%`,
                            minHeight: rain > 0 ? '32px' : '12px'
                          }}
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          {/* Rain indicator */}
                          {rain > 0 && (
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                              <Droplets className="w-4 h-4 text-white drop-shadow-lg animate-bounce" />
                            </div>
                          )}
                          
                          {/* Amount label on bar */}
                          {rain > 10 && (
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white font-bold text-xs bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                              {rain}mm
                            </div>
                          )}
                        </div>
                        
                        {/* Bottom labels */}
                        <div className="mt-3 text-center">
                          <div className="text-base font-bold text-white mb-1">
                            {rain}mm
                          </div>
                          <div className="text-xs text-blue-100 font-semibold">
                            {index === 0 ? 'Hôm nay' : index === 1 ? 'Ngày mai' : dayName}
                          </div>
                          <div className="text-xs text-blue-200/80">
                            {dateNum}/11
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Statistics */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-5 h-5 text-blue-200" />
                    <span className="text-sm text-blue-100">Tổng lượng mưa</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {selectedWeather.rainfall.forecast.reduce((a, b) => a + b, 0)}mm
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-200" />
                    <span className="text-sm text-blue-100">Ngày mưa nhiều nhất</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {Math.max(...selectedWeather.rainfall.forecast)}mm
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-yellow-200" />
                    <span className="text-sm text-blue-100">Số ngày có mưa</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {selectedWeather.rainfall.forecast.filter(r => r > 0).length} ngày
                  </div>
                </div>
              </div>

              {/* Weather advice based on rainfall */}
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white mb-1">Khuyến nghị:</div>
                    <div className="text-sm text-blue-100">
                      {selectedWeather.rainfall.forecast.some(r => r > 15) 
                        ? '⚠️ Dự báo mưa lớn, cần chuẩn bị hệ thống thoát nước và bảo vệ mùa màng'
                        : selectedWeather.rainfall.forecast.reduce((a, b) => a + b, 0) < 10
                        ? '☀️ Thời tiết khô hanh, cần tăng cường tưới tiêu cho cây trồng'
                        : '✅ Lượng mưa vừa phải, điều kiện thuận lợi cho canh tác'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Crop Advice - Enhanced */}
        <Card className="shadow-xl border-2 border-green-100 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="w-6 h-6" />
              Khuyến nghị canh tác thông minh
              <Badge className="ml-2 bg-green-600 text-white">AI Powered</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {cropAdvices.map((advice, index) => (
                <div 
                  key={index} 
                  className={`p-5 rounded-xl border-l-4 ${getPriorityColor(advice.priority)} hover:shadow-lg transition-all duration-200 cursor-pointer group`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${
                          advice.priority === 'high' ? 'bg-red-100' :
                          advice.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          {getActionIcon(advice.action)}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 text-lg">{advice.crop}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {advice.priority === 'high' ? '🔴 Ưu tiên cao' : 
                             advice.priority === 'medium' ? '🟡 Ưu tiên vừa' : '🟢 Ưu tiên thấp'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{advice.advice}</p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Province Weather Grid - Enhanced */}
        <Card className="shadow-xl border-2 border-purple-100 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <MapPin className="w-6 h-6" />
              Tổng quan thời tiết các tỉnh ĐBSCL
              <Badge className="ml-2 bg-purple-600 text-white">{weatherData.length} tỉnh</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weatherData.map((weather) => (
                <div
                  key={weather.province}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    weather.province === selectedProvince 
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg' 
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedProvince(weather.province)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-lg text-gray-900">{weather.province}</span>
                    <div className="transform scale-75">
                      {getWeatherIcon(weather.condition)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {weather.temperature.current}°
                    </span>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Droplets className="w-3 h-3" />
                        {weather.humidity}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getConditionText(weather.condition)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Badge className="bg-gray-100 text-gray-700 border-0">
                      <Wind className="w-3 h-3 mr-1" />
                      {weather.wind.speed} km/h
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-700 border-0">
                      <Eye className="w-3 h-3 mr-1" />
                      {weather.visibility} km
                    </Badge>
                  </div>

                  {weather.province === selectedProvince && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        Đang xem
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}