import React from 'react'
import { useProductStore } from '../../stores/productStore'

export const ProductSummary = () => {
  const { products } = useProductStore()

  const summary = {
    total: products.length,
    categories: new Set(products.map(p => p.category)).size,
    provinces: new Set(products.map(p => p.farm?.province || p.origin)).size,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stockLevel), 0),
    lowStock: products.filter(p => p.stockLevel <= p.reorderPoint).length,
    blockchainVerified: products.filter(p => p.blockchain?.verified).length
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">📊 Tổng Quan Hệ Thống</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold">{summary.total}</div>
          <div className="text-sm opacity-90">Tổng sản phẩm</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold">{summary.categories}</div>
          <div className="text-sm opacity-90">Danh mục</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold">{summary.provinces}</div>
          <div className="text-sm opacity-90">Tỉnh thành</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold">
            {(summary.totalValue / 1000000000).toFixed(1)}B
          </div>
          <div className="text-sm opacity-90">Tổng giá trị (VNĐ)</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-300">{summary.lowStock}</div>
          <div className="text-sm opacity-90">Sắp hết hàng</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-green-300">{summary.blockchainVerified}</div>
          <div className="text-sm opacity-90">Đã xác minh Blockchain</div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <div className="text-sm opacity-75">
          Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
        </div>
      </div>
    </div>
  )
}

// Danh sách sản phẩm theo format đơn giản cho báo cáo
export const SimpleProductList = () => {
  const { products } = useProductStore()

  const categories = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, typeof products>)

  return (
    <div className="space-y-8">
      <ProductSummary />
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Danh Sách Sản Phẩm Chi Tiết</h2>
        
        {Object.entries(categories)
          .sort(([,a], [,b]) => b.length - a.length)
          .map(([category, categoryProducts]) => (
          <div key={category} className="mb-8 last:mb-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200 bg-blue-50 px-4 py-2 rounded-t">
              🌾 {category} ({categoryProducts.length} sản phẩm)
            </h3>
            
            <div className="grid gap-4">
              {categoryProducts
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded border-l-4 border-blue-400 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {product.nameVi || product.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          SKU: <span className="font-mono ml-1">{product.sku}</span>
                        </span>
                        <span className="flex items-center">
                          📍 {product.origin}
                        </span>
                        {product.farm && (
                          <span className="flex items-center">
                            🏠 {product.farm.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {product.price.toLocaleString('vi-VN')} VNĐ
                    </div>
                    <div className="text-sm text-gray-500">/{product.unit}</div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className={`text-lg font-bold ${
                      product.stockLevel <= product.reorderPoint 
                        ? 'text-red-600' 
                        : product.stockLevel <= product.reorderPoint * 2
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}>
                      {product.stockLevel.toLocaleString('vi-VN')}
                    </div>
                    <div className="text-sm text-gray-500">còn lại</div>
                  </div>
                  
                  <div className="ml-4 flex flex-col items-center space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.tempClass === 'FROZEN' ? 'bg-blue-100 text-blue-800' :
                      product.tempClass === 'CHILL' ? 'bg-cyan-100 text-cyan-800' :
                      product.tempClass === 'AMBIENT' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.tempClass === 'FROZEN' ? '❄️ Đông lạnh' :
                       product.tempClass === 'CHILL' ? '🧊 Mát' :
                       product.tempClass === 'AMBIENT' ? '🌡️ Thường' :
                       '☀️ Khô'}
                    </span>
                    
                    {product.qualityGrade && (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.qualityGrade === 'A+' ? 'bg-green-100 text-green-800' :
                        product.qualityGrade === 'A' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        🏆 {product.qualityGrade}
                      </span>
                    )}
                    
                    {product.blockchain?.verified && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                        🔗 Blockchain
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer thông tin */}
      <div className="bg-gray-800 text-white p-6 rounded-lg text-center">
        <h3 className="text-lg font-semibold mb-2">📈 Thông Tin Hệ Thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold">Đồ án tốt nghiệp</div>
            <div className="text-gray-300">Hệ thống quản lý chuỗi lạnh</div>
          </div>
          <div>
            <div className="font-semibold">Khu vực</div>
            <div className="text-gray-300">Đồng bằng sông Cửu Long</div>
          </div>
          <div>
            <div className="font-semibold">Công nghệ</div>
            <div className="text-gray-300">React + TypeScript + Blockchain</div>
          </div>
        </div>
      </div>
    </div>
  )
}