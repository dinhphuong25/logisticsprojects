import { create } from 'zustand'
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware'
import { useWarehouseStore } from './warehouseStore'
import { useUIStore } from './uiStore'
import { blockchainService } from '@/lib/blockchain'
import { MEKONG_DELTA_CONFIG } from '@/lib/mekong-delta-config'
import type { Product, TempClass } from '@/types'

// Enhanced Product interface with smart features
export interface EnhancedProduct extends Product {
  // Base additional fields (missing from core Product interface)
  price: number
  stockLevel: number
  reorderPoint: number
  image?: string
  isPopular?: boolean
  origin: string
  tempRange: string
  certifications: string[]
  lastRestocked?: string
  
  // Agricultural specific fields
  farm?: {
    name: string
    province: string
    farmer: string
    certifications: string[]
    coordinates?: { lat: number; lng: number }
    area?: number // hectares
    establishedYear?: number
  }
  harvest?: {
    season: string
    date: string
    quantity: number
    method: 'manual' | 'machine'
    weather: string
    quality_score?: number
  }
  blockchain?: {
    verified: boolean
    traceabilityCode: string
    transactionHash: string
    verificationDate?: string
    certificates?: string[]
  }
  transportation?: {
    method: string
    distance: number
    estimatedTime: string
    route: string
    carbonFootprint?: number
    cost?: number
  }
  qualityGrade?: 'A+' | 'A' | 'B' | 'C'
  marketDemand?: 'high' | 'medium' | 'low'
  
  // Smart inventory fields
  predictedDemand?: number
  seasonalFactors?: Record<string, number>
  supplierScore?: number
  sustainabilityRating?: number
  
  // Integration fields
  warehouseId?: string
  zoneId?: string
  locationPath?: string
  lastMovement?: string
  temperature_logs?: Array<{
    timestamp: string
    temperature: number
    humidity: number
    location: string
  }>
}

interface FilterState {
  search: string
  category: string
  province: string
  season: string
  tempClass: string
  blockchainStatus: string
  qualityGrade: string
  warehouseId: string
  priceRange: [number, number]
  stockStatus: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  sortBy: string
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list' | 'table'
  pageSize: number
  currentPage: number
}

interface ProductState {
  // Data
  products: EnhancedProduct[]
  filteredProducts: EnhancedProduct[]
  selectedProducts: string[]
  currentProduct: EnhancedProduct | null
  
  // UI State
  filters: FilterState
  isLoading: boolean
  isSyncing: boolean
  error: string | null
  lastUpdated: number | null
  
  // Smart features
  searchSuggestions: string[]
  recentSearches: string[]
  popularProducts: string[]
  recommendations: string[]
  
  // Performance
  totalCount: number
  hasMore: boolean
  isLoadingMore: boolean
  
  // Actions - Data Management
  setProducts: (products: EnhancedProduct[]) => void
  addProduct: (product: EnhancedProduct) => void
  updateProduct: (id: string, updates: Partial<EnhancedProduct>) => void
  removeProduct: (id: string) => void
  bulkUpdateProducts: (updates: Array<{ id: string, data: Partial<EnhancedProduct> }>) => void
  
  // Actions - Selection
  selectProduct: (id: string) => void
  selectMultiple: (ids: string[]) => void
  clearSelection: () => void
  selectAll: () => void
  invertSelection: () => void
  
  // Actions - Filtering & Search
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  resetFilters: () => void
  applyFilters: () => void
  applySmartFilter: (intent: string) => void
  setSearch: (query: string) => void
  addToSearchHistory: (query: string) => void
  updateSearchSuggestions: (query: string) => void
  
  // Actions - Sync & Refresh
  refreshProducts: () => Promise<void>
  syncWithBlockchain: (productIds?: string[]) => Promise<void>
  syncWithWarehouse: () => Promise<void>
  loadMore: () => Promise<void>
  
  // Computed/Selectors
  getProductsByCategory: (category: string) => EnhancedProduct[]
  getProductsByProvince: (province: string) => EnhancedProduct[]
  getLowStock: () => EnhancedProduct[]
  getExpiringSoon: () => EnhancedProduct[]
  getBlockchainVerified: () => EnhancedProduct[]
  getProductStats: () => {
    total: number
    categories: Record<string, number>
    provinces: Record<string, number>
    blockchainVerified: number
    averagePrice: number
    totalValue: number
    lowStock: number
    expiringSoon: number
  }
  
  // Smart Analytics
  getPredictedDemand: (productId: string, days: number) => number
  getSeasonalTrends: (productId: string) => Record<string, number>
  getOptimalRestockLevel: (productId: string) => number
}

const initialFilters: FilterState = {
  search: '',
  category: 'all',
  province: 'all',
  season: 'all',
  tempClass: 'all',
  blockchainStatus: 'all',
  qualityGrade: 'all',
  warehouseId: 'all',
  priceRange: [0, 1000000],
  stockStatus: 'all',
  sortBy: 'nameVi',
  sortOrder: 'asc',
  viewMode: 'grid',
  pageSize: 20,
  currentPage: 1
}

