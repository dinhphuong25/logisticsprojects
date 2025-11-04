import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download } from 'lucide-react'
import { formatNumber, formatDate, getExpiryStatus, downloadCSV } from '@/lib/utils'
import type { Inventory } from '@/types'

export default function InventoryPage() {
  const [search, setSearch] = useState('')

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Quản lý tồn kho
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Quản lý tồn kho theo lô và vị trí
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách tồn kho</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm SKU, Lot, Zone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleExport} disabled={!inventory?.length}>
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
    </div>
  )
}
