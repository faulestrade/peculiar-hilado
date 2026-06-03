import api from './axios';

export const createOrder = (data) => api.post('/orders', data).then(r => r.data);