// Initial sample products for ĐBSCL
const initialProducts: EnhancedProduct[] = [
  {
    id: 'AGR-001',
    name: 'Premium Jasmine Fragrant Rice',
    nameVi: 'Gạo Jasmine Hương Lài Cao Cấp',
    sku: 'RICE-001',
    category: 'Ngũ cốc ĐBSCL',
    price: 45000,
    unit: 'kg',
    stockLevel: 5000,
    reorderPoint: 1000,
    tempClass: 'AMBIENT',
    tempRange: '18-25°C',
    shelfLifeDays: 365,
    description: 'Gạo thơm cao cấp, hạt dài, mềm dẻo, hương thơm tự nhiên. Trồng tại đồng bằng sông Cửu Long.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
    origin: 'An Giang',
    isPopular: true,
    certifications: ['VietGAP', 'Organic', 'GlobalGAP'],
    weight: 1,
    cubic: 0.001,
    lastRestocked: '2025-11-01',
    farm: {
      name: 'HTX Nông nghiệp Thạnh Phú',
      province: 'An Giang',
      farmer: 'Nguyễn Văn Minh',
      certifications: ['VietGAP', 'Organic'],
      coordinates: { lat: 10.5216, lng: 105.1258 },
      area: 25.5,
      establishedYear: 2015
    },
    harvest: {
      season: 'Vụ Đông Xuân',
      date: '2025-10-20',
      quantity: 5000,
      method: 'machine',
      weather: 'Thuận lợi',
      quality_score: 95
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'RICE-001-2025-001',
      transactionHash: '0x7a8f9e4c2b1d5e3a6f8c9d2e4b7a5f3c8e1d9a6b',
      verificationDate: '2025-10-21',
      certificates: ['VietGAP', 'Organic', 'GlobalGAP']
    },
    qualityGrade: 'A+',
    marketDemand: 'high',
    supplierScore: 9.5,
    sustainabilityRating: 9.2
  },
  {
    id: 'AGR-002',
    name: 'Organic Red Dragon Fruit',
    nameVi: 'Thanh Long Ruột Đỏ Organic',
    sku: 'FRUIT-001',
    category: 'Trái cây ĐBSCL',
    price: 35000,
    unit: 'kg',
    stockLevel: 3200,
    reorderPoint: 640,
    tempClass: 'CHILL',
    tempRange: '0-8°C',
    shelfLifeDays: 7,
    description: 'Thanh long ruột đỏ organic, không hóa chất, ngọt tự nhiên 13-15 brix.',
    image: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=500',
    origin: 'Tiền Giang',
    isPopular: true,
    certifications: ['VietGAP', 'Organic', 'Fair Trade'],
    weight: 1,
    cubic: 0.002,
    lastRestocked: '2025-11-05',
    farm: {
      name: 'Vườn Thanh Long Bình Phước',
      province: 'Tiền Giang',
      farmer: 'Trần Thị Lan',
      certifications: ['VietGAP', 'Organic'],
      coordinates: { lat: 10.3547, lng: 106.3637 },
      area: 15.0,
      establishedYear: 2017
    },
    harvest: {
      season: 'Cả năm',
      date: '2025-11-03',
      quantity: 3200,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 92
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'FRUIT-001-2025-002',
      transactionHash: '0x3c5e7f9a1b4d6e2c8a7f3e5b9d1c4a6e8f2b7d9a',
      verificationDate: '2025-11-04',
      certificates: ['VietGAP', 'Organic', 'Fair Trade']
    },
    qualityGrade: 'A+',
    marketDemand: 'high',
    supplierScore: 9.3,
    sustainabilityRating: 9.5
  },
  {
    id: 'AGR-003',
    name: 'Premium Organic Black Tiger Shrimp',
    nameVi: 'Tôm Sú Organic Đặc Sản',
    sku: 'SEAFOOD-001',
    category: 'Thủy sản ĐBSCL',
    price: 380000,
    unit: 'kg',
    stockLevel: 1500,
    reorderPoint: 300,
    tempClass: 'FROZEN',
    tempRange: '-18°C',
    shelfLifeDays: 180,
    description: 'Tôm sú nuôi sinh thái organic, size 20-30 con/kg. Không kháng sinh.',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500',
    origin: 'Cà Mau',
    isPopular: true,
    certifications: ['ASC', 'BAP', 'Organic', 'GlobalGAP'],
    weight: 1,
    cubic: 0.0015,
    lastRestocked: '2025-11-02',
    farm: {
      name: 'Trại Tôm Sinh Thái Nam Cần',
      province: 'Cà Mau',
      farmer: 'Lê Văn Hải',
      certifications: ['ASC', 'BAP', 'Organic'],
      coordinates: { lat: 9.1526, lng: 105.1960 },
      area: 30.0,
      establishedYear: 2016
    },
    harvest: {
      season: 'Vụ Hè Thu',
      date: '2025-10-28',
      quantity: 1500,
      method: 'manual',
      weather: 'Tốt',
      quality_score: 94
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'SEAFOOD-001-2025-003',
      transactionHash: '0x9d4a6f2e8c1b7a5f3e9d2c4a6b8f1e7c5a3d9e2b',
      verificationDate: '2025-10-29',
      certificates: ['ASC', 'BAP', 'Organic', 'GlobalGAP']
    },
    qualityGrade: 'A+',
    marketDemand: 'high',
    supplierScore: 9.7,
    sustainabilityRating: 9.8
  },
  {
    id: 'AGR-004',
    name: 'Fresh Ben Tre Green Coconut',
    nameVi: 'Dừa Xiêm Xanh Tươi Bến Tre',
    sku: 'FRUIT-002',
    category: 'Trái cây ĐBSCL',
    price: 15000,
    unit: 'trái',
    stockLevel: 8000,
    reorderPoint: 1600,
    tempClass: 'AMBIENT',
    tempRange: '15-25°C',
    shelfLifeDays: 30,
    description: 'Dừa xiêm xanh nguyên trái, nước ngọt mát, cùi dày. Đặc sản Bến Tre.',
    image: 'https://images.unsplash.com/photo-1598911812746-148f9bb5d968?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1598911812746-148f9bb5d968?w=500',
    origin: 'Bến Tre',
    isPopular: true,
    certifications: ['VietGAP', '3_Sao'],
    weight: 1.5,
    cubic: 0.008,
    lastRestocked: '2025-11-06',
    farm: {
      name: 'Vườn Dừa Miệt Vườn',
      province: 'Bến Tre',
      farmer: 'Võ Văn Thành',
      certifications: ['VietGAP'],
      coordinates: { lat: 10.2433, lng: 106.3758 },
      area: 18.0,
      establishedYear: 2010
    },
    harvest: {
      season: 'Cả năm',
      date: '2025-11-04',
      quantity: 8000,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 88
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'FRUIT-002-2025-004',
      transactionHash: '0x2e7c9a4f6d1b8e3a5c7f2d9e4b6a8f1c3e5d7a9b',
      verificationDate: '2025-11-05',
      certificates: ['VietGAP', '3_Sao']
    },
    qualityGrade: 'A',
    marketDemand: 'high',
    supplierScore: 8.9,
    sustainabilityRating: 8.7
  },
  {
    id: 'AGR-005',
    name: 'Premium Hoa Loc Cat Mango',
    nameVi: 'Xoài Cát Hòa Lộc Cao Cấp',
    sku: 'FRUIT-003',
    category: 'Trái cây ĐBSCL',
    price: 65000,
    unit: 'kg',
    stockLevel: 2800,
    reorderPoint: 560,
    tempClass: 'CHILL',
    tempRange: '0-8°C',
    shelfLifeDays: 7,
    description: 'Xoài cát Hòa Lộc đặc sản Tiền Giang, thịt vàng óng, thơm ngọt. Size xuất khẩu.',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0978?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0978?w=500',
    origin: 'Tiền Giang',
    isPopular: true,
    certifications: ['VietGAP', 'GlobalGAP'],
    weight: 1,
    cubic: 0.0012,
    lastRestocked: '2025-11-03',
    farm: {
      name: 'Vườn Xoài Hòa Lộc Thạnh Tân',
      province: 'Tiền Giang',
      farmer: 'Nguyễn Thanh Sơn',
      certifications: ['VietGAP', 'GlobalGAP'],
      coordinates: { lat: 10.4493, lng: 106.3420 },
      area: 12.5,
      establishedYear: 2014
    },
    harvest: {
      season: 'Vụ Hè Thu',
      date: '2025-10-30',
      quantity: 2800,
      method: 'manual',
      weather: 'Tốt',
      quality_score: 93
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'FRUIT-003-2025-005',
      transactionHash: '0x8f3a5e7c9d2b4f6a1e8c3d5b7a9f2e4c6d1a8b3e',
      verificationDate: '2025-11-01',
      certificates: ['VietGAP', 'GlobalGAP']
    },
    qualityGrade: 'A+',
    marketDemand: 'high',
    supplierScore: 9.4,
    sustainabilityRating: 9.1
  },
  {
    id: 'AGR-006',
    name: 'Frozen Pangasius Fillet',
    nameVi: 'Cá Tra Fillet Đông Lạnh',
    sku: 'SEAFOOD-002',
    category: 'Thủy sản ĐBSCL',
    price: 85000,
    unit: 'kg',
    stockLevel: 4500,
    reorderPoint: 900,
    tempClass: 'FROZEN',
    tempRange: '-18°C',
    shelfLifeDays: 180,
    description: 'Cá tra phi lê đông lạnh, không xương, không da. Nuôi trong ao bùn tự nhiên.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500',
    origin: 'Đồng Tháp',
    isPopular: true,
    certifications: ['ASC', 'BAP', 'HACCP'],
    weight: 1,
    cubic: 0.0012,
    lastRestocked: '2025-11-04',
    farm: {
      name: 'Trại Cá Tra Hồng Ngự',
      province: 'Đồng Tháp',
      farmer: 'Trần Minh Khoa',
      certifications: ['ASC', 'BAP'],
      coordinates: { lat: 10.8209, lng: 105.4145 },
      area: 45.0,
      establishedYear: 2013
    },
    harvest: {
      season: 'Vụ Đông Xuân',
      date: '2025-10-25',
      quantity: 4500,
      method: 'manual',
      weather: 'Tốt',
      quality_score: 90
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'SEAFOOD-002-2025-006',
      transactionHash: '0x4d7a9f2e6c1b5a8f3e7d2c9a4b6f1e8c5a3d7e2b',
      verificationDate: '2025-10-26',
      certificates: ['ASC', 'BAP', 'HACCP']
    },
    qualityGrade: 'A',
    marketDemand: 'high',
    supplierScore: 9.0,
    sustainabilityRating: 8.8
  },
  {
    id: 'AGR-007',
    name: 'ST25 Specialty Rice Soc Trang',
    nameVi: 'Gạo ST25 Đặc Sản Sóc Trăng',
    sku: 'RICE-002',
    category: 'Ngũ cốc ĐBSCL',
    price: 75000,
    unit: 'kg',
    stockLevel: 3500,
    reorderPoint: 700,
    tempClass: 'AMBIENT',
    tempRange: '18-25°C',
    shelfLifeDays: 365,
    description: 'Gạo ST25 đạt giải nhất gạo ngon nhất thế giới. Hạt dài, trắng trong, hương thơm đặc trưng.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
    origin: 'Sóc Trăng',
    isPopular: true,
    certifications: ['VietGAP', 'GlobalGAP', 'Organic'],
    weight: 1,
    cubic: 0.001,
    lastRestocked: '2025-11-07',
    farm: {
      name: 'HTX Lúa Gạo Sóc Trăng',
      province: 'Sóc Trăng',
      farmer: 'Hồ Quang Cua',
      certifications: ['VietGAP', 'GlobalGAP', 'Organic'],
      coordinates: { lat: 9.6031, lng: 105.9739 },
      area: 35.0,
      establishedYear: 2012
    },
    harvest: {
      season: 'Vụ Mùa',
      date: '2025-11-01',
      quantity: 3500,
      method: 'machine',
      weather: 'Thuận lợi',
      quality_score: 97
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'RICE-002-2025-007',
      transactionHash: '0x6c2e8f4a7d1b9e3f5c8d2a4b6f9e1c7a5d3e8b2f',
      verificationDate: '2025-11-02',
      certificates: ['VietGAP', 'GlobalGAP', 'Organic']
    },
    qualityGrade: 'A+',
    marketDemand: 'high',
    supplierScore: 9.8,
    sustainabilityRating: 9.6
  },
  {
    id: 'AGR-008',
    name: 'Fresh Water Coconut',
    nameVi: 'Dừa Xiêm Xanh',
    sku: 'FRUIT-003',
    category: 'Trái cây ĐBSCL',
    price: 18000,
    unit: 'trái',
    stockLevel: 4500,
    reorderPoint: 900,
    tempClass: 'AMBIENT',
    tempRange: '20-30°C',
    shelfLifeDays: 30,
    description: 'Dừa xiêm xanh tươi, nước ngọt mát, cơm dày, giàu chất điện giải tự nhiên.',
    image: 'https://images.unsplash.com/photo-1599889959407-c5d7f5632163?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1599889959407-c5d7f5632163?w=500',
    origin: 'Bến Tre',
    isPopular: true,
    certifications: ['VietGAP', 'Organic'],
    weight: 1.2,
    cubic: 0.003,
    lastRestocked: '2025-11-06',
    farm: {
      name: 'Vườn Dừa Phương Nam',
      province: 'Bến Tre',
      farmer: 'Lê Văn Sáu',
      certifications: ['VietGAP', 'Organic'],
      coordinates: { lat: 10.2438, lng: 106.3757 },
      area: 30.0,
      establishedYear: 2010
    },
    harvest: {
      season: 'Cả năm',
      date: '2025-11-05',
      quantity: 4500,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 90
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'FRUIT-003-2025-008',
      transactionHash: '0x9e4f2c8a5d7b3e1f6a8c2d9e4b7f3c5a8d1e6b9f',
      verificationDate: '2025-11-06',
      certificates: ['VietGAP', 'Organic']
    },
    qualityGrade: 'A',
    marketDemand: 'high',
    supplierScore: 9.0,
    sustainabilityRating: 9.3
  },
  {
    id: 'AGR-009',
    name: 'Seedless Lime',
    nameVi: 'Chanh Không Hạt',
    sku: 'FRUIT-004',
    category: 'Trái cây ĐBSCL',
    price: 25000,
    unit: 'kg',
    stockLevel: 2800,
    reorderPoint: 560,
    tempClass: 'CHILL',
    tempRange: '2-8°C',
    shelfLifeDays: 14,
    description: 'Chanh không hạt, múi tròn, vị chua thanh, giàu vitamin C, đặc sản Bến Tre.',
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=500',
    origin: 'Bến Tre',
    isPopular: false,
    certifications: ['VietGAP'],
    weight: 1,
    cubic: 0.0015,
    lastRestocked: '2025-11-04',
    farm: {
      name: 'HTX Chanh Phú Hội',
      province: 'Bến Tre',
      farmer: 'Nguyễn Thị Mai',
      certifications: ['VietGAP'],
      coordinates: { lat: 10.1235, lng: 106.4567 },
      area: 12.0,
      establishedYear: 2016
    },
    harvest: {
      season: 'Vụ chính',
      date: '2025-11-02',
      quantity: 2800,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 88
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'FRUIT-004-2025-009',
      transactionHash: '0x4d7e9f2c5a8b1e6d3f7a9c2e5b8d4f1a7c3e9b5d',
      verificationDate: '2025-11-03',
      certificates: ['VietGAP']
    },
    qualityGrade: 'A',
    marketDemand: 'medium',
    supplierScore: 8.7,
    sustainabilityRating: 8.9
  },
  {
    id: 'AGR-010',
    name: 'Fresh Pomelo',
    nameVi: 'Bưởi Da Xanh',
    sku: 'FRUIT-005',
    category: 'Trái cây ĐBSCL',
    price: 32000,
    unit: 'kg',
    stockLevel: 3600,
    reorderPoint: 720,
    tempClass: 'AMBIENT',
    tempRange: '18-25°C',
    shelfLifeDays: 21,
    description: 'Bưởi da xanh Bến Tre, múi hồng, vị ngọt thanh, ít hạt, thịt dày.',
    image: 'https://images.unsplash.com/photo-1602665742701-a6e0c6aafee4?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1602665742701-a6e0c6aafee4?w=500',
    origin: 'Bến Tre',
    isPopular: true,
    certifications: ['VietGAP', 'GlobalGAP'],
    weight: 1.5,
    cubic: 0.004,
    lastRestocked: '2025-11-03',
    farm: {
      name: 'Vườn Bưởi Tân Thành',
      province: 'Bến Tre',
      farmer: 'Trần Văn Bảy',
      certifications: ['VietGAP', 'GlobalGAP'],
      coordinates: { lat: 10.2567, lng: 106.3421 },
      area: 18.5,
      establishedYear: 2013
    },
    harvest: {
      season: 'Vụ chính',
      date: '2025-11-01',
      quantity: 3600,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 91
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'FRUIT-005-2025-010',
      transactionHash: '0x7c3f8e1d4a9b2e5f8c7d3a6e9b2f5c8a4d7e1b6f',
      verificationDate: '2025-11-02',
      certificates: ['VietGAP', 'GlobalGAP']
    },
    qualityGrade: 'A+',
    marketDemand: 'high',
    supplierScore: 9.1,
    sustainabilityRating: 9.0
  },
  {
    id: 'AGR-011',
    name: 'Sweet Longan',
    nameVi: 'Nhãn Lồng Hưng Yên',
    sku: 'FRUIT-006',
    category: 'Trái cây ĐBSCL',
    price: 45000,
    unit: 'kg',
    stockLevel: 2400,
    reorderPoint: 480,
    tempClass: 'CHILL',
    tempRange: '2-8°C',
    shelfLifeDays: 10,
    description: 'Nhãn lồng cao cấp, quả to, thịt dày, ngọt đậm đà, hạt nhỏ.',
    image: 'https://images.unsplash.com/photo-1599042240548-652ed6777f03?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1599042240548-652ed6777f03?w=500',
    origin: 'Vĩnh Long',
    isPopular: true,
    certifications: ['VietGAP'],
    weight: 1,
    cubic: 0.002,
    lastRestocked: '2025-11-07',
    farm: {
      name: 'Vườn Nhãn Long Hồ',
      province: 'Vĩnh Long',
      farmer: 'Phan Văn Năm',
      certifications: ['VietGAP'],
      coordinates: { lat: 10.2398, lng: 105.9647 },
      area: 10.0,
      establishedYear: 2018
    },
    harvest: {
      season: 'Vụ chính',
      date: '2025-11-06',
      quantity: 2400,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 93
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'FRUIT-006-2025-011',
      transactionHash: '0x5e8f3c1a9d6b2e7f4c8a3d5e9b1f7c4a6d8e2b9f',
      verificationDate: '2025-11-07',
      certificates: ['VietGAP']
    },
    qualityGrade: 'A+',
    marketDemand: 'high',
    supplierScore: 9.2,
    sustainabilityRating: 8.8
  },
  {
    id: 'AGR-012',
    name: 'Fresh Water Spinach',
    nameVi: 'Rau Muống Tươi',
    sku: 'VEG-001',
    category: 'Rau củ ĐBSCL',
    price: 8000,
    unit: 'kg',
    stockLevel: 5600,
    reorderPoint: 1120,
    tempClass: 'CHILL',
    tempRange: '0-4°C',
    shelfLifeDays: 3,
    description: 'Rau muống tươi, xanh non, giòn, trồng sạch theo tiêu chuẩn VietGAP.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500',
    origin: 'Đồng Tháp',
    isPopular: true,
    certifications: ['VietGAP'],
    weight: 1,
    cubic: 0.003,
    lastRestocked: '2025-11-08',
    farm: {
      name: 'HTX Rau Sạch Đồng Tháp',
      province: 'Đồng Tháp',
      farmer: 'Võ Văn Ba',
      certifications: ['VietGAP'],
      coordinates: { lat: 10.4936, lng: 105.6881 },
      area: 5.0,
      establishedYear: 2019
    },
    harvest: {
      season: 'Cả năm',
      date: '2025-11-08',
      quantity: 5600,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 87
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'VEG-001-2025-012',
      transactionHash: '0x2f9e4c7a5d1b8e3f6c9d2a4b7e5f1c8a3d6e9b2f',
      verificationDate: '2025-11-08',
      certificates: ['VietGAP']
    },
    qualityGrade: 'A',
    marketDemand: 'high',
    supplierScore: 8.5,
    sustainabilityRating: 8.7
  },
  {
    id: 'AGR-013',
    name: 'Fresh Bitter Melon',
    nameVi: 'Khổ Qua Xanh',
    sku: 'VEG-002',
    category: 'Rau củ ĐBSCL',
    price: 12000,
    unit: 'kg',
    stockLevel: 3400,
    reorderPoint: 680,
    tempClass: 'CHILL',
    tempRange: '2-8°C',
    shelfLifeDays: 7,
    description: 'Khổ qua xanh tươi, múi đều, ít đắng, giàu vitamin và khoáng chất.',
    image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=500',
    origin: 'Tiền Giang',
    isPopular: false,
    certifications: ['VietGAP'],
    weight: 1,
    cubic: 0.0025,
    lastRestocked: '2025-11-06',
    farm: {
      name: 'HTX Rau Củ Tiền Giang',
      province: 'Tiền Giang',
      farmer: 'Huỳnh Thị Tư',
      certifications: ['VietGAP'],
      coordinates: { lat: 10.3599, lng: 106.3622 },
      area: 8.0,
      establishedYear: 2017
    },
    harvest: {
      season: 'Vụ Đông Xuân',
      date: '2025-11-05',
      quantity: 3400,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 85
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'VEG-002-2025-013',
      transactionHash: '0x8d4f2e9c5a7b1e3f6d8c2a5e9b4f7c1a3d6e8b2f',
      verificationDate: '2025-11-06',
      certificates: ['VietGAP']
    },
    qualityGrade: 'A',
    marketDemand: 'medium',
    supplierScore: 8.3,
    sustainabilityRating: 8.5
  },
  {
    id: 'AGR-014',
    name: 'Fresh Lemongrass',
    nameVi: 'Sả Tươi',
    sku: 'HERB-001',
    category: 'Rau gia vị ĐBSCL',
    price: 15000,
    unit: 'kg',
    stockLevel: 2200,
    reorderPoint: 440,
    tempClass: 'CHILL',
    tempRange: '0-4°C',
    shelfLifeDays: 14,
    description: 'Sả tươi thơm, cây to, mùi thơm nồng, dùng nấu ăn và làm trà.',
    image: 'https://images.unsplash.com/photo-1583852523982-13d4eb1a75e1?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1583852523982-13d4eb1a75e1?w=500',
    origin: 'Đồng Tháp',
    isPopular: true,
    certifications: ['VietGAP', 'Organic'],
    weight: 1,
    cubic: 0.002,
    lastRestocked: '2025-11-05',
    farm: {
      name: 'Vườn Sả Organic Đồng Tháp',
      province: 'Đồng Tháp',
      farmer: 'Lâm Văn Tám',
      certifications: ['VietGAP', 'Organic'],
      coordinates: { lat: 10.5123, lng: 105.7234 },
      area: 3.5,
      establishedYear: 2020
    },
    harvest: {
      season: 'Cả năm',
      date: '2025-11-04',
      quantity: 2200,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 90
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'HERB-001-2025-014',
      transactionHash: '0x3e7f9c2a5d8b1e4f6c9d3a5e8b2f7c4a6d9e1b5f',
      verificationDate: '2025-11-05',
      certificates: ['VietGAP', 'Organic']
    },
    qualityGrade: 'A',
    marketDemand: 'high',
    supplierScore: 8.9,
    sustainabilityRating: 9.1
  },
  {
    id: 'AGR-015',
    name: 'Fresh Chili Pepper',
    nameVi: 'Ớt Hiểm Tươi',
    sku: 'HERB-002',
    category: 'Rau gia vị ĐBSCL',
    price: 28000,
    unit: 'kg',
    stockLevel: 1800,
    reorderPoint: 360,
    tempClass: 'CHILL',
    tempRange: '4-8°C',
    shelfLifeDays: 10,
    description: 'Ớt hiểm tươi, cay nồng, màu đỏ tươi, thơm, chất lượng cao.',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500',
    origin: 'An Giang',
    isPopular: false,
    certifications: ['VietGAP'],
    weight: 1,
    cubic: 0.0015,
    lastRestocked: '2025-11-07',
    farm: {
      name: 'HTX Ớt An Giang',
      province: 'An Giang',
      farmer: 'Đặng Văn Chín',
      certifications: ['VietGAP'],
      coordinates: { lat: 10.5345, lng: 105.1678 },
      area: 4.0,
      establishedYear: 2018
    },
    harvest: {
      season: 'Vụ Hè Thu',
      date: '2025-11-06',
      quantity: 1800,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 89
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'HERB-002-2025-015',
      transactionHash: '0x9f4e2c8a5d7b3e1f6a8c2d9e4b7f3c5a8d1e6b9f',
      verificationDate: '2025-11-07',
      certificates: ['VietGAP']
    },
    qualityGrade: 'A',
    marketDemand: 'medium',
    supplierScore: 8.6,
    sustainabilityRating: 8.4
  },
  {
    id: 'AGR-016',
    name: 'Fresh Snakehead Fish',
    nameVi: 'Cá Lóc Tươi',
    sku: 'FISH-002',
    category: 'Thủy sản ĐBSCL',
    price: 95000,
    unit: 'kg',
    stockLevel: 1500,
    reorderPoint: 300,
    tempClass: 'FROZEN',
    tempRange: '-18 đến -20°C',
    shelfLifeDays: 180,
    description: 'Cá lóc tươi nuôi lồng, thịt săn chắc, giàu protein, ít xương.',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500',
    origin: 'Đồng Tháp',
    isPopular: true,
    certifications: ['VietGAP', 'BAP'],
    weight: 1,
    cubic: 0.001,
    lastRestocked: '2025-11-06',
    farm: {
      name: 'Trại Nuôi Cá Lóc Tân Thành',
      province: 'Đồng Tháp',
      farmer: 'Nguyễn Văn Mười',
      certifications: ['VietGAP', 'BAP'],
      coordinates: { lat: 10.4567, lng: 105.6234 },
      area: 20.0,
      establishedYear: 2016
    },
    harvest: {
      season: 'Cả năm',
      date: '2025-11-05',
      quantity: 1500,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 91
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'FISH-002-2025-016',
      transactionHash: '0x6d3f9e2c8a5b1e7f4c9d2a5e8b3f6c1a7d4e9b2f',
      verificationDate: '2025-11-06',
      certificates: ['VietGAP', 'BAP']
    },
    qualityGrade: 'A+',
    marketDemand: 'high',
    supplierScore: 9.3,
    sustainabilityRating: 9.2
  },
  {
    id: 'AGR-017',
    name: 'Fresh Tilapia',
    nameVi: 'Cá Rô Phi Tươi',
    sku: 'FISH-003',
    category: 'Thủy sản ĐBSCL',
    price: 42000,
    unit: 'kg',
    stockLevel: 2800,
    reorderPoint: 560,
    tempClass: 'FROZEN',
    tempRange: '-18°C',
    shelfLifeDays: 180,
    description: 'Cá rô phi nuôi ao, thịt trắng, ngọt, giàu dinh dưỡng.',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500',
    origin: 'Vĩnh Long',
    isPopular: false,
    certifications: ['VietGAP'],
    weight: 1,
    cubic: 0.001,
    lastRestocked: '2025-11-04',
    farm: {
      name: 'Ao Cá Rô Phi Vĩnh Long',
      province: 'Vĩnh Long',
      farmer: 'Trần Văn Mười Một',
      certifications: ['VietGAP'],
      coordinates: { lat: 10.2543, lng: 105.9723 },
      area: 15.0,
      establishedYear: 2017
    },
    harvest: {
      season: 'Cả năm',
      date: '2025-11-03',
      quantity: 2800,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 86
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'FISH-003-2025-017',
      transactionHash: '0x4e8f2c9a5d7b1e3f6c8d2a4e9b5f7c1a3d6e8b2f',
      verificationDate: '2025-11-04',
      certificates: ['VietGAP']
    },
    qualityGrade: 'A',
    marketDemand: 'medium',
    supplierScore: 8.4,
    sustainabilityRating: 8.6
  },
  {
    id: 'AGR-018',
    name: 'Fresh Passion Fruit',
    nameVi: 'Chanh Dây Tươi',
    sku: 'FRUIT-007',
    category: 'Trái cây ĐBSCL',
    price: 38000,
    unit: 'kg',
    stockLevel: 2600,
    reorderPoint: 520,
    tempClass: 'CHILL',
    tempRange: '4-8°C',
    shelfLifeDays: 14,
    description: 'Chanh dây tươi, vỏ tím, nước nhiều, chua ngọt đậm đà, giàu vitamin C.',
    image: 'https://images.unsplash.com/photo-1582621728194-784d0b48c48f?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1582621728194-784d0b48c48f?w=500',
    origin: 'Cần Thơ',
    isPopular: true,
    certifications: ['VietGAP', 'Organic'],
    weight: 1,
    cubic: 0.002,
    lastRestocked: '2025-11-05',
    farm: {
      name: 'Vườn Chanh Dây Phong Điền',
      province: 'Cần Thơ',
      farmer: 'Lý Văn Mười Hai',
      certifications: ['VietGAP', 'Organic'],
      coordinates: { lat: 10.0812, lng: 105.6345 },
      area: 8.5,
      establishedYear: 2019
    },
    harvest: {
      season: 'Cả năm',
      date: '2025-11-04',
      quantity: 2600,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 92
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'FRUIT-007-2025-018',
      transactionHash: '0x7f3e9c2a5d8b1e4f6c9d3a5e8b2f7c4a6d9e1b5f',
      verificationDate: '2025-11-05',
      certificates: ['VietGAP', 'Organic']
    },
    qualityGrade: 'A+',
    marketDemand: 'high',
    supplierScore: 9.1,
    sustainabilityRating: 9.3
  },
  {
    id: 'AGR-019',
    name: 'Fresh River Clam',
    nameVi: 'Nghêu Sông Tươi',
    sku: 'SEAFOOD-003',
    category: 'Thủy sản ĐBSCL',
    price: 55000,
    unit: 'kg',
    stockLevel: 1900,
    reorderPoint: 380,
    tempClass: 'CHILL',
    tempRange: '0-4°C',
    shelfLifeDays: 2,
    description: 'Nghêu sông tươi, thịt ngọt, sạch, nuôi trong nước ngọt sạch.',
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=500',
    origin: 'Hậu Giang',
    isPopular: false,
    certifications: ['VietGAP'],
    weight: 1,
    cubic: 0.0008,
    lastRestocked: '2025-11-08',
    farm: {
      name: 'Trại Nuôi Nghêu Hậu Giang',
      province: 'Hậu Giang',
      farmer: 'Võ Văn Mười Ba',
      certifications: ['VietGAP'],
      coordinates: { lat: 9.7577, lng: 105.6412 },
      area: 12.0,
      establishedYear: 2018
    },
    harvest: {
      season: 'Cả năm',
      date: '2025-11-08',
      quantity: 1900,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 88
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'SEAFOOD-003-2025-019',
      transactionHash: '0x2d9f4e8c5a7b1e3f6d8c2a5e9b4f7c1a3d6e8b2f',
      verificationDate: '2025-11-08',
      certificates: ['VietGAP']
    },
    qualityGrade: 'A',
    marketDemand: 'medium',
    supplierScore: 8.5,
    sustainabilityRating: 8.7
  },
  {
    id: 'AGR-020',
    name: 'Fresh Basil',
    nameVi: 'Húng Quế Tươi',
    sku: 'HERB-003',
    category: 'Rau gia vị ĐBSCL',
    price: 18000,
    unit: 'kg',
    stockLevel: 1500,
    reorderPoint: 300,
    tempClass: 'CHILL',
    tempRange: '2-6°C',
    shelfLifeDays: 5,
    description: 'Húng quế tươi, lá xanh, thơm nồng, dùng nấu phở và các món Việt.',
    image: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=500',
    imageUrl: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=500',
    origin: 'Sóc Trăng',
    isPopular: true,
    certifications: ['VietGAP', 'Organic'],
    weight: 1,
    cubic: 0.003,
    lastRestocked: '2025-11-08',
    farm: {
      name: 'Vườn Rau Thơm Sóc Trăng',
      province: 'Sóc Trăng',
      farmer: 'Huỳnh Văn Mười Bốn',
      certifications: ['VietGAP', 'Organic'],
      coordinates: { lat: 9.6025, lng: 105.9739 },
      area: 3.0,
      establishedYear: 2020
    },
    harvest: {
      season: 'Cả năm',
      date: '2025-11-08',
      quantity: 1500,
      method: 'manual',
      weather: 'Thuận lợi',
      quality_score: 89
    },
    blockchain: {
      verified: true,
      traceabilityCode: 'HERB-003-2025-020',
      transactionHash: '0x5e8f3c1a9d6b2e7f4c8a3d5e9b1f7c4a6d8e2b9f',
      verificationDate: '2025-11-08',
      certificates: ['VietGAP', 'Organic']
    },
    qualityGrade: 'A',
    marketDemand: 'high',
    supplierScore: 8.8,
    sustainabilityRating: 9.0
  }
]

