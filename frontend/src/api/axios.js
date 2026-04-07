import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor for error handling
API.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        return Promise.reject({ message, errors: error.response?.data?.errors });
    }
);
// Category APIs
export const categoryAPI = {
    getAll: () => API.get('/categories'),
    getById: (id) => API.get(`/categories/${id}`),
    create: (data) => API.post('/categories', data),
    update: (id, data) => API.put(`/categories/${id}`, data),
    delete: (id) => API.delete(`/categories/${id}`)
};

// Product APIs
export const productAPI = {
    getAll: (params = {}) => API.get('/products', { params }),
    getById: (id) => API.get(`/products/${id}`),
    create: (data) => API.post('/products', data),
    update: (id, data) => API.put(`/products/${id}`, data),
    delete: (id) => API.delete(`/products/${id}`)
};

// Search APIs
export const searchAPI = {
    quickSearch: (q) => API.get('/search', { params: { q } }),
    getFilters: (category) => API.get('/search/filters', { params: { category } }),
    searchProducts: (data) => API.post('/search/products', data)
};

export default API;
