import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime
      jsxRuntime: 'automatic',
    }),
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
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:woff2?|eot|ttf|otf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
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
    // Target modern browsers
    target: 'es2022',
    // Optimize CSS code splitting
    cssCodeSplit: true,
    // Source maps for production debugging
    sourcemap: false,
    rollupOptions: {
      output: {
        // Optimize chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        manualChunks: (id) => {
          // React core libraries
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/scheduler/')) {
            return 'react-core'
          }
          
          // React Router
          if (id.includes('node_modules/react-router') || 
              id.includes('node_modules/@remix-run/router')) {
            return 'react-router'
          }
          
          // React Query
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'react-query'
          }
          
          // UI Libraries
          if (id.includes('node_modules/lucide-react') || 
              id.includes('node_modules/framer-motion')) {
            return 'ui-libs'
          }
          
          // Chart Libraries
          if (id.includes('node_modules/recharts') || 
              id.includes('node_modules/@nivo') || 
              id.includes('node_modules/d3-')) {
            return 'chart-libs'
          }
          
          // Form Libraries
          if (id.includes('node_modules/react-hook-form') || 
              id.includes('node_modules/zod')) {
            return 'form-libs'
          }
          
          // Web3 and Blockchain
          if (id.includes('node_modules/web3') || 
              id.includes('node_modules/ethers') || 
              id.includes('node_modules/@web3-react')) {
            return 'web3-libs'
          }
          
          // Utility Libraries
          if (id.includes('node_modules/date-fns') || 
              id.includes('node_modules/axios') || 
              id.includes('node_modules/clsx') || 
              id.includes('node_modules/class-variance-authority')) {
            return 'utils'
          }
          
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Optimize minification with terser for better compression
    minify: 'esbuild',
    // Enable CSS minification
    cssMinify: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'zustand',
      'framer-motion',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  // Development server configuration
  server: {
    port: 5175,
    strictPort: false,
    host: true,
    open: true,
  },
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: true,
  },
})