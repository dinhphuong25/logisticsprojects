import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, Plus, Package, TrendingUp, AlertTriangle, TrendingDown } from 'lucide-react'
import { formatNumber, formatDate, getExpiryStatus, downloadCSV } from '@/lib/utils'
import type { Inventory } from '@/types'
import { AddInventoryModal } from './AddInventoryModal'

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { data: inventory, isLoading } = useQuery<Inventory[]>({
    queryKey: ['inventory', search],
    queryFn: async () => {
      const res = await apiClient.get('/inventory', {
        params: { search },
      })
      return res.data
    },
  })

  const handleExport = () => {
    if (!inventory) return

    const exportData = inventory.map((item) => ({
      SKU: item.product?.sku || '-',
      'Product': item.product?.name || '-',
      'Lot': item.lot?.lotNo || '-',
      'Zone': item.zone?.name || '-',
      'Location': item.location?.code || '-',
      'Qty (kg)': item.qty,
      'Exp Date': item.lot?.expDate ? formatDate(item.lot.expDate) : '-',
    }))

    downloadCSV(exportData, 'inventory')
  }

  const getExpiryBadge = (expDate?: string) => {
    if (!expDate) return null

    const status = getExpiryStatus(expDate)
    const colors = {
      expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      critical: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      ok: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    }

    return (
      <Badge className={colors[status]}>
        {formatDate(expDate)}
      </Badge>
    )
  }

  // Calculate stats
  const stats = {
    totalItems: inventory?.length || 0,
    totalQty: inventory?.reduce((sum, item) => sum + item.qty, 0) || 0,
    expiringSoon: inventory?.filter(item => {
      if (!item.lot?.expDate) return false
      const status = getExpiryStatus(item.lot.expDate)
      return status === 'warning' || status === 'critical'
    }).length || 0,
    expired: inventory?.filter(item => {
      if (!item.lot?.expDate) return false
      return getExpiryStatus(item.lot.expDate) === 'expired'
    }).length || 0,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-3xl blur-3xl -z-10"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-all"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Package className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Quản lý tồn kho
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Theo dõi tồn kho theo lô hàng và vị trí lưu trữ
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nhập hàng vào kho
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-2 border-blue-200 dark:border-blue-800 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Tổng mặt hàng
            </p>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {stats.totalItems}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 border-green-200 dark:border-green-800 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Tổng số lượng
            </p>
            <p className="text-3xl font-black text-green-600 dark:text-green-400">
              {formatNumber(stats.totalQty)}
            </p>
            <p className="text-xs text-gray-500 mt-1">kg</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 border-yellow-200 dark:border-yellow-800 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Cấp bách
            </p>
            <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">
              {stats.expiringSoon}
            </p>
            <p className="text-xs text-gray-500 mt-1">Sắp hết hạn</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 border-red-200 dark:border-red-800 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Đã hết hạn
            </p>
            <p className="text-3xl font-black text-red-600 dark:text-red-400">
              {stats.expired}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-teal-900/20 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-black">Danh sách tồn kho ({stats.totalItems} mặt hàng)</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hiển thị {inventory?.length || 0} kết quả
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 lg:flex-initial lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm SKU, Lot, Zone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-2"
                />
              </div>
              <Button 
                onClick={handleExport} 
                disabled={!inventory?.length}
                variant="outline"
                className="border-2"
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Đang tải...</p>
          ) : !inventory?.length ? (
            <p className="text-center py-8 text-gray-500">Không có dữ liệu</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã SKU</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Mã Lô</TableHead>
                  <TableHead>Khu vực</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead className="text-right">Số lượng (kg)</TableHead>
                  <TableHead>Hạn sử dụng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">
                      {item.product?.sku || '-'}
                    </TableCell>
                    <TableCell>{item.product?.name || '-'}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.lot?.lotNo || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.zone?.name || '-'}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.location?.code || '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatNumber(item.qty)}
                    </TableCell>
                    <TableCell>
                      {getExpiryBadge(item.lot?.expDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Inventory Modal */}
      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}
