import React, { useMemo } from 'react'
import { useProductStore } from '../../stores/productStore'
import { Package, MapPin, TrendingUp, AlertCircle } from 'lucide-react'
import { ProductNavigation } from '../../components/navigation/ProductNavigation'

export const ProductReportPage = () => {
  const { products, isLoading } = useProductStore()

  const reportData = useMemo(() => {
    // Group by category
    const byCategory = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = []
      }
      acc[product.category].push(product)
      return acc
    }, {} as Record<string, typeof products>)

    // Group by province
    const byProvince = products.reduce((acc, product) => {
      const province = product.farm?.province || product.origin
      if (!acc[province]) {
        acc[province] = []
      }
      acc[province].push(product)
      return acc
    }, {} as Record<string, typeof products>)

    // Statistics
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockLevel), 0)
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length
    const lowStockItems = products.filter(p => p.stockLevel <= p.reorderPoint)
    const blockchainVerified = products.filter(p => p.blockchain?.verified)

    return {
      byCategory,
      byProvince,
      totalValue,
      avgPrice,
      lowStockItems,
      blockchainVerified,
      totalProducts: products.length
    }
  }, [products])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductNavigation />
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            BÁO CÁO DANH SÁCH SẢN PHẨM NÔNG NGHIỆP ĐBSCL
          </h1>
          <p className="text-gray-600">
            Hệ thống quản lý chuỗi lạnh - Đồng bằng sông Cửu Long
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Ngày xuất báo cáo: {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-blue-600" />
            Tổng Quan Hệ Thống
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{reportData.totalProducts}</div>
              <div className="text-sm text-gray-600">Tổng sản phẩm</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatPrice(reportData.totalValue)}</div>
              <div className="text-sm text-gray-600">Tổng giá trị</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{reportData.lowStockItems.length}</div>
              <div className="text-sm text-gray-600">Sắp hết hàng</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{reportData.blockchainVerified.length}</div>
              <div className="text-sm text-gray-600">Blockchain verified</div>
            </div>
          </div>
        </div>

        {/* Products by Category */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Package className="mr-2 text-green-600" />
            Danh Sách Sản Phẩm Theo Danh Mục
          </h2>
          
          {Object.entries(reportData.byCategory).map(([category, categoryProducts]) => (
            <div key={category} className="mb-6 border-b border-gray-200 pb-6 last:border-b-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 bg-gray-50 p-3 rounded">
                {category} ({categoryProducts.length} sản phẩm)
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2 font-semibold">STT</th>
                      <th className="text-left p-2 font-semibold">Tên sản phẩm</th>
                      <th className="text-left p-2 font-semibold">SKU</th>
                      <th className="text-left p-2 font-semibold">Xuất xứ</th>
                      <th className="text-right p-2 font-semibold">Giá (VNĐ)</th>
                      <th className="text-right p-2 font-semibold">Tồn kho</th>
                      <th className="text-center p-2 font-semibold">Nhiệt độ</th>
                      <th className="text-center p-2 font-semibold">Chất lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryProducts
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((product, index) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">
                          <div className="font-medium">{product.nameVi || product.name}</div>
                          {product.farm && (
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {product.farm.name}
                            </div>
                          )}
                        </td>
                        <td className="p-2 font-mono text-xs">{product.sku}</td>
                        <td className="p-2">{product.origin}</td>
                        <td className="p-2 text-right font-semibold">
                          {formatNumber(product.price)}
                          <div className="text-xs text-gray-500">/{product.unit}</div>
                        </td>
                        <td className="p-2 text-right">
                          <span className={`font-semibold ${
                            product.stockLevel <= product.reorderPoint 
                              ? 'text-red-600' 
                              : product.stockLevel <= product.reorderPoint * 2
                                ? 'text-yellow-600'
                                : 'text-green-600'
                          }`}>
                            {formatNumber(product.stockLevel)}
                          </span>
                          <div className="text-xs text-gray-500">
                            Min: {formatNumber(product.reorderPoint)}
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {product.tempClass}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">{product.tempRange}</div>
                        </td>
                        <td className="p-2 text-center">
                          {product.qualityGrade && (
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              product.qualityGrade === 'A+' ? 'bg-green-100 text-green-800' :
                              product.qualityGrade === 'A' ? 'bg-blue-100 text-blue-800' :
                              product.qualityGrade === 'B+' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {product.qualityGrade}
                            </span>
                          )}
                          {product.blockchain?.verified && (
                            <div className="text-xs text-green-600 mt-1">✓ Blockchain</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Products by Province */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="mr-2 text-blue-600" />
            Phân Bố Sản Phẩm Theo Tỉnh Thành
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(reportData.byProvince)
              .sort(([,a], [,b]) => b.length - a.length)
              .map(([province, provinceProducts]) => (
              <div key={province} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{province}</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">{provinceProducts.length}</div>
                <div className="text-sm text-gray-600 mb-3">sản phẩm</div>
                
                <div className="space-y-1">
                  {provinceProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="text-xs text-gray-600 flex justify-between">
                      <span className="truncate">{product.nameVi || product.name}</span>
                      <span className="ml-2 font-mono">{formatNumber(product.stockLevel)}</span>
                    </div>
                  ))}
                  {provinceProducts.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{provinceProducts.length - 3} sản phẩm khác
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        {reportData.lowStockItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center">
              <AlertCircle className="mr-2" />
              Cảnh Báo Sắp Hết Hàng ({reportData.lowStockItems.length} sản phẩm)
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-red-50">
                    <th className="text-left p-2 font-semibold">Sản phẩm</th>
                    <th className="text-left p-2 font-semibold">SKU</th>
                    <th className="text-right p-2 font-semibold">Tồn kho hiện tại</th>
                    <th className="text-right p-2 font-semibold">Mức tối thiểu</th>
                    <th className="text-left p-2 font-semibold">Cần đặt hàng</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.lowStockItems
                    .sort((a, b) => (a.stockLevel / a.reorderPoint) - (b.stockLevel / b.reorderPoint))
                    .map(product => (
                    <tr key={product.id} className="border-b border-red-100">
                      <td className="p-2 font-medium">{product.nameVi || product.name}</td>
                      <td className="p-2 font-mono text-xs">{product.sku}</td>
                      <td className="p-2 text-right text-red-600 font-bold">
                        {formatNumber(product.stockLevel)}
                      </td>
                      <td className="p-2 text-right">{formatNumber(product.reorderPoint)}</td>
                      <td className="p-2">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          {product.stockLevel === 0 ? 'Khẩn cấp' : 'Cần thiết'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-gray-600 text-sm">
            Báo cáo được tạo tự động bởi Hệ thống quản lý chuỗi lạnh ĐBSCL
          </p>
          <p className="text-gray-500 text-xs mt-2">
            © 2025 - Đồ án tốt nghiệp - Quản lý nông sản Đồng bằng sông Cửu Long
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}