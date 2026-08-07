import api from './axios';

// Auth
export const login = (data) => api.post('/auth/login', data).then(r => r.data);
export const getMe = () => api.get('/auth/me').then(r => r.data);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats').then(r => r.data);

// Products
export const getProducts = (params) => api.get('/products', { params }).then(r => r.data);
export const getProductBySlug = (slug) => api.get(`/products/${slug}`).then(r => r.data);
export const createProduct = (data) => api.post('/products', data).then(r => r.data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data).then(r => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then(r => r.data);
export const uploadProductImage = (id, formData) =>
  api.post(`/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const deleteProductImage = (imageId) => api.delete(`/products/images/${imageId}`).then(r => r.data);
export const updateVariantStock = (variantId, stock) =>
  api.patch(`/products/variants/${variantId}/stock`, { stock }).then(r => r.data);

// Categories
export const getCategories = () => api.get('/categories').then(r => r.data);
export const createCategory = (data) => api.post('/categories', data).then(r => r.data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data).then(r => r.data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then(r => r.data);
export const uploadCategoryImage = (id, file) => {
  const fd = new FormData();
  fd.append('image', file);
  return api.post(`/categories/${id}/image`, fd).then(r => r.data);
};

// Orders
export const getOrders = (params) => api.get('/orders', { params }).then(r => r.data);
export const getOrder = (id) => api.get(`/orders/${id}`).then(r => r.data);
export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status }).then(r => r.data);

// Revenue
export const getRevenue = (params) => api.get('/dashboard/revenue', { params }).then(r => r.data);

// Admin Users
export const getAdminUsers = () => api.get('/admin-users').then(r => r.data);
export const createAdminUser = (data) => api.post('/admin-users', data).then(r => r.data);
export const deleteAdminUser = (id) => api.delete(`/admin-users/${id}`).then(r => r.data);
export const changeAdminPassword = (id, password) => api.patch(`/admin-users/${id}/password`, { password }).then(r => r.data);
