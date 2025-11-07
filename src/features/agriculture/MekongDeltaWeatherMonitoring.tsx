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
  Waves
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

  // Mock weather data for ĐBSCL provinces
  useEffect(() => {
    const mockWeatherData: WeatherData[] = [
      {
        province: 'Cần Thơ',
        temperature: { current: 32, min: 26, max: 35, feels_like: 38 },
        humidity: 78,
        rainfall: { current: 0, forecast: [0, 5, 12, 8, 0, 0, 3] },
        wind: { speed: 12, direction: 'Đông Nam' },
        condition: 'sunny',
        uv_index: 9,
        visibility: 10,
        pressure: 1013,
        season: 'dry',
        agricultural_impact: {
          irrigation_need: 'high',
          pest_risk: 'medium',
          harvest_condition: 'excellent'
        }
      },
      {
        province: 'An Giang',
        temperature: { current: 30, min: 24, max: 33, feels_like: 35 },
        humidity: 82,
        rainfall: { current: 2, forecast: [8, 15, 20, 12, 5, 0, 0] },
        wind: { speed: 8, direction: 'Tây Nam' },
        condition: 'cloudy',
        uv_index: 6,
        visibility: 8,
        pressure: 1011,
        season: 'wet',
        agricultural_impact: {
          irrigation_need: 'low',
          pest_risk: 'high',
          harvest_condition: 'good'
        }
      },
      {
        province: 'Đồng Tháp',
        temperature: { current: 31, min: 25, max: 34, feels_like: 36 },
        humidity: 75,
        rainfall: { current: 0, forecast: [0, 0, 8, 15, 22, 10, 5] },
        wind: { speed: 10, direction: 'Đông' },
        condition: 'sunny',
        uv_index: 8,
        visibility: 12,
        pressure: 1014,
        season: 'dry',
        agricultural_impact: {
          irrigation_need: 'medium',
          pest_risk: 'low',
          harvest_condition: 'excellent'
        }
      }
    ]

    setWeatherData(mockWeatherData)

    // Mock alerts
    setAlerts([
      'Cảnh báo nắng nóng tại Cần Thơ, nhiệt độ có thể lên tới 38°C',
      'Dự báo mưa lớn tại An Giang trong 3 ngày tới',
      'Điều kiện thuận lợi cho thu hoạch lúa tại Đồng Tháp'
    ])

    // Mock crop advice
    setCropAdvices([
      {
        crop: 'Lúa Đông Xuân',
        advice: 'Thời tiết khô hanh, cần tưới nước đầy đủ cho ruộng lúa',
        action: 'irrigate',
        priority: 'high'
      },
      {
        crop: 'Xoài',
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
      }
    ])
  }, [])

  const selectedWeather = weatherData.find(w => w.province === selectedProvince)

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-8 h-8 text-yellow-500" />
      case 'cloudy': return <Cloud className="w-8 h-8 text-gray-500" />
      case 'rainy': return <CloudRain className="w-8 h-8 text-blue-500" />
      default: return <Sun className="w-8 h-8 text-yellow-500" />
    }
  }

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'Nắng'
      case 'cloudy': return 'Nhiều mây'
      case 'rainy': return 'Mưa'
      case 'stormy': return 'Bão'
      default: return 'Nắng'
    }
  }

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50' 
      case 'low': return 'text-green-600 bg-green-50'
      case 'excellent': return 'text-green-600 bg-green-50'
      case 'good': return 'text-blue-600 bg-blue-50'
      case 'poor': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
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
      case 'high': return 'border-l-red-500 bg-red-50'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Cloud className="w-8 h-8 text-blue-600" />
            Giám Sát Thời Tiết ĐBSCL
          </h1>
          <p className="text-gray-600 mt-2">
            Theo dõi thời tiết và tác động đến nông nghiệp
          </p>
        </div>

        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white min-w-[150px]"
        >
          {MEKONG_DELTA_CONFIG.provinces.map(province => (
            <option key={province} value={province}>{province}</option>
          ))}
        </select>
      </div>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="w-5 h-5" />
              Cảnh báo thời tiết
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{alert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Weather */}
      {selectedWeather && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Weather Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {selectedWeather.province}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {getWeatherIcon(selectedWeather.condition)}
                  <div>
                    <div className="text-4xl font-bold">
                      {selectedWeather.temperature.current}°C
                    </div>
                    <div className="text-gray-600">
                      {getConditionText(selectedWeather.condition)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-500">
                  <div>Cảm giác như {selectedWeather.temperature.feels_like}°C</div>
                  <div>Min: {selectedWeather.temperature.min}°C / Max: {selectedWeather.temperature.max}°C</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-600">Độ ẩm</div>
                    <div className="font-semibold">{selectedWeather.humidity}%</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Gió</div>
                    <div className="font-semibold">{selectedWeather.wind.speed} km/h {selectedWeather.wind.direction}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="text-sm text-gray-600">Tầm nhìn</div>
                    <div className="font-semibold">{selectedWeather.visibility} km</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="text-sm text-gray-600">UV Index</div>
                    <div className="font-semibold">{selectedWeather.uv_index}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agricultural Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="w-5 h-5" />
                Tác động nông nghiệp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nhu cầu tưới tiêu</span>
                  <Badge className={getImpactColor(selectedWeather.agricultural_impact.irrigation_need)}>
                    {selectedWeather.agricultural_impact.irrigation_need === 'high' ? 'Cao' : 
                     selectedWeather.agricultural_impact.irrigation_need === 'medium' ? 'Trung bình' : 'Thấp'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nguy cơ sâu bệnh</span>
                  <Badge className={getImpactColor(selectedWeather.agricultural_impact.pest_risk)}>
                    {selectedWeather.agricultural_impact.pest_risk === 'high' ? 'Cao' : 
                     selectedWeather.agricultural_impact.pest_risk === 'medium' ? 'Trung bình' : 'Thấp'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Điều kiện thu hoạch</span>
                  <Badge className={getImpactColor(selectedWeather.agricultural_impact.harvest_condition)}>
                    {selectedWeather.agricultural_impact.harvest_condition === 'excellent' ? 'Tuyệt vời' : 
                     selectedWeather.agricultural_impact.harvest_condition === 'good' ? 'Tốt' : 'Kém'}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">Mùa hiện tại</div>
                <Badge className={selectedWeather.season === 'dry' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}>
                  {selectedWeather.season === 'dry' ? 'Mùa khô' : 'Mùa mưa'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rainfall Forecast */}
      {selectedWeather && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="w-5 h-5" />
              Dự báo mưa 7 ngày tới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {selectedWeather.rainfall.forecast.map((rain, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${Math.max(rain * 4, 4)}px`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2">
                    {rain}mm
                  </div>
                  <div className="text-xs text-gray-500">
                    {index === 0 ? 'Hôm nay' : `+${index}`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crop Advice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Khuyến nghị canh tác
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cropAdvices.map((advice, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(advice.priority)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getActionIcon(advice.action)}
                      <span className="font-medium text-gray-900">{advice.crop}</span>
                      <Badge variant="outline" className="text-xs">
                        {advice.priority === 'high' ? 'Ưu tiên cao' : 
                         advice.priority === 'medium' ? 'Ưu tiên vừa' : 'Ưu tiên thấp'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{advice.advice}</p>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    Chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Province Weather Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Tổng quan thời tiết các tỉnh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weatherData.map((weather) => (
              <div
                key={weather.province}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  weather.province === selectedProvince 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedProvince(weather.province)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{weather.province}</span>
                  {getWeatherIcon(weather.condition)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {weather.temperature.current}°C
                  </span>
                  <div className="text-right text-sm text-gray-500">
                    <div>{weather.humidity}% ẩm</div>
                    <div>{getConditionText(weather.condition)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}