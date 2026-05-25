import axios from 'axios';
const api = axios.create({
    baseURL: '/api',
});
// Add interceptor to include token in requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('noted_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// Handle 401 errors
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('noted_token');
        // We could use a global event bus or just reload to trigger the Login view
        if (!window.location.pathname.includes('/login')) { // Placeholder if we had routing
            // For now, since we use showLogin in App.vue, we just need the state to update.
            // A simple way is to reload or use a custom event.
            window.dispatchEvent(new CustomEvent('auth-error'));
        }
    }
    return Promise.reject(error);
});
export const filesApi = {
    list(path = '.') {
        return api.get('/files/list', { params: { path } }).then((res) => res.data);
    },
    read(path) {
        return api.get('/files/read', { params: { path } }).then((res) => res.data);
    },
    write(path, content) {
        return api.put('/files/write', { path, content }).then((res) => res.data);
    },
    create(path, type) {
        return api.post('/files/create', { path, type }).then((res) => res.data);
    },
    rename(oldPath, newPath) {
        return api.patch('/files/rename', { oldPath, newPath }).then((res) => res.data);
    },
    delete(path) {
        return api.delete('/files/delete', { data: { path } }).then((res) => res.data);
    },
    status() {
        return api.get('/status').then((res) => res.data);
    },
};
export const authApi = {
    login(password) {
        return api.post('/auth/login', { password }).then((res) => res.data);
    },
};
export const aiApi = {
    process(promptId, text) {
        return api.post('/ai/process', { promptId, text }).then((res) => res.data);
    },
};
export default api;
