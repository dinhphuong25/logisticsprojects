import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - thư viện bên thứ 3
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['lucide-react'],
          'chart-vendor': ['recharts'],
          'form-vendor': ['react-hook-form', 'zod'],
          
          // Feature chunks - chia theo tính năng
          'dashboard': [
            './src/features/dashboard/DashboardPage.tsx',
            './src/features/dashboard/DashboardPageSimple.tsx',
            './src/features/dashboard/DashboardPageMinimal.tsx',
          ],
          'inventory': [
            './src/features/inventory/InventoryPage.tsx',
            './src/features/products/ProductManagementPage.tsx',
          ],
          'orders': [
            './src/features/inbound/InboundOrdersPage.tsx',
            './src/features/outbound/OutboundOrdersPage.tsx',
          ],
          'monitoring': [
            './src/features/temperature/TemperaturePage.tsx',
            './src/features/alerts/AlertsPage.tsx',
          ],
          'warehouse': [
            './src/features/warehouse/WarehouseVisualizationPage.tsx',
            './src/features/zones/ZoneManagementPage.tsx',
            './src/features/locations/LocationManagementPage.tsx',
          ],
          'energy': [
            './src/features/energy/EnergyManagementPage.tsx',
            './src/features/remote-control/RemoteControlPage.tsx',
          ],
          'settings': [
            './src/features/settings/SettingsPage.tsx',
            './src/features/reports/ReportsPage.tsx',
          ],
        },
      },
    },
    // Tăng giới hạn cảnh báo chunk size
    chunkSizeWarningLimit: 1000,
    // Tối ưu hóa minification
    minify: 'esbuild',
  },
})
