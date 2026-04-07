import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});


API.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        return Promise.reject({ message, errors: error.response?.data?.errors });
    }
);

export const categoryAPI = {
    getAllCategories: () => API.get('/categories'),
    getCategoryById: (id) => API.get(`/categories/${id}`),
    createCategory: (data) => API.post('/categories', data),
    updateCategory: (id, data) => API.put(`/categories/${id}`, data),
    deleteCategory: (id) => API.delete(`/categories/${id}`)
};


export const productAPI = {
    getAllProducts: (params = {}) => API.get('/products', { params }),
    getProductById: (id) => API.get(`/products/${id}`),
    createProduct: (data) => API.post('/products', data),
    updateProduct: (id, data) => API.put(`/products/${id}`, data),
    deleteProduct: (id) => API.delete(`/products/${id}`)
};


export const searchAPI = {
    getFilters: (category) => API.get('/search/filters', { params: { category } }),
    searchProducts: (data) => API.post('/search/products', data)
};

export default API;
