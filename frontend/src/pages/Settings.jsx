import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/api.service'
import { useAuthStore } from '../stores/authStore'
import {
  User,
  Lock,
  Bell,
  Save,
  Mail,
  Phone,
  MapPin,
  Building,
  Shield,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')

  // Profile form
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
  })

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Notifications form
  const [notificationsData, setNotificationsData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    routeUpdates: true,
    systemAlerts: true,
  })

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: authService.getProfile,
    onSuccess: (data) => {
      setProfileData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      })
    },
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => {
      toast.success('Perfil actualizado correctamente')
      queryClient.invalidateQueries(['user-profile'])
    },
    onError: () => {
      toast.error('Error al actualizar el perfil')
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Contraseña cambiada correctamente')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cambiar la contraseña')
    },
  })

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate(profileData)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    })
  }

  const handleNotificationsSubmit = (e) => {
    e.preventDefault()
    toast.success('Preferencias de notificaciones guardadas')
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Seguridad', icon: Lock },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Gestiona tu perfil y preferencias de la aplicación
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="card p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* User Info Card */}
          <div className="card p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{currentUser?.name}</p>
                <p className="text-sm text-gray-500">{currentUser?.email}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Shield className="w-4 h-4" />
                <span>Rol: {currentUser?.role === 'admin' ? 'Administrador' : 
                       currentUser?.role === 'operator' ? 'Operador' : 'Repartidor'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Cuenta Activa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Información del Perfil</h2>
                  <p className="text-sm text-gray-600">
                    Actualiza tu información personal
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nombre Completo *
                      </div>
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email *
                      </div>
                    </label>
                    <input
                      type="email"
                      className="input w-full"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Teléfono
                      </div>
                    </label>
                    <input
                      type="tel"
                      className="input w-full"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+51 999 999 999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Dirección
                      </div>
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      placeholder="Calle, número, ciudad"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="btn-primary"
                  >
                    <Save className="w-4 h-4" />
                    {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Seguridad</h2>
                  <p className="text-sm text-gray-600">
                    Cambia tu contraseña y gestiona la seguridad de tu cuenta
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual *
                  </label>
                  <input
                    type="password"
                    className="input w-full"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    className="input w-full"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo 6 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    className="input w-full"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Importante:</strong> Después de cambiar tu contraseña, 
                    tendrás que iniciar sesión nuevamente.
                  </p>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="btn-primary"
                  >
                    <Lock className="w-4 h-4" />
                    {changePasswordMutation.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Notificaciones</h2>
                  <p className="text-sm text-gray-600">
                    Configura cómo y cuándo quieres recibir notificaciones
                  </p>
                </div>
              </div>

              <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Canales de Notificación</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={notificationsData.emailNotifications}
                        onChange={(e) => setNotificationsData({ 
                          ...notificationsData, 
                          emailNotifications: e.target.checked 
                        })}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">
                          Recibir notificaciones por correo electrónico
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={notificationsData.pushNotifications}
                        onChange={(e) => setNotificationsData({ 
                          ...notificationsData, 
                          pushNotifications: e.target.checked 
                        })}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Push</p>
                        <p className="text-sm text-gray-600">
                          Notificaciones push en el navegador
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={notificationsData.smsNotifications}
                        onChange={(e) => setNotificationsData({ 
                          ...notificationsData, 
                          smsNotifications: e.target.checked 
                        })}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">SMS</p>
                        <p className="text-sm text-gray-600">
                          Recibir mensajes de texto (cargos pueden aplicar)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Tipos de Notificación</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={notificationsData.orderUpdates}
                        onChange={(e) => setNotificationsData({ 
                          ...notificationsData, 
                          orderUpdates: e.target.checked 
                        })}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Actualizaciones de Pedidos</p>
                        <p className="text-sm text-gray-600">
                          Cambios de estado en pedidos
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={notificationsData.routeUpdates}
                        onChange={(e) => setNotificationsData({ 
                          ...notificationsData, 
                          routeUpdates: e.target.checked 
                        })}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Actualizaciones de Rutas</p>
                        <p className="text-sm text-gray-600">
                          Nuevas rutas asignadas y cambios
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={notificationsData.systemAlerts}
                        onChange={(e) => setNotificationsData({ 
                          ...notificationsData, 
                          systemAlerts: e.target.checked 
                        })}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Alertas del Sistema</p>
                        <p className="text-sm text-gray-600">
                          Mantenimientos y actualizaciones importantes
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button type="submit" className="btn-primary">
                    <Save className="w-4 h-4" />
                    Guardar Preferencias
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
