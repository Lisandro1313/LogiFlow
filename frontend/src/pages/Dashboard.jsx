import { useQuery } from '@tanstack/react-query'
import { dashboardService, trackingService } from '../services/api.service'
import {
  Package,
  TruckIcon,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const statusLabels = {
  PENDING: 'Pendiente',
  ASSIGNED: 'Asignado',
  IN_TRANSIT: 'En tránsito',
  DELIVERED: 'Entregado',
  FAILED: 'Fallido',
  CANCELLED: 'Cancelado',
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  })

  const { data: trends } = useQuery({
    queryKey: ['dashboard-trends'],
    queryFn: () => dashboardService.getTrends(7),
  })

  const { data: activeLocations } = useQuery({
    queryKey: ['active-locations'],
    queryFn: trackingService.getAllActiveLocations,
    refetchInterval: 10000, // Actualizar cada 10 segundos
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const overview = stats?.overview || {}
  const ordersByStatus = stats?.ordersByStatus || []
  const recentOrders = stats?.recentOrders || []

  // Preparar datos para gráficos
  const statusChartData = ordersByStatus.map(item => ({
    name: statusLabels[item.status] || item.status,
    value: item.count,
  }))

  const trendsChartData = trends?.trends?.map(t => ({
    date: new Date(t.date).toLocaleDateString('es', { day: '2-digit', month: 'short' }),
    Total: t.total,
    Entregados: t.delivered,
    Fallidos: t.failed,
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Vista general de operaciones en tiempo real
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pedidos Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {overview.todayOrders || 0}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% vs ayer
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Entregas Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {overview.deliveredToday || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Tasa éxito: {overview.successRate || 100}%
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Repartidores Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {overview.activeAgents || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                En ruta: {overview.inTransitOrders || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TruckIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tiempo Promedio</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {overview.avgDeliveryTime || 0}m
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Por entrega
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de pedidos */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tendencia de Pedidos (7 días)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Entregados" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="Fallidos" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por estado */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pedidos por Estado
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Pedidos Recientes
          </h3>
          <a href="/orders" className="text-sm text-primary-600 hover:text-primary-700">
            Ver todos →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pedido
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dirección
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.customer.firstName} {order.customer.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {order.deliveryAddress}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge badge-${order.status.toLowerCase()}`}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
