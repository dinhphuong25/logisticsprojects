import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'sonner'
import { useThemeStore } from './stores/themeStore'
import { useAuthStore } from './stores/authStore'
import AppLayout from './components/layout/AppLayout'
import { AnimatedPage } from './components/layout/AnimatedPage'
import { LoadingSpinner } from './components/ui/loading-spinner'

// Eager load critical routes
import LoginPage from './features/auth/LoginPage'
import DashboardPage from './features/dashboard/DashboardPageSimple'

// Lazy load secondary routes for better performance
const InventoryPage = lazy(() => import('./features/inventory/InventoryPageSimple'))
const InboundOrdersPage = lazy(() => import('./features/inbound/InboundOrdersPageSimple'))
const InboundOrderDetailPage = lazy(() => import('./features/inbound/InboundOrderDetailPage'))
const CreateInboundOrderPage = lazy(() => import('./features/inbound/CreateInboundOrderPage'))
const OutboundOrdersPage = lazy(() => import('./features/outbound/OutboundOrdersPageSimple'))
const OutboundOrderDetailPage = lazy(() => import('./features/outbound/OutboundOrderDetailPage'))
const CreateOutboundOrderPage = lazy(() => import('./features/outbound/CreateOutboundOrderPage'))
const TemperaturePage = lazy(() => import('./features/temperature/TemperaturePage'))
const AlertsPage = lazy(() => import('./features/alerts/AlertsPageSimple'))
const ReportsPage = lazy(() => import('./features/reports/ReportsPageSimple'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))
const ZoneManagementPage = lazy(() => import('./features/zones/ZoneManagementPageSimple'))
const LocationManagementPage = lazy(() => import('./features/locations/LocationManagementPage'))
const ProductListPage = lazy(() => import('./features/products/ProductListPage').then(m => ({ default: m.ProductListPage })))
const ProductReportPage = lazy(() => import('./features/products/ProductReportPage').then(m => ({ default: m.ProductReportPage })))
const SimpleProductList = lazy(() => import('./features/products/SimpleProductList').then(m => ({ default: m.SimpleProductList })))
const CreateProductPage = lazy(() => import('./features/products/CreateProductPage').then(m => ({ default: m.CreateProductPage })))
const ProductDetailPage = lazy(() => import('./features/products/ProductDetailPage'))
const EditProductPage = lazy(() => import('./features/products/EditProductPage'))
const EnergyManagementPage = lazy(() => import('./features/energy/EnergyManagementPageSimple'))
const GeneratorPage = lazy(() => import('./features/energy/GeneratorPage'))
const RemoteControlPage = lazy(() => import('./features/remote-control/RemoteControlPage'))
const BlockchainTracking = lazy(() => import('./features/blockchain/BlockchainTracking').then(m => ({ default: m.BlockchainTracking })))
const BlockchainProductRegistration = lazy(() => import('./features/blockchain/BlockchainProductRegistration').then(m => ({ default: m.BlockchainProductRegistration })))
const MekongDeltaAgricultureDashboard = lazy(() => import('./features/agriculture/MekongDeltaAgricultureDashboard').then(m => ({ default: m.MekongDeltaAgricultureDashboard })))
const MekongDeltaWeatherMonitoring = lazy(() => import('./features/agriculture/MekongDeltaWeatherMonitoring').then(m => ({ default: m.MekongDeltaWeatherMonitoring })))
const MekongDeltaTransportationHub = lazy(() => import('./features/agriculture/MekongDeltaTransportationHub').then(m => ({ default: m.MekongDeltaTransportationHub })))
const SmartAnalyticsDashboard = lazy(() => import('./features/dashboard/SmartAnalyticsDashboard'))
const EnhancedDashboard = lazy(() => import('./features/dashboard/EnhancedDashboard'))

function App() {
  return (
    <BrowserRouter>
      <AppContainer />
    </BrowserRouter>
  )
}

function AppContainer() {
  const location = useLocation()
  const { isDark } = useThemeStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <>
      <AnimatePresence mode="sync" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/login"
            element={
              <AnimatedPage>
                <LoginPage />
              </AnimatedPage>
            }
          />

          <Route
            element={
              isAuthenticated ? (
                <AppLayout />
              ) : (
                <Navigate to="/login" replace state={{ from: location }} />
              )
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <EnhancedDashboard />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/dashboard/simple"
              element={
                <AnimatedPage>
                  <DashboardPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/analytics"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SmartAnalyticsDashboard />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/inventory"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <InventoryPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/inbound"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <InboundOrdersPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/inbound/create"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <CreateInboundOrderPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/inbound/:orderId"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <InboundOrderDetailPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/outbound"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <OutboundOrdersPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/outbound/create"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <CreateOutboundOrderPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/outbound/:orderId"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <OutboundOrderDetailPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/temperature"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <TemperaturePage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/alerts"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AlertsPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/reports"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ReportsPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/zones"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ZoneManagementPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/locations"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <LocationManagementPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/products"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProductListPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/products/report"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProductReportPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/products/simple"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SimpleProductList />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/products/create"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <CreateProductPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/products/:productId"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProductDetailPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/products/:productId/edit"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <EditProductPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/energy"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <EnergyManagementPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/generator"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <GeneratorPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/remote-control"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <RemoteControlPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/settings"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SettingsPage />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/blockchain"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <BlockchainTracking />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/blockchain/register"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <BlockchainProductRegistration />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/agriculture"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <MekongDeltaAgricultureDashboard />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/weather"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <MekongDeltaWeatherMonitoring />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route
              path="/transportation"
              element={
                <AnimatedPage>
                  <Suspense fallback={<LoadingSpinner />}>
                    <MekongDeltaTransportationHub />
                  </Suspense>
                </AnimatedPage>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
