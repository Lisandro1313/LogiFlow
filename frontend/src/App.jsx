import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import CreateOrder from './pages/CreateOrder'
import Customers from './pages/Customers'
import Agents from './pages/Agents'
import RoutesPage from './pages/Routes'
import RouteOptimizer from './pages/RouteOptimizer'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function App() {
  const { token } = useAuthStore()

  if (!token) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/orders/create" element={<CreateOrder />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/routes/optimize" element={<RouteOptimizer />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
