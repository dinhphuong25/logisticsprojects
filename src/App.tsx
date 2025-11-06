import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useThemeStore } from './stores/themeStore'
import { useAuthStore } from './stores/authStore'
import AppLayout from './components/layout/AppLayout'
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
import ProductManagementPage from './features/products/ProductsPageSimple'
import CreateProductPage from './features/products/CreateProductPage'
import ProductDetailPage from './features/products/ProductDetailPage'
import EditProductPage from './features/products/EditProductPage'
import EnergyManagementPage from './features/energy/EnergyManagementPageSimple'
import GeneratorPage from './features/energy/GeneratorPage'
import RemoteControlPage from './features/remote-control/RemoteControlPage'

function App() {
  const { isDark } = useThemeStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Apply theme on mount
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/inbound" element={<InboundOrdersPage />} />
                  <Route path="/inbound/create" element={<CreateInboundOrderPage />} />
                  <Route path="/inbound/:orderId" element={<InboundOrderDetailPage />} />
                  <Route path="/outbound" element={<OutboundOrdersPage />} />
                  <Route path="/outbound/create" element={<CreateOutboundOrderPage />} />
                  <Route path="/outbound/:orderId" element={<OutboundOrderDetailPage />} />
                  <Route path="/temperature" element={<TemperaturePage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/zones" element={<ZoneManagementPage />} />
                  <Route path="/locations" element={<LocationManagementPage />} />
                  <Route path="/products" element={<ProductManagementPage />} />
                  <Route path="/products/create" element={<CreateProductPage />} />
                  <Route path="/products/:productId" element={<ProductDetailPage />} />
                  <Route path="/products/:productId/edit" element={<EditProductPage />} />
                  <Route path="/energy" element={<EnergyManagementPage />} />
                  <Route path="/generator" element={<GeneratorPage />} />
                  <Route path="/remote-control" element={<RemoteControlPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}

export default App
