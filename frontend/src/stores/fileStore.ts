import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import { filesApi, FileMetadata } from '@/api';
import { db } from '@/utils/db';

export const useFileStore = defineStore('file', {
  state: () => ({
    currentPath: '.' as string,
    files: [] as FileMetadata[],
    recentFiles: [] as FileMetadata[],
    currentFile: null as FileMetadata | null,
    currentContent: '' as string,
    isEditing: false,
    readonly: false,
    authEnabled: false,
    loading: false,
    error: null as string | null,
    isOnline: navigator.onLine,
    conflict: null as { serverContent: string, localContent: string } | null,
  }),
  actions: {
    init() {
      // WebSocket setup
      const socket = io();
      socket.on('file-change', async (data: { event: string, path: string }) => {
        console.log('File change event:', data);
        
        // Refresh the file list if the change is in the current directory
        const parent = data.path.includes('/') ? data.path.substring(0, data.path.lastIndexOf('/')) : '.';
        if (parent === this.currentPath || data.path === this.currentPath) {
           this.fetchFiles(this.currentPath);
        }
        
        // If the currently open file changed on the server, we might have a conflict
        if (this.currentFile && data.path === this.currentFile.path && data.event === 'change') {
           const serverContent = await filesApi.read(data.path);
           if (serverContent !== this.currentContent) {
              this.conflict = {
                serverContent,
                localContent: this.currentContent
              };
           }
        }
      });

      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncPendingChanges();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
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
        this.isEditing = true;
        this.addToRecent(file);
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
      } catch (err: any) {
        this.error = err.message || 'Failed to save file';
      }
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
              const newPath = change.path.includes('/') 
                ? change.path.substring(0, change.path.lastIndexOf('/') + 1) + change.newName 
                : change.newName!;
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
    closeEditor() {
      this.isEditing = false;
      this.currentFile = null;
      this.currentContent = '';
    },
    async navigate(path: string) {
      this.isEditing = false;
      await this.fetchFiles(path);
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
  },
});
