import api from './axios';

export const getProducts = (params) => api.get('/products', { params }).then(r => r.data);
export const getProduct = (slug) => api.get(`/products/${slug}`).then(r => r.data);
export const getCategories = () => api.get('/categories').then(r => r.data);
