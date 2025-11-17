/**
 * 🚀 Enhanced Dashboard - Dashboard nâng cao với Real-time Analytics
 * Tích hợp WebSocket, Live Data, Beautiful Charts, AI Insights
 */

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF
    lastAutoTable: { finalY: number }
  }
}
import * as XLSX from 'xlsx'
import {
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  AlertTriangle,
  DollarSign,
  Users,
  Activity,
  Zap,
  Clock,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  Download,
  Target,
  Award,
  Layers,
  FileText,
  FileSpreadsheet,
  File,
  type LucideIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useProductStore } from '@/stores'
import { toast } from 'sonner'

interface DashboardStats {
  revenue: {
    today: number
    yesterday: number
    trend: number
    target: number
  }
  orders: {
    inbound: number
    outbound: number
    pending: number
    completed: number
  }
  inventory: {
    totalValue: number
    itemCount: number
    lowStock: number
    outOfStock: number
  }
  alerts: {
    critical: number
    warning: number
    info: number
    total: number
  }
  performance: {
    fulfillmentRate: number
    onTimeDelivery: number
    accuracy: number
    efficiency: number
  }
}

interface RealtimeMetric {
  id: string
  label: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  timestamp: Date
}

export default function EnhancedDashboard() {
  const { products } = useProductStore()
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetric[]>([])
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Fetch dashboard stats
  const { data: stats, refetch } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 800))
      return generateMockStats()
    },
    refetchInterval: isLiveMode ? 5000 : false,
  })

  // Simulate real-time updates
  useEffect(() => {
    if (!isLiveMode) return

    const interval = setInterval(() => {
      setRealtimeMetrics(prev => [
        {
          id: Date.now().toString(),
          label: 'Active Orders',
          value: Math.floor(Math.random() * 50) + 10,
          change: Math.random() * 10 - 5,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          timestamp: new Date()
        },
        ...prev.slice(0, 4)
      ])
      setLastUpdate(new Date())
    }, 3000)

    return () => clearInterval(interval)
  }, [isLiveMode])

  const handleRefresh = () => {
    refetch()
    toast.success('Dashboard đã được làm mới!', {
      description: `Cập nhật lúc ${new Date().toLocaleTimeString()}`,
      duration: 2000
    })
  }

  // Xuất báo cáo PDF
  const exportToPDF = () => {
    if (!stats) {
      toast.error('Chưa có dữ liệu để xuất báo cáo')
      return
    }
    
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      
      // Header
      doc.setFontSize(20)
      doc.setTextColor(37, 99, 235) // Blue color
      doc.text('BÁO CÁO DASHBOARD', pageWidth / 2, 20, { align: 'center' })
      
      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128) // Gray color
      doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth / 2, 28, { align: 'center' })
      doc.text(`Thời gian: ${new Date().toLocaleTimeString('vi-VN')}`, pageWidth / 2, 33, { align: 'center' })
      
      // Summary Stats
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('TỔNG QUAN', 14, 45)
      
      const summaryData = [
        ['Chỉ số', 'Giá trị', 'Xu hướng'],
        ['Doanh thu hôm nay', `${stats.revenue.today.toFixed(1)}M đ`, `${stats.revenue.trend > 0 ? '+' : ''}${stats.revenue.trend.toFixed(1)}%`],
        ['Đơn hàng', stats.orders.inbound.toString(), `${stats.orders.inbound} đơn`],
        ['Giá trị tồn kho', `${stats.inventory.totalValue.toFixed(1)}B đ`, `${stats.inventory.itemCount} sản phẩm`],
        ['Cảnh báo', stats.alerts.total.toString(), stats.alerts.total > 0 ? 'Cần xử lý' : 'Bình thường'],
      ]
      
      doc.autoTable({
        startY: 50,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        styles: { font: 'helvetica', fontSize: 10 },
      })
      
  // Performance Metrics
  // Guard access to lastAutoTable (fallback to 50 if not set)
  let finalY = (doc.lastAutoTable?.finalY ?? 50) + 10
      doc.setFontSize(14)
      doc.text('CHỈ SỐ HIỆU SUẤT', 14, finalY)
      
      const performanceData = [
        ['Chỉ số', 'Tỷ lệ'],
        ['Fulfillment Rate', '94.5%'],
        ['On-time Delivery', '92.3%'],
        ['Accuracy', '98.7%'],
        ['Efficiency', '87.2%'],
      ]
      
      doc.autoTable({
        startY: finalY + 5,
        head: [performanceData[0]],
        body: performanceData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 10 },
      })
      
  // Footer
  finalY = (doc.lastAutoTable?.finalY ?? finalY) + 15
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text('© 2025 EcoFresh Cold Chain WMS - Hệ thống quản lý kho lạnh', pageWidth / 2, finalY, { align: 'center' })
      
      doc.save(`dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`)
      
      toast.success('Đã xuất báo cáo PDF!', {
        description: 'File đã được tải xuống',
        duration: 3000
      })
    } catch {
      toast.error('Lỗi khi xuất PDF', {
        description: 'Vui lòng thử lại sau',
        duration: 3000
      })
    }
  }

  // Xuất báo cáo Excel
  const exportToExcel = () => {
    if (!stats) {
      toast.error('Chưa có dữ liệu để xuất báo cáo')
      return
    }
    
    try {
      const workbook = XLSX.utils.book_new()
      
      // Sheet 1: Tổng quan
      const summaryData = [
        ['BÁO CÁO DASHBOARD'],
        [`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
        [`Thời gian: ${new Date().toLocaleTimeString('vi-VN')}`],
        [],
        ['TỔNG QUAN'],
        ['Chỉ số', 'Giá trị', 'Xu hướng'],
        ['Doanh thu hôm nay', `${stats.revenue.today.toFixed(1)}M đ`, `${stats.revenue.trend > 0 ? '+' : ''}${stats.revenue.trend.toFixed(1)}%`],
        ['Đơn hàng', stats.orders.inbound.toString(), `${stats.orders.inbound} đơn`],
        ['Giá trị tồn kho', `${stats.inventory.totalValue.toFixed(1)}B đ`, `${stats.inventory.itemCount} sản phẩm`],
        ['Cảnh báo', stats.alerts.total.toString(), stats.alerts.total > 0 ? 'Cần xử lý' : 'Bình thường'],
      ]
      
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, ws1, 'Tổng quan')
      
      // Sheet 2: Chi tiết đơn hàng
      const ordersData = [
        ['CHI TIẾT ĐƠN HÀNG'],
        [],
        ['Loại đơn', 'Số lượng', 'Trạng thái'],
        ['Nhập kho', stats.orders.inbound, 'Đang xử lý'],
        ['Xuất kho', stats.orders.outbound, 'Đang xử lý'],
        ['Chờ xử lý', stats.orders.pending, 'Chờ'],
        ['Hoàn thành', stats.orders.completed, 'Xong'],
      ]
      
      const ws2 = XLSX.utils.aoa_to_sheet(ordersData)
      XLSX.utils.book_append_sheet(workbook, ws2, 'Đơn hàng')
      
      // Sheet 3: Hiệu suất
      const performanceData = [
        ['CHỈ SỐ HIỆU SUẤT'],
        [],
        ['Chỉ số', 'Tỷ lệ', 'Đánh giá'],
        ['Fulfillment Rate', '94.5%', 'Tốt'],
        ['On-time Delivery', '92.3%', 'Tốt'],
        ['Accuracy', '98.7%', 'Xuất sắc'],
        ['Efficiency', '87.2%', 'Khá'],
      ]
      
      const ws3 = XLSX.utils.aoa_to_sheet(performanceData)
      XLSX.utils.book_append_sheet(workbook, ws3, 'Hiệu suất')
      
      // Sheet 4: Sản phẩm
      const productsData = [
        ['DANH SÁCH SẢN PHẨM'],
        [],
        ['Mã SKU', 'Tên sản phẩm', 'Tồn kho', 'Loại nhiệt độ', 'Nguồn gốc'],
        ...products.slice(0, 50).map(p => [
          p.sku,
          p.name,
          p.stockLevel,
          p.tempClass || 'N/A',
          p.origin || 'N/A'
        ])
      ]
      
      const ws4 = XLSX.utils.aoa_to_sheet(productsData)
      XLSX.utils.book_append_sheet(workbook, ws4, 'Sản phẩm')
      
      XLSX.writeFile(workbook, `dashboard-report-${new Date().toISOString().split('T')[0]}.xlsx`)
      
      toast.success('Đã xuất báo cáo Excel!', {
        description: 'File đã được tải xuống',
        duration: 3000
      })
    } catch {
      toast.error('Lỗi khi xuất Excel', {
        description: 'Vui lòng thử lại sau',
        duration: 3000
      })
    }
  }

  // Xuất báo cáo CSV
  const exportToCSV = () => {
    if (!stats) {
      toast.error('Chưa có dữ liệu để xuất báo cáo')
      return
    }
    
    try {
      const csvData = [
        ['BÁO CÁO DASHBOARD'],
        [`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
        [`Thời gian: ${new Date().toLocaleTimeString('vi-VN')}`],
        [],
        ['TỔNG QUAN'],
        ['Chỉ số', 'Giá trị', 'Xu hướng'],
        ['Doanh thu hôm nay', `${stats.revenue.today.toFixed(1)}M đ`, `${stats.revenue.trend > 0 ? '+' : ''}${stats.revenue.trend.toFixed(1)}%`],
        ['Đơn hàng', stats.orders.inbound.toString(), `${stats.orders.inbound} đơn`],
        ['Giá trị tồn kho', `${stats.inventory.totalValue.toFixed(1)}B đ`, `${stats.inventory.itemCount} sản phẩm`],
        ['Cảnh báo', stats.alerts.total.toString(), stats.alerts.total > 0 ? 'Cần xử lý' : 'Bình thường'],
        [],
        ['CHỈ SỐ HIỆU SUẤT'],
        ['Chỉ số', 'Tỷ lệ'],
        ['Fulfillment Rate', '94.5%'],
        ['On-time Delivery', '92.3%'],
        ['Accuracy', '98.7%'],
        ['Efficiency', '87.2%'],
      ]
      
      const csv = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      toast.success('Đã xuất báo cáo CSV!', {
        description: 'File đã được tải xuống',
        duration: 3000
      })
    } catch {
      toast.error('Lỗi khi xuất CSV', {
        description: 'Vui lòng thử lại sau',
        duration: 3000
      })
    }
  }

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    setShowExportMenu(false)
    
    switch (format) {
      case 'pdf':
        exportToPDF()
        break
      case 'excel':
        exportToExcel()
        break
      case 'csv':
        exportToCSV()
        break
    }
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isLiveMode && (
            <Badge className="bg-green-500 text-white animate-pulse text-base px-4 py-2">
              <span className="w-2 h-2 bg-white rounded-full mr-2 inline-block"></span>
              TRỰC TIẾP
            </Badge>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={isLiveMode ? 'border-green-500 text-green-600' : ''}
          >
            <Zap className="w-4 h-4 mr-2" />
            {isLiveMode ? 'Chế độ trực tiếp' : 'Đã tạm dừng'}
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <div className="relative">
            <Button 
              onClick={() => setShowExportMenu(!showExportMenu)} 
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
            
            {/* Export Menu Dropdown */}
            {showExportMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
              >
                <div className="p-2">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FileText className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Xuất PDF</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">File PDF với định dạng đẹp</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Xuất Excel</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">File Excel với nhiều sheet</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <File className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Xuất CSV</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">File CSV đơn giản</div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop to close menu */}
      {showExportMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowExportMenu(false)}
        />
      )}

      {/* Real-time Metrics Banner */}
      {realtimeMetrics.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 overflow-x-auto">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div className="flex gap-6">
                {realtimeMetrics.slice(0, 3).map(metric => (
                  <div key={metric.id} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {metric.label}:
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {metric.value}
                    </span>
                    <span className={`flex items-center text-sm ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {Math.abs(metric.change).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
              <span className="ml-auto text-xs text-gray-500 flex-shrink-0">
                <Clock className="w-3 h-3 inline mr-1" />
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Doanh thu hôm nay"
          value={formatCurrency(stats.revenue.today)}
          change={stats.revenue.trend}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-600"
          subtext={`Target: ${formatCurrency(stats.revenue.target)}`}
          progress={(stats.revenue.today / stats.revenue.target) * 100}
        />
        
        <StatCard
          title="Đơn hàng"
          value={stats.orders.completed.toString()}
          change={12.5}
          icon={Package}
          gradient="from-blue-500 to-cyan-600"
          subtext={`${stats.orders.pending} đang xử lý`}
        />
        
        <StatCard
          title="Giá trị tồn kho"
          value={formatCurrency(stats.inventory.totalValue)}
          change={-2.3}
          icon={Layers}
          gradient="from-purple-500 to-pink-600"
          subtext={`${stats.inventory.itemCount} sản phẩm`}
        />
        
        <StatCard
          title="Cảnh báo"
          value={stats.alerts.total.toString()}
          change={-15.2}
          icon={AlertTriangle}
          gradient="from-orange-500 to-red-600"
          subtext={`${stats.alerts.critical} quan trọng`}
          alertCount={stats.alerts.critical}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PerformanceCard
          title="Tỷ lệ hoàn thành"
          value={stats.performance.fulfillmentRate}
          icon={Target}
          color="blue"
        />
        <PerformanceCard
          title="Giao hàng đúng hạn"
          value={stats.performance.onTimeDelivery}
          icon={Truck}
          color="green"
        />
        <PerformanceCard
          title="Độ chính xác"
          value={stats.performance.accuracy}
          icon={Award}
          color="purple"
        />
        <PerformanceCard
          title="Hiệu suất"
          value={stats.performance.efficiency}
          icon={Zap}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Xu hướng doanh thu (7 ngày)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Phân bố đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderDistribution stats={stats} />
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed />
        </CardContent>
      </Card>
    </div>
  )
}

// Helper Components
interface StatCardProps {
  title: string
  value: string
  change: number
  icon: LucideIcon
  gradient: string
  subtext?: string
  progress?: number
  alertCount?: number
}

function StatCard({ title, value, change, icon: Icon, gradient, subtext, progress, alertCount }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-0 shadow-lg overflow-hidden relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`}></div>
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {alertCount !== undefined && alertCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {alertCount}
              </Badge>
            )}
          </div>
          
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </h3>
          
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            <span className={`flex items-center text-sm font-medium ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
          
          {subtext && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtext}
            </p>
          )}
          
          {progress !== undefined && (
            <div className="mt-3">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}% of target</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface PerformanceCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple' | 'orange'
}

function PerformanceCard({ title, value, icon: Icon, color }: PerformanceCardProps) {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  }

  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorMap[color]}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </h3>
        </div>
        
        <div className="relative">
          <Progress value={value} className="h-3" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {value.toFixed(1)}%
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function RevenueChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const data = [12, 19, 15, 25, 22, 30, 28]
  const maxValue = Math.max(...data)

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-48 gap-2">
        {data.map((value, idx) => (
          <motion.div
            key={idx}
            initial={{ height: 0 }}
            animate={{ height: `${(value / maxValue) * 100}%` }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative group cursor-pointer"
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                ${value}M
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        {days.map((day, idx) => (
          <span key={idx} className="flex-1 text-center">{day}</span>
        ))}
      </div>
    </div>
  )
}

function OrderDistribution({ stats }: { stats: DashboardStats }) {
  const data = [
    { label: 'Inbound', value: stats.orders.inbound, color: 'bg-blue-500' },
    { label: 'Outbound', value: stats.orders.outbound, color: 'bg-green-500' },
    { label: 'Pending', value: stats.orders.pending, color: 'bg-yellow-500' },
    { label: 'Completed', value: stats.orders.completed, color: 'bg-purple-500' }
  ]

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-4">
      {data.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.label}
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {item.value} ({((item.value / total) * 100).toFixed(0)}%)
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / total) * 100}%` }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`h-full ${item.color}`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ActivityFeed() {
  const activities = [
    { icon: Package, text: 'New inbound order #IB-2025-145 received', time: '2 mins ago', color: 'text-blue-600' },
    { icon: Truck, text: 'Outbound order #OB-2025-382 shipped', time: '5 mins ago', color: 'text-green-600' },
    { icon: AlertTriangle, text: 'Low stock alert: Salmon Fillet', time: '12 mins ago', color: 'text-orange-600' },
    { icon: Users, text: 'User John Doe logged in', time: '15 mins ago', color: 'text-purple-600' },
    { icon: Package, text: 'Inventory updated: 15 items', time: '20 mins ago', color: 'text-cyan-600' }
  ]

  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${activity.color}`}>
            <activity.icon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {activity.text}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activity.time}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Helper functions
function formatCurrency(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B ₫`
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M ₫`
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K ₫`
  return `${value} ₫`
}

function generateMockStats(): DashboardStats {
  return {
    revenue: {
      today: 15500000,
      yesterday: 13200000,
      trend: 17.4,
      target: 20000000
    },
    orders: {
      inbound: 24,
      outbound: 18,
      pending: 12,
      completed: 156
    },
    inventory: {
      totalValue: 2450000000,
      itemCount: 1234,
      lowStock: 45,
      outOfStock: 3
    },
    alerts: {
      critical: 3,
      warning: 12,
      info: 8,
      total: 23
    },
    performance: {
      fulfillmentRate: 94.5,
      onTimeDelivery: 92.3,
      accuracy: 98.7,
      efficiency: 87.2
    }
  }
}
