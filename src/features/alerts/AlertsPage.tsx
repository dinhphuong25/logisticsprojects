import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Alert } from '@/types'

export default function AlertsPage() {
  const queryClient = useQueryClient()

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await apiClient.get('/alerts')
      return res.data
    },
    refetchInterval: 5000,
  })

  const resolveMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await apiClient.post(`/alerts/${alertId}/resolve`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Đã giải quyết cảnh báo')
    },
    onError: () => {
      toast.error('Không thể giải quyết cảnh báo')
    },
  })

  const getSeverityBadge = (severity: string) => {
    const severityMap: Record<string, { label: string; color: string }> = {
      INFO: { label: 'Thông tin', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
      LOW: { label: 'Thấp', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      MEDIUM: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
      HIGH: { label: 'Cao', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
      CRITICAL: { label: 'Nghiêm trọng', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    }
    const config = severityMap[severity] || severityMap.INFO
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const openAlerts = alerts?.filter((a) => a.status === 'OPEN') || []
  const resolvedAlerts = alerts?.filter((a) => a.status === 'RESOLVED') || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-900 via-orange-800 to-amber-800 dark:from-red-200 dark:via-orange-200 dark:to-amber-200 bg-clip-text text-transparent">
          Cảnh báo hệ thống
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {openAlerts.length} cảnh báo đang mở
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Cảnh báo đang mở</h2>
        {openAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">Không có cảnh báo nào</p>
            </CardContent>
          </Card>
        ) : (
          openAlerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-xs text-gray-500">
                        {formatDateTime(alert.createdAt)}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{alert.titleVi}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {alert.messageVi}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => resolveMutation.mutate(alert.id)}
                    disabled={resolveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Giải quyết
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {resolvedAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-500">Đã giải quyết</h2>
          {resolvedAlerts.map((alert) => (
            <Card key={alert.id} className="opacity-60">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {getSeverityBadge(alert.severity)}
                  <span className="text-xs text-gray-500">
                    {formatDateTime(alert.createdAt)}
                  </span>
                </div>
                <CardTitle className="text-lg">{alert.titleVi}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {alert.messageVi}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
