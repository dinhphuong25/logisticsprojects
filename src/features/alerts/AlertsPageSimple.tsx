import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle, 
  Activity,
  Thermometer,
  Package,
  Zap,
  Bell,
  Search,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCheck
} from 'lucide-react'
import { toast } from 'sonner'

interface Alert {
  id: string
  type: 'TEMPERATURE' | 'EQUIPMENT' | 'INVENTORY' | 'ENERGY' | 'SYSTEM'
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'RESOLVED' | 'ACKNOWLEDGED'
  title: string
  message: string
  location?: string
  timestamp: string
  resolvedAt?: string
  resolvedBy?: string
}

const fetchAlerts = async (): Promise<Alert[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400))
  
  return [
    // CRITICAL Alerts
    {
      id: 'ALT-001',
      type: 'TEMPERATURE',
      severity: 'CRITICAL',
      status: 'OPEN',
      title: 'Vượt ngưỡng nhiệt độ',
      message: 'Nhiệt độ KHU ĐÔNG B vượt ngưỡng cho phép (-18°C → -15°C)',
      location: 'Khu vực đông lạnh B',
      timestamp: new Date(Date.now() - 17 * 60 * 1000).toISOString()
    },
    {
      id: 'ALT-002',
      type: 'EQUIPMENT',
      severity: 'CRITICAL',
      status: 'OPEN',
      title: 'Lỗi máy nén khí',
      message: 'Máy nén khí #3 ngừng hoạt động, cần bảo trì khẩn cấp',
      location: 'Phòng máy chính',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    },
    
    // HIGH Alerts
    {
      id: 'ALT-003',
      type: 'INVENTORY',
      severity: 'HIGH',
      status: 'OPEN',
      title: 'Sản phẩm sắp hết hạn',
      message: '3 lô hàng sẽ hết hạn trong vòng 7 ngày (Sữa tươi, Thịt bò, Cá hồi)',
      location: 'Kho lạnh A',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ALT-004',
      type: 'ENERGY',
      severity: 'HIGH',
      status: 'ACKNOWLEDGED',
      title: 'Tiêu thụ điện bất thường',
      message: 'Mức tiêu thụ điện tăng 35% so với trung bình, kiểm tra thiết bị',
      location: 'Hệ thống năng lượng',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    
    // MEDIUM Alerts
    {
      id: 'ALT-005',
      type: 'TEMPERATURE',
      severity: 'MEDIUM',
      status: 'OPEN',
      title: 'Dao động nhiệt độ',
      message: 'Nhiệt độ khu lạnh C dao động ±2°C trong 30 phút qua',
      location: 'Khu vực lạnh C',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString()
    },
    {
      id: 'ALT-006',
      type: 'INVENTORY',
      severity: 'MEDIUM',
      status: 'OPEN',
      title: 'Tồn kho thấp',
      message: 'Sản phẩm "Sữa chua Vinamilk" còn 50 thùng (< ngưỡng 100)',
      location: 'Kho lạnh B',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ALT-007',
      type: 'SYSTEM',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      title: 'Kết nối cảm biến',
      message: 'Cảm biến nhiệt độ #12 mất kết nối 15 phút',
      location: 'Zone A-3',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      resolvedBy: 'Admin User'
    },
    
    // LOW Alerts
    {
      id: 'ALT-008',
      type: 'EQUIPMENT',
      severity: 'LOW',
      status: 'ACKNOWLEDGED',
      title: 'Bảo trì định kỳ',
      message: 'Hệ thống làm lạnh cần bảo trì định kỳ trong 7 ngày tới',
      location: 'Tất cả kho',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ALT-009',
      type: 'ENERGY',
      severity: 'LOW',
      status: 'RESOLVED',
      title: 'Pin mặt trời sạc đầy',
      message: 'Hệ thống lưu trữ năng lượng đã sạc đầy 100%',
      location: 'Hệ thống solar',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      resolvedBy: 'System'
    },
    
    // INFO Alerts
    {
      id: 'ALT-010',
      type: 'SYSTEM',
      severity: 'INFO',
      status: 'RESOLVED',
      title: 'Cập nhật firmware',
      message: 'Hệ thống đã cập nhật firmware lên phiên bản 2.5.3',
      location: 'System',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      resolvedBy: 'System'
    },
    {
      id: 'ALT-011',
      type: 'INVENTORY',
      severity: 'INFO',
      status: 'RESOLVED',
      title: 'Nhập hàng thành công',
      message: 'Đã nhập 150 thùng sản phẩm từ đơn hàng #PO-2025-089',
      location: 'Kho lạnh A',
      timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(Date.now() - 29 * 60 * 60 * 1000).toISOString(),
      resolvedBy: 'Staff User'
    },
    {
      id: 'ALT-012',
      type: 'TEMPERATURE',
      severity: 'INFO',
      status: 'RESOLVED',
      title: 'Nhiệt độ ổn định',
      message: 'Tất cả khu vực đã đạt nhiệt độ mục tiêu',
      location: 'Tất cả kho',
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(Date.now() - 35 * 60 * 60 * 1000).toISOString(),
      resolvedBy: 'System'
    }
  ]
}

