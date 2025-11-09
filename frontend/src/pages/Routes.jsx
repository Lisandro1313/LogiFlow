import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { routeService, agentService, orderService } from '../services/api.service'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Route as RouteIcon,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  MapPin,
  Clock,
  Package,
  User,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  XCircle,
  Navigation
} from 'lucide-react'
import toast from 'react-hot-toast'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

const statusIcons = {
  pending: AlertCircle,
  in_progress: TrendingUp,
  completed: CheckCircle,
  cancelled: XCircle,
}

export default function RoutesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showOrdersModal, setShowOrdersModal] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [formData, setFormData] = useState({
    agentId: '',
    name: '',
    estimatedTime: 0,
    totalDistance: 0,
  })

  // Fetch routes
  const { data: routes, isLoading } = useQuery({
    queryKey: ['routes', search],
    queryFn: async () => {
      const data = await routeService.getRoutes()
      if (search) {
        return data.filter(route =>
          route.name?.toLowerCase().includes(search.toLowerCase()) ||
          route.agent?.user?.name?.toLowerCase().includes(search.toLowerCase())
        )
      }
      return data
    },
  })

  // Fetch agents for dropdown
  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: agentService.getAgents,
  })

  // Fetch pending orders
  const { data: pendingOrders } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: () => orderService.getOrders({ status: 'pending', limit: 1000 }),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: routeService.createRoute,
    onSuccess: () => {
      toast.success('Ruta creada correctamente')
      queryClient.invalidateQueries(['routes'])
      handleCloseCreateModal()
    },
    onError: () => {
      toast.error('Error al crear la ruta')
    },
  })

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => routeService.updateRouteStatus(id, status),
    onSuccess: () => {
      toast.success('Estado actualizado correctamente')
      queryClient.invalidateQueries(['routes'])
    },
    onError: () => {
      toast.error('Error al actualizar el estado')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: routeService.deleteRoute,
    onSuccess: () => {
      toast.success('Ruta eliminada correctamente')
      queryClient.invalidateQueries(['routes'])
      setShowDeleteModal(false)
      setSelectedRoute(null)
    },
    onError: () => {
      toast.error('Error al eliminar la ruta')
    },
  })

  const handleOpenCreateModal = (route = null) => {
    if (route) {
      setSelectedRoute(route)
      setFormData({
        agentId: route.agentId || '',
        name: route.name || '',
        estimatedTime: route.estimatedTime || 0,
        totalDistance: route.totalDistance || 0,
      })
    } else {
      setSelectedRoute(null)
      setFormData({
        agentId: '',
        name: '',
        estimatedTime: 0,
        totalDistance: 0,
      })
    }
    setShowCreateModal(true)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
    setSelectedRoute(null)
    setFormData({
      agentId: '',
      name: '',
      estimatedTime: 0,
      totalDistance: 0,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const data = {
      ...formData,
      estimatedTime: parseInt(formData.estimatedTime),
      totalDistance: parseFloat(formData.totalDistance),
    }

    createMutation.mutate(data)
  }

  const handleDelete = () => {
    if (selectedRoute) {
      deleteMutation.mutate(selectedRoute.id)
    }
  }

  const handleUpdateStatus = (routeId, newStatus) => {
    updateStatusMutation.mutate({ id: routeId, status: newStatus })
  }

  const handleViewOrders = (route) => {
    setSelectedRoute(route)
    setShowOrdersModal(true)
  }

  const getStatusIcon = (status) => {
    const Icon = statusIcons[status]
    return <Icon className="w-5 h-5" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Rutas</h1>
          <p className="text-gray-600 mt-1">
            {routes?.length || 0} rutas registradas
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/routes/optimize')}
            className="btn-secondary"
          >
            <Navigation className="w-4 h-4" />
            Optimizar Rutas
          </button>
          <button
            onClick={() => handleOpenCreateModal()}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nueva Ruta
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre de ruta o repartidor..."
            className="input pl-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      {routes && routes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {routes.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-yellow-200" />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Progreso</p>
                <p className="text-3xl font-bold text-blue-600">
                  {routes.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-3xl font-bold text-green-600">
                  {routes.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-200" />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pedidos</p>
                <p className="text-3xl font-bold text-primary">
                  {routes.reduce((sum, r) => sum + (r._count?.orders || 0), 0)}
                </p>
              </div>
              <Package className="w-12 h-12 text-primary opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* Routes List */}
      {isLoading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando rutas...</p>
        </div>
      ) : routes?.length === 0 ? (
        <div className="card p-12 text-center">
          <RouteIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay rutas
          </h3>
          <p className="text-gray-500 mb-4">
            Comienza creando tu primera ruta o usa el optimizador
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleOpenCreateModal()}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Crear Ruta
            </button>
            <button
              onClick={() => navigate('/routes/optimize')}
              className="btn-secondary"
            >
              <Navigation className="w-4 h-4" />
              Optimizar
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => {
            const StatusIcon = statusIcons[route.status]
            return (
              <div key={route.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                      <RouteIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{route.name || `Ruta #${route.id.slice(0, 8)}`}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[route.status]}`}>
                        {getStatusIcon(route.status)}
                        {statusLabels[route.status]}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewOrders(route)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Ver pedidos"
                    >
                      <Package className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRoute(route)
                        setShowDeleteModal(true)
                      }}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {route.agent && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{route.agent.user?.name || 'Sin nombre'}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>{route._count?.orders || 0} pedidos</span>
                  </div>
                  {route.totalDistance > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{route.totalDistance.toFixed(2)} km</span>
                    </div>
                  )}
                  {route.estimatedTime > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{route.estimatedTime} min</span>
                    </div>
                  )}
                </div>

                {/* Status Actions */}
                <div className="pt-4 border-t space-y-2">
                  {route.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(route.id, 'in_progress')}
                      className="w-full btn-primary text-sm"
                    >
                      Iniciar Ruta
                    </button>
                  )}
                  {route.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(route.id, 'completed')}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Completar Ruta
                    </button>
                  )}
                  {(route.status === 'pending' || route.status === 'in_progress') && (
                    <button
                      onClick={() => handleUpdateStatus(route.id, 'cancelled')}
                      className="w-full btn-secondary text-sm"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                {route.createdAt && (
                  <div className="mt-4 text-xs text-gray-500">
                    Creada el {format(new Date(route.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Nueva Ruta
              </h3>
              <button
                onClick={handleCloseCreateModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Ruta *
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Ruta Centro Mañana"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repartidor *
                </label>
                <select
                  className="input w-full"
                  value={formData.agentId}
                  onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar repartidor</option>
                  {agents?.filter(a => a.status === 'available').map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.user?.name || 'Sin nombre'} - {agent.vehicle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distancia (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="input w-full"
                    value={formData.totalDistance}
                    onChange={(e) => setFormData({ ...formData, totalDistance: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input w-full"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-gray-700">
                  <strong>Nota:</strong> Después de crear la ruta, podrás asignarle pedidos desde el optimizador o manualmente.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary"
                >
                  <Save className="w-4 h-4" />
                  Crear Ruta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Orders Modal */}
      {showOrdersModal && selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Pedidos de {selectedRoute.name || 'la Ruta'}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedRoute._count?.orders || 0} pedidos asignados
                </p>
              </div>
              <button
                onClick={() => {
                  setShowOrdersModal(false)
                  setSelectedRoute(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedRoute.orders && selectedRoute.orders.length > 0 ? (
              <div className="space-y-3">
                {selectedRoute.orders.map((routeOrder) => (
                  <div key={routeOrder.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            #{routeOrder.sequence}
                          </span>
                          <h4 className="font-semibold text-gray-900">
                            Pedido #{routeOrder.order?.id.slice(0, 8)}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3" />
                          {routeOrder.order?.address}
                        </p>
                        {routeOrder.order?.customer && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {routeOrder.order.customer.name}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[routeOrder.order?.status || 'pending']}`}>
                        {statusLabels[routeOrder.order?.status || 'pending']}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay pedidos asignados a esta ruta</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Eliminar Ruta?
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar esta ruta? Los pedidos asignados quedarán sin ruta.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedRoute(null)
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
