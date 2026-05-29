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

export interface SearchResult {
  path: string;
  name: string;
  snippet: string;
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
  search(query: string): Promise<SearchResult[]> {
    return api.get('/files/search', { params: { q: query } }).then((res) => res.data);
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
  process(promptId: string, fullContent: string, selection?: string, history: any[] = [], fileList: string[] = [], customInstructions?: string): Promise<AIResponse> {
    return api.post('/ai/process', { promptId, fullContent, selection, history, fileList, customInstructions }).then((res) => res.data);
  },
  async streamProcess(
    promptId: string, 
    fullContent: string, 
    selection: string | undefined, 
    history: any[], 
    fileList: string[], 
    customInstructions: string | undefined,
    onChunk: (text: string) => void
  ): Promise<AIResponse> {
    const token = localStorage.getItem('noted_token');
    const response = await fetch('/api/ai/process-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ promptId, fullContent, selection, history, fileList, customInstructions }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No readable stream');

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.text) {
              fullText += data.text;
              onChunk(fullText);
            } else if (data.error) {
              throw new Error(data.error);
            }
          } catch (e) {
            // Partial JSON or other noise
          }
        }
      }
    }

    try {
      const firstBrace = fullText.indexOf('{');
      const lastBrace = fullText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
        const jsonStr = fullText.substring(firstBrace, lastBrace + 1);
        return JSON.parse(jsonStr);
      }
      return JSON.parse(fullText);
    } catch (e) {
      console.warn('Failed to parse full AI response, attempting partial extraction:', e);
      
      // Fallback: Manually extract fields using regex if JSON is truncated
      const result: AIResponse = { comment: '', content: null, questions: [] };
      
      const commentMatch = fullText.match(/"comment":\s*"((?:[^"\\]|\\.)*)/);
      if (commentMatch) {
        result.comment = commentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      } else {
        // If no comment field found, just use the raw text minus code blocks
        result.comment = fullText.replace(/```json/gi, '').replace(/```/g, '').trim();
      }

      const contentMatch = fullText.match(/"content":\s*"((?:[^"\\]|\\.)*)/);
      if (contentMatch) {
        const extractedContent = contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        result.content = extractedContent || null;
      }

      return result;
    }
  }
};

export default api;
