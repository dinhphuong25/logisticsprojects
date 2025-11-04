# 🚀 COLD-CHAIN WMS - QUICK START

## ✅ Tình Trạng Hiện Tại

### coldstore-admin (Hệ thống đầu tiên) ✅ WORKING
- **URL**: http://localhost:5173/
- **Status**: Đang chạy hoàn hảo
- **Features**: Dashboard, Inventory, Temperature, Alerts
- **Login**: user0@coldstore.com / password

### coldchain-wms (Hệ thống mới) 🚧 READY TO BUILD  
- **Location**: `c:\Users\dark\Desktop\mô hình 3d\coldchain-wms`
- **Config**: ✅ Tailwind, TypeScript, PostCSS đã setup
- **Dependencies**: Đang cài đặt...

---

## 📦 MỤC TIÊU HỆ THỐNG MỚI

Tạo một **Cold-Chain Logistics WMS** với đầy đủ tính năng:

✅ Dashboard với KPIs realtime  
✅ Quản lý Inbound (ASN → QC → Putaway)  
✅ Quản lý Storage (Zones, Locations, Slotting)  
✅ Quản lý Outbound (Waves, FEFO Picking)  
✅ Inventory với CSV/XLSX export  
✅ Temperature monitoring realtime  
✅ Alerts Center (TEMP, EXPIRY, DOOR)  
✅ Dock & Yard management (Calendar + Map)  
✅ Đa ngôn ngữ (VI/EN)  
✅ Dark mode

---

## 🎯 LỘ TRÌNH PHÁT TRIỂN

Tôi đã chuẩn bị SẴN:
1. ✅ Project structure
2. ✅ TypeScript configuration
3. ✅ Tailwind + PostCSS setup
4. ⬜ Type definitions (đang tạo)
5. ⬜ Mock API server
6. ⬜ Core components
7. ⬜ Features implementation

---

## 💻 LỆNH CẦN CHẠY

Sau khi dependencies cài xong:

```bash
cd "c:\Users\dark\Desktop\mô hình 3d\coldchain-wms"
npm run dev
```

---

## 🎨 THIẾT KẾ HỆ THỐNG

### Architecture
```
┌──────────────────────────────────┐
│       React Frontend             │
│  ┌────────────────────────────┐  │
│  │  Features (Business Logic) │  │
│  │  - Dashboard               │  │
│  │  - Inbound/Outbound        │  │
│  │  - Inventory               │  │
│  │  - Temperature             │  │
│  │  - Dock & Yard             │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  State Management          │  │
│  │  - Zustand (global)        │  │
│  │  - TanStack Query (server) │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
            ↓↑ REST API
┌──────────────────────────────────┐
│    MirageJS Mock Server          │
│  - Real-time sensors (5s)        │
│  - Alert engine                  │
│  - FEFO logic                    │
│  - Slotting optimizer            │
└──────────────────────────────────┘
```

### Key Features

#### 1. **Dashboard** (Realtime KPIs)
- Nhập hôm nay: 15 đơn
- Xuất hôm nay: 12 đơn  
- Tồn CHILL: 45,000 kg
- Tồn FROZEN: 78,000 kg
- Cảnh báo: 3 alerts
- Dock đúng giờ: 95%

#### 2. **FEFO Algorithm**
```typescript
// Chọn lô hàng hết hạn sớm nhất trước
function allocateFEFO(qty: number, productId: string) {
  return lots
    .filter(l => l.productId === productId)
    .sort((a, b) => new Date(a.expDate) - new Date(b.expDate))
    .reduce((acc, lot) => {
      const take = Math.min(lot.qty, qty - acc.allocated);
      acc.allocations.push({ lotId: lot.id, qty: take });
      acc.allocated += take;
      return acc;
    }, { allocated: 0, allocations: [] });
}
```

#### 3. **Slotting Score**
```typescript
// Tính điểm vị trí tối ưu
score = 0.6 × tempMatch + 0.2 × spaceFit + 0.2 × velocity

Ví dụ:
- Sản phẩm CHILL + Location CHILL Zone = tempMatch = 1
- Cubic fit 80% = spaceFit = 0.8
- Velocity 50 picks/day = velocityScore = 0.5

Score = 0.6 × 1 + 0.2 × 0.8 + 0.2 × 0.5 = 0.86 (tốt!)
```

