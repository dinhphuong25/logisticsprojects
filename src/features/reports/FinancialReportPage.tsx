import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  TruckIcon,
  Users,
  Zap,
  CreditCard,
  PieChart,
  BarChart3,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface FinancialData {
  period: string
  revenue: {
    total: number
    inbound: number
    outbound: number
    storage: number
    other: number
  }
  expenses: {
    total: number
    labor: number
    energy: number
    maintenance: number
    transport: number
    other: number
  }
  profit: {
    gross: number
    net: number
    margin: number
  }
  cash: {
    opening: number
    closing: number
    flow: number
  }
}

// Dữ liệu mẫu báo cáo tài chính Quý 3/2025
const financialReport: FinancialData = {
  period: 'Quý 3/2025 (Tháng 7-9)',
  revenue: {
    total: 5850000000, // 5.85 tỷ
    inbound: 1950000000, // 1.95 tỷ - Dịch vụ nhập hàng
    outbound: 2340000000, // 2.34 tỷ - Dịch vụ xuất hàng
    storage: 1170000000, // 1.17 tỷ - Phí lưu kho
    other: 390000000 // 390 triệu - Dịch vụ khác
  },
  expenses: {
    total: 3510000000, // 3.51 tỷ
    labor: 1404000000, // 1.404 tỷ - Lương nhân viên (40%)
    energy: 877500000, // 877.5 triệu - Điện năng (25%)
    maintenance: 526500000, // 526.5 triệu - Bảo trì thiết bị (15%)
    transport: 351000000, // 351 triệu - Vận chuyển (10%)
    other: 351000000 // 351 triệu - Chi phí khác (10%)
  },
  profit: {
    gross: 2340000000, // 2.34 tỷ - Lợi nhuận gộp
    net: 1872000000, // 1.872 tỷ - Lợi nhuận ròng (sau thuế 20%)
    margin: 32.0 // 32% - Tỷ suất lợi nhuận
  },
  cash: {
    opening: 4500000000, // 4.5 tỷ - Tiền đầu kỳ
    closing: 6372000000, // 6.372 tỷ - Tiền cuối kỳ
    flow: 1872000000 // 1.872 tỷ - Dòng tiền thuần
  }
}

// Dữ liệu so sánh theo tháng
const monthlyData = [
  {
    month: 'Tháng 7',
    revenue: 1950000000,
    expenses: 1170000000,
    profit: 624000000,
    margin: 32.0
  },
  {
    month: 'Tháng 8',
    revenue: 1872000000,
    expenses: 1123200000,
    profit: 598720000,
    margin: 32.0
  },
  {
    month: 'Tháng 9',
    revenue: 2028000000,
    expenses: 1216800000,
    profit: 649200000,
    margin: 32.0
  }
]

// Top khách hàng theo doanh thu
const topCustomers = [
  { name: 'Siêu thị BigC', revenue: 1170000000, orders: 145, avgOrder: 8068965 },
  { name: 'Co.op Mart', revenue: 936000000, orders: 128, avgOrder: 7312500 },
  { name: 'Nhà hàng Luxury Chain', revenue: 702000000, orders: 186, avgOrder: 3774193 },
  { name: 'Khách sỉ ABC Corporation', revenue: 585000000, orders: 89, avgOrder: 6573033 },
  { name: 'Hệ thống cửa hàng XYZ', revenue: 468000000, orders: 234, avgOrder: 2000000 }
]

// Chi tiết chi phí vận hành
const operatingExpenses = [
  { category: 'Lương & Phúc lợi', amount: 1404000000, percent: 40.0, trend: 2.5 },
  { category: 'Điện năng & Nhiên liệu', amount: 877500000, percent: 25.0, trend: -5.2 },
  { category: 'Bảo trì & Sửa chữa', amount: 526500000, percent: 15.0, trend: 1.8 },
  { category: 'Vận chuyển & Logistics', amount: 351000000, percent: 10.0, trend: 3.1 },
  { category: 'Quản lý & Hành chính', amount: 210600000, percent: 6.0, trend: 0.5 },
  { category: 'Marketing & Bán hàng', amount: 140400000, percent: 4.0, trend: 8.3 }
]

