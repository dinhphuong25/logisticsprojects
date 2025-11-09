import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'sonner'
import { useThemeStore } from './stores/themeStore'
import { useAuthStore } from './stores/authStore'
import AppLayout from './components/layout/AppLayout'
import { AnimatedPage } from './components/layout/AnimatedPage'
import LoginPage from './features/auth/LoginPage'
import DashboardPage from './features/dashboard/DashboardPageSimple'
import InventoryPage from './features/inventory/InventoryPageSimple'
import InboundOrdersPage from './features/inbound/InboundOrdersPageSimple'
import InboundOrderDetailPage from './features/inbound/InboundOrderDetailPage'
import CreateInboundOrderPage from './features/inbound/CreateInboundOrderPage'
import OutboundOrdersPage from './features/outbound/OutboundOrdersPageSimple'
import OutboundOrderDetailPage from './features/outbound/OutboundOrderDetailPage'
import CreateOutboundOrderPage from './features/outbound/CreateOutboundOrderPage'
import TemperaturePage from './features/temperature/TemperaturePage'
import AlertsPage from './features/alerts/AlertsPageSimple'
import ReportsPage from './features/reports/ReportsPageSimple'
import SettingsPage from './features/settings/SettingsPage'
import ZoneManagementPage from './features/zones/ZoneManagementPageSimple'
import LocationManagementPage from './features/locations/LocationManagementPage'
import { ProductListPage } from './features/products/ProductListPage'
import { ProductReportPage } from './features/products/ProductReportPage'
import { SimpleProductList } from './features/products/SimpleProductList'
import { CreateProductPage } from './features/products/CreateProductPage'
import ProductDetailPage from './features/products/ProductDetailPage'
import EditProductPage from './features/products/EditProductPage'
import EnergyManagementPage from './features/energy/EnergyManagementPageSimple'
import GeneratorPage from './features/energy/GeneratorPage'
import RemoteControlPage from './features/remote-control/RemoteControlPage'
import { BlockchainTracking } from './features/blockchain/BlockchainTracking'
import { BlockchainProductRegistration } from './features/blockchain/BlockchainProductRegistration'
import { MekongDeltaAgricultureDashboard } from './features/agriculture/MekongDeltaAgricultureDashboard'
import { MekongDeltaWeatherMonitoring } from './features/agriculture/MekongDeltaWeatherMonitoring'
import { MekongDeltaTransportationHub } from './features/agriculture/MekongDeltaTransportationHub'
import SmartAnalyticsDashboard from './features/dashboard/SmartAnalyticsDashboard'

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
                  <DashboardPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/analytics"
              element={
                <AnimatedPage>
                  <SmartAnalyticsDashboard />
                </AnimatedPage>
              }
            />
            <Route
              path="/inventory"
              element={
                <AnimatedPage>
                  <InventoryPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/inbound"
              element={
                <AnimatedPage>
                  <InboundOrdersPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/inbound/create"
              element={
                <AnimatedPage>
                  <CreateInboundOrderPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/inbound/:orderId"
              element={
                <AnimatedPage>
                  <InboundOrderDetailPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/outbound"
              element={
                <AnimatedPage>
                  <OutboundOrdersPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/outbound/create"
              element={
                <AnimatedPage>
                  <CreateOutboundOrderPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/outbound/:orderId"
              element={
                <AnimatedPage>
                  <OutboundOrderDetailPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/temperature"
              element={
                <AnimatedPage>
                  <TemperaturePage />
                </AnimatedPage>
              }
            />
            <Route
              path="/alerts"
              element={
                <AnimatedPage>
                  <AlertsPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/reports"
              element={
                <AnimatedPage>
                  <ReportsPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/zones"
              element={
                <AnimatedPage>
                  <ZoneManagementPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/locations"
              element={
                <AnimatedPage>
                  <LocationManagementPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/products"
              element={
                <AnimatedPage>
                  <ProductListPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/products/report"
              element={
                <AnimatedPage>
                  <ProductReportPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/products/simple"
              element={
                <AnimatedPage>
                  <SimpleProductList />
                </AnimatedPage>
              }
            />
            <Route
              path="/products/create"
              element={
                <AnimatedPage>
                  <CreateProductPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/products/:productId"
              element={
                <AnimatedPage>
                  <ProductDetailPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/products/:productId/edit"
              element={
                <AnimatedPage>
                  <EditProductPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/energy"
              element={
                <AnimatedPage>
                  <EnergyManagementPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/generator"
              element={
                <AnimatedPage>
                  <GeneratorPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/remote-control"
              element={
                <AnimatedPage>
                  <RemoteControlPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/settings"
              element={
                <AnimatedPage>
                  <SettingsPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/blockchain"
              element={
                <AnimatedPage>
                  <BlockchainTracking />
                </AnimatedPage>
              }
            />
            <Route
              path="/blockchain/register"
              element={
                <AnimatedPage>
                  <BlockchainProductRegistration />
                </AnimatedPage>
              }
            />
            <Route
              path="/agriculture"
              element={
                <AnimatedPage>
                  <MekongDeltaAgricultureDashboard />
                </AnimatedPage>
              }
            />
            <Route
              path="/weather"
              element={
                <AnimatedPage>
                  <MekongDeltaWeatherMonitoring />
                </AnimatedPage>
              }
            />
            <Route
              path="/transportation"
              element={
                <AnimatedPage>
                  <MekongDeltaTransportationHub />
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
