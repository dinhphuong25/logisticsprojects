import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'EcoFresh Cold Chain WMS',
        short_name: 'EcoFresh',
        description: 'Advanced Cold Chain Warehouse Management System with AI & Real-time Monitoring',
        theme_color: '#0EA5E9',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\..*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
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
