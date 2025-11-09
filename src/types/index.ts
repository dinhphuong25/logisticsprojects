// ==================== DOMAIN MODELS ====================

// Kho hàng
export interface Warehouse {
  id: string;
  name: string;
  nameVi: string;
  code: string; // "HCM-01"
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  totalCapacity: number; // m³
  usedCapacity: number;
}

// Khu vực (Zone)
export interface Zone {
  id: string;
  warehouseId: string;
  name: string; // "CHILL ZONE A"
  nameVi: string;
  type: ZoneType;
  tempMin: number; // °C
  tempMax: number;
  tempTarget: number;
  capacity: number; // kg
  used: number;
}

export type ZoneType = "CHILL" | "FROZEN" | "DRY" | "STAGING";

// Vị trí lưu trữ
export interface Location {
  id: string;
  zoneId: string;
  code: string; // "A-01-05"
  rack: string; // "A"
  level: string; // "01"
  slot: string; // "05"
  maxQty: number; // kg
  currentQty: number;
  cubic: number; // m³
  status: LocationStatus;
}

export type LocationStatus = "AVAILABLE" | "OCCUPIED" | "BLOCKED" | "MAINTENANCE";

// Sản phẩm
export interface Product {
  id: string;
  sku: string; // "SKU-001"
  name: string;
  nameVi: string;
  description?: string;
  unit: string; // "KG", "CTN", "PAL"
  tempClass: TempClass;
  shelfLifeDays: number;
  weight: number; // kg per unit
  cubic: number; // m³ per unit
  category: string;
  imageUrl?: string;
}

export type TempClass = "CHILL" | "FROZEN" | "DRY" | "AMBIENT";

// Lô hàng
export interface Lot {
  id: string;
  productId: string;
  lotNo: string; // "LOT-20251102-001"
  mfgDate: string; // ISO date
  expDate: string; // ISO date
  originCountry: string;
  supplier: string;
  totalQty: number; // kg
  availableQty: number;
  allocatedQty: number;
  status: LotStatus;
}

export type LotStatus = "QUARANTINE" | "AVAILABLE" | "ALLOCATED" | "EXPIRED" | "HOLD";

// Tồn kho
export interface Inventory {
  id: string;
  lotId: string;
  locationId: string;
  qty: number; // kg
  updatedAt: string;
  
  // Populated fields
  lot?: Lot;
  product?: Product;
  location?: Location;
  zone?: Zone;
}

// Đơn nhập kho
export interface InboundOrder {
  id: string;
  orderNo: string; // "IB-20251102-001"
  warehouseId: string;
  supplier: string;
  carrier?: string;
  trailerNo?: string;
  eta: string; // ISO datetime
  actualArrival?: string;
  status: InboundStatus;
  lines: InboundLine[];
  totalQty: number;
  receivedQty: number;
  createdAt: string;
  createdBy: string;
  notes?: string;
}

export type InboundStatus = "PENDING" | "SCHEDULED" | "RECEIVING" | "QC" | "PUTAWAY" | "COMPLETED" | "CANCELLED";

export interface InboundLine {
  id: string;
  inboundOrderId: string;
  productId: string;
  expectedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  lotNo?: string;
  mfgDate?: string;
  expDate?: string;
  
  // Populated
  product?: Product;
}

// Đơn xuất kho
export interface OutboundOrder {
  id: string;
  orderNo: string; // "OB-20251102-001"
  warehouseId: string;
  customer: string;
  customerAddress: string;
  carrier?: string;
  trailerNo?: string;
  etd: string; // Expected Time of Departure
  actualDeparture?: string;
  status: OutboundStatus;
  priority: Priority;
  pickStrategy: PickStrategy;
  lines: OutboundLine[];
  totalQty: number;
  pickedQty: number;
  shippedQty: number;
  createdAt: string;
  createdBy: string;
  notes?: string;
}

export type OutboundStatus = "PENDING" | "RELEASED" | "PICKING" | "PICKED" | "PACKING" | "LOADED" | "SHIPPED" | "CANCELLED";
export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type PickStrategy = "FEFO" | "FIFO" | "LIFO" | "LOT_SPECIFIC";

export interface OutboundLine {
  id: string;
  outboundOrderId: string;
  productId: string;
  requestedQty: number;
  allocatedQty: number;
  pickedQty: number;
  shippedQty: number;
  allocations: Allocation[];
  
  // Populated
  product?: Product;
}

export interface Allocation {
  lotId: string;
  locationId: string;
  qty: number;
  
  // Populated
  lot?: Lot;
  location?: Location;
}

// Lịch Dock
export interface DockAppointment {
  id: string;
  warehouseId: string;
  door: string; // "DOOR-1"
  carrier: string;
  trailerNo: string;
  driver?: string;
  driverPhone?: string;
  type: AppointmentType;
  orderId?: string; // Link to InboundOrder or OutboundOrder
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: AppointmentStatus;
  notes?: string;
}

