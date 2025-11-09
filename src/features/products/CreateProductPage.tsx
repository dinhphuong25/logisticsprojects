import React, { useState } from 'react';
import { useProductStore } from '../../stores/productStore';
import { Package, Save, X, Sparkles, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

// Sample data generator for ĐBSCL agricultural products
const generateSampleProducts = () => {
  const products = [
    {
      nameVi: 'Gạo Jasmine Hương Lài Cao Cấp',
      name: 'Premium Jasmine Fragrant Rice',
      sku: 'RICE-001',
      category: 'Ngũ cốc ĐBSCL',
      price: 45000,
      unit: 'kg',
      stockLevel: 5000,
      description: 'Gạo thơm cao cấp, hạt dài, mềm dẻo, hương thơm tự nhiên. Trồng tại đồng bằng sông Cửu Long với quy trình canh tác hữu cơ.',
      origin: 'An Giang',
      farmName: 'HTX Nông nghiệp Thạnh Phú',
      farmerName: 'Nguyễn Văn Minh',
      farmProvince: 'An Giang',
      farmArea: 25.5,
      certifications: ['VietGAP', 'Organic', 'GlobalGAP']
    },
    {
      nameVi: 'Thanh Long Ruột Đỏ Organic',
      name: 'Organic Red Dragon Fruit',
      sku: 'FRUIT-001',
      category: 'Trái cây ĐBSCL',
      price: 35000,
      unit: 'kg',
      stockLevel: 3200,
      description: 'Thanh long ruột đỏ organic, không hóa chất, ngọt tự nhiên 13-15 brix. Thu hoạch đúng độ chín, đóng gói theo tiêu chuẩn xuất khẩu.',
      origin: 'Tiền Giang',
      farmName: 'Vườn Thanh Long Bình Phước',
      farmerName: 'Trần Thị Lan',
      farmProvince: 'Tiền Giang',
      farmArea: 15.0,
      certifications: ['VietGAP', 'Organic', 'Fair Trade']
    },
    {
      nameVi: 'Tôm Sú Organic Đặc Sản',
      name: 'Premium Organic Black Tiger Shrimp',
      sku: 'SEAFOOD-001',
      category: 'Thủy sản ĐBSCL',
      price: 380000,
      unit: 'kg',
      stockLevel: 1500,
      description: 'Tôm sú nuôi sinh thái organic, size 20-30 con/kg. Không kháng sinh, không hóa chất. Nuôi trong môi trường nước mặn tự nhiên.',
      origin: 'Cà Mau',
      farmName: 'Trại Tôm Sinh Thái Nam Cần',
      farmerName: 'Lê Văn Hải',
      farmProvince: 'Cà Mau',
      farmArea: 30.0,
      certifications: ['ASC', 'BAP', 'Organic', 'GlobalGAP']
    },
    {
      nameVi: 'Dừa Xiêm Xanh Tươi Bến Tre',
      name: 'Fresh Ben Tre Green Coconut',
      sku: 'FRUIT-002',
      category: 'Trái cây ĐBSCL',
      price: 15000,
      unit: 'trái',
      stockLevel: 8000,
      description: 'Dừa xiêm xanh nguyên trái, nước ngọt mát, cùi dày. Đặc sản nổi tiếng của Bến Tre, được trồng theo phương pháp truyền thống.',
      origin: 'Bến Tre',
      farmName: 'Vườn Dừa Miệt Vườn',
      farmerName: 'Võ Văn Thành',
      farmProvince: 'Bến Tre',
      farmArea: 18.0,
      certifications: ['VietGAP', '3_Sao']
    },
    {
      nameVi: 'Xoài Cát Hòa Lộc Cao Cấp',
      name: 'Premium Hoa Loc Cat Mango',
      sku: 'FRUIT-003',
      category: 'Trái cây ĐBSCL',
      price: 65000,
      unit: 'kg',
      stockLevel: 2800,
      description: 'Xoài cát Hòa Lộc đặc sản Tiền Giang, thịt vàng óng, thơm ngọt đậm đà. Size xuất khẩu 350-450g/trái.',
      origin: 'Tiền Giang',
      farmName: 'Vườn Xoài Hòa Lộc Thạnh Tân',
      farmerName: 'Nguyễn Thanh Sơn',
      farmProvince: 'Tiền Giang',
      farmArea: 12.5,
      certifications: ['VietGAP', 'GlobalGAP']
    },
    {
      nameVi: 'Cá Tra Fillet Đông Lạnh',
      name: 'Frozen Pangasius Fillet',
      sku: 'SEAFOOD-002',
      category: 'Thủy sản ĐBSCL',
      price: 85000,
      unit: 'kg',
      stockLevel: 4500,
      description: 'Cá tra phi lê đông lạnh, không xương, không da. Nuôi trong ao bùn tự nhiên, thịt cá ngọt, không tanh.',
      origin: 'Đồng Tháp',
      farmName: 'Trại Cá Tra Hồng Ngự',
      farmerName: 'Trần Minh Khoa',
      farmProvince: 'Đồng Tháp',
      farmArea: 45.0,
      certifications: ['ASC', 'BAP', 'HACCP']
    },
    {
      nameVi: 'Gạo ST25 Đặc Sản Sóc Trăng',
      name: 'ST25 Specialty Rice Soc Trang',
      sku: 'RICE-002',
      category: 'Ngũ cốc ĐBSCL',
      price: 75000,
      unit: 'kg',
      stockLevel: 3500,
      description: 'Gạo ST25 đạt giải nhất gạo ngon nhất thế giới. Hạt dài, trắng trong, hương thơm đặc trưng, nấu cơm dẻo và ngon.',
      origin: 'Sóc Trăng',
      farmName: 'HTX Lúa Gạo Sóc Trăng',
      farmerName: 'Hồ Quang Cua',
      farmProvince: 'Sóc Trăng',
      farmArea: 35.0,
      certifications: ['VietGAP', 'GlobalGAP', 'Organic']
    },
    {
      nameVi: 'Bưởi Da Xanh Vĩnh Long',
      name: 'Vinh Long Green Skin Pomelo',
      sku: 'FRUIT-004',
      category: 'Trái cây ĐBSCL',
      price: 28000,
      unit: 'kg',
      stockLevel: 4200,
      description: 'Bưởi da xanh đặc sản Vĩnh Long, múi hồng, ngọt thanh, ít hạt. Trọng lượng trung bình 1.2-1.5kg/trái.',
      origin: 'Vĩnh Long',
      farmName: 'Vườn Bưởi Tam Bình',
      farmerName: 'Lê Thị Mai',
      farmProvince: 'Vĩnh Long',
      farmArea: 8.5,
      certifications: ['VietGAP', '3_Sao']
    },
    {
      nameVi: 'Mật Ong Hoa Nhãn Nguyên Chất',
      name: 'Pure Longan Blossom Honey',
      sku: 'FOOD-001',
      category: 'Thực phẩm chế biến ĐBSCL',
      price: 180000,
      unit: 'kg',
      stockLevel: 800,
      description: 'Mật ong hoa nhãn nguyên chất 100%, không pha trộn. Hương thơm đặc trưng của hoa nhãn, màu vàng óng.',
      origin: 'Cần Thơ',
      farmName: 'Trại Ong Mật Cồn Khương',
      farmerName: 'Phan Văn Tùng',
      farmProvince: 'Cần Thơ',
      farmArea: 5.0,
      certifications: ['HACCP', 'Organic']
    },
    {
      nameVi: 'Sầu Riêng Ri6 Cái Mơn',
      name: 'Ri6 Durian Cai Mon',
      sku: 'FRUIT-005',
      category: 'Trái cây ĐBSCL',
      price: 120000,
      unit: 'kg',
      stockLevel: 1200,
      description: 'Sầu riêng Ri6 đặc sản Cái Mơn, múi dày, vàng óng, béo ngậy, vị ngọt đậm. Trọng lượng 2-3kg/trái.',
      origin: 'Cần Thơ',
      farmName: 'Vườn Sầu Riêng Cái Mơn',
      farmerName: 'Nguyễn Văn Dũng',
      farmProvince: 'Cần Thơ',
      farmArea: 6.5,
      certifications: ['VietGAP']
    },
    {
      nameVi: 'Cá Lóc Đồng Tươi Sống',
      name: 'Fresh Live Snakehead Fish',
      sku: 'SEAFOOD-003',
      category: 'Thủy sản ĐBSCL',
      price: 95000,
      unit: 'kg',
      stockLevel: 2200,
      description: 'Cá lóc đồng tươi sống, nuôi trong ruộng lúa và ao tự nhiên. Thịt cá ngọt, giàu protein, ít mỡ.',
      origin: 'An Giang',
      farmName: 'Ao Cá Đồng Tháp Mười',
      farmerName: 'Võ Minh Tuấn',
      farmProvince: 'An Giang',
      farmArea: 22.0,
      certifications: ['VietGAP', 'ASC']
    },
    {
      nameVi: 'Măng Cụt Tươi Cà Mau',
      name: 'Fresh Ca Mau Mangosteen',
      sku: 'FRUIT-006',
      category: 'Trái cây ĐBSCL',
      price: 42000,
      unit: 'kg',
      stockLevel: 2800,
      description: 'Măng cụt tươi Cà Mau, vỏ tím đen, múi trắng ngọt thanh. Size đều 5-7 múi/trái.',
      origin: 'Cà Mau',
      farmName: 'Vườn Trái Cây U Minh',
      farmerName: 'Huỳnh Thị Nga',
      farmProvince: 'Cà Mau',
      farmArea: 10.0,
      certifications: ['VietGAP']
    }
  ];

  return products.map((p, index) => ({
    id: `AGR-${Date.now() + index}`,
    name: p.name,
    nameVi: p.nameVi,
    sku: p.sku,
    category: p.category,
    price: p.price,
    unit: p.unit,
    stockLevel: p.stockLevel,
    reorderPoint: Math.floor(p.stockLevel * 0.2),
    tempClass: (p.category === 'Thủy sản ĐBSCL' ? 'FROZEN' : 
               p.category === 'Trái cây ĐBSCL' ? 'CHILL' : 'AMBIENT') as 'FROZEN' | 'CHILL' | 'AMBIENT' | 'DRY',
    tempRange: p.category === 'Thủy sản ĐBSCL' ? '-18°C' : 
               p.category === 'Trái cây ĐBSCL' ? '0-8°C' : '18-25°C',
    shelfLifeDays: p.category === 'Thủy sản ĐBSCL' ? 180 : 
                   p.category === 'Trái cây ĐBSCL' ? 7 : 365,
    description: p.description,
    image: `https://images.unsplash.com/photo-${1574323347407 + index}?w=500`,
    imageUrl: `https://images.unsplash.com/photo-${1574323347407 + index}?w=500`,
    origin: p.origin,
    isPopular: index < 4,
    certifications: p.certifications,
    weight: 1,
    cubic: 0.001,
    lastRestocked: new Date().toISOString().split('T')[0],
    
    farm: {
      name: p.farmName,
      province: p.farmProvince,
      farmer: p.farmerName,
      certifications: p.certifications,
      coordinates: { lat: 10.0000 + (index * 0.1), lng: 106.0000 + (index * 0.1) },
      area: p.farmArea,
      establishedYear: 2015 + Math.floor(index / 2)
    },
    
    harvest: {
      season: index % 3 === 0 ? 'Vụ Đông Xuân' : index % 3 === 1 ? 'Vụ Hè Thu' : 'Vụ Mùa',
      date: new Date(Date.now() - (index * 86400000)).toISOString().split('T')[0],
      quantity: p.stockLevel,
      method: (index % 2 === 0 ? 'manual' : 'machine') as 'manual' | 'machine',
      weather: 'Thuận lợi',
      quality_score: 85 + Math.floor(Math.random() * 15)
    },
    
    blockchain: {
      verified: true,
      traceabilityCode: `${p.sku}-2025-${String(index).padStart(3, '0')}`,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
      verificationDate: new Date().toISOString().split('T')[0],
      certificates: p.certifications
    },
    
    qualityGrade: (index % 5 === 0 ? 'A+' : index % 4 === 0 ? 'A' : 'B') as 'A+' | 'A' | 'B' | 'C',
    marketDemand: (index < 5 ? 'high' : index < 9 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
    supplierScore: 8.0 + (Math.random() * 2),
    sustainabilityRating: 8.0 + (Math.random() * 2)
  }));
};

export const CreateProductPage = () => {
  const { addProduct, products } = useProductStore();
  const [formData, setFormData] = useState({
    name: '',
    nameVi: '',
    sku: '',
    category: 'Ngũ cốc ĐBSCL',
    price: 0,
    unit: 'kg',
    stockLevel: 0,
    description: '',
    origin: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);

  const handleGenerateSampleData = () => {
    setIsGenerating(true);
    const sampleProducts = generateSampleProducts();
    
    let count = 0;
    const interval = setInterval(() => {
      if (count < sampleProducts.length) {
        addProduct(sampleProducts[count]);
        count++;
        setGeneratedCount(count);
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        setTimeout(() => {
          alert(`✅ Đã tạo thành công ${sampleProducts.length} sản phẩm ĐBSCL!\n\n` +
                `📦 Tổng sản phẩm trong hệ thống: ${products.length + sampleProducts.length}\n` +
                `🌾 Hãy kiểm tra trang Danh sách sản phẩm để xem.`);
        }, 500);
      }
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduct = {
      id: `AGR-${Date.now().toString().slice(-6)}`,
      ...formData,
      tempClass: 'AMBIENT' as const,
      tempRange: '18-25°C',
      shelfLifeDays: 30,
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500',
      isPopular: false,
      certifications: [],
      weight: 1,
      cubic: 0.001,
      reorderPoint: 50,
      lastRestocked: new Date().toISOString().split('T')[0],
      
      farm: {
        name: 'Nông trại mẫu',
        province: formData.origin,
        farmer: 'Nông dân',
        certifications: [],
        coordinates: { lat: 10.0000, lng: 106.0000 },
        area: 10,
        establishedYear: 2020
      },
      
      harvest: {
        season: 'Vụ Đông Xuân',
        date: new Date().toISOString().split('T')[0],
        quantity: formData.stockLevel,
        method: 'manual' as const,
        weather: 'Thuận lợi',
        quality_score: 90
      },
      
      blockchain: {
        verified: true,
        traceabilityCode: `${formData.sku}-2025`,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
        verificationDate: new Date().toISOString().split('T')[0],
        certificates: []
      },
      
      qualityGrade: 'A' as const,
      marketDemand: 'medium' as const,
      supplierScore: 9.0,
      sustainabilityRating: 8.5
    };
    
    addProduct(newProduct);
    alert('Sản phẩm đã được tạo thành công!');
    
    // Reset form
    setFormData({
      name: '',
      nameVi: '',
      sku: '',
      category: 'Ngũ cốc ĐBSCL',
      price: 0,
      unit: 'kg',
      stockLevel: 0,
      description: '',
      origin: ''
    });
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <Package className="mr-4 text-green-600" size={40} />
                Quản Lý Sản Phẩm ĐBSCL
              </h1>
              <p className="text-gray-600 mt-3 text-lg">Thêm sản phẩm nông nghiệp từ Đồng bằng Sông Cửu Long</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="px-4 py-2 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700 font-medium">
                    📦 Tổng sản phẩm: <span className="font-bold text-xl">{products.length}</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick Generate Button */}
            <div className="text-center">
              <button
                onClick={handleGenerateSampleData}
                disabled={isGenerating}
                className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <div>
                        <div className="font-bold text-lg">Đang tạo...</div>
                        <div className="text-sm opacity-90">{generatedCount} sản phẩm</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Sparkles className="animate-pulse" size={24} />
                      <div>
                        <div className="font-bold text-lg">Tạo Dữ Liệu Mẫu</div>
                        <div className="text-sm opacity-90">12 sản phẩm ĐBSCL</div>
                      </div>
                    </>
                  )}
                </div>
              </button>
              <p className="text-xs text-gray-500 mt-2">Tự động tạo sản phẩm đặc sản</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manual Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-green-100">
              <Plus className="text-green-600" size={28} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tạo Thủ Công</h2>
                <p className="text-sm text-gray-600">Nhập thông tin sản phẩm chi tiết</p>
              </div>
            </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm (Tiếng Việt) *
              </label>
              <input
                type="text"
                required
                value={formData.nameVi}
                onChange={(e) => handleChange('nameVi', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Gạo ST25 Cao Cấp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm (English) *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="VD: ST25 Premium Rice"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã SKU *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="VD: RICE-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Ngũ cốc ĐBSCL">Ngũ cốc ĐBSCL</option>
                <option value="Trái cây ĐBSCL">Trái cây ĐBSCL</option>
                <option value="Thủy sản ĐBSCL">Thủy sản ĐBSCL</option>
                <option value="Thực phẩm chế biến ĐBSCL">Thực phẩm chế biến ĐBSCL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá (VNĐ) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đơn vị *
              </label>
              <select
                required
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="gram">Gram (g)</option>
                <option value="trái">Trái</option>
                <option value="túi">Túi</option>
                <option value="thùng">Thùng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tồn kho *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stockLevel}
                onChange={(e) => handleChange('stockLevel', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xuất xứ *
              </label>
              <select
                required
                value={formData.origin}
                onChange={(e) => handleChange('origin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn tỉnh thành</option>
                <option value="An Giang">An Giang</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Đồng Tháp">Đồng Tháp</option>
                <option value="Kiên Giang">Kiên Giang</option>
                <option value="Long An">Long An</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả sản phẩm
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả chi tiết về sản phẩm..."
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <X className="mr-2" size={18} />
              Hủy bỏ
            </button>
            
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <Save className="mr-2" size={18} />
              Tạo sản phẩm
            </button>
          </div>
          </form>
        </div>

        {/* Sample Data Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100">
            <Sparkles className="text-blue-600" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dữ Liệu Mẫu Có Sẵn</h2>
              <p className="text-sm text-gray-600">12 sản phẩm đặc sản ĐBSCL</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-2">
            {[
              { icon: '🌾', name: 'Gạo Jasmine Hương Lài', origin: 'An Giang' },
              { icon: '🐉', name: 'Thanh Long Ruột Đỏ Organic', origin: 'Tiền Giang' },
              { icon: '🦐', name: 'Tôm Sú Organic Đặc Sản', origin: 'Cà Mau' },
              { icon: '🥥', name: 'Dừa Xiêm Xanh Tươi', origin: 'Bến Tre' },
              { icon: '🥭', name: 'Xoài Cát Hòa Lộc', origin: 'Tiền Giang' },
              { icon: '🐟', name: 'Cá Tra Fillet Đông Lạnh', origin: 'Đồng Tháp' },
              { icon: '🌾', name: 'Gạo ST25 Đặc Sản', origin: 'Sóc Trăng' },
              { icon: '🍊', name: 'Bưởi Da Xanh', origin: 'Vĩnh Long' },
              { icon: '🍯', name: 'Mật Ong Hoa Nhãn', origin: 'Cần Thơ' },
              { icon: '🌰', name: 'Sầu Riêng Ri6 Cái Mơn', origin: 'Cần Thơ' },
              { icon: '🐟', name: 'Cá Lóc Đồng Tươi Sống', origin: 'An Giang' },
              { icon: '🍇', name: 'Măng Cụt Tươi', origin: 'Cà Mau' }
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-3xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">📍 {item.origin}</div>
                </div>
                <CheckCircle2 className="text-green-600" size={20} />
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <div className="font-semibold text-blue-900 mb-1">Thông tin dữ liệu mẫu</div>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>✅ Bao gồm đầy đủ thông tin nông trại, blockchain, chứng nhận</div>
                  <div>✅ Dữ liệu thực tế về sản phẩm ĐBSCL</div>
                  <div>✅ Tự động phân loại nhiệt độ bảo quản</div>
                  <div>✅ Tích hợp hệ thống truy xuất nguồn gốc</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
