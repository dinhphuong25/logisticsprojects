import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  FileText,
  Activity,
  Thermometer,
  Package,
  TruckIcon,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  FileBarChart,
  Eye,
  Share2,
  Mail,
  Star,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface Report {
  id: string
  name: string
  description: string
  type: 'INVENTORY' | 'INBOUND' | 'OUTBOUND' | 'TEMPERATURE' | 'ENERGY' | 'FINANCIAL' | 'CUSTOMER' | 'PERFORMANCE'
  period: string
  generatedAt: string
  fileSize: string
  format: 'PDF' | 'EXCEL' | 'CSV'
  status: 'READY' | 'GENERATING' | 'SCHEDULED'
  downloads: number
}

const fetchReports = async (): Promise<Report[]> => {
  await new Promise(resolve => setTimeout(resolve, 600))
  
  return [
    {
      id: 'RPT-001',
      name: 'Báo cáo Tồn kho - Tháng 11/2025',
      description: 'Phân tích mức tồn kho, giá trị hàng hóa và xu hướng nhập xuất',
      type: 'INVENTORY',
      period: 'Tháng 11/2025',
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      fileSize: '2.4 MB',
      format: 'PDF',
      status: 'READY',
      downloads: 45
    },
    {
      id: 'RPT-002',
      name: 'Hiệu suất Nhập hàng - Tuần 44',
      description: 'Đánh giá tốc độ nhận hàng, độ chính xác và năng suất nhân viên',
      type: 'INBOUND',
      period: 'Tuần 44/2025',
      generatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      fileSize: '1.8 MB',
      format: 'EXCEL',
      status: 'READY',
      downloads: 28
    },
    {
      id: 'RPT-003',
      name: 'Hiệu suất Xuất hàng - Tháng 10/2025',
      description: 'Thống kê đơn hàng, tỷ lệ picking chính xác, thời gian giao hàng',
      type: 'OUTBOUND',
      period: 'Tháng 10/2025',
      generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      fileSize: '3.1 MB',
      format: 'PDF',
      status: 'READY',
      downloads: 67
    },
    {
      id: 'RPT-004',
      name: 'Tuân thủ Nhiệt độ - Quý 3/2025',
      description: 'Giám sát nhiệt độ, cảnh báo vượt ngưỡng và phân tích xu hướng',
      type: 'TEMPERATURE',
      period: 'Q3/2025',
      generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      fileSize: '4.2 MB',
      format: 'PDF',
      status: 'READY',
      downloads: 89
    },
    {
      id: 'RPT-005',
      name: 'Năng lượng Mặt trời - Tháng 10/2025',
      description: 'Sản lượng điện, hiệu suất panel, tiết kiệm chi phí',
      type: 'ENERGY',
      period: 'Tháng 10/2025',
      generatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      fileSize: '1.5 MB',
      format: 'EXCEL',
      status: 'READY',
      downloads: 34
    },
    {
      id: 'RPT-006',
      name: 'Báo cáo Tài chính - Quý 3/2025',
      description: 'Doanh thu, chi phí vận hành, lợi nhuận và phân tích tài chính',
      type: 'FINANCIAL',
      period: 'Q3/2025',
      generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      fileSize: '2.8 MB',
      format: 'PDF',
      status: 'READY',
      downloads: 156
    },
    {
      id: 'RPT-007',
      name: 'Phân tích Khách hàng - Tháng 10/2025',
      description: 'Top khách hàng, tần suất đặt hàng, giá trị trung bình đơn hàng',
      type: 'CUSTOMER',
      period: 'Tháng 10/2025',
      generatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      fileSize: '1.9 MB',
      format: 'EXCEL',
      status: 'READY',
      downloads: 52
    },
    {
      id: 'RPT-008',
      name: 'Hiệu suất Tổng thể - Tuần 44',
      description: 'KPI tổng hợp: năng suất, chất lượng, thời gian xử lý',
      type: 'PERFORMANCE',
      period: 'Tuần 44/2025',
      generatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      fileSize: '2.1 MB',
      format: 'PDF',
      status: 'READY',
      downloads: 78
    },
    {
      id: 'RPT-009',
      name: 'Báo cáo Tồn kho - Hàng ngày',
      description: 'Cập nhật tồn kho real-time, cảnh báo hết hạn',
      type: 'INVENTORY',
      period: 'Hôm nay',
      generatedAt: new Date().toISOString(),
      fileSize: '1.2 MB',
      format: 'CSV',
      status: 'GENERATING',
      downloads: 0
    },
    {
      id: 'RPT-010',
      name: 'Nhiệt độ Tuần tới - Lịch định kỳ',
      description: 'Báo cáo tự động gửi email mỗi thứ 2 hàng tuần',
      type: 'TEMPERATURE',
      period: 'Tuần 45/2025',
      generatedAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      fileSize: '-',
      format: 'PDF',
      status: 'SCHEDULED',
      downloads: 0
    }
  ]
}