export default function FinancialReportPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)} tỷ`
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)} triệu`
    }
    return `${value.toLocaleString('vi-VN')} đ`
  }

  const handleExportPDF = () => {
    toast.loading('Đang tạo file PDF...', { id: 'pdf-export' })

    try {
      const doc = new jsPDF()

      // ===== TRANG 1: TỔNG QUAN =====
      
      // Header
      doc.setFontSize(22)
      doc.setTextColor(99, 102, 241)
      doc.text('BAO CAO TAI CHINH', 105, 20, { align: 'center' })
      
      doc.setFontSize(14)
      doc.setTextColor(107, 114, 128)
      doc.text('He thong Quan ly Kho Lanh', 105, 28, { align: 'center' })
      doc.text(financialReport.period, 105, 35, { align: 'center' })

      // Divider
      doc.setDrawColor(229, 231, 235)
      doc.setLineWidth(0.5)
      doc.line(20, 40, 190, 40)

      // KPI Cards
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      
      let yPos = 50

      // Revenue Card
      doc.setFillColor(239, 246, 255)
      doc.roundedRect(20, yPos, 85, 35, 3, 3, 'F')
      doc.setFontSize(10)
      doc.setTextColor(59, 130, 246)
      doc.text('DOANH THU', 25, yPos + 8)
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text(formatCurrency(financialReport.revenue.total), 25, yPos + 18)
      doc.setFontSize(9)
      doc.setTextColor(34, 197, 94)
      doc.text('+ 12.5% so voi quy truoc', 25, yPos + 26)

      // Profit Card
      doc.setFillColor(240, 253, 244)
      doc.roundedRect(110, yPos, 80, 35, 3, 3, 'F')
      doc.setFontSize(10)
      doc.setTextColor(34, 197, 94)
      doc.text('LOI NHUAN RONG', 115, yPos + 8)
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text(formatCurrency(financialReport.profit.net), 115, yPos + 18)
      doc.setFontSize(9)
      doc.setTextColor(34, 197, 94)
      doc.text(`Bien loi nhuan: ${financialReport.profit.margin}%`, 115, yPos + 26)

      yPos += 45

      // Expenses Card
      doc.setFillColor(254, 242, 242)
      doc.roundedRect(20, yPos, 85, 35, 3, 3, 'F')
      doc.setFontSize(10)
      doc.setTextColor(239, 68, 68)
      doc.text('CHI PHI', 25, yPos + 8)
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text(formatCurrency(financialReport.expenses.total), 25, yPos + 18)
      doc.setFontSize(9)
      doc.setTextColor(239, 68, 68)
      doc.text('40% lao dong, 25% nang luong', 25, yPos + 26)

      // Cash Flow Card
      doc.setFillColor(255, 247, 237)
      doc.roundedRect(110, yPos, 80, 35, 3, 3, 'F')
      doc.setFontSize(10)
      doc.setTextColor(249, 115, 22)
      doc.text('DONG TIEN', 115, yPos + 8)
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text(formatCurrency(financialReport.cash.closing), 115, yPos + 18)
      doc.setFontSize(9)
      doc.setTextColor(34, 197, 94)
      doc.text(`+ ${formatCurrency(financialReport.cash.flow)}`, 115, yPos + 26)

      yPos += 50

      // Bảng phân tích doanh thu
      doc.setFontSize(14)
      doc.setTextColor(99, 102, 241)
      doc.text('PHAN TICH DOANH THU', 20, yPos)
      
      yPos += 5

      // @ts-expect-error - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        head: [['Hang muc', 'Gia tri', 'Ti le', 'Tang truong']],
        body: [
          ['Dich vu nhap hang', formatCurrency(financialReport.revenue.inbound), '33.3%', '+ 8.5%'],
          ['Dich vu xuat hang', formatCurrency(financialReport.revenue.outbound), '40.0%', '+ 15.2%'],
          ['Phi luu kho', formatCurrency(financialReport.revenue.storage), '20.0%', '+ 10.8%'],
          ['Dich vu khac', formatCurrency(financialReport.revenue.other), '6.7%', '+ 18.3%'],
          ['TONG DOANH THU', formatCurrency(financialReport.revenue.total), '100%', '+ 12.5%']
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 45, halign: 'right' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 35, halign: 'center' }
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      })

      // Footer trang 1
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text('Trang 1/3 - Bao cao Tai chinh ' + financialReport.period, 105, 285, { align: 'center' })

      // ===== TRANG 2: CHI PHI & LỢI NHUẬN =====
      doc.addPage()

      yPos = 20

      // Header trang 2
      doc.setFontSize(16)
      doc.setTextColor(99, 102, 241)
      doc.text('PHAN TICH CHI PHI VA LOI NHUAN', 105, yPos, { align: 'center' })
      
      yPos += 10

      // Bảng chi phí vận hành
      // @ts-expect-error - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        head: [['Loai chi phi', 'Gia tri', 'Ti le', 'Bien dong']],
        body: operatingExpenses.map(item => [
          item.category,
          formatCurrency(item.amount),
          `${item.percent.toFixed(1)}%`,
          `${item.trend > 0 ? '+' : ''}${item.trend.toFixed(1)}%`
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 45, halign: 'right' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 30, halign: 'center' }
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      })

      // @ts-expect-error - jspdf-autotable finalY
      yPos = doc.lastAutoTable.finalY + 15

      // Bảng so sánh theo tháng
      doc.setFontSize(14)
      doc.setTextColor(99, 102, 241)
      doc.text('SO SANH THEO THANG', 20, yPos)
      
      yPos += 5

      // @ts-expect-error - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        head: [['Thang', 'Doanh thu', 'Chi phi', 'Loi nhuan', 'Bien LN']],
        body: monthlyData.map(item => [
          item.month,
          formatCurrency(item.revenue),
          formatCurrency(item.expenses),
          formatCurrency(item.profit),
          `${item.margin.toFixed(1)}%`
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 40, halign: 'right' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' },
          4: { cellWidth: 25, halign: 'center' }
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      })

      // @ts-expect-error - jspdf-autotable finalY
      yPos = doc.lastAutoTable.finalY + 15

      // Phân tích lợi nhuận
      doc.setFontSize(14)
      doc.setTextColor(99, 102, 241)
      doc.text('PHAN TICH LOI NHUAN', 20, yPos)
      
      yPos += 5

      // @ts-expect-error - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        body: [
          ['Doanh thu thuan', formatCurrency(financialReport.revenue.total)],
          ['Tru: Chi phi hoat dong', `- ${formatCurrency(financialReport.expenses.total)}`],
          ['Loi nhuan gop (EBITDA)', formatCurrency(financialReport.profit.gross)],
          ['Tru: Thue TNDN (20%)', `- ${formatCurrency(financialReport.profit.gross * 0.2)}`],
          ['Loi nhuan rong sau thue', formatCurrency(financialReport.profit.net)],
          ['Bien loi nhuan rong', `${financialReport.profit.margin}%`]
        ],
        theme: 'striped',
        styles: {
          fontSize: 10,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 100, fontStyle: 'bold' },
          1: { cellWidth: 65, halign: 'right' }
        }
      })

      // Footer trang 2
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text('Trang 2/3 - Bao cao Tai chinh ' + financialReport.period, 105, 285, { align: 'center' })

      // ===== TRANG 3: KHÁCH HÀNG & DÒNG TIỀN =====
      doc.addPage()

      yPos = 20

      // Header trang 3
      doc.setFontSize(16)
      doc.setTextColor(99, 102, 241)
      doc.text('TOP KHACH HANG & DONG TIEN', 105, yPos, { align: 'center' })
      
      yPos += 10

      // Bảng top khách hàng
      doc.setFontSize(14)
      doc.setTextColor(99, 102, 241)
      doc.text('TOP 5 KHACH HANG THEO DOANH THU', 20, yPos)
      
      yPos += 5

      // @ts-expect-error - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        head: [['Xep hang', 'Khach hang', 'Doanh thu', 'So don', 'TB/Don']],
        body: topCustomers.map((customer, index) => [
          `#${index + 1}`,
          customer.name,
          formatCurrency(customer.revenue),
          customer.orders.toString(),
          formatCurrency(customer.avgOrder)
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 70 },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 30, halign: 'right' }
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      })

      // @ts-expect-error - jspdf-autotable finalY
      yPos = doc.lastAutoTable.finalY + 15

      // Bảng phân tích dòng tiền
      doc.setFontSize(14)
      doc.setTextColor(99, 102, 241)
      doc.text('PHAN TICH DONG TIEN', 20, yPos)
      
      yPos += 5

      // @ts-expect-error - jspdf-autotable types
      doc.autoTable({
        startY: yPos,
        head: [['Hang muc', 'Gia tri']],
        body: [
          ['Tien dau ky', formatCurrency(financialReport.cash.opening)],
          ['Dong tien tu hoat dong kinh doanh', `+ ${formatCurrency(financialReport.profit.net)}`],
          ['Thu tu khach hang', `+ ${formatCurrency(financialReport.revenue.total * 0.95)}`],
          ['Chi tra nha cung cap', `- ${formatCurrency(financialReport.expenses.total * 0.6)}`],
          ['Chi tra luong nhan vien', `- ${formatCurrency(financialReport.expenses.labor)}`],
          ['Chi phi nang luong', `- ${formatCurrency(financialReport.expenses.energy)}`],
          ['Chi phi khac', `- ${formatCurrency(financialReport.expenses.other)}`],
          ['Dong tien thuan trong ky', formatCurrency(financialReport.cash.flow)],
          ['Tien cuoi ky', formatCurrency(financialReport.cash.closing)]
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 110, fontStyle: 'bold' },
          1: { cellWidth: 55, halign: 'right' }
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      })

      // @ts-expect-error - jspdf-autotable finalY
      yPos = doc.lastAutoTable.finalY + 15

      // Tóm tắt & Nhận xét
      doc.setFillColor(240, 253, 244)
      doc.roundedRect(20, yPos, 170, 45, 3, 3, 'F')
      
      doc.setFontSize(12)
      doc.setTextColor(22, 163, 74)
      doc.text('TOM TAT & NHAN XET', 25, yPos + 8)
      
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      const summary = [
        '+ Doanh thu tang 12.5% so voi quy truoc, dat 5.85 ty dong',
        '+ Loi nhuan rong dat 1.87 ty dong, bien loi nhuan on dinh o 32%',
        '+ Dich vu xuat hang tang truong manh nhat (+15.2%)',
        '+ Chi phi nang luong giam 5.2% nho he thong solar hieu qua',
        '+ Dong tien tot, du dieu kien mo rong hoat dong quy tiep theo',
        '+ Top 5 khach hang dong gop 68% tong doanh thu'
      ]
      
      summary.forEach((line, index) => {
        doc.text(line, 25, yPos + 18 + (index * 5))
      })

      // Footer trang 3
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text('Trang 3/3 - Bao cao Tai chinh ' + financialReport.period, 105, 285, { align: 'center' })
      
      // Final footer
      const now = new Date().toLocaleString('vi-VN')
      doc.text(`Ngay xuat bao cao: ${now}`, 20, 292)
      doc.text('He thong Quan ly Kho Lanh - VENTURE DMST & KN', 190, 292, { align: 'right' })

      // Save PDF
      doc.save(`Bao_cao_tai_chinh_${financialReport.period.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)

      toast.success('Xuất PDF thành công!', { id: 'pdf-export' })

    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Không thể tạo file PDF', { id: 'pdf-export' })
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
            Báo cáo Tài chính
          </h1>
          <p className="text-xs md:text-base text-gray-500 dark:text-gray-400 mt-1 md:mt-2">
            {financialReport.period} • Hệ thống Quản lý Kho Lạnh
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="outline" size="sm" className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 shrink-0">
            <Calendar className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
            <span className="hidden sm:inline">Chọn kỳ</span>
          </Button>
          <Button 
            size="sm" 
            onClick={handleExportPDF}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shrink-0"
          >
            <Download className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
            Xuất PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {/* Doanh thu */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <Badge className="bg-green-500 text-white text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5%
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">Doanh thu</p>
            <p className="text-xl md:text-3xl font-bold text-blue-600">{formatCurrency(financialReport.revenue.total)}</p>
          </CardContent>
        </Card>

        {/* Lợi nhuận */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <Badge className="bg-green-500 text-white text-xs">
                {financialReport.profit.margin}%
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">Lợi nhuận ròng</p>
            <p className="text-xl md:text-3xl font-bold text-green-600">{formatCurrency(financialReport.profit.net)}</p>
          </CardContent>
        </Card>

        {/* Chi phí */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <Badge className="bg-red-500 text-white text-xs">
                60%
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">Chi phí</p>
            <p className="text-xl md:text-3xl font-bold text-red-600">{formatCurrency(financialReport.expenses.total)}</p>
          </CardContent>
        </Card>

        {/* Dòng tiền */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <Badge className="bg-green-500 text-white text-xs">
                <ArrowUpRight className="w-3 h-3" />
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">Tiền cuối kỳ</p>
            <p className="text-xl md:text-3xl font-bold text-orange-600">{formatCurrency(financialReport.cash.closing)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Phân tích Doanh thu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              Cơ cấu Doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Dịch vụ xuất hàng', value: financialReport.revenue.outbound, color: 'from-blue-500 to-cyan-500', percent: 40.0 },
                { label: 'Dịch vụ nhập hàng', value: financialReport.revenue.inbound, color: 'from-purple-500 to-pink-500', percent: 33.3 },
                { label: 'Phí lưu kho', value: financialReport.revenue.storage, color: 'from-green-500 to-emerald-500', percent: 20.0 },
                { label: 'Dịch vụ khác', value: financialReport.revenue.other, color: 'from-orange-500 to-amber-500', percent: 6.7 }
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{item.percent}% tổng doanh thu</span>
                    <Badge className={`bg-gradient-to-r ${item.color} text-white text-xs`}>
                      +{(Math.random() * 10 + 5).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-red-600" />
              Cơ cấu Chi phí
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {operatingExpenses.slice(0, 4).map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{item.percent}% tổng chi phí</span>
                    <Badge className={`text-xs ${item.trend > 0 ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                      {item.trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {Math.abs(item.trend)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theo dõi theo tháng */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Hiệu quả theo tháng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {monthlyData.map((month, index) => (
              <Card key={index} className="border-2 border-purple-100 dark:border-purple-900/30">
                <CardContent className="p-4">
                  <h4 className="font-bold text-purple-600 mb-3">{month.month}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Doanh thu</span>
                      <span className="text-sm font-bold text-blue-600">{formatCurrency(month.revenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Chi phí</span>
                      <span className="text-sm font-bold text-red-600">{formatCurrency(month.expenses)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Lợi nhuận</span>
                      <span className="text-sm font-bold text-green-600">{formatCurrency(month.profit)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Biên LN</span>
                        <Badge className="bg-green-500 text-white text-xs">
                          {month.margin}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top khách hàng */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Top 5 Khách hàng theo Doanh thu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  index === 0 ? 'from-yellow-400 to-orange-500' :
                  index === 1 ? 'from-gray-400 to-gray-500' :
                  index === 2 ? 'from-amber-600 to-amber-700' :
                  'from-indigo-500 to-purple-600'
                } flex items-center justify-center text-white font-bold text-lg`}>
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">{customer.name}</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {customer.orders} đơn
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      TB: {formatCurrency(customer.avgOrder)}/đơn
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(customer.revenue)}</p>
                  <Badge className="bg-emerald-500 text-white text-xs mt-1">
                    {((customer.revenue / financialReport.revenue.total) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tóm tắt */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Tóm tắt & Nhận xét
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-bold text-green-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Điểm tích cực
              </h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Doanh thu tăng <strong>12.5%</strong> so với quý trước, đạt <strong>{formatCurrency(financialReport.revenue.total)}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Lợi nhuận ròng đạt <strong>{formatCurrency(financialReport.profit.net)}</strong>, biên lợi nhuận ổn định ở <strong>{financialReport.profit.margin}%</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Dịch vụ xuất hàng tăng trưởng mạnh nhất với <strong>+15.2%</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Chi phí năng lượng giảm <strong>5.2%</strong> nhờ hệ thống solar hiệu quả</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-blue-600 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Khuyến nghị
              </h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">→</span>
                  <span>Dòng tiền tốt, có điều kiện để mở rộng hoạt động sang quý tiếp theo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">→</span>
                  <span>Top 5 khách hàng đóng góp <strong>68%</strong> tổng doanh thu, cần đa dạng hóa danh mục</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">→</span>
                  <span>Tiếp tục tối ưu chi phí năng lượng và nâng cao năng suất lao động</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">→</span>
                  <span>Đầu tư thêm vào công nghệ để tăng hiệu quả vận hành</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
