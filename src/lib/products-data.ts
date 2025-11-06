// Shared product data for the application
export interface Product {
  id: string
  sku: string
  name: string
  nameVi: string
  description: string
  image: string
  unit: string
  tempClass: 'CHILL' | 'FROZEN' | 'DRY'
  tempRange: string
  shelfLifeDays: number
  weight: number
  cubic: number
  category: string
  subcategory: string
  stockLevel: number
  reorderPoint: number
  price: number
  supplier: string
  origin: string
  certifications: string[]
  isPopular: boolean
  lastRestocked: string
}

// Master product catalog
export const PRODUCT_CATALOG: Product[] = [
  // Seafood Category
  {
    id: 'prod-001',
    sku: 'FISH-SAL-001',
    name: 'Norwegian Salmon Fillet',
    nameVi: 'Cá hồi Na Uy phi lê',
    description: 'Cá hồi tươi nhập khẩu từ Na Uy, giàu Omega-3, thịt hồng tươi',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
    unit: 'KG',
    tempClass: 'FROZEN',
    tempRange: '-18°C đến -22°C',
    shelfLifeDays: 365,
    weight: 2.5,
    cubic: 0.008,
    category: 'Hải sản',
    subcategory: 'Cá tươi',
    stockLevel: 450,
    reorderPoint: 100,
    price: 580000,
    supplier: 'Fresh Seafood Co.',
    origin: 'Na Uy',
    certifications: ['MSC', 'ASC', 'HACCP'],
    isPopular: true,
    lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-002',
    sku: 'SHRIMP-VAC-001',
    name: 'Black Tiger Prawns',
    nameVi: 'Tôm sú đông lạnh',
    description: 'Tôm sú size 16/20, đông lạnh ngay sau đánh bắt, tươi ngon',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80',
    unit: 'KG',
    tempClass: 'FROZEN',
    tempRange: '-18°C đến -20°C',
    shelfLifeDays: 540,
    weight: 1.0,
    cubic: 0.005,
    category: 'Hải sản',
    subcategory: 'Tôm',
    stockLevel: 320,
    reorderPoint: 80,
    price: 450000,
    supplier: 'Ocean Fresh Import',
    origin: 'Việt Nam',
    certifications: ['BAP', 'HACCP', 'GlobalG.A.P'],
    isPopular: true,
    lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Meat Category
  {
    id: 'prod-004',
    sku: 'BEEF-WAG-001',
    name: 'Wagyu Beef Ribeye',
    nameVi: 'Thịt bò Wagyu Ribeye',
    description: 'Thịt bò Wagyu cao cấp, vân mỡ đẹp, độ marbling A5',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
    unit: 'KG',
    tempClass: 'FROZEN',
    tempRange: '-18°C đến -20°C',
    shelfLifeDays: 730,
    weight: 3.0,
    cubic: 0.01,
    category: 'Thịt',
    subcategory: 'Thịt bò',
    stockLevel: 180,
    reorderPoint: 50,
    price: 2850000,
    supplier: 'Global Meat Import',
    origin: 'Úc',
    certifications: ['Halal', 'HACCP', 'MSA'],
    isPopular: true,
    lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-005',
    sku: 'PORK-BEL-001',
    name: 'Premium Pork Belly',
    nameVi: 'Thịt ba chỉ heo cao cấp',
    description: 'Thịt ba chỉ heo tươi, từ trang trại chuẩn VietGAP',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800&q=80',
    unit: 'KG',
    tempClass: 'CHILL',
    tempRange: '0°C đến 4°C',
    shelfLifeDays: 14,
    weight: 2.0,
    cubic: 0.006,
    category: 'Thịt',
    subcategory: 'Thịt heo',
    stockLevel: 420,
    reorderPoint: 100,
    price: 185000,
    supplier: 'VN Farm Fresh',
    origin: 'Việt Nam',
    certifications: ['VietGAP', 'HACCP'],
    isPopular: true,
    lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-006',
    sku: 'CHIC-WHL-001',
    name: 'Free Range Chicken',
    nameVi: 'Gà ta thả vườn',
    description: 'Gà ta nuôi thả vườn, thịt chắc dai, không hormone',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800&q=80',
    unit: 'KG',
    tempClass: 'CHILL',
    tempRange: '0°C đến 4°C',
    shelfLifeDays: 7,
    weight: 1.5,
    cubic: 0.005,
    category: 'Thịt',
    subcategory: 'Gà',
    stockLevel: 350,
    reorderPoint: 80,
    price: 125000,
    supplier: 'Organic Poultry Farm',
    origin: 'Việt Nam',
    certifications: ['Organic', 'VietGAP'],
    isPopular: true,
    lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Dairy Category
  {
    id: 'prod-007',
    sku: 'MILK-FRS-001',
    name: 'Fresh Milk A2',
    nameVi: 'Sữa tươi A2 cao cấp',
    description: 'Sữa tươi A2 protein, dễ tiêu hóa, không GMO',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80',
    unit: 'Lít',
    tempClass: 'CHILL',
    tempRange: '2°C đến 6°C',
    shelfLifeDays: 10,
    weight: 1.03,
    cubic: 0.001,
    category: 'Sữa',
    subcategory: 'Sữa tươi',
    stockLevel: 520,
    reorderPoint: 120,
    price: 85000,
    supplier: 'Premium Dairy Corp.',
    origin: 'Úc',
    certifications: ['Organic', 'HACCP', 'A2'],
    isPopular: true,
    lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-009',
    sku: 'YOGU-GRE-001',
    name: 'Greek Yogurt Plain',
    nameVi: 'Sữa chua Hy Lạp',
    description: 'Sữa chua Hy Lạp nguyên chất, protein cao, ít đường',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
    unit: 'KG',
    tempClass: 'CHILL',
    tempRange: '2°C đến 6°C',
    shelfLifeDays: 30,
    weight: 0.5,
    cubic: 0.0005,
    category: 'Sữa',
    subcategory: 'Sữa chua',
    stockLevel: 380,
    reorderPoint: 100,
    price: 125000,
    supplier: 'Mediterranean Foods',
    origin: 'Hy Lạp',
    certifications: ['Organic', 'HACCP'],
    isPopular: true,
    lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Vegetables Category
  {
    id: 'prod-011',
    sku: 'VEG-SPN-001',
    name: 'Baby Spinach',
    nameVi: 'Rau chân vịt baby',
    description: 'Rau chân vịt non, tươi mát, giàu sắt',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80',
    unit: 'KG',
    tempClass: 'CHILL',
    tempRange: '2°C đến 6°C',
    shelfLifeDays: 7,
    weight: 0.3,
    cubic: 0.001,
    category: 'Rau củ',
    subcategory: 'Rau',
    stockLevel: 180,
    reorderPoint: 50,
    price: 95000,
    supplier: 'Green Valley',
    origin: 'Việt Nam',
    certifications: ['VietGAP', 'HACCP'],
    isPopular: true,
    lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Fruits Category
  {
    id: 'prod-012',
    sku: 'FRU-BER-001',
    name: 'Mixed Berry Blend',
    nameVi: 'Hỗn hợp dâu tây đông lạnh',
    description: 'Hỗn hợp dâu tây, việt quất, mâm xôi đông lạnh',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80',
    unit: 'KG',
    tempClass: 'FROZEN',
    tempRange: '-18°C đến -20°C',
    shelfLifeDays: 730,
    weight: 1.0,
    cubic: 0.003,
    category: 'Trái cây',
    subcategory: 'Dâu',
    stockLevel: 410,
    reorderPoint: 100,
    price: 280000,
    supplier: 'Berry Farm Imports',
    origin: 'Mỹ',
    certifications: ['Organic', 'USDA', 'HACCP'],
    isPopular: true,
    lastRestocked: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Helper functions to query products
export const getAllProducts = (): Product[] => {
  return PRODUCT_CATALOG
}

export const getProductById = (id: string): Product | undefined => {
  return PRODUCT_CATALOG.find(p => p.id === id)
}

export const getProductBySku = (sku: string): Product | undefined => {
  return PRODUCT_CATALOG.find(p => p.sku === sku)
}

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase()
  return PRODUCT_CATALOG.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.nameVi.toLowerCase().includes(lowerQuery) ||
    p.sku.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery)
  )
}

export const getProductsByCategory = (category: string): Product[] => {
  return PRODUCT_CATALOG.filter(p => p.category === category)
}

export const getProductsByTempClass = (tempClass: 'CHILL' | 'FROZEN' | 'DRY'): Product[] => {
  return PRODUCT_CATALOG.filter(p => p.tempClass === tempClass)
}

export const getProductsInStock = (): Product[] => {
  return PRODUCT_CATALOG.filter(p => p.stockLevel > 0)
}

export const getLowStockProducts = (): Product[] => {
  return PRODUCT_CATALOG.filter(p => p.stockLevel <= p.reorderPoint)
}

export const getPopularProducts = (): Product[] => {
  return PRODUCT_CATALOG.filter(p => p.isPopular)
}

// Get zone assignment based on temperature class
export const getZoneForProduct = (tempClass: 'CHILL' | 'FROZEN' | 'DRY'): string => {
  const zones = {
    FROZEN: ['FRZ-A', 'FRZ-B', 'FRZ-C'],
    CHILL: ['CHILL-A', 'CHILL-B'],
    DRY: ['DRY-A', 'DRY-B']
  }
  const zoneList = zones[tempClass]
  return zoneList[Math.floor(Math.random() * zoneList.length)]
}
