import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { orderService, routeService, agentService } from '../services/api.service'
import { 
  ArrowLeft, 
  Navigation, 
  MapPin, 
  Package, 
  CheckCircle,
  Clock,
  TrendingUp,
  User,
  Zap,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function RouteOptimizer() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedOrders, setSelectedOrders] = useState([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [optimizedRoute, setOptimizedRoute] = useState(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Fetch pending orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: () => orderService.getOrders({ status: 'pending', limit: 1000 }),
  })

  // Fetch available agents
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['available-agents'],
    queryFn: async () => {
      const allAgents = await agentService.getAgents()
      return allAgents.filter(a => a.status === 'available')
    },
  })

  // Create route mutation
  const createRouteMutation = useMutation({
    mutationFn: routeService.createRoute,
    onSuccess: () => {
      toast.success('Ruta creada y optimizada correctamente')
      queryClient.invalidateQueries(['routes'])
      queryClient.invalidateQueries(['pending-orders'])
      navigate('/routes')
    },
    onError: () => {
      toast.error('Error al crear la ruta')
    },
  })

  const handleToggleOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    if (selectedOrders.length === ordersData?.orders?.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(ordersData?.orders?.map(o => o.id) || [])
    }
  }

  const handleOptimize = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Selecciona al menos un pedido')
      return
    }

    if (!selectedAgent) {
      toast.error('Selecciona un repartidor')
      return
    }

    setIsOptimizing(true)

    try {
      // Get selected orders data
      const ordersToOptimize = ordersData.orders
        .filter(o => selectedOrders.includes(o.id))
        .map(o => ({
          id: o.id,
          latitude: o.latitude || -12.0464,
          longitude: o.longitude || -77.0428,
          address: o.address,
        }))

      // Call optimization endpoint
      const optimized = await routeService.optimizeRoute({
        agentId: selectedAgent,
        orders: ordersToOptimize,
      })

      setOptimizedRoute(optimized)
      toast.success('Ruta optimizada correctamente')
    } catch (error) {
      toast.error('Error al optimizar la ruta. Usando orden por defecto.')
      
      // Fallback: create basic route
      const ordersToOptimize = ordersData.orders
        .filter(o => selectedOrders.includes(o.id))
        .map((o, index) => ({
          id: o.id,
          sequence: index + 1,
          address: o.address,
        }))

      setOptimizedRoute({
        totalDistance: ordersToOptimize.length * 5, // Estimate 5km per order
        estimatedTime: ordersToOptimize.length * 15, // Estimate 15min per order
        orders: ordersToOptimize,
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleCreateRoute = async () => {
    if (!optimizedRoute || !selectedAgent) return

    const agent = agents.find(a => a.id === selectedAgent)
    
    const routeData = {
      agentId: selectedAgent,
      name: `Ruta ${agent?.user?.name || 'Optimizada'} - ${new Date().toLocaleDateString()}`,
      totalDistance: optimizedRoute.totalDistance || 0,
      estimatedTime: optimizedRoute.estimatedTime || 0,
      orders: optimizedRoute.orders?.map(o => o.id) || selectedOrders,
    }

    createRouteMutation.mutate(routeData)
  }

  const pendingOrders = ordersData?.orders || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/routes')}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Optimizador de Rutas</h1>
          <p className="text-gray-600 mt-1">
            Selecciona pedidos y un repartidor para crear una ruta optimizada
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Orders Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Selection */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">1. Seleccionar Repartidor</h2>
            {agentsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : agents && agents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedAgent === agent.id
                        ? 'border-primary bg-primary bg-opacity-5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {agent.user?.name || 'Sin nombre'}
                        </p>
                        <p className="text-sm text-gray-500">{agent.vehicle}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay repartidores disponibles</p>
              </div>
            )}
          </div>

          {/* Orders Selection */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">2. Seleccionar Pedidos</h2>
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary hover:underline"
              >
                {selectedOrders.length === pendingOrders.length ? 'Deseleccionar' : 'Seleccionar'} Todos
              </button>
            </div>

            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay pedidos pendientes</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pendingOrders.map((order) => (
                  <label
                    key={order.id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedOrders.includes(order.id)
                        ? 'border-primary bg-primary bg-opacity-5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleToggleOrder(order.id)}
                      className="mt-1 w-4 h-4 text-primary rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          ${order.total?.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3" />
                        {order.address}
                      </p>
                      {order.customer && (
                        <p className="text-sm text-gray-500">
                          {order.customer.name}
                        </p>
                      )}
                      {order.zone && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {order.zone.name}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>{selectedOrders.length}</strong> pedido(s) seleccionado(s)
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Optimization */}
        <div className="space-y-6">
          <div className="card p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">3. Optimizar</h2>

            {!optimizedRoute ? (
              <>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Repartidor:</span>
                    <span className="font-semibold">
                      {selectedAgent ? agents?.find(a => a.id === selectedAgent)?.user?.name : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pedidos:</span>
                    <span className="font-semibold">{selectedOrders.length}</span>
                  </div>
                </div>

                <button
                  onClick={handleOptimize}
                  disabled={selectedOrders.length === 0 || !selectedAgent || isOptimizing}
                  className="btn-primary w-full"
                >
                  {isOptimizing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Optimizando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Optimizar Ruta
                    </>
                  )}
                </button>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      El algoritmo de IA calculará la ruta más eficiente usando K-Means y TSP
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900">Ruta Optimizada</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                        <MapPin className="w-4 h-4" />
                        Distancia
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {optimizedRoute.totalDistance?.toFixed(1)} km
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                        <Clock className="w-4 h-4" />
                        Tiempo
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {optimizedRoute.estimatedTime} min
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Package className="w-4 h-4" />
                      Pedidos en orden
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {optimizedRoute.orders?.length || selectedOrders.length}
                    </p>
                  </div>

                  {optimizedRoute.orders && optimizedRoute.orders.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Secuencia:</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {optimizedRoute.orders.map((order, index) => (
                          <div key={order.id} className="flex items-start gap-2 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-semibold">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium">#{order.id.slice(0, 8)}</p>
                              <p className="text-gray-500 text-xs">{order.address}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCreateRoute}
                    disabled={createRouteMutation.isPending}
                    className="btn-primary w-full"
                  >
                    {createRouteMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4" />
                        Crear Ruta
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setOptimizedRoute(null)
                      setSelectedOrders([])
                      setSelectedAgent('')
                    }}
                    className="btn-secondary w-full"
                  >
                    Optimizar Otra Ruta
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
