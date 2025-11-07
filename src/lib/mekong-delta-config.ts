// Nông sản Đồng bằng Sông Cửu Long - Cấu hình đặc thù
export const MEKONG_DELTA_CONFIG = {
  // Các tỉnh chính ĐBSCL
  provinces: [
    'An Giang', 'Đồng Tháp', 'Tiền Giang', 'Vĩnh Long', 'Bến Tre',
    'Trà Vinh', 'Sóc Trăng', 'Hậu Giang', 'Kiên Giang', 'Cà Mau',
    'Long An', 'Cần Thơ'
  ],

  // Nông sản chính của ĐBSCL
  primaryProducts: {
    grains: {
      name: 'Ngũ cốc',
      items: ['Lúa gạo', 'Ngô', 'Đậu xanh', 'Đậu nành'],
      seasons: ['Vụ đông xuân', 'Vụ hè thu', 'Vụ mùa'],
      storage: { temperature: '25-30°C', humidity: '12-14%' }
    },
    fruits: {
      name: 'Trái cây',
      items: ['Xoài', 'Dừa', 'Chôm chôm', 'Sầu riêng', 'Thanh long', 'Bưởi'],
      seasons: ['Mùa khô', 'Mùa mưa'],
      storage: { temperature: '8-12°C', humidity: '85-90%' }
    },
    aquaculture: {
      name: 'Thủy sản',
      items: ['Cá tra', 'Cá basa', 'Tôm sú', 'Tôm thẻ chân trắng'],
      storage: { temperature: '-18°C', humidity: '95%' }
    },
    vegetables: {
      name: 'Rau củ',
      items: ['Củ cải trắng', 'Cà chua', 'Ớt', 'Hành lá'],
      storage: { temperature: '0-4°C', humidity: '90-95%' }
    }
  },

  // Mùa vụ theo lịch ĐBSCL
  cropCalendar: {
    'Vụ Đông Xuân': { start: 'T12', end: 'T4', products: ['Lúa', 'Rau màu'] },
    'Vụ Hè Thu': { start: 'T5', end: 'T9', products: ['Lúa', 'Ngô'] },
    'Vụ Mùa': { start: 'T6', end: 'T11', products: ['Lúa', 'Đậu'] },
    'Mùa khô': { start: 'T11', end: 'T4', products: ['Trái cây'] },
    'Mùa mưa': { start: 'T5', end: 'T10', products: ['Rau xanh', 'Thủy sản'] }
  },

  // Phương tiện vận chuyển đặc thù ĐBSCL
  transportation: {
    waterway: { name: 'Đường thủy', capacity: '500-2000 tấn', cost: 'Thấp' },
    road: { name: 'Đường bộ', capacity: '20-30 tấn', cost: 'Trung bình' },
    river_boat: { name: 'Ghe bầu', capacity: '5-15 tấn', cost: 'Thấp' }
  },

  // Chợ đầu mối và trung tâm phân phối
  marketCenters: [
    { name: 'Chợ đầu mối Hóc Môn', province: 'TP.HCM', type: 'primary' },
    { name: 'Chợ đầu mối Cần Thơ', province: 'Cần Thơ', type: 'regional' },
    { name: 'Chợ nổi Cái Răng', province: 'Cần Thơ', type: 'traditional' },
    { name: 'Chợ Long Xuyên', province: 'An Giang', type: 'regional' }
  ],

  // Tiêu chuẩn chất lượng nông sản
  qualityStandards: {
    VietGAP: 'Thực hành nông nghiệp tốt Việt Nam',
    GlobalGAP: 'Tiêu chuẩn quốc tế',
    Organic: 'Hữu cơ',
    '3_Sao': 'Gạo chất lượng cao'
  },

  // Thời tiết và điều kiện khí hậu
  climate: {
    temperature: { min: 24, max: 35, unit: '°C' },
    humidity: { min: 70, max: 85, unit: '%' },
    rainfall: { annual: '1200-1800mm' },
    seasons: ['Mùa khô', 'Mùa mưa']
  },

  // Cảnh báo thiên tai phổ biến
  naturalDisasters: [
    'Lũ lụt', 'Hạn hán', 'Xâm nhập mặn', 'Bão nhiệt đới'
  ]
}

// Hàm hỗ trợ tính toán mùa vụ
export const getCurrentSeason = (): string => {
  const month = new Date().getMonth() + 1
  
  if (month >= 12 || month <= 4) return 'Vụ Đông Xuân / Mùa khô'
  if (month >= 5 && month <= 9) return 'Vụ Hè Thu / Mùa mưa'
  return 'Vụ Mùa'
}

// Hàm tính toán điều kiện bảo quản theo sản phẩm
export const getStorageConditions = (productType: string, productName: string) => {
  const category = Object.values(MEKONG_DELTA_CONFIG.primaryProducts)
    .find(cat => cat.items.includes(productName))
  
  return category?.storage || { temperature: '15-25°C', humidity: '60-70%' }
}

// Hàm xác định phương tiện vận chuyển phù hợp
export const getOptimalTransport = (distance: number, weight: number): string => {
  if (weight > 100 && distance > 50) return 'waterway' // Đường thủy cho hàng nặng, quãng xa
  if (weight <= 20) return 'river_boat' // Ghe bầu cho hàng nhẹ
  return 'road' // Đường bộ cho trường hợp còn lại
}