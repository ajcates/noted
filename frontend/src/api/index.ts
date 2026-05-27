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
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
  }
);

export interface FileMetadata {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  mtime: string;
}

export const filesApi = {
  list(path: string = '.'): Promise<FileMetadata[]> {
    return api.get('/files/list', { params: { path } }).then((res) => res.data);
  },
  read(path: string): Promise<string> {
    return api.get('/files/read', { params: { path } }).then((res) => res.data);
  },
  write(path: string, content: string): Promise<any> {
    return api.put('/files/write', { path, content }).then((res) => res.data);
  },
  create(path: string, type: 'file' | 'directory'): Promise<any> {
    return api.post('/files/create', { path, type }).then((res) => res.data);
  },
  rename(oldPath: string, newPath: string): Promise<any> {
    return api.patch('/files/rename', { oldPath, newPath }).then((res) => res.data);
  },
  delete(path: string): Promise<any> {
    return api.delete('/files/delete', { data: { path } }).then((res) => res.data);
  },
  status(): Promise<any> {
    return api.get('/status').then((res) => res.data);
  },
};

export const authApi = {
  login(password: string): Promise<{ token: string }> {
    return api.post('/auth/login', { password }).then((res) => res.data);
  },
};

export interface AIResponse {
  comment: string;
  content: string | null;
  questions?: {
    question: string;
    options: string[];
  }[];
}

export const aiApi = {
  process(promptId: string, fullContent: string, selection?: string, history: any[] = []): Promise<AIResponse> {
    return api.post('/ai/process', { promptId, fullContent, selection, history }).then((res) => res.data);
  },
};

export default api;
