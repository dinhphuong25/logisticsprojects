import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { List, BarChart3 } from 'lucide-react'

export const ProductNavigation = () => {
  const location = useLocation()
  
  const navItems = [
    {
      path: '/products/simple',
      label: 'Danh sách đơn giản',
      icon: List,
      description: 'Xem tổng quan sản phẩm'
    },
    {
      path: '/products',
      label: 'Quản lý chi tiết',
      icon: BarChart3,
      description: 'Quản lý và chỉnh sửa sản phẩm'
    },
    {
      path: '/products/report',
      label: 'Báo cáo tổng hợp',
      icon: BarChart3,
      description: 'Xem báo cáo và thống kê'
    }
  ]

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={20} className="mr-2" />
                <div>
                  <div>{item.label}</div>
                  <div className="text-xs text-gray-400">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}