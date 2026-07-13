import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, AuthProvider, useAuth } from './context/AppContext'

import Landing from './pages/Landing'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Upgrade from './pages/Upgrade'
import Store from './pages/Store'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'
import AdminSellers from './pages/AdminSellers'
import Marketplace from './pages/Marketplace'
import SponsoredAd from './pages/SponsoredAd'
import Dispute from './pages/Dispute'
import StoreSettings from './pages/StoreSettings'

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function HomeRoute() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  if (user?.role === 'seller') return <Navigate to="/dashboard" replace />
  return <Landing />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/store/:storeSlug" element={<Store />} />
      <Route path="/checkout/:storeSlug/:productId" element={<Checkout />} />
      <Route path="/dispute" element={<Dispute />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/dashboard/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/dashboard/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
      <Route path="/dashboard/sponsored" element={<ProtectedRoute><SponsoredAd /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute><StoreSettings /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
      <Route path="/admin/sellers" element={<ProtectedRoute adminOnly><AdminSellers /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
