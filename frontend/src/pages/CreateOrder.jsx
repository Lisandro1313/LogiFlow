import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { orderService, customerService } from '../services/api.service'
import { ArrowLeft, Plus, Trash2, Save, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateOrder() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    customerId: '',
    zoneId: '',
    address: '',
    latitude: '',
    longitude: '',
    notes: '',
    items: [{ productName: '', quantity: 1, price: 0 }],
  })

  // Fetch customers
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers({ limit: 1000 }),
  })

  // Fetch zones
  const { data: zones } = useQuery({
    queryKey: ['zones'],
    queryFn: () => orderService.getOrders({ limit: 1000 }).then(res => {
      const uniqueZones = new Map()
      res.orders?.forEach(order => {
        if (order.zone) {
          uniqueZones.set(order.zone.id, order.zone)
        }
      })
      return Array.from(uniqueZones.values())
    }),
  })

  // Create order mutation
  const createMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: (data) => {
      toast.success('Pedido creado correctamente')
      queryClient.invalidateQueries(['orders'])
      navigate(`/orders/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear el pedido')
    },
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData(prev => ({ ...prev, items: newItems }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productName: '', quantity: 1, price: 0 }],
    }))
  }

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }))
    }
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => 
      sum + (parseFloat(item.quantity) * parseFloat(item.price || 0)), 0
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.customerId) {
      toast.error('Selecciona un cliente')
      return
    }
    if (!formData.address) {
      toast.error('Ingresa una dirección')
      return
    }
    if (formData.items.some(item => !item.productName || item.quantity <= 0 || item.price <= 0)) {
      toast.error('Completa todos los productos correctamente')
      return
    }

    const orderData = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      items: formData.items.map(item => ({
        productName: item.productName,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
      })),
    }

    createMutation.mutate(orderData)
  }

  const selectedCustomer = customersData?.customers?.find(c => c.id === formData.customerId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Pedido</h1>
          <p className="text-gray-600 mt-1">
            Completa la información del pedido
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <select
                  className="input w-full"
                  value={formData.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {customersData?.customers?.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Email:</strong> {selectedCustomer.email || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Dirección guardada:</strong> {selectedCustomer.address || 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Información de Entrega</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección de Entrega *
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Calle, número, ciudad"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zona
                </label>
                <select
                  className="input w-full"
                  value={formData.zoneId}
                  onChange={(e) => handleInputChange('zoneId', e.target.value)}
                >
                  <option value="">Seleccionar zona (opcional)</option>
                  {zones?.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitud (opcional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="input w-full"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    placeholder="-12.0464"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitud (opcional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="input w-full"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    placeholder="-77.0428"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  className="input w-full"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Instrucciones especiales, puntos de referencia, etc."
                />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Productos</h2>
              <button
                type="button"
                onClick={addItem}
                className="btn-secondary text-sm"
              >
                <Plus className="w-4 h-4" />
                Agregar Producto
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Producto *
                        </label>
                        <input
                          type="text"
                          className="input w-full"
                          value={item.productName}
                          onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                          placeholder="Nombre del producto"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Cantidad *
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="input w-full"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Precio Unitario *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="input w-full"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                      className="mt-6 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-2 text-right text-sm text-gray-600">
                    Subtotal: ${(item.quantity * item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="card p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Productos:</span>
                <span className="font-medium">{formData.items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Unidades totales:</span>
                <span className="font-medium">
                  {formData.items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0)}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-primary w-full"
              >
                <Save className="w-4 h-4" />
                {createMutation.isPending ? 'Creando...' : 'Crear Pedido'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="btn-secondary w-full"
              >
                Cancelar
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-gray-700">
                <strong>Nota:</strong> El pedido se creará con estado "Pendiente" y 
                podrá ser asignado a una ruta posteriormente.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
