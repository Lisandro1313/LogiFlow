import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '../services/api.service'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Download,
  Upload,
  Trash2,
  Eye,
  Edit,
  X,
  MapPin,
  Calendar,
  DollarSign,
  QrCode
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_transit: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  pending: 'Pendiente',
  in_transit: 'En Tránsito',
  delivered: 'Entregado',
  failed: 'Fallido',
  cancelled: 'Cancelado',
}

export default function Orders() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    zoneId: '',
    search: '',
    startDate: '',
    endDate: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', page, filters],
    queryFn: () => orderService.getOrders({ 
      page, 
      limit: 10,
      ...filters 
    }),
  })

  // Fetch zones for filter
  const { data: zones } = useQuery({
    queryKey: ['zones'],
    queryFn: () => orderService.getOrders({ limit: 1000 }).then(res => {
      // Extract unique zones from orders
      const uniqueZones = new Map()
      res.orders?.forEach(order => {
        if (order.zone) {
          uniqueZones.set(order.zone.id, order.zone)
        }
      })
      return Array.from(uniqueZones.values())
    }),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: orderService.deleteOrder,
    onSuccess: () => {
      toast.success('Pedido eliminado correctamente')
      queryClient.invalidateQueries(['orders'])
      setShowDeleteModal(false)
      setSelectedOrder(null)
    },
    onError: () => {
      toast.error('Error al eliminar el pedido')
    },
  })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters({
      status: '',
      zoneId: '',
      search: '',
      startDate: '',
      endDate: '',
    })
    setPage(1)
  }

  const handleDelete = () => {
    if (selectedOrder) {
      deleteMutation.mutate(selectedOrder.id)
    }
  }

  const handleDownloadPDF = async (orderId) => {
    try {
      const blob = await orderService.downloadOrderPDF(orderId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pedido-${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('PDF descargado correctamente')
    } catch (error) {
      toast.error('Error al descargar el PDF')
    }
  }

  const handleImportExcel = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await orderService.importOrders(file)
      toast.success('Pedidos importados correctamente')
      queryClient.invalidateQueries(['orders'])
      event.target.value = '' // Reset input
    } catch (error) {
      toast.error('Error al importar pedidos')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="text-gray-600 mt-1">
            {ordersData?.total || 0} pedidos registrados
          </p>
        </div>
        <div className="flex gap-3">
          <label className="btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" />
            Importar Excel
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleImportExcel}
            />
          </label>
          <button
            onClick={() => navigate('/orders/create')}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nuevo Pedido
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por ID, cliente, dirección..."
              className="input pl-10 w-full"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-primary text-white' : ''}`}
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t">
            <select
              className="input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="in_transit">En Tránsito</option>
              <option value="delivered">Entregado</option>
              <option value="failed">Fallido</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <select
              className="input"
              value={filters.zoneId}
              onChange={(e) => handleFilterChange('zoneId', e.target.value)}
            >
              <option value="">Todas las zonas</option>
              {zones?.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="input"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              placeholder="Fecha inicio"
            />

            <input
              type="date"
              className="input"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              placeholder="Fecha fin"
            />

            <button
              onClick={handleClearFilters}
              className="btn-secondary sm:col-span-2 lg:col-span-4"
            >
              <X className="w-4 h-4" />
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando pedidos...</p>
          </div>
        ) : ordersData?.orders?.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay pedidos
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza creando tu primer pedido
            </p>
            <button
              onClick={() => navigate('/orders/create')}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Crear Pedido
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Dirección</th>
                    <th>Zona</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData.orders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-mono text-sm">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td>
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.customer?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer?.phone || ''}
                          </div>
                        </div>
                      </td>
                      <td className="max-w-xs truncate">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{order.address}</span>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {order.zone?.name || 'Sin zona'}
                        </span>
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="font-semibold">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          {order.total?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {order.createdAt ? format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(order.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Descargar PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowDeleteModal(true)
                            }}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {ordersData?.totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {((page - 1) * 10) + 1} a {Math.min(page * 10, ordersData.total)} de {ordersData.total} pedidos
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, ordersData.totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 rounded ${
                            page === pageNum
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(ordersData.totalPages, p + 1))}
                    disabled={page === ordersData.totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Eliminar Pedido?
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el pedido #{selectedOrder?.id.slice(0, 8)}? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedOrder(null)
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
