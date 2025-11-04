import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr = "dd/MM/yyyy"): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return "-";
  }
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd/MM/yyyy HH:mm");
}

export function getDaysUntilExpiry(expDate: string): number {
  try {
    const expiry = parseISO(expDate);
    return differenceInDays(expiry, new Date());
  } catch {
    return 0;
  }
}

export function getExpiryStatus(expDate: string): "expired" | "critical" | "warning" | "ok" {
  const days = getDaysUntilExpiry(expDate);
  if (days < 0) return "expired";
  if (days <= 3) return "critical";
  if (days <= 7) return "warning";
  return "ok";
}

export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    RECEIVING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    QC: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    PUTAWAY: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    RELEASED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    PICKING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    PICKED: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    PACKING: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    LOADED: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    SHIPPED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    AVAILABLE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    OCCUPIED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    BLOCKED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    MAINTENANCE: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    ONLINE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    OFFLINE: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    WARNING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    ERROR: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    OPEN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    ACKNOWLEDGED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    DISMISSED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    INFO: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    LOW: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return colors[severity] || "bg-gray-100 text-gray-800";
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    NORMAL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return colors[priority] || "bg-gray-100 text-gray-800";
}

export function downloadCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        const stringValue = value?.toString() || "";
        return stringValue.includes(",") ? `"${stringValue}"` : stringValue;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;
  link.click();
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}`;
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
