// API service - handles all HTTP requests to Rails backend
// Base URL: http://localhost:3000/api/v1
// Automatically includes authentication token in headers
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - adds auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handles 401 (unauthorized) errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// AUTH ENDPOINTS
export const authAPI = {
  // POST /api/v1/auth/login
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  // POST /api/v1/auth/register
  register: (name: string, email: string, password: string, accountType?: string, companyName?: string) =>
    api.post('/auth/register', { name, email, password, account_type: accountType, company_name: companyName }),
}

// BUCKET ENDPOINTS
export const bucketsAPI = {
  // GET /api/v1/buckets
  getAll: () => api.get('/buckets'),
  
  // GET /api/v1/buckets/:id
  getOne: (id: number) => api.get(`/buckets/${id}`),
  
  // POST /api/v1/buckets
  create: (data: { name: string; description?: string }) =>
    api.post('/buckets', { bucket: data }),
  
  // PATCH /api/v1/buckets/:id
  update: (id: number, data: any) =>
    api.patch(`/buckets/${id}`, { bucket: data }),
  
  // DELETE /api/v1/buckets/:id
  delete: (id: number) => api.delete(`/buckets/${id}`),
  
  // GET /api/v1/buckets/:id/images
  getImages: (id: number) => api.get(`/buckets/${id}/images`),
}

// SCHEDULE ENDPOINTS
export const schedulesAPI = {
  // GET /api/v1/bucket_schedules
  getAll: () => api.get('/bucket_schedules'),
  
  // POST /api/v1/bucket_schedules
  create: (data: any) => api.post('/bucket_schedules', data),
  
  // DELETE /api/v1/bucket_schedules/:id
  delete: (id: number) => api.delete(`/bucket_schedules/${id}`),
}

// MARKETPLACE ENDPOINTS
export const marketplaceAPI = {
  // GET /api/v1/marketplace
  getAll: () => api.get('/marketplace'),
  
  // GET /api/v1/marketplace/available
  getAvailable: () => api.get('/marketplace/available'),
  
  // POST /api/v1/marketplace/:id/clone
  clone: (id: number, preserveScheduling: boolean) =>
    api.post(`/marketplace/${id}/clone`, { preserve_scheduling: preserveScheduling }),
}

// USER INFO ENDPOINTS
export const userAPI = {
  // GET /api/v1/user_info
  getProfile: () => api.get('/user_info'),
  
  // PATCH /api/v1/user_info
  updateProfile: (data: any) => api.patch('/user_info', { user: data }),
  
  // GET /api/v1/user_info/connected_accounts
  getConnectedAccounts: () => api.get('/user_info/connected_accounts'),
}

export default api
