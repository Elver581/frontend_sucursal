import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para añadir token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API de autenticación
export const authAPI = {
  register: (data) => apiClient.post('/register', data),
  login: (data) => apiClient.post('/login', data),
  logout: () => apiClient.post('/logout'),
  me: () => apiClient.get('/me'),
};

// API de productos
export const productsAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/products?${queryParams}`);
  },

  
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
  getMyProducts: (page = 1) => apiClient.get(`/my-products?page=${page}`),
  markAsSold: (id) => apiClient.patch(`/products/${id}/sold`),
  getAllByBranch: (branch_id) =>
    apiClient.get('/productsAll', { params: { branch_id } }),

  
  // Endpoint ligero para <select> (/products/all?q=...&limit=...)
  getAllForSelect: (q, limit = 0) =>
    apiClient.get('/productsAll', { params: { q, limit } }),

  // Endpoint para publicar productos
 togglePublished: (id, is_published) =>
    apiClient.patch(`/products/${id}/toggle-published`, { is_published }),
};

// API de categorías
export const categoriesAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/categories?${queryParams}`);
  },
  getActive: () => apiClient.get('/categories/active'),
  getById: (id) => apiClient.get(`/categories/${id}`),
  create: (data) => apiClient.post('/categories', data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/categories/${id}`),
  toggleStatus: (id) => apiClient.patch(`/categories/${id}/toggle-status`),
};
//API Sucursales
export const branchesAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/branches?${queryParams}`);
  },
  getActive: () => apiClient.get('/branches'),
  getById: (id) => apiClient.get(`/branches/${id}`),
  create: (data) => apiClient.post('/branches', data),
  update: (id, data) => apiClient.put(`/branches/${id}`, data),
  delete: (id) => apiClient.delete(`/branches/${id}`),
  toggleStatus: (id) => apiClient.patch(`/branches/${id}/toggle-status`),
};

// API de ventas
export const salesAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/sales?${queryParams}`);
  },
  getById: (id) => apiClient.get(`/sales/${id}`),
  create: (data) => apiClient.post('/sales', data),
  update: (id, data) => apiClient.put(`/sales/${id}`, data),
  cancel: (id) => apiClient.patch(`/sales/${id}/cancel`),
  getStats: () => apiClient.get('/sales-stats'),
  salesByPaymentMethod: (period = 'today', branchId = null) => {
    const params = new URLSearchParams();
    params.append('period', period);
    if (branchId) params.append('branch_id', branchId);
    return apiClient.get(`/company/sales-by-payment-method?${params.toString()}`);
  },
};

// API de compras
export const purchasesAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/purchases?${queryParams}`);
  },
  getById: (id) => apiClient.get(`/purchases/${id}`),
  create: (data) => apiClient.post('/purchases', data),
  update: (id, data) => apiClient.put(`/purchases/${id}`, data),
  cancel: (id) => apiClient.patch(`/purchases/${id}/cancel`),
  getStats: () => apiClient.get('/purchases-stats'),
};

// API de métodos de pago
export const paymentMethodsAPI = {
  getAll: () => apiClient.get('/payment-methods'),
  getActive: () => apiClient.get('/payment-methods/active'),
  getById: (id) => apiClient.get(`/payment-methods/${id}`),
  create: (data) => apiClient.post('/payment-methods', data),
  update: (id, data) => apiClient.put(`/payment-methods/${id}`, data),
  delete: (id) => apiClient.delete(`/payment-methods/${id}`),
  setDefault: (id) => apiClient.patch(`/payment-methods/${id}/default`),
};

// API de inventario
export const inventoryAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/inventory?${queryParams}`);
  },
  getMovements: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/inventory/movements?${queryParams}`);
  },
  getAlerts: () => apiClient.get('/inventory/alerts'),
  getSummary: () => apiClient.get('/inventory/summary'),
  adjust: (data) => apiClient.post('/inventory/adjust', data),
  updateSettings: (data) => apiClient.put('/inventory/settings', data),
};

// API de estadísticas
export const statsAPI = {
  getDashboard: () => apiClient.get('/stats/dashboard'),
  getDailySales: (days = 30) => apiClient.get(`/stats/daily-sales?days=${days}`),
  getMonthlySales: (months = 12) => apiClient.get(`/stats/monthly-sales?months=${months}`),
  getProductPerformance: () => apiClient.get('/stats/product-performance'),
  getSalesByCategory: (period = 'month') => apiClient.get(`/stats/sales-by-category?period=${period}`),
  getProfitLoss: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return apiClient.get(`/stats/profit-loss?${params.toString()}`);
  },
};

// API de proveedores
export const suppliersAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/suppliers?${queryParams}`);
  },
  getActiveSuppliers: () => apiClient.get('/suppliers/active'),
  getById: (id) => apiClient.get(`/suppliers/${id}`),
  create: (data) => apiClient.post('/suppliers', data),
  update: (id, data) => apiClient.put(`/suppliers/${id}`, data),
  delete: (id) => apiClient.delete(`/suppliers/${id}`),
};

// API de usuarios
export const usersAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/users?${queryParams}`);
  },
  getById: (id) => apiClient.get(`/users/${id}`),
  create: (data) => apiClient.post('/users', data),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  delete: (id) => apiClient.delete(`/users/${id}`),
  changePassword: (data) => apiClient.put('/change-password', data),
  getRoles: () => apiClient.get('/roles'),
};


// API de empresas
export const companiesAPI = {
  register: (data) => apiClient.post('/companies/register', data),
  activate: (token) => apiClient.post(`/companies/activate/${token}`),
  getCompanyInfo: () => apiClient.get('/companies/current'),
  updateCompany: (data) => apiClient.put('/companies/current', data),
  // Rutas autenticadas para empresa del usuario
  getMyCompany: () => apiClient.get('/my-company'),
  updateMyCompanyProfile: (data) => apiClient.put('/my-company/profile', data),
  uploadMyCompanyLogo: (formData) => apiClient.post('/my-company/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteMyCompanyLogo: () => apiClient.delete('/my-company/logo'),
  // Admin endpoints
  getAllCompanies: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/companies?${queryParams}`);
  },
  activateCompanyByAdmin: (id) => apiClient.post(`/admin/companies/${id}/activate`),
  deactivateCompany: (id) => apiClient.post(`/admin/companies/${id}/deactivate`),
  getCompanyById: (id) => apiClient.get(`/admin/companies/${id}`),
};

export default apiClient;
