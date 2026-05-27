import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFileStore } from './fileStore';
import { filesApi } from '@/api';

// Mock the API
vi.mock('@/api', () => ({
  filesApi: {
    list: vi.fn(),
    read: vi.fn(),
    status: vi.fn(),
  },
}));

// Mock IndexedDB (Dexie)
vi.mock('@/utils/db', () => ({
  db: {
    files: {
      toArray: vi.fn(() => Promise.resolve([])),
      get: vi.fn(),
      put: vi.fn(),
    },
    pendingChanges: {
      toArray: vi.fn(() => Promise.resolve([])),
      put: vi.fn(),
    },
  },
}));

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
  })),
}));

describe('fileStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    // Mock localStorage
    const storage: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => storage[key] || null),
      setItem: vi.fn((key, value) => { storage[key] = value; }),
      removeItem: vi.fn((key) => { delete storage[key]; }),
    });

    // Default navigator.onLine mock
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  it('initializes with default values', () => {
    const store = useFileStore();
    expect(store.currentPath).toBe('.');
    expect(store.files).toEqual([]);
    expect(store.loading).toBe(false);
  });

  it('fetchFiles updates files and currentPath on success', async () => {
    const mockFiles = [{ name: 'test.md', path: 'test.md', type: 'file' as const, size: 10, mtime: '2023-01-01' }];
    (filesApi.list as any).mockResolvedValue(mockFiles);
    
    const store = useFileStore();
    await store.fetchFiles('some/path');
    
    expect(store.files).toEqual(mockFiles);
    expect(store.currentPath).toBe('some/path');
    expect(filesApi.list).toHaveBeenCalledWith('some/path');
  });

  it('navigate calls fetchFiles and closes editor', async () => {
    const store = useFileStore();
    store.isEditing = true;
    
    // Spying on fetchFiles
    const fetchFilesSpy = vi.spyOn(store, 'fetchFiles').mockImplementation(() => Promise.resolve());
    
    await store.navigate('new/path');
    
    expect(store.isEditing).toBe(false);
    expect(fetchFilesSpy).toHaveBeenCalledWith('new/path');
  });

  it('sets error when fetchFiles fails', async () => {
    (filesApi.list as any).mockRejectedValue(new Error('Network Error'));
    
    const store = useFileStore();
    await store.fetchFiles('.');
    
    expect(store.error).toBe('Network Error');
    expect(store.loading).toBe(false);
  });

  describe('Sorting', () => {
    it('updates sortBy and sortDesc when setSort is called', () => {
      const store = useFileStore();
      
      // Default is name / false
      store.setSort('mtime');
      expect(store.sortBy).toBe('mtime');
      expect(store.sortDesc).toBe(true); // Default to descending for mtime
      
      store.setSort('mtime');
      expect(store.sortDesc).toBe(false); // Toggle
    });

    it('sortedFiles getter correctly sorts files', () => {
      const store = useFileStore();
      store.files = [
        { name: 'b.md', path: 'b.md', type: 'file', size: 20, mtime: '2023-01-02' },
        { name: 'a.md', path: 'a.md', type: 'file', size: 10, mtime: '2023-01-01' },
        { name: 'folder', path: 'folder', type: 'directory', size: 0, mtime: '2023-01-03' },
      ] as any;

      // Default: name / false (but directories first)
      expect(store.sortedFiles[0].name).toBe('folder');
      expect(store.sortedFiles[1].name).toBe('a.md');
      expect(store.sortedFiles[2].name).toBe('b.md');

      // Sort by size descending
      store.setSort('size'); 
      // size default is desc: true
      expect(store.sortedFiles[0].name).toBe('folder'); // Directory still first
      expect(store.sortedFiles[1].name).toBe('b.md'); // 20
      expect(store.sortedFiles[2].name).toBe('a.md'); // 10
    });
  });

  describe('Offline Support', () => {
    it('fetches from DB when offline', async () => {
      // Set offline
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      
      const { db } = await import('@/utils/db');
      const mockCachedFiles = [
        { name: 'cached.md', path: 'cached.md', type: 'file', size: 5, mtime: '2023-01-01' }
      ];
      (db.files.toArray as any).mockResolvedValue(mockCachedFiles);

      const store = useFileStore();
      store.isOnline = false;
      await store.fetchFiles('.');

      expect(store.files).toEqual(mockCachedFiles);
      expect(filesApi.list).not.toHaveBeenCalled();
    });
  });
});
