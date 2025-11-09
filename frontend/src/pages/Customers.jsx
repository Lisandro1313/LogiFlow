import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerService } from '../services/api.service'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  MapPin,
  Phone,
  Mail,
  Package
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Customers() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
  })

  // Fetch customers
  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => customerService.getCustomers({ 
      page, 
      limit: 10,
      search 
    }),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: customerService.createCustomer,
    onSuccess: () => {
      toast.success('Cliente creado correctamente')
      queryClient.invalidateQueries(['customers'])
      handleCloseModal()
    },
    onError: () => {
      toast.error('Error al crear el cliente')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => customerService.updateCustomer(id, data),
    onSuccess: () => {
      toast.success('Cliente actualizado correctamente')
      queryClient.invalidateQueries(['customers'])
      handleCloseModal()
    },
    onError: () => {
      toast.error('Error al actualizar el cliente')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: customerService.deleteCustomer,
    onSuccess: () => {
      toast.success('Cliente eliminado correctamente')
      queryClient.invalidateQueries(['customers'])
      setShowDeleteModal(false)
      setSelectedCustomer(null)
    },
    onError: () => {
      toast.error('Error al eliminar el cliente')
    },
  })

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setSelectedCustomer(customer)
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        latitude: customer.latitude || '',
        longitude: customer.longitude || '',
      })
    } else {
      setSelectedCustomer(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        latitude: '',
        longitude: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedCustomer(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      latitude: '',
      longitude: '',
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const data = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
    }

    if (selectedCustomer) {
      updateMutation.mutate({ id: selectedCustomer.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = () => {
    if (selectedCustomer) {
      deleteMutation.mutate(selectedCustomer.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">
            {customersData?.total || 0} clientes registrados
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            className="input pl-10 w-full"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </div>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando clientes...</p>
        </div>
      ) : customersData?.customers?.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay clientes
          </h3>
          <p className="text-gray-500 mb-4">
            Comienza agregando tu primer cliente
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Crear Cliente
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customersData.customers.map((customer) => (
              <div key={customer.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-500">
                        {customer._count?.orders || 0} pedidos
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(customer)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setShowDeleteModal(true)
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </div>
                  )}
                </div>

                {customer.createdAt && (
                  <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                    Registrado el {format(new Date(customer.createdAt), 'dd/MM/yyyy', { locale: es })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {customersData?.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {((page - 1) * 10) + 1} a {Math.min(page * 10, customersData.total)} de {customersData.total} clientes
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
                  {Array.from({ length: Math.min(5, customersData.totalPages) }, (_, i) => {
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
                  onClick={() => setPage(p => Math.min(customersData.totalPages, p + 1))}
                  disabled={page === customersData.totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
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
                  Nombre *
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="input w-full"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
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
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="-77.0428"
                  />
                </div>
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
                  {selectedCustomer ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Eliminar Cliente?
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar a {selectedCustomer?.name}? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedCustomer(null)
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