export default function ReportsPageSimple() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month')
  const [selectedType, setSelectedType] = useState<string>('ALL')

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: fetchReports,
    refetchInterval: 30000
  })

  const stats = useMemo(() => {
    if (!reports) return { total: 0, ready: 0, avgTime: 0, downloads: 0 }
    
    const readyReports = reports.filter(r => r.status === 'READY')
    return {
      total: reports.length,
      ready: readyReports.length,
      avgTime: 2.3,
      downloads: reports.reduce((sum, r) => sum + r.downloads, 0)
    }
  }, [reports])

  const filteredReports = useMemo(() => {
    if (!reports) return []
    return reports.filter(r => selectedType === 'ALL' || r.type === selectedType)
  }, [reports, selectedType])

  const reportTypes = [
    {
      id: 'INVENTORY',
      name: 'Tồn kho',
      description: 'Mức tồn kho và định giá hàng hóa',
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600',
      count: reports?.filter(r => r.type === 'INVENTORY').length || 0
    },
    {
      id: 'INBOUND',
      name: 'Nhập hàng',
      description: 'Hiệu suất tiếp nhận và độ chính xác',
      icon: TruckIcon,
      color: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600',
      count: reports?.filter(r => r.type === 'INBOUND').length || 0
    },
    {
      id: 'OUTBOUND',
      name: 'Xuất hàng',
      description: 'Chỉ số picking và giao hàng',
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600',
      count: reports?.filter(r => r.type === 'OUTBOUND').length || 0
    },
    {
      id: 'TEMPERATURE',
      name: 'Nhiệt độ',
      description: 'Giám sát và tuân thủ nhiệt độ',
      icon: Thermometer,
      color: 'from-red-500 to-rose-500',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600',
      count: reports?.filter(r => r.type === 'TEMPERATURE').length || 0
    },
    {
      id: 'ENERGY',
      name: 'Năng lượng',
      description: 'Sản lượng solar và tiết kiệm điện',
      icon: Zap,
      color: 'from-yellow-500 to-amber-500',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600',
      count: reports?.filter(r => r.type === 'ENERGY').length || 0
    },
    {
      id: 'FINANCIAL',
      name: 'Tài chính',
      description: 'Doanh thu, chi phí và lợi nhuận',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600',
      count: reports?.filter(r => r.type === 'FINANCIAL').length || 0
    },
    {
      id: 'CUSTOMER',
      name: 'Khách hàng',
      description: 'Phân tích hành vi và giá trị',
      icon: Users,
      color: 'from-indigo-500 to-blue-500',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600',
      count: reports?.filter(r => r.type === 'CUSTOMER').length || 0
    },
    {
      id: 'PERFORMANCE',
      name: 'Hiệu suất',
      description: 'KPI và năng suất tổng thể',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600',
      count: reports?.filter(r => r.type === 'PERFORMANCE').length || 0
    }
  ]

  const getStatusBadge = (status: string) => {
    const configs = {
      READY: { label: 'Sẵn sàng', color: 'bg-green-500 text-white' },
      GENERATING: { label: 'Đang tạo', color: 'bg-blue-500 text-white animate-pulse' },
      SCHEDULED: { label: 'Đã lên lịch', color: 'bg-yellow-500 text-white' }
    }
    const config = configs[status as keyof typeof configs] || configs.READY
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getFormatIcon = (format: string) => {
    const icons = {
      PDF: FileText,
      EXCEL: FileSpreadsheet,
      CSV: FileBarChart
    }
    return icons[format as keyof typeof icons] || FileText
  }

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    if (diff < 0) {
      const hours = Math.ceil(Math.abs(diff) / (60 * 60 * 1000))
      return `Còn ${hours} giờ nữa`
    }
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Vừa xong'
    if (minutes < 60) return `${minutes} phút trước`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    return `${days} ngày trước`
  }

  const handleDownload = (report: Report) => {
    if (report.status !== 'READY') {
      toast.warning('Báo cáo chưa sẵn sàng')
      return
    }
    toast.success(`Đang tải xuống: ${report.name}`)
    // Simulate download
    setTimeout(() => {
      toast.success('Tải xuống thành công!')
    }, 1500)
  }

  const handlePreview = (report: Report) => {
    if (report.status !== 'READY') {
      toast.warning('Báo cáo chưa sẵn sàng')
      return
    }
    toast.info(`Đang mở xem trước: ${report.name}`)
  }

  const handleShare = () => {
    toast.success('Đã sao chép liên kết chia sẻ')
  }

  const handleEmail = () => {
    toast.success('Báo cáo sẽ được gửi qua email')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Báo cáo & Phân tích
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Tạo và tải xuống báo cáo chi tiết về hoạt động kho lạnh
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20">
            <Calendar className="w-4 h-4 mr-2" />
            Lên lịch báo cáo
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg">
            <FileText className="w-4 h-4 mr-2" />
            Tạo báo cáo mới
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng báo cáo</p>
                <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
                <Badge className="bg-blue-500 text-white mt-2">+12%</Badge>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sẵn sàng tải</p>
                <p className="text-4xl font-bold text-green-600">{stats.ready}</p>
                <Badge className="bg-green-500 text-white mt-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Thời gian xử lý TB</p>
                <p className="text-4xl font-bold text-purple-600">{stats.avgTime}s</p>
                <Badge className="bg-purple-500 text-white mt-2">-8%</Badge>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lượt tải xuống</p>
                <p className="text-4xl font-bold text-orange-600">{stats.downloads}</p>
                <Badge className="bg-orange-500 text-white mt-2">+24%</Badge>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Download className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period & Type Selector */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Chọn khoảng thời gian báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'today', label: 'Hôm nay' },
              { value: 'week', label: 'Tuần này' },
              { value: 'month', label: 'Tháng này' },
              { value: 'quarter', label: 'Quý này' },
              { value: 'year', label: 'Năm nay' }
            ].map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod(period.value)}
                className={selectedPeriod === period.value ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : ''}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Types Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Loại báo cáo</h2>
          <Button
            variant="outline"
            onClick={() => setSelectedType('ALL')}
            className={selectedType === 'ALL' ? 'border-purple-500 text-purple-600' : ''}
          >
            Tất cả ({reports?.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportTypes.map((type) => {
            const Icon = type.icon
            return (
              <Card 
                key={type.id}
                className={`border-0 shadow-xl cursor-pointer transition-all hover:shadow-2xl hover:scale-105 ${
                  selectedType === type.id ? 'ring-2 ring-purple-500 ring-offset-2' : ''
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl ${type.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 ${type.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{type.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{type.description}</p>
                  <Badge className={`bg-gradient-to-r ${type.color} text-white`}>
                    {type.count} báo cáo
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Reports List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedType === 'ALL' ? 'Tất cả báo cáo' : reportTypes.find(t => t.id === selectedType)?.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {filteredReports.length} báo cáo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => {
            const FormatIcon = getFormatIcon(report.format)
            const typeConfig = reportTypes.find(t => t.id === report.type)
            const TypeIcon = typeConfig?.icon || FileText

            return (
              <Card key={report.id} className="border-0 shadow-xl hover:shadow-2xl transition-all group">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl ${typeConfig?.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <TypeIcon className={`w-8 h-8 ${typeConfig?.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                          {report.name}
                        </CardTitle>
                        {report.downloads > 50 && (
                          <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {report.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        {getStatusBadge(report.status)}
                        <div className="flex items-center gap-1">
                          <FormatIcon className="w-4 h-4" />
                          <span>{report.format}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{report.period}</span>
                        </div>
                        {report.status === 'READY' && (
                          <>
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              <span>{report.fileSize}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              <span>{report.downloads} lượt</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {getTimeAgo(report.generatedAt)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(report)}
                      disabled={report.status !== 'READY'}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Xem trước
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(report)}
                      disabled={report.status !== 'READY'}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Tải xuống
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleShare}
                      disabled={report.status !== 'READY'}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEmail}
                      disabled={report.status !== 'READY'}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Popular Reports */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-500" />
            Báo cáo phổ biến nhất
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reports
              ?.filter(r => r.status === 'READY')
              .sort((a, b) => b.downloads - a.downloads)
              .slice(0, 3)
              .map((report, index) => (
                <div
                  key={report.id}
                  className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      #{index + 1}
                    </Badge>
                    <Badge variant="outline">{report.downloads} lượt tải</Badge>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {report.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{report.period}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
