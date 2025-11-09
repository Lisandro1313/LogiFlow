import api from '../lib/api'

export const authService = {
    login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        return data
    },

    register: async (userData) => {
        const { data } = await api.post('/auth/register', userData)
        return data
    },

    getProfile: async () => {
        const { data } = await api.get('/auth/profile')
        return data
    },

    updateProfile: async (profileData) => {
        const { data } = await api.put('/auth/profile', profileData)
        return data
    },

    changePassword: async (passwordData) => {
        const { data } = await api.put('/auth/change-password', passwordData)
        return data
    },
}

export const orderService = {
    getOrders: async (params) => {
        const { data } = await api.get('/orders', { params })
        return data
    },

    getOrderById: async (id) => {
        const { data } = await api.get(`/orders/${id}`)
        return data
    },

    createOrder: async (orderData) => {
        const { data } = await api.post('/orders', orderData)
        return data
    },

    updateOrder: async (id, orderData) => {
        const { data } = await api.put(`/orders/${id}`, orderData)
        return data
    },

    deleteOrder: async (id) => {
        const { data } = await api.delete(`/orders/${id}`)
        return data
    },

    getOrderStats: async () => {
        const { data } = await api.get('/orders/stats')
        return data
    },

    downloadPDF: async (id) => {
        const response = await api.get(`/orders/${id}/pdf`, {
            responseType: 'blob',
        })
        return response.data
    },

    importOrders: async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        const { data } = await api.post('/orders/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },
}

export const customerService = {
    getCustomers: async (params) => {
        const { data } = await api.get('/customers', { params })
        return data
    },

    getCustomerById: async (id) => {
        const { data } = await api.get(`/customers/${id}`)
        return data
    },

    createCustomer: async (customerData) => {
        const { data } = await api.post('/customers', customerData)
        return data
    },

    updateCustomer: async (id, customerData) => {
        const { data } = await api.put(`/customers/${id}`, customerData)
        return data
    },

    deleteCustomer: async (id) => {
        const { data } = await api.delete(`/customers/${id}`)
        return data
    },
}

export const agentService = {
    getAgents: async (params) => {
        const { data } = await api.get('/agents', { params })
        return data
    },

    getAgentById: async (id) => {
        const { data } = await api.get(`/agents/${id}`)
        return data
    },

    updateAgent: async (id, agentData) => {
        const { data } = await api.put(`/agents/${id}`, agentData)
        return data
    },

    getAgentStats: async (id) => {
        const { data } = await api.get(`/agents/${id}/stats`)
        return data
    },
}

export const routeService = {
    getRoutes: async (params) => {
        const { data } = await api.get('/routes', { params })
        return data
    },

    getRouteById: async (id) => {
        const { data } = await api.get(`/routes/${id}`)
        return data
    },

    createRoute: async (routeData) => {
        const { data } = await api.post('/routes', routeData)
        return data
    },

    updateRouteStatus: async (id, status) => {
        const { data } = await api.put(`/routes/${id}/status`, { status })
        return data
    },

    optimizeRoute: async (orderIds) => {
        const { data } = await api.post('/routes/optimize', { orderIds })
        return data
    },

    deleteRoute: async (id) => {
        const { data } = await api.delete(`/routes/${id}`)
        return data
    },
}

export const zoneService = {
    getZones: async () => {
        const { data } = await api.get('/zones')
        return data
    },

    createZone: async (zoneData) => {
        const { data } = await api.post('/zones', zoneData)
        return data
    },

    updateZone: async (id, zoneData) => {
        const { data } = await api.put(`/zones/${id}`, zoneData)
        return data
    },

    deleteZone: async (id) => {
        const { data } = await api.delete(`/zones/${id}`)
        return data
    },
}

export const dashboardService = {
    getStats: async () => {
        const { data } = await api.get('/dashboard/stats')
        return data
    },

    getTrends: async (days = 7) => {
        const { data } = await api.get('/dashboard/trends', { params: { days } })
        return data
    },
}

export const trackingService = {
    updateLocation: async (locationData) => {
        const { data } = await api.post('/tracking/location', locationData)
        return data
    },

    getAgentLocation: async (agentId) => {
        const { data } = await api.get(`/tracking/agent/${agentId}`)
        return data
    },

    getAllActiveLocations: async () => {
        const { data } = await api.get('/tracking/active')
        return data
    },
}
