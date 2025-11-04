import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Thermometer, AlertCircle } from 'lucide-react'
import type { Sensor } from '@/types'

export default function TemperaturePage() {
  const { data: sensors } = useQuery<Sensor[]>({
    queryKey: ['sensors'],
    queryFn: async () => {
      const res = await apiClient.get('/sensors')
      return res.data
    },
    refetchInterval: 5000, // Update every 5 seconds
  })

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      ONLINE: { label: 'Hoạt động', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      WARNING: { label: 'Cảnh báo', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
      OFFLINE: { label: 'Ngoại tuyến', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
      ERROR: { label: 'Lỗi', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    }
    const config = statusMap[status] || statusMap.OFFLINE
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const temperatureSensors = sensors?.filter((s) => s.type === 'TEMPERATURE') || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-900 via-orange-800 to-yellow-800 dark:from-red-200 dark:via-orange-200 dark:to-yellow-200 bg-clip-text text-transparent">
          Giám sát nhiệt độ
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Theo dõi nhiệt độ thời gian thực từ các cảm biến
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {temperatureSensors.map((sensor) => (
          <Card key={sensor.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {sensor.name}
                </CardTitle>
                {getStatusBadge(sensor.status)}
              </div>
              <p className="text-xs text-gray-500">{sensor.zone?.name || '-'}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Thermometer className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {sensor.currentValue.toFixed(1)}°C
                  </div>
                  <p className="text-sm text-gray-500">
                    Mục tiêu: {sensor.zone?.tempTarget || '-'}°C
                  </p>
                </div>
              </div>

              {sensor.status === 'WARNING' && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900 dark:text-yellow-300">
                      Cảnh báo nhiệt độ
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-400">
                      Vượt ngưỡng cho phép
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {temperatureSensors.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Thermometer className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Không có dữ liệu cảm biến</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
