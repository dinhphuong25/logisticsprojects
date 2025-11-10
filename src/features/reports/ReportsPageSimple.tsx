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
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF
    lastAutoTable: { finalY: number }
  }
}

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
    
    toast.loading('Đang tạo file PDF...', { id: 'pdf-download' })
    
    try {
      // Create new PDF document
      const doc = new jsPDF()
      
      // Add Vietnamese font support (using default font for now)
      doc.setFont('helvetica')
      
      // Header
      doc.setFontSize(20)
      doc.setTextColor(99, 102, 241) // Indigo color
      doc.text(report.name, 15, 20)
      
      // Subheader
      doc.setFontSize(12)
      doc.setTextColor(107, 114, 128) // Gray color
      doc.text(report.description, 15, 30)
      
      // Divider line
      doc.setDrawColor(229, 231, 235)
      doc.line(15, 35, 195, 35)
      
      // Report Info
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      let yPos = 45
      
      doc.text(`Loai bao cao: ${getReportTypeName(report.type)}`, 15, yPos)
      yPos += 7
      doc.text(`Thoi gian: ${report.period}`, 15, yPos)
      yPos += 7
      doc.text(`Dinh dang: ${report.format}`, 15, yPos)
      yPos += 7
      doc.text(`Kich thuoc: ${report.fileSize}`, 15, yPos)
      yPos += 7
      doc.text(`Ngay tao: ${new Date(report.generatedAt).toLocaleString('vi-VN')}`, 15, yPos)
      yPos += 7
      doc.text(`Luot tai: ${report.downloads}`, 15, yPos)
      
      // Add some sample data based on report type
      yPos += 15
      doc.setFontSize(14)
      doc.setTextColor(99, 102, 241)
      doc.text('Thong tin chi tiet', 15, yPos)
      
      yPos += 10
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      
      // Add table based on report type
      const tableData = generateTableData(report.type)
      
      doc.autoTable({
        startY: yPos,
        head: [tableData.headers],
        body: tableData.rows,
        theme: 'grid',
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      })
      
  // Footer
  // Use optional chaining in case autoTable didn't populate lastAutoTable
  const finalY = doc.lastAutoTable?.finalY ?? (yPos + 50)
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text('Bao cao duoc tao tu He thong Quan ly Kho Lanh', 15, finalY + 15)
      doc.text(`Ngay tai xuong: ${new Date().toLocaleString('vi-VN')}`, 15, finalY + 20)
      
      // Save PDF
      const fileName = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      doc.save(fileName)
      
      toast.success('Tải xuống thành công!', { id: 'pdf-download' })
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Không thể tạo file PDF', { id: 'pdf-download' })
    }
  }
  
  const getReportTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      'INVENTORY': 'Ton kho',
      'INBOUND': 'Nhap hang',
      'OUTBOUND': 'Xuat hang',
      'TEMPERATURE': 'Nhiet do',
      'ENERGY': 'Nang luong',
      'FINANCIAL': 'Tai chinh',
      'CUSTOMER': 'Khach hang',
      'PERFORMANCE': 'Hieu suat'
    }
    return typeMap[type] || type
  }
  
  const generateTableData = (type: string) => {
    switch (type) {
      case 'INVENTORY':
        return {
          headers: ['Ma SP', 'Ten san pham', 'So luong', 'Gia tri', 'Trang thai'],
          rows: [
            ['SKU001', 'Thit bo dong lanh', '250 kg', '75,000,000 VND', 'Ton kho'],
            ['SKU002', 'Ca hoi tuoi', '180 kg', '54,000,000 VND', 'Ton kho'],
            ['SKU003', 'Rau cu qua', '320 kg', '12,800,000 VND', 'Ton kho'],
            ['SKU004', 'Thuc pham dong lanh', '450 kg', '90,000,000 VND', 'Ton kho'],
            ['SKU005', 'Sua tuoi', '200 lit', '20,000,000 VND', 'Ton kho']
          ]
        }
      case 'INBOUND':
        return {
          headers: ['Ma don', 'Nha cung cap', 'So luong', 'Thoi gian', 'Trang thai'],
          rows: [
            ['IB-001', 'ABC Foods Co.', '500 kg', '05/11/2025 08:30', 'Hoan thanh'],
            ['IB-002', 'Fresh Market Ltd', '350 kg', '05/11/2025 10:15', 'Hoan thanh'],
            ['IB-003', 'Cold Chain Pro', '420 kg', '05/11/2025 14:20', 'Hoan thanh'],
            ['IB-004', 'VN Logistics', '280 kg', '05/11/2025 16:45', 'Dang xu ly'],
            ['IB-005', 'Import Export JSC', '600 kg', '06/11/2025 09:00', 'Dang xu ly']
          ]
        }
      case 'OUTBOUND':
        return {
          headers: ['Ma don', 'Khach hang', 'So luong', 'Thoi gian giao', 'Trang thai'],
          rows: [
            ['OB-001', 'Sieu thi BigC', '320 kg', '05/11/2025 07:00', 'Da giao'],
            ['OB-002', 'Nha hang Luxury', '150 kg', '05/11/2025 09:30', 'Da giao'],
            ['OB-003', 'Cua hang thuc pham', '200 kg', '05/11/2025 11:00', 'Da giao'],
            ['OB-004', 'Khach si', '450 kg', '05/11/2025 15:30', 'Dang giao'],
            ['OB-005', 'Sieu thi Co.op', '380 kg', '06/11/2025 08:00', 'Cho giao']
          ]
        }
      case 'TEMPERATURE':
        return {
          headers: ['Khu vuc', 'Nhiet do TB', 'Min', 'Max', 'Canh bao'],
          rows: [
            ['Zone A', '-2°C', '-4°C', '0°C', 'Khong'],
            ['Zone B', '-18°C', '-20°C', '-16°C', 'Khong'],
            ['Zone C', '2°C', '0°C', '4°C', 'Khong'],
            ['Zone D', '-15°C', '-18°C', '-12°C', '1 lan'],
            ['Zone E', '5°C', '3°C', '7°C', 'Khong']
          ]
        }
      case 'ENERGY':
        return {
          headers: ['Ngay', 'San luong (kWh)', 'Tieu thu (kWh)', 'Tiet kiem', 'Hieu suat'],
          rows: [
            ['01/11/2025', '145.2', '180.5', '35,000 VND', '88%'],
            ['02/11/2025', '152.8', '175.3', '38,000 VND', '92%'],
            ['03/11/2025', '138.5', '182.1', '32,000 VND', '85%'],
            ['04/11/2025', '160.3', '178.9', '42,000 VND', '94%'],
            ['05/11/2025', '148.7', '176.2', '36,000 VND', '89%']
          ]
        }
      case 'FINANCIAL':
        return {
          headers: ['Hang muc', 'Doanh thu', 'Chi phi', 'Loi nhuan', 'Ty suat'],
          rows: [
            ['Tuan 1', '450,000,000', '280,000,000', '170,000,000', '37.8%'],
            ['Tuan 2', '520,000,000', '310,000,000', '210,000,000', '40.4%'],
            ['Tuan 3', '480,000,000', '295,000,000', '185,000,000', '38.5%'],
            ['Tuan 4', '510,000,000', '305,000,000', '205,000,000', '40.2%'],
            ['Tong', '1,960,000,000', '1,190,000,000', '770,000,000', '39.3%']
          ]
        }
      case 'CUSTOMER':
        return {
          headers: ['Khach hang', 'So don', 'Tong gia tri', 'Trung binh', 'Xep hang'],
          rows: [
            ['Sieu thi BigC', '45', '850,000,000', '18,888,889', 'VIP'],
            ['Co.op Mart', '38', '720,000,000', '18,947,368', 'VIP'],
            ['Nha hang Luxury', '52', '680,000,000', '13,076,923', 'Gold'],
            ['Khach si ABC', '28', '560,000,000', '20,000,000', 'VIP'],
            ['Cua hang XYZ', '65', '420,000,000', '6,461,538', 'Silver']
          ]
        }
      case 'PERFORMANCE':
        return {
          headers: ['Chi tieu', 'Muc tieu', 'Thuc te', 'Dat duoc', 'Danh gia'],
          rows: [
            ['Toc do nhap hang', '500 kg/h', '520 kg/h', '104%', 'Tot'],
            ['Do chinh xac', '99%', '98.5%', '99.5%', 'Tot'],
            ['Thoi gian giao hang', '2h', '1.8h', '110%', 'Xuat sac'],
            ['Ty le loi', '< 1%', '0.5%', '200%', 'Xuat sac'],
            ['Hieu suat nang luong', '90%', '92%', '102%', 'Tot']
          ]
        }
      default:
        return {
          headers: ['Tieu de', 'Gia tri', 'Ghi chu'],
          rows: [
            ['Du lieu mau 1', '100', 'Thong tin chi tiet'],
            ['Du lieu mau 2', '200', 'Thong tin chi tiet'],
            ['Du lieu mau 3', '300', 'Thong tin chi tiet']
          ]
        }
    }
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

  const handleGenerateReport = () => {
    toast.loading('Đang tạo báo cáo...', { id: 'generate-report' })
    
    try {
      // Create a new comprehensive report
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      
      // Header with gradient effect (simulated with color)
      doc.setFontSize(24)
      doc.setTextColor(99, 102, 241) // Indigo
      doc.text('BAO CAO TONG QUAN', pageWidth / 2, 20, { align: 'center' })
      
      doc.setFontSize(12)
      doc.setTextColor(107, 114, 128) // Gray
      doc.text('He thong Quan ly Kho Lanh EcoFresh', pageWidth / 2, 30, { align: 'center' })
      doc.text(`Ngay tao: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth / 2, 37, { align: 'center' })
      doc.text(`Thoi gian: ${new Date().toLocaleTimeString('vi-VN')}`, pageWidth / 2, 44, { align: 'center' })
      
      // Divider
      doc.setDrawColor(99, 102, 241)
      doc.setLineWidth(0.5)
      doc.line(15, 50, pageWidth - 15, 50)
      
      // Period selection info
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      doc.text(`Khoang thoi gian: ${selectedPeriod === 'today' ? 'Hom nay' : selectedPeriod === 'week' ? 'Tuan nay' : selectedPeriod === 'month' ? 'Thang nay' : selectedPeriod === 'quarter' ? 'Quy nay' : 'Nam nay'}`, 15, 58)
      
      // Statistics Summary
      doc.setFontSize(14)
      doc.setTextColor(99, 102, 241)
      doc.text('TONG QUAN HOAT DONG', 15, 70)
      
      const summaryData = [
        ['Chi tieu', 'Gia tri', 'Trang thai'],
        ['Tong so bao cao', stats.total.toString(), 'Hoan tat'],
        ['Bao cao san sang', stats.ready.toString(), 'Khong co loi'],
        ['Thoi gian trung binh', `${stats.avgTime}s`, 'Tot'],
        ['Luot tai xuong', stats.downloads.toString(), 'Cao']
      ]
      
      doc.autoTable({
        startY: 75,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        headStyles: { 
          fillColor: [99, 102, 241], 
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10
        },
        styles: { 
          fontSize: 9,
          cellPadding: 4
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      })
      
  // Report Types Overview
  // Guard access to lastAutoTable
  let finalY = (doc.lastAutoTable?.finalY ?? 75) + 15
      doc.setFontSize(14)
      doc.setTextColor(99, 102, 241)
      doc.text('PHAN LOAI BAO CAO', 15, finalY)
      
      const typeData = [
        ['Loai bao cao', 'So luong', 'Mo ta'],
        ['Ton kho', '3', 'Phan tich muc ton kho va gia tri'],
        ['Nhap hang', '2', 'Hieu suat tiep nhan hang hoa'],
        ['Xuat hang', '2', 'Chi so picking va giao hang'],
        ['Nhiet do', '1', 'Giam sat nhiet do kho lanh'],
        ['Nang luong', '1', 'San luong dien mat troi'],
        ['Tai chinh', '1', 'Doanh thu va chi phi']
      ]
      
      doc.autoTable({
        startY: finalY + 5,
        head: [typeData[0]],
        body: typeData.slice(1),
        theme: 'striped',
        headStyles: { 
          fillColor: [139, 92, 246], // Purple
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10
        },
        styles: { 
          fontSize: 9,
          cellPadding: 4
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      })
      
  // Performance Metrics
  finalY = (doc.lastAutoTable?.finalY ?? finalY) + 15
      doc.setFontSize(14)
      doc.setTextColor(99, 102, 241)
      doc.text('CHI SO HIEU SUAT', 15, finalY)
      
      const performanceData = [
        ['Chi tieu', 'Gia tri', 'Danh gia'],
        ['Ty le tao bao cao thanh cong', '98.5%', 'Xuat sac'],
        ['Thoi gian xu ly trung binh', '2.3s', 'Tot'],
        ['Do chinh xac du lieu', '99.2%', 'Xuat sac'],
        ['Ty le tai lai thanh cong', '100%', 'Hoan hao']
      ]
      
      doc.autoTable({
        startY: finalY + 5,
        head: [performanceData[0]],
        body: performanceData.slice(1),
        theme: 'grid',
        headStyles: { 
          fillColor: [16, 185, 129], // Green
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10
        },
        styles: { 
          fontSize: 9,
          cellPadding: 4
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      })
      
  // Footer
  finalY = (doc.lastAutoTable?.finalY ?? finalY) + 20
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text('© 2025 EcoFresh Cold Chain WMS - He thong quan ly kho lanh', pageWidth / 2, finalY, { align: 'center' })
      doc.text('Website: ecofresh.com | Email: contact@ecofresh.com | Tel: +84 123 456 789', pageWidth / 2, finalY + 5, { align: 'center' })
      
      // Save the PDF
      const fileName = `bao-cao-tong-quan-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      toast.success('Đã tạo và tải xuống báo cáo thành công!', { 
        id: 'generate-report',
        description: `File: ${fileName}`,
        duration: 4000
      })
      
    } catch (error) {
      console.error('Error generating report:', error)
      const msg = error instanceof Error ? error.message : String(error)
      toast.error('Không thể tạo báo cáo', { 
        id: 'generate-report',
        description: msg || 'Vui lòng thử lại sau',
        duration: 5000
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Báo cáo & Phân tích
          </h1>
          <p className="text-xs md:text-base text-gray-500 dark:text-gray-400 mt-1 md:mt-2">
            Tạo và tải xuống báo cáo chi tiết về hoạt động kho lạnh
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0">
          <Button variant="outline" size="sm" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 shrink-0 text-xs md:text-sm">
            <Calendar className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
            <span className="hidden sm:inline">Lên lịch</span>
          </Button>
          <Button 
            onClick={handleGenerateReport}
            size="sm" 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shrink-0 text-xs md:text-sm"
          >
            <FileText className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
            <span className="hidden sm:inline">Tạo báo cáo</span>
            <span className="sm:hidden">Tạo</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng báo cáo</p>
                <p className="text-2xl md:text-4xl font-bold text-blue-600">{stats.total}</p>
                <Badge className="bg-blue-500 text-white mt-1 md:mt-2 text-xs">+12%</Badge>
              </div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">Sẵn sàng</p>
                <p className="text-2xl md:text-4xl font-bold text-green-600">{stats.ready}</p>
                <Badge className="bg-green-500 text-white mt-1 md:mt-2 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  OK
                </Badge>
              </div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">Thời gian TB</p>
                <p className="text-2xl md:text-4xl font-bold text-purple-600">{stats.avgTime}s</p>
                <Badge className="bg-purple-500 text-white mt-1 md:mt-2 text-xs">-8%</Badge>
              </div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">Tải xuống</p>
                <p className="text-2xl md:text-4xl font-bold text-orange-600">{stats.downloads}</p>
                <Badge className="bg-orange-500 text-white mt-1 md:mt-2 text-xs">+24%</Badge>
              </div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Download className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period & Type Selector */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-base md:text-lg">Chọn khoảng thời gian báo cáo</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 md:gap-3">
            {[
              { value: 'today', label: 'Hôm nay' },
              { value: 'week', label: 'Tuần này' },
              { value: 'month', label: 'Tháng này' },
              { value: 'quarter', label: 'Quý này' },
              { value: 'year', label: 'Năm nay' }
            ].map((period) => (
              <Button
                key={period.value}
                size="sm"
                variant={selectedPeriod === period.value ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod(period.value)}
                className={`text-xs md:text-sm ${selectedPeriod === period.value ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : ''}`}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Types Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Loại báo cáo</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedType('ALL')}
            className={`text-xs md:text-sm ${selectedType === 'ALL' ? 'border-purple-500 text-purple-600' : ''}`}
          >
            Tất cả ({reports?.length})
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
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
                <CardContent className="p-4 md:p-6">
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${type.iconBg} flex items-center justify-center mb-3 md:mb-4`}>
                    <Icon className={`w-5 h-5 md:w-7 md:h-7 ${type.iconColor}`} />
                  </div>
                  <h3 className="text-sm md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">{type.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 md:mb-3 line-clamp-2">{type.description}</p>
                  <Badge className={`bg-gradient-to-r ${type.color} text-white text-xs`}>
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
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
            {selectedType === 'ALL' ? 'Tất cả báo cáo' : reportTypes.find(t => t.id === selectedType)?.name}
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            {filteredReports.length} báo cáo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {filteredReports.map((report) => {
            const FormatIcon = getFormatIcon(report.format)
            const typeConfig = reportTypes.find(t => t.id === report.type)
            const TypeIcon = typeConfig?.icon || FileText

            return (
              <Card key={report.id} className="border-0 shadow-xl hover:shadow-2xl transition-all group">
                <CardHeader className="pb-3 md:pb-4">
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${typeConfig?.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <TypeIcon className={`w-6 h-6 md:w-8 md:h-8 ${typeConfig?.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1 md:mb-2">
                        <CardTitle className="text-sm md:text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                          {report.name}
                        </CardTitle>
                        {report.downloads > 50 && (
                          <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 md:mb-3 line-clamp-2 hidden sm:block">
                        {report.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        {getStatusBadge(report.status)}
                        <div className="flex items-center gap-1">
                          <FormatIcon className="w-3 h-3 md:w-4 md:h-4" />
                          <span>{report.format}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                          <span>{report.period}</span>
                        </div>
                        {report.status === 'READY' && (
                          <>
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3 md:w-4 md:h-4" />
                              <span>{report.fileSize}</span>
                            </div>
                            <div className="hidden md:flex items-center gap-1">
                              <Download className="w-3 h-3 md:w-4 md:h-4" />
                              <span>{report.downloads} lượt</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-1 md:mt-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {getTimeAgo(report.generatedAt)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(report)}
                      disabled={report.status !== 'READY'}
                      className="flex-1 text-xs hidden sm:flex"
                    >
                      <Eye className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                      <span className="hidden md:inline">Xem trước</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(report)}
                      disabled={report.status !== 'READY'}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs"
                    >
                      <Download className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                      Tải xuống
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleShare}
                      disabled={report.status !== 'READY'}
                      className="px-2 md:px-3"
                    >
                      <Share2 className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEmail}
                      disabled={report.status !== 'READY'}
                      className="px-2 md:px-3 hidden sm:flex"
                    >
                      <Mail className="w-3 h-3 md:w-4 md:h-4" />
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
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 md:gap-3 text-base md:text-lg">
            <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
            Báo cáo phổ biến nhất
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {reports
              ?.filter(r => r.status === 'READY')
              .sort((a, b) => b.downloads - a.downloads)
              .slice(0, 3)
              .map((report, index) => (
                <div
                  key={report.id}
                  className="p-3 md:p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                      #{index + 1}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{report.downloads} lượt</Badge>
                  </div>
                  <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {report.name}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{report.period}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