export const useProductStore = create<ProductState>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          // Initial state with sample products
          products: initialProducts,
          filteredProducts: initialProducts,
          selectedProducts: [],
          currentProduct: null,
          filters: initialFilters,
          isLoading: false,
          isSyncing: false,
          error: null,
          lastUpdated: null,
          searchSuggestions: [],
          recentSearches: [],
          popularProducts: [],
          recommendations: [],
          totalCount: 0,
          hasMore: false,
          isLoadingMore: false,

          // Data Management Actions
          setProducts: (products: EnhancedProduct[]) => {
            set({
              products,
              totalCount: products.length,
              lastUpdated: Date.now(),
              error: null
            })
            get().applyFilters()
          },

          addProduct: (product: EnhancedProduct) => {
            set(state => ({
              products: [...state.products, product],
              totalCount: state.totalCount + 1,
              lastUpdated: Date.now()
            }))
            get().applyFilters()
            
            // Add notification
            useUIStore.getState().addNotification({
              type: 'success',
              title: 'Sản phẩm mới',
              message: `Đã thêm sản phẩm ${product.nameVi}`
            })
          },

          updateProduct: (id: string, updates: Partial<EnhancedProduct>) => {
            set(state => ({
              products: state.products.map(p => 
                p.id === id ? { ...p, ...updates } : p
              ),
              currentProduct: state.currentProduct?.id === id 
                ? { ...state.currentProduct, ...updates }
                : state.currentProduct,
              lastUpdated: Date.now()
            }))
            get().applyFilters()
          },

          removeProduct: (id: string) => {
            set(state => {
              // const product = state.products.find(p => p.id === id)
              return {
                products: state.products.filter(p => p.id !== id),
                selectedProducts: state.selectedProducts.filter(pid => pid !== id),
                currentProduct: state.currentProduct?.id === id ? null : state.currentProduct,
                totalCount: state.totalCount - 1,
                lastUpdated: Date.now()
              }
            })
            get().applyFilters()
          },

          bulkUpdateProducts: (updates) => {
            set(state => ({
              products: state.products.map(product => {
                const update = updates.find(u => u.id === product.id)
                return update ? { ...product, ...update.data } : product
              }),
              lastUpdated: Date.now()
            }))
            get().applyFilters()
            
            useUIStore.getState().addNotification({
              type: 'success',
              title: 'Cập nhật hàng loạt',
              message: `Đã cập nhật ${updates.length} sản phẩm`
            })
          },

          // Selection Actions
          selectProduct: (id: string) => {
            set(state => ({
              selectedProducts: state.selectedProducts.includes(id)
                ? state.selectedProducts.filter(pid => pid !== id)
                : [...state.selectedProducts, id]
            }))
          },

          selectMultiple: (ids: string[]) => {
            set({ selectedProducts: ids })
          },

          clearSelection: () => {
            set({ selectedProducts: [] })
          },

          selectAll: () => {
            const { filteredProducts } = get()
            set({ selectedProducts: filteredProducts.map(p => p.id) })
          },

          invertSelection: () => {
            const { filteredProducts, selectedProducts } = get()
            const allIds = filteredProducts.map(p => p.id)
            const newSelection = allIds.filter(id => !selectedProducts.includes(id))
            set({ selectedProducts: newSelection })
          },

          // Filtering & Search Actions
          setFilter: (key, value) => {
            set(state => ({
              filters: { ...state.filters, [key]: value, currentPage: 1 }
            }))
            get().applyFilters()
          },

          resetFilters: () => {
            set({ filters: { ...initialFilters } })
            get().applyFilters()
          },

          applySmartFilter: (intent: string) => {
            // Smart filter processing based on natural language intent
            const filters = get().filters
            const newFilters = { ...filters }

            if (intent.includes('hôm nay') || intent.includes('mới nhất')) {
              newFilters.sortBy = 'lastRestocked'
              newFilters.sortOrder = 'desc'
            }
            
            if (intent.includes('hết hàng') || intent.includes('sắp hết')) {
              newFilters.stockStatus = 'low_stock'
            }
            
            if (intent.includes('blockchain') || intent.includes('xác thực')) {
              newFilters.blockchainStatus = 'verified'
            }

            MEKONG_DELTA_CONFIG.provinces.forEach(province => {
              if (intent.toLowerCase().includes(province.toLowerCase())) {
                newFilters.province = province
              }
            })

            set({ filters: newFilters })
            get().applyFilters()
          },

          setSearch: (query: string) => {
            set(state => ({
              filters: { ...state.filters, search: query, currentPage: 1 }
            }))
            
            if (query.trim()) {
              get().addToSearchHistory(query)
              get().updateSearchSuggestions(query)
            }
            
            get().applyFilters()
          },

          addToSearchHistory: (query: string) => {
            if (!query.trim()) return
            
            set(state => {
              const filtered = state.recentSearches.filter(s => s !== query)
              return {
                recentSearches: [query, ...filtered].slice(0, 10)
              }
            })
          },

          // Sync Actions
          refreshProducts: async () => {
            set({ isLoading: true, error: null })
            
            try {
              // Simulate API call
              const mockProducts = await new Promise<EnhancedProduct[]>(resolve => {
                setTimeout(() => resolve(getMockProducts()), 1000)
              })
              
              get().setProducts(mockProducts)
              set({ isLoading: false })
              
              useUIStore.getState().addNotification({
                type: 'success',
                title: 'Làm mới dữ liệu',
                message: 'Đã cập nhật danh sách sản phẩm'
              })
            } catch (error) {
              set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Lỗi không xác định'
              })
              
              useUIStore.getState().addNotification({
                type: 'error',
                title: 'Lỗi làm mới',
                message: 'Không thể tải danh sách sản phẩm'
              })
            }
          },

          syncWithBlockchain: async (productIds?: string[]) => {
            set({ isSyncing: true })
            
            try {
              const { products } = get()
              const targetProducts = productIds 
                ? products.filter(p => productIds.includes(p.id))
                : products.filter(p => p.blockchain?.traceabilityCode)

              for (const product of targetProducts) {
                if (product.blockchain?.traceabilityCode) {
                  const verifyResult = await blockchainService.verifyProduct(
                    product.blockchain.traceabilityCode
                  )
                  
                  get().updateProduct(product.id, {
                    blockchain: {
                      ...product.blockchain,
                      verified: verifyResult.verified,
                      verificationDate: new Date().toISOString()
                    }
                  })
                }
              }
              
              set({ isSyncing: false })
              
              useUIStore.getState().addNotification({
                type: 'success',
                title: 'Đồng bộ Blockchain',
                message: `Đã xác thực ${targetProducts.length} sản phẩm`
              })
            } catch (error: unknown) {
              console.error('Blockchain sync error:', error)
              set({ isSyncing: false })
              
              useUIStore.getState().addNotification({
                type: 'error',
                title: 'Lỗi đồng bộ',
                message: 'Không thể kết nối với blockchain'
              })
            }
          },

          syncWithWarehouse: async () => {
            const currentWarehouse = useWarehouseStore.getState().currentWarehouse
            if (!currentWarehouse) return

            set({ isSyncing: true })
            
            try {
              // Update products with warehouse info
              const { products } = get()
              const updatedProducts = products.map(product => ({
                ...product,
                warehouseId: currentWarehouse.id,
                locationPath: `${currentWarehouse.name}/${product.category}`
              }))
              
              set({ products: updatedProducts, isSyncing: false })
            } catch (error: unknown) {
              console.error('Warehouse sync error:', error)
              set({ isSyncing: false })
            }
          },

          loadMore: async () => {
            const { hasMore, isLoadingMore } = get()
            if (!hasMore || isLoadingMore) return

            set({ isLoadingMore: true })
            
            try {
              // Simulate loading more products
              await new Promise(resolve => setTimeout(resolve, 1000))
              // In real app, load next page of products
              set({ isLoadingMore: false })
            } catch (error: unknown) {
              console.error('Load more error:', error)
              set({ isLoadingMore: false })
            }
          },

          // Selectors
          getProductsByCategory: (category: string) => {
            return get().products.filter(p => p.category === category)
          },

          getProductsByProvince: (province: string) => {
            return get().products.filter(p => 
              (p as EnhancedProduct).farm?.province === province || p.origin === province
            )
          },

          getLowStock: () => {
            return get().products.filter(p => p.stockLevel <= p.reorderPoint)
          },

          getExpiringSoon: () => {
            const threeDaysFromNow = new Date()
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
            
            return get().products.filter(p => {
              if (!p.lastRestocked) return false
              const expiryDate = new Date(p.lastRestocked)
              expiryDate.setDate(expiryDate.getDate() + p.shelfLifeDays)
              return expiryDate <= threeDaysFromNow
            })
          },

          getBlockchainVerified: () => {
            return get().products.filter(p => 
              (p as EnhancedProduct).blockchain?.verified === true
            )
          },

          getProductStats: () => {
            const { products } = get()
            
            // Safety check for empty products array
            if (!products || products.length === 0) {
              return {
                total: 0,
                categories: {} as Record<string, number>,
                provinces: {} as Record<string, number>,
                blockchainVerified: 0,
                averagePrice: 0,
                totalValue: 0,
                lowStock: 0,
                expiringSoon: 0
              }
            }
            
            const stats = {
              total: products.length,
              categories: {} as Record<string, number>,
              provinces: {} as Record<string, number>,
              blockchainVerified: 0,
              averagePrice: 0,
              totalValue: 0,
              lowStock: 0,
              expiringSoon: 0
            }

            products.forEach(product => {
              // Categories
              stats.categories[product.category] = (stats.categories[product.category] || 0) + 1
              
              // Provinces
              const province = (product as EnhancedProduct).farm?.province || product.origin
              if (province) {
                stats.provinces[province] = (stats.provinces[province] || 0) + 1
              }
              
              // Blockchain
              if ((product as EnhancedProduct).blockchain?.verified) {
                stats.blockchainVerified++
              }
              
              // Financial
              stats.totalValue += product.price * product.stockLevel
              
              // Stock status
              if (product.stockLevel <= product.reorderPoint) {
                stats.lowStock++
              }
            })

            stats.averagePrice = products.length > 0 ? stats.totalValue / products.reduce((sum, p) => sum + p.stockLevel, 0) : 0

            return stats
          },

          // Smart Analytics
          getPredictedDemand: (productId: string, days: number) => {
            const product = get().products.find(p => p.id === productId) as EnhancedProduct
            if (!product?.predictedDemand) return 0
            
            const seasonalFactor = product.seasonalFactors?.[new Date().getMonth().toString()] || 1
            return Math.round(product.predictedDemand * seasonalFactor * (days / 30))
          },

          getSeasonalTrends: (productId: string) => {
            const product = get().products.find(p => p.id === productId) as EnhancedProduct
            return product?.seasonalFactors || {}
          },

          getOptimalRestockLevel: (productId: string) => {
            const product = get().products.find(p => p.id === productId)
            if (!product) return 0
            
            const predicted30Days = get().getPredictedDemand(productId, 30)
            const leadTime = 7 // days
            const safetyStock = Math.ceil(predicted30Days * 0.2)
            
            return Math.ceil((predicted30Days / 30) * leadTime) + safetyStock
          },

          // Helper methods
          applyFilters: () => {
            const { products, filters } = get()
            let filtered = [...products]

            // Search
            if (filters.search) {
              const query = filters.search.toLowerCase()
              filtered = filtered.filter(product =>
                product.nameVi.toLowerCase().includes(query) ||
                product.name.toLowerCase().includes(query) ||
                product.sku.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query) ||
                (product as EnhancedProduct).farm?.name.toLowerCase().includes(query)
              )
            }

            // Category filter
            if (filters.category !== 'all') {
              filtered = filtered.filter(p => p.category === filters.category)
            }

            // Province filter
            if (filters.province !== 'all') {
              filtered = filtered.filter(p => 
                (p as EnhancedProduct).farm?.province === filters.province || 
                p.origin === filters.province
              )
            }

            // Season filter
            if (filters.season !== 'all') {
              filtered = filtered.filter(p => 
                (p as EnhancedProduct).harvest?.season === filters.season
              )
            }

            // Temperature filter
            if (filters.tempClass !== 'all') {
              filtered = filtered.filter(p => p.tempClass === filters.tempClass)
            }

            // Blockchain filter
            if (filters.blockchainStatus !== 'all') {
              const isVerified = filters.blockchainStatus === 'verified'
              filtered = filtered.filter(p => 
                (p as EnhancedProduct).blockchain?.verified === isVerified
              )
            }

            // Quality filter
            if (filters.qualityGrade !== 'all') {
              filtered = filtered.filter(p => 
                (p as EnhancedProduct).qualityGrade === filters.qualityGrade
              )
            }

            // Price range filter
            const [minPrice, maxPrice] = filters.priceRange
            filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice)

            // Stock status filter
            if (filters.stockStatus !== 'all') {
              switch (filters.stockStatus) {
                case 'in_stock':
                  filtered = filtered.filter(p => p.stockLevel > p.reorderPoint)
                  break
                case 'low_stock':
                  filtered = filtered.filter(p => p.stockLevel <= p.reorderPoint && p.stockLevel > 0)
                  break
                case 'out_of_stock':
                  filtered = filtered.filter(p => p.stockLevel === 0)
                  break
              }
            }

            // Sorting
            filtered.sort((a, b) => {
              let aValue: string | number | Date, bValue: string | number | Date
              
              switch (filters.sortBy) {
                case 'nameVi':
                  aValue = a.nameVi
                  bValue = b.nameVi
                  break
                case 'price':
                  aValue = a.price
                  bValue = b.price
                  break
                case 'stockLevel':
                  aValue = a.stockLevel
                  bValue = b.stockLevel
                  break
                case 'lastRestocked':
                  aValue = new Date(a.lastRestocked || 0)
                  bValue = new Date(b.lastRestocked || 0)
                  break
                default:
                  aValue = a.nameVi
                  bValue = b.nameVi
              }

              if (typeof aValue === 'string' && typeof bValue === 'string') {
                return filters.sortOrder === 'asc' 
                  ? aValue.localeCompare(bValue)
                  : bValue.localeCompare(aValue)
              } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
              } else if (aValue instanceof Date && bValue instanceof Date) {
                return filters.sortOrder === 'asc' 
                  ? aValue.getTime() - bValue.getTime() 
                  : bValue.getTime() - aValue.getTime()
              } else {
                return 0
              }
            })

            set({ filteredProducts: filtered })
          },

          updateSearchSuggestions: (query: string) => {
            const { products } = get()
            const suggestions = new Set<string>()
            
            products.forEach(product => {
              if (product.nameVi.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(product.nameVi)
              }
              if (product.category.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(product.category)
              }
              const farm = (product as EnhancedProduct).farm
              if (farm?.name.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(farm.name)
              }
            })
            
            set({ searchSuggestions: Array.from(suggestions).slice(0, 5) })
          }
        }),
        {
          name: 'product-storage',
          partialize: (state) => ({
            recentSearches: state.recentSearches,
            filters: {
              ...state.filters,
              search: '', // Don't persist search query
              currentPage: 1 // Reset page
            },
            popularProducts: state.popularProducts
          }),
          version: 1
        }
      )
    ),
    { name: 'ProductStore' }
  )
)

