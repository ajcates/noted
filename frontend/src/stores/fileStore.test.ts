import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFileStore } from './fileStore';
import { filesApi } from '@/api';

// Mock the API
vi.mock('@/api', () => ({
  filesApi: {
    list: vi.fn(),
    read: vi.fn(),
    write: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    rename: vi.fn(),
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
      delete: vi.fn(),
      where: vi.fn(() => ({ equals: vi.fn(() => ({ modify: vi.fn() })) })),
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
    off: vi.fn(),
    disconnect: vi.fn(),
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

  it('does not duplicate listeners and disposes its socket', async () => {
    const { io } = await import('socket.io-client');
    const store = useFileStore();

    store.init();
    store.init();
    expect(io).toHaveBeenCalledTimes(1);

    const socket = (io as any).mock.results[0].value;
    store.dispose();
    expect(socket.off).toHaveBeenCalledWith('file-change');
    expect(socket.disconnect).toHaveBeenCalledOnce();
    expect(store.socket).toBeNull();
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

  it('saves a copy beside the current file and opens it', async () => {
    const store = useFileStore();
    store.currentFile = {
      name: 'original.md',
      path: 'notes/original.md',
      type: 'file',
      size: 8,
      mtime: '2023-01-01'
    };
    store.currentContent = 'A copied note';
    const copiedFile = {
      name: 'original copy.md',
      path: 'notes/original copy.md',
      type: 'file' as const,
      size: 13,
      mtime: '2023-01-02'
    };
    const fetchFiles = vi.spyOn(store, 'fetchFiles').mockImplementation(async (path) => {
      store.currentPath = path ?? '.';
      store.files = [copiedFile];
    });
    const openFile = vi.spyOn(store, 'openFile').mockResolvedValue();

    const saved = await store.saveFileAs('original copy.md', 'A copied note');

    expect(saved).toBe(true);
    expect(filesApi.create).toHaveBeenCalledWith('notes/original copy.md', 'file');
    expect(filesApi.write).toHaveBeenCalledWith('notes/original copy.md', 'A copied note');
    expect(fetchFiles).toHaveBeenCalledWith('notes');
    expect(openFile).toHaveBeenCalledWith(copiedFile);
  });

  it('moves an entry into the selected destination directory', async () => {
    const store = useFileStore();
    const entry = {
      name: 'note.md',
      path: 'notes/note.md',
      type: 'file' as const,
      size: 12,
      mtime: '2023-01-01'
    };
    const fetchFiles = vi.spyOn(store, 'fetchFiles').mockResolvedValue();

    const moved = await store.moveEntry(entry, 'archive');

    expect(moved).toBe('moved');
    expect(filesApi.rename).toHaveBeenCalledWith('notes/note.md', 'archive/note.md');
    expect(fetchFiles).toHaveBeenCalledWith('archive');
  });

  it('refuses to move a directory inside itself', async () => {
    const store = useFileStore();
    const entry = {
      name: 'notes',
      path: 'notes',
      type: 'directory' as const,
      size: 0,
      mtime: '2023-01-01'
    };

    const moved = await store.moveEntry(entry, 'notes/archive');

    expect(moved).toBe('failed');
    expect(filesApi.rename).not.toHaveBeenCalled();
    expect(store.error).toBe('A folder cannot be moved inside itself.');
  });

  it('optimistically removes multiple entries and restores them when bulk delete is undone', async () => {
    const store = useFileStore();
    const entries = [
      { name: 'one.md', path: 'one.md', type: 'file' as const, size: 1, mtime: '2023-01-01' },
      { name: 'two.md', path: 'two.md', type: 'file' as const, size: 1, mtime: '2023-01-01' }
    ];
    store.files = [...entries];

    const deletion = store.deleteEntriesWithUndo(entries);
    expect(store.files).toEqual([]);

    store.cancelDelete();

    await expect(deletion).resolves.toBe(false);
    expect(store.files).toEqual(entries);
  });

  it('moves an entry under an alternate name after a destination conflict', async () => {
    const store = useFileStore();
    const entry = {
      name: 'note.md',
      path: 'notes/note.md',
      type: 'file' as const,
      size: 12,
      mtime: '2023-01-01'
    };
    vi.spyOn(store, 'fetchFiles').mockResolvedValue();

    const moved = await store.moveEntry(entry, 'archive', 'note copy.md');

    expect(moved).toBe('moved');
    expect(filesApi.rename).toHaveBeenCalledWith('notes/note.md', 'archive/note copy.md');
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

  describe('external file changes', () => {
    const openFile = { name: 'note.md', path: 'note.md', type: 'file' as const, size: 4, mtime: '2023-01-01' };

    it('refreshes the current directory when an entry is added, moved, or removed', async () => {
      const store = useFileStore();
      store.currentPath = 'notes';
      const fetchFiles = vi.spyOn(store, 'fetchFiles').mockResolvedValue();

      await store.handleFileChange({ event: 'add', path: 'notes/new.md' });
      await store.handleFileChange({ event: 'unlink', path: 'notes/old.md' });

      expect(fetchFiles).toHaveBeenCalledTimes(2);
      expect(fetchFiles).toHaveBeenCalledWith('notes');
    });

    it('updates a clean editor from an external write', async () => {
      const store = useFileStore();
      store.currentFile = openFile;
      store.currentContent = 'saved copy';
      store.lastPersistedContent = 'saved copy';
      (filesApi.read as any).mockResolvedValue('changed outside noted');

      await store.handleFileChange({ event: 'change', path: 'note.md' });

      expect(store.currentContent).toBe('changed outside noted');
      expect(store.lastPersistedContent).toBe('changed outside noted');
      expect(store.conflict).toBeNull();
    });

    it('keeps a local draft and opens a conflict for an external write', async () => {
      const store = useFileStore();
      store.currentFile = openFile;
      store.currentContent = 'unsaved local draft';
      store.lastPersistedContent = 'saved copy';
      (filesApi.read as any).mockResolvedValue('changed outside noted');

      await store.handleFileChange({ event: 'change', path: 'note.md' });

      expect(store.currentContent).toBe('unsaved local draft');
      expect(store.conflict).toEqual({
        localContent: 'unsaved local draft',
        serverContent: 'changed outside noted',
      });
    });

    it('returns to the listing when the open file is deleted or moved', async () => {
      const store = useFileStore();
      store.currentPath = 'notes';
      store.currentFile = { ...openFile, path: 'notes/note.md' };
      store.currentContent = 'saved copy';
      store.isEditing = true;
      const fetchFiles = vi.spyOn(store, 'fetchFiles').mockResolvedValue();

      await store.handleFileChange({ event: 'unlink', path: 'notes/note.md' });

      expect(store.isEditing).toBe(false);
      expect(store.currentFile).toBeNull();
      expect(fetchFiles).toHaveBeenCalledWith('notes');
    });
  });
});
