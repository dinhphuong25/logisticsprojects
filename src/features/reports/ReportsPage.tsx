import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  FileText,
  PieChart,
  Activity
} from 'lucide-react'

export default function ReportsPage() {
  const { t } = useTranslation()
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const reportTypes = [
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Current stock levels and valuation',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'inbound',
      title: 'Inbound Performance',
      description: 'Receiving efficiency and accuracy',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'outbound',
      title: 'Outbound Performance',
      description: 'Picking and shipping metrics',
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'temperature',
      title: 'Temperature Compliance',
      description: 'Temperature monitoring and alerts',
      icon: PieChart,
      color: 'from-orange-500 to-red-500',
    },
  ]

  const quickStats = [
    { label: 'Báo cáo đã tạo', value: '156', trend: '+12%' },
    { label: 'Thời gian xử lý trung bình', value: '2.3s', trend: '-8%' },
    { label: 'Lượt tải xuống', value: '89', trend: '+24%' },
    { label: 'Scheduled Reports', value: '12', trend: '0%' },
  ]

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
            {t('Reports & Analytics')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Generate and download comprehensive reports
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 w-full sm:w-auto">
            <FileText className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                <Badge variant={stat.trend.startsWith('+') ? 'default' : 'secondary'} className="text-xs">
                  {stat.trend}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Report Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['today', 'week', 'month', 'quarter', 'year'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod(period)}
                className="capitalize"
              >
                {period}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{report.title}</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Inventory Report - October 2025', date: '2025-11-01', size: '2.4 MB' },
              { name: 'Temperature Compliance - Q3', date: '2025-10-15', size: '1.8 MB' },
              { name: 'Inbound Performance - September', date: '2025-10-01', size: '3.1 MB' },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-gray-500">
                      {report.date} • {report.size}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
