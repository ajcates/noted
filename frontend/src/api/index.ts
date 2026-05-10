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
  status(): Promise<any> {
    return api.get('/status').then((res) => res.data);
  },
};

export default api;
