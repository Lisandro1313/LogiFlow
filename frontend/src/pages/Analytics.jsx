import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardService, orderService } from '../services/api.service'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Truck,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Analytics() {
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  })

  // Fetch dashboard metrics
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: dashboardService.getMetrics,
  })

  // Fetch trends
  const { data: trends } = useQuery({
    queryKey: ['dashboard-trends', dateRange],
    queryFn: () => dashboardService.getTrends(dateRange.startDate, dateRange.endDate),
  })

  // Fetch orders for stats
  const { data: ordersData } = useQuery({
    queryKey: ['orders-analytics', dateRange],
    queryFn: () => orderService.getOrders({ 
      limit: 1000,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate 
    }),
  })

  // Calculate advanced stats
  const calculateStats = () => {
    if (!ordersData?.orders) return null

    const orders = ordersData.orders
    
    // By zone
    const byZone = orders.reduce((acc, order) => {
      const zone = order.zone?.name || 'Sin zona'
      if (!acc[zone]) acc[zone] = { count: 0, total: 0 }
      acc[zone].count++
      acc[zone].total += order.total || 0
      return acc
    }, {})

    // By day of week
    const byDayOfWeek = orders.reduce((acc, order) => {
      const day = format(new Date(order.createdAt), 'EEEE', { locale: es })
      if (!acc[day]) acc[day] = 0
      acc[day]++
      return acc
    }, {})

    // By hour
    const byHour = orders.reduce((acc, order) => {
      const hour = new Date(order.createdAt).getHours()
      if (!acc[hour]) acc[hour] = 0
      acc[hour]++
      return acc
    }, {})

    // Revenue trend
    const revenueTrend = orders.reduce((acc, order) => {
      const date = format(new Date(order.createdAt), 'yyyy-MM-dd')
      if (!acc[date]) acc[date] = 0
      acc[date] += order.total || 0
      return acc
    }, {})

    return {
      byZone: Object.entries(byZone).map(([name, data]) => ({ name, ...data })),
      byDayOfWeek: Object.entries(byDayOfWeek).map(([name, value]) => ({ name, value })),
      byHour: Object.entries(byHour).map(([hour, value]) => ({ hour: `${hour}:00`, value })),
      revenueTrend: Object.entries(revenueTrend).map(([date, value]) => ({ date, value })),
      totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length : 0,
    }
  }

  const stats = calculateStats()

  // Status distribution for pie chart
  const statusData = ordersData?.orders ? 
    Object.entries(
      ordersData.orders.reduce((acc, order) => {
        const status = order.status || 'pending'
        if (!acc[status]) acc[status] = 0
        acc[status]++
        return acc
      }, {})
    ).map(([name, value]) => ({
      name: name === 'pending' ? 'Pendiente' :
            name === 'in_transit' ? 'En Tránsito' :
            name === 'delivered' ? 'Entregado' :
            name === 'failed' ? 'Fallido' : 'Cancelado',
      value
    })) : []

  const handleExport = () => {
    // Simple CSV export
    if (!ordersData?.orders) return
    
    const csv = [
      ['ID', 'Cliente', 'Estado', 'Total', 'Fecha'],
      ...ordersData.orders.map(o => [
        o.id,
        o.customer?.name || 'N/A',
        o.status,
        o.total || 0,
        format(new Date(o.createdAt), 'yyyy-MM-dd HH:mm')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Avanzado</h1>
          <p className="text-gray-600 mt-1">
            Análisis detallado de operaciones y tendencias
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="btn-secondary"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              className="input w-full"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              className="input w-full"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
          <button
            onClick={() => setDateRange({
              startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
              endDate: format(new Date(), 'yyyy-MM-dd'),
            })}
            className="btn-secondary whitespace-nowrap"
          >
            Últimos 30 días
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Ingresos Totales</p>
            <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              En el periodo seleccionado
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Total Pedidos</p>
            <p className="text-3xl font-bold text-gray-900">{ordersData?.orders?.length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">
              Pedidos procesados
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Valor Promedio</p>
            <p className="text-3xl font-bold text-gray-900">${stats.avgOrderValue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Por pedido
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Zonas Activas</p>
            <p className="text-3xl font-bold text-gray-900">{stats.byZone.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              Con pedidos
            </p>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        {stats?.revenueTrend && stats.revenueTrend.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Tendencia de Ingresos</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `$${value.toFixed(2)}`}
                  labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  name="Ingresos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Orders by Zone */}
        {stats?.byZone && stats.byZone.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Pedidos por Zona</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byZone}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status Distribution */}
        {statusData.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Distribución por Estado</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Orders by Day of Week */}
        {stats?.byDayOfWeek && stats.byDayOfWeek.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Pedidos por Día de la Semana</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byDayOfWeek}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue by Zone */}
        {stats?.byZone && stats.byZone.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Ingresos por Zona</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byZone}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="total" fill="#f59e0b" name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Orders by Hour */}
        {stats?.byHour && stats.byHour.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Pedidos por Hora del Día</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.byHour.sort((a, b) => 
                parseInt(a.hour) - parseInt(b.hour)
              )}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Pedidos"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Zones Table */}
      {stats?.byZone && stats.byZone.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Top Zonas por Rendimiento</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Ranking</th>
                  <th>Zona</th>
                  <th>Pedidos</th>
                  <th>Ingresos</th>
                  <th>Promedio por Pedido</th>
                </tr>
              </thead>
              <tbody>
                {stats.byZone
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 10)
                  .map((zone, index) => (
                    <tr key={zone.name}>
                      <td>
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-200 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="font-medium">{zone.name}</td>
                      <td>{zone.count}</td>
                      <td className="font-semibold text-green-600">
                        ${zone.total.toFixed(2)}
                      </td>
                      <td>
                        ${(zone.total / zone.count).toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
