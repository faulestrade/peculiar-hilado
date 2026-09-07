const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';
export const imgUrl = (url) => !url ? '' : url.startsWith('http') ? url : `${BASE_URL}${url}`;