export type AppointmentType = "INBOUND" | "OUTBOUND";
export type AppointmentStatus = "SCHEDULED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

// Tài sản trong Yard
export interface YardAsset {
  id: string;
  warehouseId: string;
  type: AssetType;
  identifier: string; // Trailer/Truck number
  carrier: string;
  location: {
    lat: number;
    lng: number;
  };
  status: YardAssetStatus;
  appointmentId?: string;
  checkedInAt?: string;
  notes?: string;
}

export type AssetType = "TRAILER" | "TRUCK" | "CONTAINER";
export type YardAssetStatus = "PARKED" | "AT_DOCK" | "LOADING" | "UNLOADING" | "DEPARTED";

// Cảm biến nhiệt độ
export interface Sensor {
  id: string;
  zoneId: string;
  name: string;
  nameVi: string;
  type: SensorType;
  location: string; // "Góc A, tầng 2"
  currentValue: number;
  unit: string; // "°C", "%"
  status: SensorStatus;
  lastUpdated: string;
  batteryLevel?: number; // %
  
  // Populated
  zone?: Zone;
}

export type SensorType = "TEMPERATURE" | "HUMIDITY" | "DOOR";
export type SensorStatus = "ONLINE" | "OFFLINE" | "WARNING" | "ERROR";

// Cảnh báo
export interface Alert {
  id: string;
  type: AlertType;
  severity: Severity;
  title: string;
  titleVi: string;
  message: string;
  messageVi: string;
  warehouseId: string;
  zoneId?: string;
  sensorId?: string;
  orderId?: string;
  lotId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  status: AlertStatus;
  
  // Populated
  zone?: Zone;
  sensor?: Sensor;
}

export type AlertType = "TEMP_HIGH" | "TEMP_LOW" | "HUMIDITY" | "DOOR_OPEN" | "EXPIRY_WARNING" | "EXPIRY_CRITICAL" | "INVENTORY_LOW" | "DOCK_DELAY" | "SYSTEM";
export type Severity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | "DISMISSED";

// Người dùng
export interface User {
  id: string;
  email: string;
  name: string;
  nameVi: string;
  role: UserRole;
  warehouseIds: string[]; // Warehouses user has access to
  avatar?: string;
  phone?: string;
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
}

export type UserRole = "ADMIN" | "SUPERVISOR" | "OPERATOR" | "VIEWER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

// Nhật ký hoạt động
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string; // "CREATE_INBOUND", "PICK_ORDER", etc.
  resource: string; // "InboundOrder", "OutboundOrder"
  resourceId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  warehouseId: string;
  timestamp: string;
  ipAddress?: string;
}

// ==================== DASHBOARD TYPES ====================

export interface KPIData {
  inboundToday: number;
  outboundToday: number;
  onHandChill: number; // kg
  onHandFrozen: number; // kg
  openAlerts: number;
  dockOnTimePercent: number;
}

export interface TempHistoryPoint {
  timestamp: string;
  zoneName: string;
  value: number;
  target: number;
}

export interface InventoryDistribution {
  zoneId: string;
  zoneName: string;
  qty: number;
  capacity: number;
  utilizationPercent: number;
}

// ==================== API TYPES ====================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, unknown>;
}

// ==================== FORM TYPES ====================

export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface InboundOrderForm {
  supplier: string;
  carrier?: string;
  trailerNo?: string;
  eta: string;
  lines: {
    productId: string;
    expectedQty: number;
  }[];
  notes?: string;
}

export interface OutboundOrderForm {
  customer: string;
  customerAddress: string;
  carrier?: string;
  trailerNo?: string;
  etd: string;
  priority: Priority;
  pickStrategy: PickStrategy;
  lines: {
    productId: string;
    requestedQty: number;
  }[];
  notes?: string;
}

export interface DockAppointmentForm {
  door: string;
  carrier: string;
  trailerNo: string;
  driver?: string;
  driverPhone?: string;
  type: AppointmentType;
  orderId?: string;
  scheduledStart: string;
  scheduledEnd: string;
  notes?: string;
}

// ==================== ALGORITHM TYPES ====================

export interface SlottingScore {
  locationId: string;
  score: number;
  tempMatch: number;
  spaceFit: number;
  velocityScore: number;
  distance: number;
}

export interface FEFOAllocationResult {
  allocations: Allocation[];
  totalAllocated: number;
  remainingQty: number;
  success: boolean;
}

// ==================== UTILITY TYPES ====================

export interface SelectOption {
  value: string;
  label: string;
  labelVi?: string;
  disabled?: boolean;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  headerVi?: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}
