import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Navigation
      "nav.dashboard": "Dashboard",
      "nav.inbound": "Inbound",
      "nav.outbound": "Outbound",
      "nav.storage": "Storage",
      "nav.inventory": "Inventory",
      "nav.temperature": "Temperature",
      "nav.alerts": "Alerts",
      "nav.dock": "Dock Schedule",
      "nav.yard": "Yard",
      "nav.users": "Users",
      "nav.settings": "Settings",
      "nav.audit": "Audit Log",

      // KPIs
      "kpi.inboundToday": "Inbound Today",
      "kpi.outboundToday": "Outbound Today",
      "kpi.onHandChill": "On Hand (Chill)",
      "kpi.onHandFrozen": "On Hand (Frozen)",
      "kpi.openAlerts": "Open Alerts",
      "kpi.dockOnTime": "Dock On-Time %",

      // Common
      "common.search": "Search",
      "common.filter": "Filter",
      "common.export": "Export",
      "common.import": "Import",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.view": "View",
      "common.create": "Create",
      "common.refresh": "Refresh",
      "common.loading": "Loading...",
      "common.noData": "No data available",
      "common.success": "Success",
      "common.error": "Error",
      "common.confirm": "Confirm",
      "common.close": "Close",

      // Auth
      "auth.login": "Login",
      "auth.logout": "Logout",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.remember": "Remember me",
      "auth.welcome": "Welcome back",

      // Status
      "status.pending": "Pending",
      "status.completed": "Completed",
      "status.cancelled": "Cancelled",
      "status.receiving": "Receiving",
      "status.picking": "Picking",
      "status.shipped": "Shipped",

      // Temperature
      "temp.current": "Current",
      "temp.target": "Target",
      "temp.min": "Min",
      "temp.max": "Max",
      "temp.normal": "Normal",
      "temp.warning": "Warning",
      "temp.critical": "Critical",
    },
  },
  vi: {
    translation: {
      // Navigation
      "nav.dashboard": "Bảng điều khiển",
      "nav.inbound": "Nhập kho",
      "nav.outbound": "Xuất kho",
      "nav.storage": "Lưu trữ",
      "nav.inventory": "Tồn kho",
      "nav.temperature": "Nhiệt độ",
      "nav.alerts": "Cảnh báo",
      "nav.dock": "Lịch Dock",
      "nav.yard": "Sân xe",
      "nav.users": "Người dùng",
      "nav.settings": "Cài đặt",
      "nav.audit": "Nhật ký",

      // KPIs
      "kpi.inboundToday": "Nhập hôm nay",
      "kpi.outboundToday": "Xuất hôm nay",
      "kpi.onHandChill": "Tồn kho mát",
      "kpi.onHandFrozen": "Tồn kho đông",
      "kpi.openAlerts": "Cảnh báo",
      "kpi.dockOnTime": "Dock đúng giờ",

      // Common
      "common.search": "Tìm kiếm",
      "common.filter": "Lọc",
      "common.export": "Xuất dữ liệu",
      "common.import": "Nhập dữ liệu",
      "common.save": "Lưu",
      "common.cancel": "Hủy",
      "common.delete": "Xóa",
      "common.edit": "Sửa",
      "common.view": "Xem",
      "common.create": "Tạo mới",
      "common.refresh": "Làm mới",
      "common.loading": "Đang tải...",
      "common.noData": "Không có dữ liệu",
      "common.success": "Thành công",
      "common.error": "Lỗi",
      "common.confirm": "Xác nhận",
      "common.close": "Đóng",

      // Auth
      "auth.login": "Đăng nhập",
      "auth.logout": "Đăng xuất",
      "auth.email": "Email",
      "auth.password": "Mật khẩu",
      "auth.remember": "Ghi nhớ đăng nhập",
      "auth.welcome": "Chào mừng trở lại",

      // Status
      "status.pending": "Chờ xử lý",
      "status.completed": "Hoàn thành",
      "status.cancelled": "Đã hủy",
      "status.receiving": "Đang nhận",
      "status.picking": "Đang lấy",
      "status.shipped": "Đã xuất",

      // Temperature
      "temp.current": "Hiện tại",
      "temp.target": "Mục tiêu",
      "temp.min": "Tối thiểu",
      "temp.max": "Tối đa",
      "temp.normal": "Bình thường",
      "temp.warning": "Cảnh báo",
      "temp.critical": "Nghiêm trọng",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "vi", // Default to Vietnamese
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