// Mock data function
function getMockProducts(): EnhancedProduct[] {
  return [
    // === NGŨ CỐC ĐBSCL ===
    {
      id: 'AGR-001',
      name: 'Premium ST25 Rice',
      nameVi: 'Gạo ST25 Cao Cấp',
      sku: 'ST25-001',
      category: 'Ngũ cốc ĐBSCL',
      price: 28500,
      unit: 'kg',
      stockLevel: 50000,
      reorderPoint: 10000,
      tempClass: 'DRY' as TempClass,
      tempRange: '25-30°C',
      shelfLifeDays: 365,
      description: 'Gạo ST25 thơm ngon, chất lượng cao từ Sóc Trăng',
      image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500',
      imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500',
      origin: 'Sóc Trăng',
      isPopular: true,
      certifications: ['VietGAP', '3_Sao', 'Organic'],
      weight: 25,
      cubic: 0.025,
      lastRestocked: '2025-01-15',
      farm: {
        name: 'Hợp tác xã Thạnh Phú',
        province: 'Sóc Trăng',
        farmer: 'Nguyễn Văn Minh',
        certifications: ['VietGAP', '3_Sao'],
        coordinates: { lat: 9.6034, lng: 105.9697 },
        area: 50,
        establishedYear: 2015
      },
      harvest: {
        season: 'Vụ Đông Xuân',
        date: '2025-01-15',
        quantity: 50,
        method: 'machine',
        weather: 'Thuận lợi',
        quality_score: 95
      },
      blockchain: {
        verified: true,
        traceabilityCode: 'ST25-RICE-2025-001',
        transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
        verificationDate: '2025-01-16',
        certificates: ['VietGAP', 'Organic']
      },
      transportation: {
        method: 'Xe tải',
        distance: 45,
        estimatedTime: '2 giờ',
        route: 'Sóc Trăng → Cần Thơ → TPHCM',
        carbonFootprint: 12.5,
        cost: 850000
      },
      qualityGrade: 'A+',
      marketDemand: 'high',
      predictedDemand: 15000,
      seasonalFactors: {
        '0': 1.2, '1': 1.1, '2': 0.9, '3': 0.8, '4': 0.9, '5': 1.0,
        '6': 1.1, '7': 1.2, '8': 1.3, '9': 1.4, '10': 1.3, '11': 1.2
      },
      supplierScore: 9.2,
      sustainabilityRating: 8.5
    },
    {
      id: 'AGR-002',
      name: 'Jasmine Fragrant Rice',
      nameVi: 'Gạo Thơm Jasmine',
      sku: 'JASMINE-001',
      category: 'Ngũ cốc ĐBSCL',
      price: 32000,
      unit: 'kg',
      stockLevel: 25000,
      reorderPoint: 5000,
      tempClass: 'DRY' as TempClass,
      tempRange: '20-25°C',
      shelfLifeDays: 730,
      description: 'Gạo thơm Jasmine hạt dài, thơm đặc trưng từ An Giang',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500',
      origin: 'An Giang',
      isPopular: true,
      certifications: ['VietGAP', 'Organic', 'Fair Trade'],
      weight: 5,
      cubic: 0.008,
      lastRestocked: '2025-01-12',
      farm: {
        name: 'Nông trại Cỏ May',
        province: 'An Giang',
        farmer: 'Lê Thị Mai',
        certifications: ['VietGAP', 'Organic'],
        coordinates: { lat: 10.5217, lng: 105.1258 },
        area: 35,
        establishedYear: 2012
      },
      harvest: {
        season: 'Vụ Mùa',
        date: '2025-01-10',
        quantity: 80,
        method: 'machine',
        weather: 'Nắng ráo',
        quality_score: 92
      },
      blockchain: {
        verified: true,
        traceabilityCode: 'JASMINE-RICE-2025-002',
        transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
        verificationDate: '2025-01-13',
        certificates: ['Organic', 'Fair Trade']
      },
      qualityGrade: 'A+',
      marketDemand: 'high',
      supplierScore: 9.0,
      sustainabilityRating: 9.2
    },
    {
      id: 'AGR-003',
      name: 'Brown Rice Organic',
      nameVi: 'Gạo Lứt Hữu Cơ',
      sku: 'BROWN-001',
      category: 'Ngũ cốc ĐBSCL',
      price: 45000,
      unit: 'kg',
      stockLevel: 8000,
      reorderPoint: 2000,
      tempClass: 'DRY' as TempClass,
      tempRange: '18-25°C',
      shelfLifeDays: 180,
      description: 'Gạo lứt hữu cơ giàu dinh dưỡng từ Cần Thơ',
      image: 'https://images.unsplash.com/photo-1596040032863-95a4a3b9fc32?w=500',
      imageUrl: 'https://images.unsplash.com/photo-1596040032863-95a4a3b9fc32?w=500',
      origin: 'Cần Thơ',
      isPopular: false,
      certifications: ['Organic', 'VietGAP'],
      weight: 2,
      cubic: 0.003,
      lastRestocked: '2025-01-08',
      farm: {
        name: 'Trang trại Xanh',
        province: 'Cần Thơ',
        farmer: 'Phạm Văn Xanh',
        certifications: ['Organic', 'VietGAP'],
        coordinates: { lat: 10.0451, lng: 105.7469 },
        area: 15,
        establishedYear: 2019
      },
      harvest: {
        season: 'Vụ Đông Xuân',
        date: '2025-01-05',
        quantity: 20,
        method: 'manual',
        weather: 'Mát mẻ',
        quality_score: 88
      },
      blockchain: {
        verified: true,
        traceabilityCode: 'BROWN-RICE-2025-003',
        transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
        verificationDate: '2025-01-09',
        certificates: ['Organic']
      },
      qualityGrade: 'A',
      marketDemand: 'medium',
      supplierScore: 8.5,
      sustainabilityRating: 9.8
    },

    // === TRÁI CÂY ĐBSCL ===
    {
      id: 'AGR-002',
      name: 'Dragon Fruit Premium',
      nameVi: 'Thanh Long Cao Cấp',
      sku: 'DRAGON-001',
      category: 'Trái cây ĐBSCL',
      price: 45000,
      unit: 'kg',
      stockLevel: 2500,
      reorderPoint: 500,
      tempClass: 'CHILL' as TempClass,
      tempRange: '8-12°C',
      shelfLifeDays: 14,
      description: 'Thanh Long ruột đỏ tươi ngon từ Tiền Giang',
      image: 'https://images.unsplash.com/photo-1526318472351-c0d1b4d4bd14?w=500',
      imageUrl: 'https://images.unsplash.com/photo-1526318472351-c0d1b4d4bd14?w=500',
      origin: 'Tiền Giang',
      isPopular: true,
      certifications: ['VietGAP', 'GlobalGAP'],
      weight: 1,
      cubic: 0.002,
      lastRestocked: '2025-01-10',
      farm: {
        name: 'Vườn Thanh Long Hùng Phát',
        province: 'Tiền Giang',
        farmer: 'Trần Văn Hùng',
        certifications: ['VietGAP', 'GlobalGAP'],
        coordinates: { lat: 10.3587, lng: 106.3621 },
        area: 20,
        establishedYear: 2018
      },
      harvest: {
        season: 'Quanh năm',
        date: '2025-01-10',
        quantity: 25,
        method: 'manual',
        weather: 'Nắng ráo',
        quality_score: 88
      },
      blockchain: {
        verified: true,
        traceabilityCode: 'DRAGON-FRUIT-2025-002',
        transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
        verificationDate: '2025-01-11',
        certificates: ['VietGAP', 'GlobalGAP']
      },
      transportation: {
        method: 'Xe lạnh',
        distance: 70,
        estimatedTime: '3 giờ',
        route: 'Tiền Giang → TPHCM',
        carbonFootprint: 8.2,
        cost: 1200000
      },
      qualityGrade: 'A',
      marketDemand: 'high',
      predictedDemand: 800,
      seasonalFactors: {
        '0': 1.0, '1': 1.1, '2': 1.2, '3': 1.3, '4': 1.2, '5': 1.0,
        '6': 0.9, '7': 0.8, '8': 0.9, '9': 1.0, '10': 1.1, '11': 1.2
      },
      supplierScore: 8.8,
      sustainabilityRating: 9.0
    },
    {
      id: 'AGR-003',
      name: 'Mango Frozen Slices',
      nameVi: 'Xoài Cắt Lát Đông Lạnh',
      sku: 'MANGO-FROZEN-001',
      category: 'Thực phẩm chế biến ĐBSCL',
      price: 85000,
      unit: 'kg',
      stockLevel: 8000,
      reorderPoint: 1500,
      tempClass: 'FROZEN' as TempClass,
      tempRange: '-18°C',
      shelfLifeDays: 365,
      description: 'Xoài cắt lát đông lạnh IQF chất lượng xuất khẩu',
      image: 'https://images.unsplash.com/photo-1553279765-ac2ba4d578cb?w=500',
      imageUrl: 'https://images.unsplash.com/photo-1553279765-ac2ba4d578cb?w=500',
      origin: 'Đồng Tháp',
      isPopular: false,
      certifications: ['HACCP', 'BRC', 'FDA'],
      weight: 10,
      cubic: 0.012,
      lastRestocked: '2025-01-05',
      farm: {
        name: 'Nhà máy chế biến An Giang Food',
        province: 'Đồng Tháp',
        farmer: 'Công ty TNHH An Giang Food',
        certifications: ['HACCP', 'BRC', 'FDA'],
        coordinates: { lat: 10.6637, lng: 105.6318 },
        area: 100,
        establishedYear: 2010
      },
      harvest: {
        season: 'Vụ chính',
        date: '2024-12-20',
        quantity: 80,
        method: 'machine',
        weather: 'Khô hanh',
        quality_score: 92
      },
      blockchain: {
        verified: true,
        traceabilityCode: 'MANGO-FROZEN-2025-003',
        transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
        verificationDate: '2025-01-06',
        certificates: ['HACCP', 'BRC', 'FDA']
      },
      transportation: {
        method: 'Container lạnh',
        distance: 120,
        estimatedTime: '4 giờ',
        route: 'Đồng Tháp → TPHCM',
        carbonFootprint: 15.8,
        cost: 2500000
      },
      qualityGrade: 'A+',
      marketDemand: 'medium',
      predictedDemand: 2000,
      seasonalFactors: {
        '0': 0.8, '1': 0.9, '2': 1.2, '3': 1.4, '4': 1.5, '5': 1.3,
        '6': 1.0, '7': 0.8, '8': 0.7, '9': 0.8, '10': 0.9, '11': 1.0
      },
      supplierScore: 9.5,
      sustainabilityRating: 8.2
    },

    // === THÊM NHIỀU SẢN PHẨM MỚI ===
    {
      id: 'AGR-004',
      name: 'Durian Monthong Premium',
      nameVi: 'Sầu Riêng Monthong Cao Cấp',
      sku: 'DURIAN-001',
      category: 'Trái cây ĐBSCL',
      price: 180000,
      unit: 'trái',
      stockLevel: 150,
      reorderPoint: 30,
      tempClass: 'CHILL' as TempClass,
      tempRange: '10-15°C',
      shelfLifeDays: 7,
      description: 'Sầu riêng Monthong thơm ngon, múi dày từ Tiền Giang',
      image: 'https://images.unsplash.com/photo-1631115223659-f6c2d3f7db98?w=500',
      imageUrl: 'https://images.unsplash.com/photo-1631115223659-f6c2d3f7db98?w=500',
      origin: 'Tiền Giang',
      isPopular: true,
      certifications: ['VietGAP', 'Organic'],
      weight: 2.5,
      cubic: 0.008,
      lastRestocked: '2025-01-14',
      farm: {
        name: 'Vườn Sầu Riêng Cái Lậy',
        province: 'Tiền Giang',
        farmer: 'Võ Văn Riêng',
        certifications: ['VietGAP', 'Organic'],
        coordinates: { lat: 10.4520, lng: 106.0720 },
        area: 8,
        establishedYear: 2016
      },
      harvest: {
        season: 'Mùa khô',
        date: '2025-01-12',
        quantity: 200,
        method: 'manual',
        weather: 'Nắng nóng',
        quality_score: 95
      },
      blockchain: {
        verified: true,
        traceabilityCode: 'DURIAN-2025-004',
        transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
        verificationDate: '2025-01-15',
        certificates: ['VietGAP', 'Organic']
      },
      qualityGrade: 'A+',
      marketDemand: 'high',
      supplierScore: 9.3,
      sustainabilityRating: 8.9
    },
    {
      id: 'AGR-005',
      name: 'Coconut Water Fresh',
      nameVi: 'Nước Dừa Tươi',
      sku: 'COCONUT-001',
      category: 'Thực phẩm chế biến ĐBSCL',
      price: 15000,
      unit: 'trái',
      stockLevel: 5000,
      reorderPoint: 1000,
      tempClass: 'CHILL' as TempClass,
      tempRange: '4-8°C',
      shelfLifeDays: 3,
      description: 'Nước dừa tươi nguyên chất từ Bến Tre',
      image: 'https://images.unsplash.com/photo-1520973048-4fd7b53e4c73?w=500',
      imageUrl: 'https://images.unsplash.com/photo-1520973048-4fd7b53e4c73?w=500',
      origin: 'Bến Tre',
      isPopular: true,
      certifications: ['VietGAP', 'HACCP'],
      weight: 1.2,
      cubic: 0.002,
      lastRestocked: '2025-01-16',
      farm: {
        name: 'HTX Dừa Bến Tre',
        province: 'Bến Tre',
        farmer: 'Lê Minh Dừa',
        certifications: ['VietGAP', 'HACCP'],
        coordinates: { lat: 10.2441, lng: 106.3750 },
        area: 50,
        establishedYear: 2010
      },
      harvest: {
        season: 'Quanh năm',
        date: '2025-01-15',
        quantity: 10000,
        method: 'manual',
        weather: 'Ẩm ướt',
        quality_score: 92
      },
      blockchain: {
        verified: true,
        traceabilityCode: 'COCONUT-2025-005',
        transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
        verificationDate: '2025-01-16',
        certificates: ['VietGAP', 'HACCP']
      },
      qualityGrade: 'A',
      marketDemand: 'high',
      supplierScore: 8.9,
      sustainabilityRating: 9.5
    },
    {
      id: 'AGR-006',
      name: 'Catfish Fillet Frozen',
      nameVi: 'Phi Lê Cá Tra Đông Lạnh',
      sku: 'CATFISH-001',
      category: 'Thủy sản ĐBSCL',
      price: 120000,
      unit: 'kg',
      stockLevel: 3000,
      reorderPoint: 500,
      tempClass: 'FROZEN' as TempClass,
      tempRange: '-18°C',
      shelfLifeDays: 365,
      description: 'Phi lê cá tra đông lạnh xuất khẩu từ Đồng Tháp',
      image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500',
      imageUrl: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500',
      origin: 'Đồng Tháp',
      isPopular: true,
      certifications: ['ASC', 'BAP', 'GlobalGAP'],
      weight: 1,
      cubic: 0.001,
      lastRestocked: '2025-01-10',
      farm: {
        name: 'Trại Cá Tra Hùng Vương',
        province: 'Đồng Tháp',
        farmer: 'Nguyễn Hùng Vương',
        certifications: ['ASC', 'BAP'],
        coordinates: { lat: 10.4918, lng: 105.6881 },
        area: 25,
        establishedYear: 2012
      },
      harvest: {
        season: 'Mùa khô',
        date: '2025-01-08',
        quantity: 5000,
        method: 'manual',
        weather: 'Mát mẻ',
        quality_score: 93
      },
      blockchain: {
        verified: true,
        traceabilityCode: 'CATFISH-2025-006',
        transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
        verificationDate: '2025-01-11',
        certificates: ['ASC', 'BAP']
      },
      qualityGrade: 'A+',
      marketDemand: 'high',
      supplierScore: 9.1,
      sustainabilityRating: 8.7
    },
    {
      id: 'AGR-007',
      name: 'Mango Cat Chu Premium',
      nameVi: 'Xoài Cát Chu Cao Cấp',
      sku: 'MANGO-001',
      category: 'Trái cây ĐBSCL',
      price: 85000,
      unit: 'kg',
      stockLevel: 1200,
      reorderPoint: 300,
      tempClass: 'CHILL' as TempClass,
      tempRange: '12-16°C',
      shelfLifeDays: 10,
      description: 'Xoài Cát Chu ngọt thơm từ Đồng Tháp',
      image: 'https://images.unsplash.com/photo-1553279765-ac2ba4d578cb?w=500',
      imageUrl: 'https://images.unsplash.com/photo-1553279765-ac2ba4d578cb?w=500',
      origin: 'Đồng Tháp',
      isPopular: true,
      certifications: ['VietGAP', 'GlobalGAP'],
      weight: 0.3,
      cubic: 0.0005,
      lastRestocked: '2025-01-13',
      farm: {
        name: 'Vườn Xoài Cát Chu',
        province: 'Đồng Tháp',
        farmer: 'Huỳnh Văn Chu',
        certifications: ['VietGAP', 'GlobalGAP'],
        coordinates: { lat: 10.4578, lng: 105.6363 },
        area: 12,
        establishedYear: 2014
      },
      harvest: {
        season: 'Mùa khô',
        date: '2025-01-10',
        quantity: 2000,
        method: 'manual',
        weather: 'Nắng ráo',
        quality_score: 94
      },
      blockchain: {
        verified: true,
        traceabilityCode: 'MANGO-2025-007',
        transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
        verificationDate: '2025-01-14',
        certificates: ['VietGAP', 'GlobalGAP']
      },
      qualityGrade: 'A+',
      marketDemand: 'high',
      supplierScore: 9.2,
      sustainabilityRating: 8.8
    }
  ]
}

// Auto-sync with warehouse changes
useWarehouseStore.subscribe(
  (state) => state.currentWarehouse,
  (warehouse) => {
    if (warehouse) {
      useProductStore.getState().syncWithWarehouse()
    }
  }
)

// Auto-refresh products every 10 minutes
const AUTO_REFRESH_INTERVAL = 10 * 60 * 1000
setInterval(() => {
  const state = useProductStore.getState()
  if (state.lastUpdated && Date.now() - state.lastUpdated > AUTO_REFRESH_INTERVAL) {
    state.refreshProducts()
  }
}, 60 * 1000) // Check every minute