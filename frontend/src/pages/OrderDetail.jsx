import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { orderService } from '../services/api.service'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Edit,
  Trash2,
  QrCode,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

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

const statusIcons = {
  pending: AlertCircle,
  in_transit: TrendingUp,
  delivered: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  // Fetch order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrders({ limit: 1000 }).then(res => 
      res.orders.find(o => o.id === id)
    ),
    enabled: !!id,
  })

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => 
      orderService.updateOrder(orderId, { status }),
    onSuccess: () => {
      toast.success('Estado actualizado correctamente')
      queryClient.invalidateQueries(['order', id])
      queryClient.invalidateQueries(['orders'])
      setShowStatusModal(false)
      setNewStatus('')
    },
    onError: () => {
      toast.error('Error al actualizar el estado')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: orderService.deleteOrder,
    onSuccess: () => {
      toast.success('Pedido eliminado correctamente')
      navigate('/orders')
    },
    onError: () => {
      toast.error('Error al eliminar el pedido')
    },
  })

  const handleDownloadPDF = async () => {
    try {
      const blob = await orderService.downloadOrderPDF(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pedido-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('PDF descargado correctamente')
    } catch (error) {
      toast.error('Error al descargar el PDF')
    }
  }

  const handleUpdateStatus = () => {
    if (newStatus) {
      updateStatusMutation.mutate({ orderId: id, status: newStatus })
    }
  }

  const handleDelete = () => {
    deleteMutation.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Pedido no encontrado
        </h3>
        <p className="text-gray-500 mb-4">
          El pedido que buscas no existe o ha sido eliminado
        </p>
        <button onClick={() => navigate('/orders')} className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Volver a Pedidos
        </button>
      </div>
    )
  }

  const StatusIcon = statusIcons[order.status]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pedido #{order.id.slice(0, 8)}
            </h1>
            <p className="text-gray-600 mt-1">
              Creado el {format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="btn-secondary"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Estado del Pedido</h2>
              <button
                onClick={() => setShowStatusModal(true)}
                className="btn-secondary text-sm"
              >
                <Edit className="w-4 h-4" />
                Cambiar Estado
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${statusColors[order.status]}`}>
                <StatusIcon className="w-8 h-8" />
              </div>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  Última actualización: {format(new Date(order.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Productos</h2>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.productName}</h3>
                    <p className="text-sm text-gray-500">
                      Cantidad: {item.quantity} × ${item.price?.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No hay productos registrados</p>
              )}
            </div>
            
            {/* Total */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ${order.total?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Dirección de Entrega</h2>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium text-gray-900">{order.address}</p>
                {order.zone && (
                  <p className="text-sm text-gray-500 mt-1">
                    Zona: {order.zone.name}
                  </p>
                )}
                {(order.latitude && order.longitude) && (
                  <p className="text-sm text-gray-500 mt-1">
                    Coordenadas: {order.latitude}, {order.longitude}
                  </p>
                )}
              </div>
            </div>
            {order.notes && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Notas:</strong> {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Cliente</h2>
            {order.customer ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{order.customer.name}</p>
                    <p className="text-sm text-gray-500">Cliente</p>
                  </div>
                </div>
                {order.customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a href={`tel:${order.customer.phone}`} className="text-primary hover:underline">
                      {order.customer.phone}
                    </a>
                  </div>
                )}
                {order.customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a href={`mailto:${order.customer.email}`} className="text-primary hover:underline">
                      {order.customer.email}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No hay información del cliente</p>
            )}
          </div>

          {/* Delivery Agent */}
          {order.route?.agent && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Repartidor Asignado</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.route.agent.user?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">Repartidor</p>
                  </div>
                </div>
                {order.route.agent.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a href={`tel:${order.route.agent.phone}`} className="text-primary hover:underline">
                      {order.route.agent.phone}
                    </a>
                  </div>
                )}
                {order.route.agent.vehicle && (
                  <div className="text-sm text-gray-500">
                    Vehículo: {order.route.agent.vehicle}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QR Code */}
          {order.qrCode && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Código QR</h2>
              <div className="flex justify-center">
                <img 
                  src={order.qrCode} 
                  alt="QR Code" 
                  className="w-48 h-48 border-2 border-gray-200 rounded-lg"
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Escanea para más información
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Historial</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="w-0.5 h-full bg-gray-200"></div>
                </div>
                <div className="pb-4">
                  <p className="font-medium text-gray-900">Pedido actualizado</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(order.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Pedido creado</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cambiar Estado del Pedido
            </h3>
            <select
              className="input w-full mb-4"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">Seleccionar estado</option>
              <option value="pending">Pendiente</option>
              <option value="in_transit">En Tránsito</option>
              <option value="delivered">Entregado</option>
              <option value="failed">Fallido</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setNewStatus('')
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus || updateStatusMutation.isPending}
                className="btn-primary disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Eliminar Pedido?
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
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
