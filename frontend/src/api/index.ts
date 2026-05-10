import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

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

export default api;