#### 4. **Temperature Monitoring**
```typescript
// Update mỗi 5 giây
setInterval(() => {
  zones.forEach(zone => {
    const temp = zone.target + gaussian(0, 1);
    if (temp < zone.min || temp > zone.max) {
      createAlert('TEMP', `${zone.name}: ${temp}°C vượt ngưỡng`);
    }
  });
}, 5000);
```

---

## 📊 DATA MODELS

```typescript
// Kho
interface Warehouse {
  id: string;
  name: string;        // "HCM Warehouse"
  code: string;        // "HCM-01"
  address: string;
  location: { lat: number; lng: number };
}

// Khu vực
interface Zone {
  id: string;
  warehouseId: string;
  name: string;        // "CHILL ZONE A"
  type: "CHILL" | "FROZEN";
  tempMin: number;     // 2°C
  tempMax: number;     // 8°C
}

// Vị trí
interface Location {
  id: string;
  zoneId: string;
  rack: string;        // "A"
  level: string;       // "1"
  slot: string;        // "05"
  maxQty: number;      // 1000 kg
  cubic: number;       // 10 m³
}

// Sản phẩm
interface Product {
  id: string;
  sku: string;         // "SKU-001"
  name: string;        // "Frozen Salmon"
  nameVi: string;      // "Cá hồi đông lạnh"
  unit: string;        // "KG"
  tempClass: "CHILL" | "FROZEN";
  shelfLifeDays: number; // 30 ngày
}

// Lô hàng
interface Lot {
  id: string;
  productId: string;
  lotNo: string;       // "LOT-20251102-001"
  mfgDate: string;     // "2025-11-01"
  expDate: string;     // "2025-12-01"
  qty: number;         // 500 kg
}

// Tồn kho
interface Inventory {
  id: string;
  lotId: string;
  locationId: string;
  qty: number;
}

// Đơn nhập
interface InboundOrder {
  id: string;
  supplier: string;
  eta: string;         // Expected Time of Arrival
  status: "PENDING" | "RECEIVING" | "QC" | "COMPLETED";
  lines: Array<{
    productId: string;
    qty: number;
  }>;
}

// Đơn xuất  
interface OutboundOrder {
  id: string;
  customer: string;
  etd: string;         // Expected Time of Departure
  status: "PENDING" | "PICKING" | "PACKING" | "SHIPPED";
  lines: Array<{
    productId: string;
    qty: number;
  }>;
  pickStrategy: "FEFO" | "FIFO";
}

// Lịch Dock
interface DockAppointment {
  id: string;
  carrier: string;     // "Viettel Post"
  trailerNo: string;   // "51A-12345"
  door: string;        // "DOOR-1"
  start: string;       // "2025-11-02T08:00"
  end: string;         // "2025-11-02T10:00"
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  type: "INBOUND" | "OUTBOUND";
}

// Cảnh báo
interface Alert {
  id: string;
  type: "TEMP" | "EXPIRY" | "INVENTORY" | "DOOR";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  messageVi: string;
  createdAt: string;
  resolved: boolean;
}
```

---

## 🎨 UI DESIGN

