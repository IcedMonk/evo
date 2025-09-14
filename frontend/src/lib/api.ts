import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getMe: () => api.get('/auth/me'),
  
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),
  
  resetPassword: (data: { token: string; password: string }) =>
    api.put('/auth/reset-password', data),
}

// User API
export const userApi = {
  updateProfile: (data: {
    firstName?: string
    lastName?: string
    evolutionApiKey?: string
  }) => api.put('/user/profile', data),
  
  getStats: () => api.get('/user/stats'),
}

// Instance API
export const instanceApi = {
  create: (data: { instanceName: string; integration?: string }) =>
    api.post('/instances', data),
  
  getAll: () => api.get('/instances'),
  
  getOne: (instanceName: string) => api.get(`/instances/${instanceName}`),
  
  getQRCode: (instanceName: string) =>
    api.get(`/instances/${instanceName}/qr`),
  
  update: (instanceName: string, data: {
    profileName?: string
    profilePictureUrl?: string
  }) => api.put(`/instances/${instanceName}`, data),
  
  delete: (instanceName: string) => api.delete(`/instances/${instanceName}`),
}

// Message API
export const messageApi = {
  sendText: (data: {
    instanceName: string
    number: string
    text: string
  }) => api.post('/messages/send-text', data),
  
  sendMedia: (data: {
    instanceName: string
    number: string
    media: string
    type: 'image' | 'video' | 'audio' | 'document'
    caption?: string
  }) => api.post('/messages/send-media', data),
  
  sendTemplate: (data: {
    instanceName: string
    templateData: any
  }) => api.post('/messages/send-template', data),
  
  getChats: (instanceName: string, page = 1, limit = 20) =>
    api.get(`/messages/${instanceName}/chats`, {
      params: { page, limit },
    }),
  
  getMessages: (instanceName: string, jid: string, page = 1, limit = 50) =>
    api.get(`/messages/${instanceName}/chat/${jid}`, {
      params: { page, limit },
    }),
  
  getGroups: (instanceName: string) =>
    api.get(`/messages/${instanceName}/groups`),
  
  createGroup: (instanceName: string, data: any) =>
    api.post(`/messages/${instanceName}/groups`, { groupData: data }),
}

// Webhook API
export const webhookApi = {
  set: (instanceName: string, data: {
    url: string
    enabled: boolean
    events: string[]
  }) => api.post(`/webhooks/${instanceName}`, data),
  
  get: (instanceName: string) => api.get(`/webhooks/${instanceName}`),
  
  delete: (instanceName: string) => api.delete(`/webhooks/${instanceName}`),
}

// Billing API
export const billingApi = {
  getPlans: () => api.get('/billing/plans'),
  
  getSubscription: () => api.get('/billing/subscription'),
  
  updateSubscription: (data: { plan: string }) =>
    api.put('/billing/subscription', data),
  
  createCheckoutSession: (data: { plan: string }) =>
    api.post('/billing/create-checkout-session', data),
}

export default api