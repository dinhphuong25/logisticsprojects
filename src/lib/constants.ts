// ==================== CONSTANTS ====================

export const APP_NAME = "Cold-Chain WMS";
export const APP_VERSION = "1.0.0";
export const API_BASE_URL = "/api";

// Temperature thresholds
export const TEMP_RANGES = {
  CHILL: { min: 2, max: 8, target: 5 },
  FROZEN: { min: -25, max: -18, target: -22 },
} as const;

// Alert severities colors
export const SEVERITY_COLORS = {
  INFO: "blue",
  LOW: "green",
  MEDIUM: "yellow",
  HIGH: "orange",
  CRITICAL: "red",
} as const;

// Status colors
export const STATUS_COLORS = {
  // Inbound
  PENDING: "gray",
  SCHEDULED: "blue",
  RECEIVING: "yellow",
  QC: "purple",
  PUTAWAY: "orange",
  COMPLETED: "green",
  CANCELLED: "red",
  
  // Outbound
  RELEASED: "blue",
  PICKING: "yellow",
  PICKED: "orange",
  PACKING: "purple",
  LOADED: "cyan",
  SHIPPED: "green",
  
  // Dock
  CHECKED_IN: "blue",
  IN_PROGRESS: "yellow",
  NO_SHOW: "red",
  
  // Location
  AVAILABLE: "green",
  OCCUPIED: "yellow",
  BLOCKED: "red",
  MAINTENANCE: "gray",
  
  // Lot
  QUARANTINE: "yellow",
  HOLD: "orange",
  EXPIRED: "red",
  
  // Sensor
  ONLINE: "green",
  OFFLINE: "gray",
  WARNING: "yellow",
  ERROR: "red",
  
  // Alert
  OPEN: "red",
  ACKNOWLEDGED: "yellow",
  RESOLVED: "green",
  DISMISSED: "gray",
} as const;

// Priority colors
export const PRIORITY_COLORS = {
  LOW: "gray",
  NORMAL: "blue",
  HIGH: "orange",
  URGENT: "red",
} as const;

// Default pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Sensor update interval (ms)
export const SENSOR_UPDATE_INTERVAL = 5000; // 5 seconds

// Chart colors
export const CHART_COLORS = [
  "#3B82F6", // blue
  "#06B6D4", // cyan
  "#A855F7", // purple
  "#10B981", // green
  "#F59E0B", // orange
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
];

// Default warehouses
export const DEFAULT_WAREHOUSES = [
  {
    id: "wh-1",
    code: "HCM-01",
    name: "HCM Cold Storage",
    nameVi: "Kho Lạnh TP.HCM",
    location: { lat: 10.8231, lng: 106.6297 },
  },
  {
    id: "wh-2",
    code: "LA-01",
    name: "Long An Distribution Center",
    nameVi: "Trung Tâm Phân Phối Long An",
    location: { lat: 10.5356, lng: 106.4056 },
  },
];

// Door configuration
export const DOCK_DOORS = [
  "DOOR-1",
  "DOOR-2",
  "DOOR-3",
  "DOOR-4",
  "DOOR-5",
  "DOOR-6",
];

// Units
export const UNITS = ["KG", "CTN", "PAL", "EA"];

// Countries
export const COUNTRIES = [
  { code: "VN", name: "Vietnam", nameVi: "Việt Nam" },
  { code: "US", name: "United States", nameVi: "Hoa Kỳ" },
  { code: "JP", name: "Japan", nameVi: "Nhật Bản" },
  { code: "AU", name: "Australia", nameVi: "Úc" },
  { code: "NO", name: "Norway", nameVi: "Na Uy" },
  { code: "TH", name: "Thailand", nameVi: "Thái Lan" },
];

// Product categories
export const PRODUCT_CATEGORIES = [
  { value: "SEAFOOD", label: "Seafood", labelVi: "Hải sản" },
  { value: "MEAT", label: "Meat", labelVi: "Thịt" },
  { value: "POULTRY", label: "Poultry", labelVi: "Gia cầm" },
  { value: "DAIRY", label: "Dairy", labelVi: "Sữa" },
  { value: "FROZEN_FOOD", label: "Frozen Food", labelVi: "Thực phẩm đông lạnh" },
  { value: "VEGETABLES", label: "Vegetables", labelVi: "Rau củ" },
  { value: "FRUITS", label: "Fruits", labelVi: "Trái cây" },
  { value: "BEVERAGES", label: "Beverages", labelVi: "Đồ uống" },
];

// Permissions
export const PERMISSIONS = {
  ADMIN: ["*"],
  SUPERVISOR: [
    "dashboard.view",
    "inbound.view",
    "inbound.create",
    "inbound.edit",
    "inbound.receive",
    "outbound.view",
    "outbound.create",
    "outbound.pick",
    "inventory.view",
    "inventory.adjust",
    "temperature.view",
    "alerts.view",
    "alerts.resolve",
    "dock.view",
    "dock.manage",
    "yard.view",
  ],
  OPERATOR: [
    "dashboard.view",
    "inbound.view",
    "inbound.receive",
    "outbound.view",
    "outbound.pick",
    "inventory.view",
    "temperature.view",
    "alerts.view",
    "dock.view",
    "yard.view",
  ],
  VIEWER: [
    "dashboard.view",
    "inventory.view",
    "temperature.view",
    "alerts.view",
  ],
} as const;

// Date formats
export const DATE_FORMAT = "dd/MM/yyyy";
export const DATETIME_FORMAT = "dd/MM/yyyy HH:mm";
export const TIME_FORMAT = "HH:mm";
