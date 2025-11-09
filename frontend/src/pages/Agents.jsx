import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { agentService } from '../services/api.service'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Truck,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Phone,
  Mail,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react'
import toast from 'react-hot-toast'

const statusColors = {
  available: 'bg-green-100 text-green-800',
  busy: 'bg-yellow-100 text-yellow-800',
  offline: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  available: 'Disponible',
  busy: 'Ocupado',
  offline: 'Desconectado',
}

export default function Agents() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [agentStats, setAgentStats] = useState(null)
  const [formData, setFormData] = useState({
    userId: '',
    phone: '',
    vehicle: '',
    status: 'available',
  })

  // Fetch agents
  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents', search],
    queryFn: async () => {
      const data = await agentService.getAgents()
      if (search) {
        return data.filter(agent => 
          agent.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          agent.phone?.includes(search) ||
          agent.vehicle?.toLowerCase().includes(search.toLowerCase())
        )
      }
      return data
    },
  })

  // Create mutation (Note: in real app, you'd need to create user first)
  const createMutation = useMutation({
    mutationFn: agentService.createAgent,
    onSuccess: () => {
      toast.success('Repartidor creado correctamente')
      queryClient.invalidateQueries(['agents'])
      handleCloseModal()
    },
    onError: () => {
      toast.error('Error al crear el repartidor')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => agentService.updateAgent(id, data),
    onSuccess: () => {
      toast.success('Repartidor actualizado correctamente')
      queryClient.invalidateQueries(['agents'])
      handleCloseModal()
    },
    onError: () => {
      toast.error('Error al actualizar el repartidor')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: agentService.deleteAgent,
    onSuccess: () => {
      toast.success('Repartidor eliminado correctamente')
      queryClient.invalidateQueries(['agents'])
      setShowDeleteModal(false)
      setSelectedAgent(null)
    },
    onError: () => {
      toast.error('Error al eliminar el repartidor')
    },
  })

  const handleOpenModal = (agent = null) => {
    if (agent) {
      setSelectedAgent(agent)
      setFormData({
        userId: agent.userId || '',
        phone: agent.phone || '',
        vehicle: agent.vehicle || '',
        status: agent.status || 'available',
      })
    } else {
      setSelectedAgent(null)
      setFormData({
        userId: '',
        phone: '',
        vehicle: '',
        status: 'available',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedAgent(null)
    setFormData({
      userId: '',
      phone: '',
      vehicle: '',
      status: 'available',
    })
  }

  const handleViewStats = async (agent) => {
    try {
      const stats = await agentService.getAgentStats(agent.id)
      setAgentStats(stats)
      setSelectedAgent(agent)
      setShowStatsModal(true)
    } catch (error) {
      toast.error('Error al cargar las estadísticas')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (selectedAgent) {
      updateMutation.mutate({ id: selectedAgent.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = () => {
    if (selectedAgent) {
      deleteMutation.mutate(selectedAgent.id)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'busy':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <X className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Repartidores</h1>
          <p className="text-gray-600 mt-1">
            {agents?.length || 0} repartidores registrados
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nuevo Repartidor
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o vehículo..."
            className="input pl-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      {agents && agents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-3xl font-bold text-green-600">
                  {agents.filter(a => a.status === 'available').length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-200" />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Ruta</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {agents.filter(a => a.status === 'busy').length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-200" />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Desconectados</p>
                <p className="text-3xl font-bold text-gray-600">
                  {agents.filter(a => a.status === 'offline').length}
                </p>
              </div>
              <X className="w-12 h-12 text-gray-200" />
            </div>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      {isLoading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando repartidores...</p>
        </div>
      ) : agents?.length === 0 ? (
        <div className="card p-12 text-center">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay repartidores
          </h3>
          <p className="text-gray-500 mb-4">
            Comienza agregando tu primer repartidor
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Crear Repartidor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {agent.user?.name || 'Sin nombre'}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[agent.status]}`}>
                      {statusLabels[agent.status]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(agent)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAgent(agent)
                      setShowDeleteModal(true)
                    }}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {agent.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{agent.phone}</span>
                  </div>
                )}
                {agent.user?.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{agent.user.email}</span>
                  </div>
                )}
                {agent.vehicle && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span>{agent.vehicle}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={() => handleViewStats(agent)}
                  className="w-full btn-secondary text-sm"
                >
                  <TrendingUp className="w-4 h-4" />
                  Ver Estadísticas
                </button>
              </div>

              {agent.createdAt && (
                <div className="mt-4 text-xs text-gray-500">
                  Registrado el {format(new Date(agent.createdAt), 'dd/MM/yyyy', { locale: es })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedAgent ? 'Editar Repartidor' : 'Nuevo Repartidor'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  className="input w-full"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehículo *
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  placeholder="Moto, Bicicleta, Auto, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  className="input w-full"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="available">Disponible</option>
                  <option value="busy">Ocupado</option>
                  <option value="offline">Desconectado</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary"
                >
                  <Save className="w-4 h-4" />
                  {selectedAgent ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && agentStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Estadísticas de {selectedAgent?.user?.name}
                </h3>
                <p className="text-sm text-gray-500">Rendimiento del repartidor</p>
              </div>
              <button
                onClick={() => {
                  setShowStatsModal(false)
                  setAgentStats(null)
                  setSelectedAgent(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Entregas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {agentStats.totalDeliveries || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Exitosas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {agentStats.successfulDeliveries || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tiempo Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {agentStats.avgDeliveryTime || 0}m
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">Tasa de Éxito</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {agentStats.successRate || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Rutas Activas</h4>
              <p className="text-sm text-gray-700">
                Actualmente tiene {agentStats.activeRoutes || 0} ruta(s) asignada(s)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Eliminar Repartidor?
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar a {selectedAgent?.user?.name}? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedAgent(null)
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