### Color Scheme
- **Primary**: Blue (#3B82F6) - cho actions, buttons
- **CHILL**: Cyan (#06B6D4) - khu vực mát  
- **FROZEN**: Purple (#A855F7) - khu vực đông
- **Success**: Green (#10B981) - trạng thái OK
- **Warning**: Orange (#F59E0B) - cảnh báo
- **Danger**: Red (#EF4444) - nghiêm trọng

### Layout
```
┌─────────────────────────────────────────────┐
│ Topbar: Logo | Warehouse Switcher | User    │
├──────────┬──────────────────────────────────┤
│          │                                   │
│ Sidebar  │        Main Content              │
│          │                                   │
│ - Dash   │  ┌─────────────────────────────┐ │
│ - Inbd   │  │  KPI Cards                  │ │
│ - Outbd  │  └─────────────────────────────┘ │
│ - Inv    │  ┌─────────────────────────────┐ │
│ - Temp   │  │  Charts                     │ │
│ - Alerts │  └─────────────────────────────┘ │
│ - Dock   │                                   │
│ - Yard   │                                   │
│ - Users  │                                   │
│          │                                   │
└──────────┴──────────────────────────────────┘
```

---

## 🔐 AUTHENTICATION

### Login Credentials
```typescript
const users = [
  { email: "admin@wms.com", role: "ADMIN", password: "password" },
  { email: "supervisor@wms.com", role: "SUPERVISOR", password: "password" },
  { email: "operator@wms.com", role: "OPERATOR", password: "password" },
];
```

### Role Permissions
```typescript
const permissions = {
  ADMIN: ["*"], // All permissions
  SUPERVISOR: [
    "dashboard.view",
    "inbound.view", "inbound.create", "inbound.edit",
    "outbound.view", "outbound.create",
    "inventory.view",
    "temperature.view",
    "alerts.view", "alerts.resolve",
  ],
  OPERATOR: [
    "dashboard.view",
    "inventory.view",
    "temperature.view",
    "alerts.view",
  ],
};
```

---

## 📱 RESPONSIVE BREAKPOINTS

- **Mobile**: < 768px (Single column, collapsed sidebar)
- **Tablet**: 768px - 1024px (2 columns, icon sidebar)
- **Desktop**: > 1024px (Full layout, expanded sidebar)

---

## 🌐 I18N (Đa Ngôn Ngữ)

### Vietnamese (Default)
```typescript
const vi = {
  "nav.dashboard": "Bảng điều khiển",
  "nav.inbound": "Nhập kho",
  "nav.outbound": "Xuất kho",
  "nav.inventory": "Tồn kho",
  "nav.temperature": "Nhiệt độ",
  "nav.alerts": "Cảnh báo",
  "nav.dock": "Bến đỗ",
  "nav.yard": "Sân xe",
  
  "kpi.inboundToday": "Nhập hôm nay",
  "kpi.outboundToday": "Xuất hôm nay",
  "kpi.onHandChill": "Tồn kho mát",
  "kpi.onHandFrozen": "Tồn kho đông",
  "kpi.openAlerts": "Cảnh báo",
  "kpi.dockOnTime": "Dock đúng giờ",
};
```

### English
```typescript
const en = {
  "nav.dashboard": "Dashboard",
  "nav.inbound": "Inbound",
  "nav.outbound": "Outbound",
  "nav.inventory": "Inventory",
  "nav.temperature": "Temperature",
  "nav.alerts": "Alerts",
  "nav.dock": "Dock",
  "nav.yard": "Yard",
  
  "kpi.inboundToday": "Inbound Today",
  "kpi.outboundToday": "Outbound Today",
  "kpi.onHandChill": "On Hand (Chill)",
  "kpi.onHandFrozen": "On Hand (Frozen)",
  "kpi.openAlerts": "Open Alerts",
  "kpi.dockOnTime": "Dock On-Time %",
};
```

---

## 🧪 TESTING STRATEGY

### Unit Tests (Vitest)
```bash
npm run test
```

Test coverage:
- ✅ FEFO allocation logic
- ✅ Slotting score calculator
- ✅ Alert engine rules
- ✅ Utility functions

### E2E Tests (Playwright)  
```bash
npm run test:e2e
```

Scenarios:
- ✅ Login flow
- ✅ Dashboard loads with KPIs
- ✅ Create inbound order
- ✅ Pick with FEFO
- ✅ Temperature alert triggers

---

## 📦 DEPLOYMENT

### Build for Production
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

### Deploy to Vercel/Netlify
```bash
# Connect git repository
# Auto-deploy on push to main
```

---

## 🎯 BẮT ĐẦU NGAY!

**Bạn muốn tôi làm gì tiếp theo?**

**A.** Tạo toàn bộ file TypeScript types (`src/types/index.ts`) - **5 phút**

**B.** Tạo MirageJS mock server với sensors (`src/mocks/server.ts`) - **10 phút**

**C.** Tạo Dashboard hoàn chỉnh với KPIs + Charts - **15 phút**

**D.** Tạo Inventory Table với filters + CSV export - **15 phút**

**E.** Tạo Temperature Monitoring realtime - **10 phút**

**F.** Tạo TẤT CẢ các file cốt lõi một lần - **30 phút** ⭐ RECOMMENDED

---

💡 **Gợi ý**: Chọn **F** để có hệ thống hoàn chỉnh ngay!

🚀 **coldchain-wms** - Cold-Chain Logistics WMS Made in Vietnam
