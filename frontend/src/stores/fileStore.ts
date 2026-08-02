import { defineStore } from 'pinia';
import { markRaw } from 'vue';
import { io, Socket } from 'socket.io-client';
import { filesApi, FileMetadata, SearchResult } from '@/api';
import { db } from '@/utils/db';

type SortBy = 'name' | 'mtime' | 'size';
type FileChange = { event: string; path: string };

const parentPath = (filePath: string) => {
  const slashIndex = filePath.lastIndexOf('/');
  return slashIndex === -1 ? '.' : filePath.slice(0, slashIndex);
};

const isPathOrDescendant = (candidate: string, directory: string) =>
  candidate === directory || candidate.startsWith(`${directory}/`);

export const useFileStore = defineStore('file', {
  state: () => ({
    currentPath: '.' as string,
    files: [] as FileMetadata[],
    sortBy: (localStorage.getItem('sortBy') || 'name') as SortBy,
    sortDesc: localStorage.getItem('sortDesc') === 'true',
    recentFiles: [] as FileMetadata[],
    currentFile: null as FileMetadata | null,
    currentContent: '' as string,
    lastPersistedContent: '' as string,
    isEditing: false,
    readonly: false,
    authEnabled: false,
    loading: false,
    error: null as string | null,
    isOnline: navigator.onLine,
    conflict: null as { serverContent: string, localContent: string } | null,
    searchResults: [] as SearchResult[],
    isSearching: false,
    socket: null as Socket | null,
    onlineHandler: null as (() => void) | null,
    offlineHandler: null as (() => void) | null,
  }),
  getters: {
    sortedFiles(state) {
      try {
        return [...state.files].sort((a, b) => {
          // 1. Directories always first
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }

          let comparison = 0;
          if (state.sortBy === 'name') {
            comparison = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
          } else if (state.sortBy === 'mtime') {
            const timeA = a.mtime ? new Date(a.mtime).getTime() : 0;
            const timeB = b.mtime ? new Date(b.mtime).getTime() : 0;
            comparison = (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
          } else if (state.sortBy === 'size') {
            comparison = (a.size || 0) - (b.size || 0);
          }

          // 2. Secondary sort by name (A-Z) for stability if primary comparison is equal or NaN
          if ((comparison === 0 || isNaN(comparison)) && state.sortBy !== 'name') {
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
          }

          if (isNaN(comparison)) comparison = 0;

          return state.sortDesc ? -comparison : comparison;
        });
      } catch (err) {
        console.error('Error in sortedFiles getter:', err);
        return state.files;
      }
    },
    fileList(state): string[] {
      return state.files.map(f => f.name);
    }
  },
  actions: {
    init() {
      if (!this.socket) {
        this.socket = markRaw(io());
        this.socket.on('file-change', (data: FileChange) => {
          void this.handleFileChange(data);
        });
      }

      if (!this.onlineHandler) {
        this.onlineHandler = () => {
          this.isOnline = true;
          void this.syncPendingChanges();
        };
        window.addEventListener('online', this.onlineHandler);
      }
      if (!this.offlineHandler) {
        this.offlineHandler = () => {
          this.isOnline = false;
        };
        window.addEventListener('offline', this.offlineHandler);
      }
    },
    dispose() {
      if (this.onlineHandler) {
        window.removeEventListener('online', this.onlineHandler);
        this.onlineHandler = null;
      }
      if (this.offlineHandler) {
        window.removeEventListener('offline', this.offlineHandler);
        this.offlineHandler = null;
      }
      if (this.socket) {
        this.socket.off('file-change');
        this.socket.disconnect();
        this.socket = null;
      }
    },
    async handleFileChange(data: FileChange) {
      const changedPath = data.path.replace(/\\/g, '/');
      const changedParent = parentPath(changedPath);
      const openFile = this.currentFile;
      const openFileRemoved = openFile && data.event.startsWith('unlink') &&
        isPathOrDescendant(openFile.path, changedPath);
      const currentDirectoryRemoved = data.event === 'unlinkDir' &&
        isPathOrDescendant(this.currentPath, changedPath);

      if (openFileRemoved || currentDirectoryRemoved) {
        const fallbackPath = currentDirectoryRemoved ? parentPath(changedPath) : this.currentPath;
        this.closeEditor();
        this.error = 'The open file was removed or moved outside the current directory.';
        await this.fetchFiles(fallbackPath);
        return;
      }

      if (changedParent === this.currentPath || changedPath === this.currentPath) {
        await this.fetchFiles(this.currentPath);
      }

      if (!openFile || changedPath !== openFile.path || data.event !== 'change') return;

      try {
        const serverContent = await filesApi.read(changedPath);
        if (serverContent === this.currentContent) {
          this.lastPersistedContent = serverContent;
          return;
        }

        if (this.currentContent === this.lastPersistedContent) {
          this.currentContent = serverContent;
          this.lastPersistedContent = serverContent;
          await db.files.put({ ...openFile, content: serverContent });
        } else {
          this.conflict = {
            serverContent,
            localContent: this.currentContent
          };
        }
      } catch (err: any) {
        this.error = err.message || 'Failed to refresh the externally changed file';
      }
    },
    async fetchStatus() {
      try {
        const status = await filesApi.status();
        this.readonly = status.config.readonly;
        this.authEnabled = status.config.authEnabled;
      } catch (err) {
        console.error('Failed to fetch status', err);
      }
    },
    async fetchFiles(path: string = '.') {
      this.loading = true;
      this.error = null;
      try {
        let files: FileMetadata[];
        if (this.isOnline) {
          files = await filesApi.list(path);
          // Cache file metadata (minimal version for browser)
          // We'll fetch full content for all files as requested in preference 1
          this.cacheAllFiles(files);
        } else {
          // Filter cached files by path prefix
          const allCached = await db.files.toArray();
          files = allCached
            .filter(f => {
              const parent = f.path.includes('/') ? f.path.substring(0, f.path.lastIndexOf('/')) : '.';
              return (path === '.' && !f.path.includes('/')) || parent === path;
            })
            .map(f => ({
              name: f.name,
              path: f.path,
              type: f.type,
              size: f.size,
              mtime: f.mtime
            }));
        }
        this.files = files;
        this.currentPath = path;
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch files';
      } finally {
        this.loading = false;
      }
    },
    async cacheAllFiles(files: FileMetadata[]) {
      const cachedFiles = await db.files.toArray();
      const cacheMap = new Map(cachedFiles.map(f => [f.path, f]));

      for (const file of files) {
        if (file.type === 'file') {
          const cached = cacheMap.get(file.path);
          // Only fetch if not cached or server version is newer
          if (!cached || cached.mtime !== file.mtime || cached.size !== file.size) {
            try {
              const content = await filesApi.read(file.path);
              await db.files.put({
                ...file,
                content
              });
            } catch (e) {
              console.error(`Failed to cache ${file.path}`, e);
            }
          }
        } else if (file.type === 'directory') {
          // Cache directory metadata even if it has no content
          await db.files.put({
            ...file,
            content: '' // Directories have no content but need to be in the DB to show up in the list
          });
        }
      }
      
      // Cleanup: remove cached files that no longer exist on server in this directory
      // (This is a simple version, ideally we'd do a full sync check)
    },
    async openFile(file: FileMetadata) {
      this.loading = true;
      this.error = null;
      try {
        let content: string;
        if (this.isOnline) {
          content = await filesApi.read(file.path);
          // Update cache
          await db.files.put({ ...file, content });
        } else {
          const cached = await db.files.get(file.path);
          content = cached ? cached.content : '';
          if (!cached) this.error = 'File not available offline';
        }
        
        this.currentFile = file;
        this.currentContent = content;
        this.lastPersistedContent = content;
        this.isEditing = true;
        this.addToRecent(file);
        this.syncUrl();
      } catch (err: any) {
        this.error = err.message || 'Failed to read file';
      } finally {
        this.loading = false;
      }
    },
    async saveFile(content: string) {
      if (!this.currentFile || this.readonly) return;
      
      const path = this.currentFile.path;
      
      try {
        // Optimistic update local cache
        await db.files.where('path').equals(path).modify({ content });
        this.currentContent = content;

        // Save a version snapshot
        await this.saveVersion(path, content);

        if (this.isOnline) {
          await filesApi.write(path, content);
        } else {
          await db.pendingChanges.put({
            path,
            type: 'write',
            content,
            timestamp: Date.now()
          });
        }
        this.lastPersistedContent = content;
      } catch (err: any) {
        this.error = err.message || 'Failed to save file';
      }
    },
    async saveFileAs(name: string, content: string): Promise<boolean> {
      if (!this.currentFile || this.readonly) return false;

      const newName = name.trim();
      if (!newName || newName === '.' || newName === '..' || /[\\/]/.test(newName)) {
        this.error = 'Enter a valid file name without folders.';
        return false;
      }

      const directory = parentPath(this.currentFile.path);
      const newPath = directory === '.' ? newName : `${directory}/${newName}`;
      if (newPath === this.currentFile.path) {
        this.error = 'Choose a different file name.';
        return false;
      }

      const newFile: FileMetadata = {
        name: newName,
        path: newPath,
        type: 'file',
        size: new Blob([content]).size,
        mtime: new Date().toISOString(),
      };

      let createdOnline = false;
      try {
        if (this.isOnline) {
          await filesApi.create(newPath, 'file');
          createdOnline = true;
          try {
            await filesApi.write(newPath, content);
          } catch (error) {
            await filesApi.delete(newPath).catch(() => undefined);
            throw error;
          }
        } else {
          if (await db.files.get(newPath)) {
            throw new Error('A file with that name already exists.');
          }
          await db.files.put({ ...newFile, content });
          await db.pendingChanges.put({
            path: newPath,
            type: 'create',
            entryType: 'file',
            timestamp: Date.now()
          });
          await db.pendingChanges.put({
            path: newPath,
            type: 'write',
            content,
            timestamp: Date.now()
          });
        }

        await this.fetchFiles(directory);
        const listedFile = this.files.find(file => file.path === newPath);
        await this.openFile(listedFile || newFile);
        return true;
      } catch (err: any) {
        if (createdOnline) {
          await this.fetchFiles(directory);
        }
        this.error = err.response?.data?.message || err.message || 'Failed to save file as';
        return false;
      }
    },
    updateDraft(content: string) {
      this.currentContent = content;
    },
    async createFile(name: string, type: 'file' | 'directory') {
      const newPath = this.currentPath === '.' ? name : `${this.currentPath}/${name}`;
      try {
        if (this.isOnline) {
          await filesApi.create(newPath, type);
        } else {
          await db.pendingChanges.put({
            path: newPath,
            type: 'create',
            entryType: type,
            timestamp: Date.now()
          });
          // Optimistic local cache for new file
          if (type === 'file') {
            await db.files.put({
              path: newPath,
              name,
              type,
              content: '',
              mtime: new Date().toISOString(),
              size: 0
            });
          }
        }
        await this.fetchFiles(this.currentPath);
      } catch (err: any) {
        this.error = err.message || 'Failed to create entry';
      }
    },
    async renameEntry(oldPath: string, newName: string) {
      const parentPath = oldPath.includes('/') ? oldPath.substring(0, oldPath.lastIndexOf('/')) : '';
      const newPath = parentPath ? `${parentPath}/${newName}` : newName;
      try {
        if (this.isOnline) {
          await filesApi.rename(oldPath, newPath);
        } else {
          await db.pendingChanges.put({
            path: oldPath,
            type: 'rename',
            newName,
            timestamp: Date.now()
          });
          // Local cache update
          const cached = await db.files.get(oldPath);
          if (cached) {
            await db.files.delete(oldPath);
            await db.files.put({ ...cached, path: newPath, name: newName });
          }
        }
        await this.fetchFiles(this.currentPath);
      } catch (err: any) {
        this.error = err.message || 'Failed to rename entry';
      }
    },
    async moveEntry(
      entry: FileMetadata,
      destinationDirectory: string,
      destinationName = entry.name
    ): Promise<'moved' | 'conflict' | 'failed'> {
      const sourceDirectory = parentPath(entry.path);
      const destination = destinationDirectory || '.';
      const newName = destinationName.trim();
      if (!newName || newName === '.' || newName === '..' || /[\\/]/.test(newName)) {
        this.error = 'Enter a valid name without folders.';
        return 'failed';
      }
      const newPath = destination === '.' ? newName : `${destination}/${newName}`;

      if (sourceDirectory === destination && newName === entry.name) {
        this.error = `${entry.name} is already in this directory.`;
        return 'failed';
      }
      if (
        entry.type === 'directory' &&
        (destination === entry.path || destination.startsWith(`${entry.path}/`))
      ) {
        this.error = 'A folder cannot be moved inside itself.';
        return 'failed';
      }

      try {
        if (this.isOnline) {
          await filesApi.rename(entry.path, newPath);
        } else {
          const cachedFiles = await db.files.toArray();
          if (cachedFiles.some(file => file.path === newPath)) {
            this.error = 'A file or folder with that name already exists here.';
            return 'conflict';
          }

          const affectedFiles = cachedFiles.filter(file =>
            file.path === entry.path || file.path.startsWith(`${entry.path}/`)
          );
          await db.pendingChanges.put({
            path: entry.path,
            type: 'rename',
            newPath,
            timestamp: Date.now()
          });

          for (const cached of affectedFiles) {
            const movedPath = `${newPath}${cached.path.slice(entry.path.length)}`;
            await db.files.delete(cached.path);
            await db.files.put({
              ...cached,
              path: movedPath,
              name: cached.path === entry.path ? newName : cached.name
            });
          }
        }

        await this.fetchFiles(destination);
        return 'moved';
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message || 'Failed to move entry';
        await this.fetchFiles(destination);
        return err.response?.status === 409 ? 'conflict' : 'failed';
      }
    },
    async deleteEntry(path: string) {
      try {
        if (this.isOnline) {
          await filesApi.delete(path);
        } else {
          await db.pendingChanges.put({
            path,
            type: 'delete',
            timestamp: Date.now()
          });
          await db.files.delete(path);
        }
        await this.fetchFiles(this.currentPath);
      } catch (err: any) {
        this.error = err.message || 'Failed to delete entry';
        await this.fetchFiles(this.currentPath);
      }
    },
    async searchFiles(query: string) {
      if (!query.trim()) {
        this.searchResults = [];
        return;
      }
      this.isSearching = true;
      try {
        this.searchResults = await filesApi.search(query);
      } catch (err: any) {
        this.error = err.message || 'Search failed';
      } finally {
        this.isSearching = false;
      }
    },
    async syncPendingChanges() {
      const changes = await db.pendingChanges.toArray();
      if (changes.length === 0) return;

      for (const change of changes) {
        try {
          switch (change.type) {
            case 'write':
              await filesApi.write(change.path, change.content!);
              break;
            case 'create':
              await filesApi.create(change.path, change.entryType!);
              break;
            case 'rename':
              const newPath = change.newPath || (change.path.includes('/')
                ? change.path.substring(0, change.path.lastIndexOf('/') + 1) + change.newName
                : change.newName!);
              await filesApi.rename(change.path, newPath);
              break;
            case 'delete':
              await filesApi.delete(change.path);
              break;
          }
          await db.pendingChanges.delete(change.id!);
        } catch (e: any) {
          console.error(`Sync failed for ${change.path}`, e);
          // If conflict (e.g. 409 or similar, though not explicitly handled by backend yet)
          // we should notify user. For now, we assume simple overwrite.
          this.error = `Sync conflict for ${change.path}. Using local version.`;
        }
      }
      await this.fetchFiles(this.currentPath);
    },
    // Optimistic delete with undo support (modified for offline)
    async deleteEntryWithUndo(file: FileMetadata) {
      const originalFiles = [...this.files];
      this.files = this.files.filter(f => f.path !== file.path);
      
      return new Promise<boolean>((resolve) => {
        const timeout = setTimeout(async () => {
          try {
            await this.deleteEntry(file.path);
            resolve(true);
          } catch (err: any) {
            this.error = err.message || 'Failed to delete entry';
            this.files = originalFiles;
            resolve(false);
          }
        }, 5000);

        (this as any)._cancelDelete = () => {
          clearTimeout(timeout);
          this.files = originalFiles;
          resolve(false);
        };
      });
    },
    async deleteEntriesWithUndo(files: FileMetadata[]) {
      if (files.length === 0) return false;

      const originalFiles = [...this.files];
      const paths = new Set(files.map(file => file.path));
      this.files = this.files.filter(file => !paths.has(file.path));

      return new Promise<boolean>((resolve) => {
        const timeout = setTimeout(async () => {
          try {
            for (const file of files) {
              await this.deleteEntry(file.path);
            }
            resolve(true);
          } catch (err: any) {
            this.error = err.message || 'Failed to delete selected entries';
            this.files = originalFiles;
            resolve(false);
          }
        }, 5000);

        (this as any)._cancelDelete = () => {
          clearTimeout(timeout);
          this.files = originalFiles;
          resolve(false);
        };
      });
    },
    cancelDelete() {
      if ((this as any)._cancelDelete) {
        (this as any)._cancelDelete();
        (this as any)._cancelDelete = null;
      }
    },
    async resolveConflict(resolvedContent: string) {
      this.conflict = null;
      await this.saveFile(resolvedContent);
    },
    async saveVersion(path: string, content: string) {
      // Avoid saving identical consecutive versions
      const lastVersion = await db.versions.where('path').equals(path).sortBy('timestamp').then(v => v[v.length - 1]);
      if (lastVersion && lastVersion.content === content) return;

      await db.versions.add({
        path,
        content,
        timestamp: Date.now()
      });

      // Cleanup old versions (keep last 50)
      const count = await db.versions.where('path').equals(path).count();
      if (count > 50) {
        const oldest = await db.versions.where('path').equals(path).limit(count - 50).toArray();
        await db.versions.bulkDelete(oldest.map(v => v.id!));
      }
    },
    async getVersions(path: string) {
      return db.versions.where('path').equals(path).reverse().sortBy('timestamp');
    },
    closeEditor() {
      this.isEditing = false;
      this.currentFile = null;
      this.currentContent = '';
      this.lastPersistedContent = '';
      this.syncUrl();
    },
    async navigate(path: string) {
      this.isEditing = false;
      await this.fetchFiles(path);
      this.syncUrl();
    },
    syncUrl() {
      let path = '/';
      if (this.isEditing && this.currentFile) {
        path = '/' + this.currentFile.path;
      } else if (this.currentPath !== '.') {
        path = '/' + this.currentPath + '/';
      }
      
      if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
    },
    async handleUrl() {
      const path = window.location.pathname.substring(1); // Remove leading slash
      if (!path || path === '') {
        await this.fetchFiles('.');
        return;
      }

      if (path.endsWith('.md')) {
        // It's a file
        const segments = path.split('/');
        const name = segments[segments.length - 1];
        const dir = segments.slice(0, -1).join('/') || '.';
        
        // Ensure we have the file list for the parent directory
        await this.fetchFiles(dir);
        
        // Try to find the file in the list
        const file = this.files.find(f => f.path === path);
        if (file) {
          await this.openFile(file);
        } else {
          // If not found (maybe first load), create a dummy metadata and try to open
          await this.openFile({
            name,
            path,
            type: 'file',
            size: 0,
            mtime: new Date().toISOString()
          });
        }
      } else {
        // It's a directory
        const dirPath = path.endsWith('/') ? path.slice(0, -1) : path;
        await this.fetchFiles(dirPath);
      }
    },
    addToRecent(file: FileMetadata) {
      const exists = this.recentFiles.find((f: FileMetadata) => f.path === file.path);
      if (!exists) {
        this.recentFiles.unshift(file);
        if (this.recentFiles.length > 10) {
          this.recentFiles.pop();
        }
      }
    },
    setSort(by: SortBy) {
      if (this.sortBy === by) {
        this.sortDesc = !this.sortDesc;
      } else {
        this.sortBy = by;
        // Default to descending (newest first / largest first) for mtime and size
        this.sortDesc = (by === 'mtime' || by === 'size');
      }
      localStorage.setItem('sortBy', this.sortBy);
      localStorage.setItem('sortDesc', String(this.sortDesc));
    },
  },
});