export default function AlertsPageSimple() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('OPEN')

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    refetchInterval: 5000
  })

  const resolveMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return { alertId }
    },
    onSuccess: (_, alertId) => {
      queryClient.setQueryData(['alerts'], (old: Alert[] | undefined) => {
        if (!old) return []
        return old.map(alert => 
          alert.id === alertId 
            ? { 
                ...alert, 
                status: 'RESOLVED' as const, 
                resolvedAt: new Date().toISOString(),
                resolvedBy: 'Admin User'
              }
            : alert
        )
      })
      toast.success('Đã giải quyết cảnh báo')
    },
    onError: () => {
      toast.error('Không thể giải quyết cảnh báo')
    }
  })

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { alertId }
    },
    onSuccess: (_, alertId) => {
      queryClient.setQueryData(['alerts'], (old: Alert[] | undefined) => {
        if (!old) return []
        return old.map(alert => 
          alert.id === alertId ? { ...alert, status: 'ACKNOWLEDGED' as const } : alert
        )
      })
      toast.success('Đã xác nhận cảnh báo')
    }
  })

  const filteredAlerts = useMemo(() => {
    if (!alerts) return []
    
    return alerts.filter(alert => {
      const matchesSearch = 
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.location?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = selectedType === 'ALL' || alert.type === selectedType
      const matchesSeverity = selectedSeverity === 'ALL' || alert.severity === selectedSeverity
      const matchesStatus = selectedStatus === 'ALL' || alert.status === selectedStatus
      
      return matchesSearch && matchesType && matchesSeverity && matchesStatus
    })
  }, [alerts, searchQuery, selectedType, selectedSeverity, selectedStatus])

  // Statistics
  const stats = useMemo(() => {
    if (!alerts) return { total: 0, open: 0, critical: 0, resolved: 0 }
    
    return {
      total: alerts.length,
      open: alerts.filter(a => a.status === 'OPEN').length,
      critical: alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'OPEN').length,
      resolved: alerts.filter(a => a.status === 'RESOLVED').length
    }
  }, [alerts])

  const getSeverityConfig = (severity: string) => {
    const configs = {
      CRITICAL: { 
        label: 'Nghiêm trọng', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-500',
        icon: XCircle,
        iconColor: 'text-red-600'
      },
      HIGH: { 
        label: 'Cao', 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-500',
        icon: AlertTriangle,
        iconColor: 'text-orange-600'
      },
      MEDIUM: { 
        label: 'Trung bình', 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-500',
        icon: AlertCircle,
        iconColor: 'text-yellow-600'
      },
      LOW: { 
        label: 'Thấp', 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-500',
        icon: Info,
        iconColor: 'text-blue-600'
      },
      INFO: { 
        label: 'Thông tin', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-500',
        icon: Info,
        iconColor: 'text-gray-600'
      }
    }
    return configs[severity as keyof typeof configs] || configs.INFO
  }

  const getTypeConfig = (type: string) => {
    const configs = {
      TEMPERATURE: { label: 'Nhiệt độ', icon: Thermometer, color: 'text-red-600' },
      EQUIPMENT: { label: 'Thiết bị', icon: Activity, color: 'text-blue-600' },
      INVENTORY: { label: 'Tồn kho', icon: Package, color: 'text-green-600' },
      ENERGY: { label: 'Năng lượng', icon: Zap, color: 'text-yellow-600' },
      SYSTEM: { label: 'Hệ thống', icon: Bell, color: 'text-purple-600' }
    }
    return configs[type as keyof typeof configs] || configs.SYSTEM
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      OPEN: { label: 'Đang mở', color: 'bg-red-500 text-white' },
      ACKNOWLEDGED: { label: 'Đã xác nhận', color: 'bg-yellow-500 text-white' },
      RESOLVED: { label: 'Đã giải quyết', color: 'bg-green-500 text-white' }
    }
    const config = configs[status as keyof typeof configs] || configs.OPEN
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getTimeAgo = (timestamp: string) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
    if (minutes < 1) return 'Vừa xong'
    if (minutes < 60) return `${minutes} phút trước`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    return `${days} ngày trước`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
            Cảnh báo hệ thống
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {stats.open} cảnh báo đang mở • {stats.critical} nghiêm trọng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Tất cả cảm biến đang hoạt động</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng cảnh báo</p>
                <p className="text-4xl font-bold text-red-600">{stats.total}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                <Bell className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Đang mở</p>
                <p className="text-4xl font-bold text-orange-600">{stats.open}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nghiêm trọng</p>
                <p className="text-4xl font-bold text-rose-600">{stats.critical}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                <XCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Đã giải quyết</p>
                <p className="text-4xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCheck className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm cảnh báo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="ALL">Tất cả loại</option>
              <option value="TEMPERATURE">Nhiệt độ</option>
              <option value="EQUIPMENT">Thiết bị</option>
              <option value="INVENTORY">Tồn kho</option>
              <option value="ENERGY">Năng lượng</option>
              <option value="SYSTEM">Hệ thống</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="CRITICAL">Nghiêm trọng</option>
              <option value="HIGH">Cao</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="LOW">Thấp</option>
              <option value="INFO">Thông tin</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="OPEN">Đang mở</option>
              <option value="ACKNOWLEDGED">Đã xác nhận</option>
              <option value="RESOLVED">Đã giải quyết</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="py-16 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Không có cảnh báo
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Tất cả hệ thống đang hoạt động bình thường
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const severityConfig = getSeverityConfig(alert.severity)
            const typeConfig = getTypeConfig(alert.type)
            const SeverityIcon = severityConfig.icon
            const TypeIcon = typeConfig.icon

            return (
              <Card 
                key={alert.id} 
                className={`border-0 shadow-xl transition-all hover:shadow-2xl ${
                  alert.status === 'RESOLVED' ? 'opacity-60' : ''
                } ${alert.severity === 'CRITICAL' ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        alert.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30' :
                        alert.severity === 'HIGH' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        alert.severity === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        alert.severity === 'LOW' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        'bg-gray-100 dark:bg-gray-900/30'
                      }`}>
                        <SeverityIcon className={`w-6 h-6 ${severityConfig.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Badge className={`${severityConfig.color} border-2 font-semibold`}>
                            {severityConfig.label}
                          </Badge>
                          {getStatusBadge(alert.status)}
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
                            <span>{typeConfig.label}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{getTimeAgo(alert.timestamp)}</span>
                          </div>
                        </div>

                        {/* Title & Message */}
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {alert.title}
                        </CardTitle>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {alert.message}
                        </p>

                        {/* Location & ID */}
                        <div className="flex items-center gap-4 text-sm">
                          {alert.location && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span>{alert.location}</span>
                            </div>
                          )}
                          <span className="text-gray-400 dark:text-gray-600">ID: {alert.id}</span>
                        </div>

                        {/* Resolved Info */}
                        {alert.status === 'RESOLVED' && alert.resolvedAt && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              <span>Đã giải quyết {getTimeAgo(alert.resolvedAt)} bởi {alert.resolvedBy}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {alert.status === 'OPEN' && (
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => resolveMutation.mutate(alert.id)}
                          disabled={resolveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Giải quyết
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeMutation.mutate(alert.id)}
                          disabled={acknowledgeMutation.isPending}
                          className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/20"
                        >
                          Xác nhận
                        </Button>
                      </div>
                    )}

                    {alert.status === 'ACKNOWLEDGED' && (
                      <Button
                        size="sm"
                        onClick={() => resolveMutation.mutate(alert.id)}
                        disabled={resolveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Giải quyết
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            )
          })
        )}
      </div>

      {/* Summary Footer */}
      {filteredAlerts.length > 0 && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                Hiển thị <span className="font-bold text-gray-900 dark:text-white">{filteredAlerts.length}</span> cảnh báo
              </p>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Giảm 15% so với tuần trước
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
