import { defineStore } from 'pinia';
import { authApi } from '@/api';
export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('noted_token') || null,
        isAuthenticated: !!localStorage.getItem('noted_token'),
        error: null,
        loading: false,
    }),
    actions: {
        async login(password) {
            this.loading = true;
            this.error = null;
            try {
                const { token } = await authApi.login(password);
                this.token = token;
                this.isAuthenticated = true;
                localStorage.setItem('noted_token', token);
                return true;
            }
            catch (err) {
                this.error = err.response?.data?.error || 'Login failed';
                return false;
            }
            finally {
                this.loading = false;
            }
        },
        logout() {
            this.token = null;
            this.isAuthenticated = false;
            localStorage.removeItem('noted_token');
        },
        handleAuthError() {
            this.logout();
        }
    },
});
