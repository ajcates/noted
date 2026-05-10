import { defineStore } from 'pinia';
import { filesApi, FileMetadata } from '@/api';

export const useFileStore = defineStore('file', {
  state: () => ({
    currentPath: '.' as string,
    files: [] as FileMetadata[],
    recentFiles: [] as FileMetadata[],
    currentFile: null as FileMetadata | null,
    currentContent: '' as string,
    isEditing: false,
    readonly: false,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchStatus() {
      try {
        const status = await filesApi.status();
        this.readonly = status.config.readonly;
      } catch (err) {
        console.error('Failed to fetch status', err);
      }
    },
    async fetchFiles(path: string = '.') {
      this.loading = true;
      this.error = null;
      try {
        const files = await filesApi.list(path);
        this.files = files;
        this.currentPath = path;
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch files';
      } finally {
        this.loading = false;
      }
    },
    async openFile(file: FileMetadata) {
      this.loading = true;
      this.error = null;
      try {
        const content = await filesApi.read(file.path);
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
      try {
        await filesApi.write(this.currentFile.path, content);
        this.currentContent = content;
      } catch (err: any) {
        this.error = err.message || 'Failed to save file';
      }
    },
    async createFile(name: string, type: 'file' | 'directory') {
      const newPath = this.currentPath === '.' ? name : `${this.currentPath}/${name}`;
      try {
        await filesApi.create(newPath, type);
        await this.fetchFiles(this.currentPath);
      } catch (err: any) {
        this.error = err.message || 'Failed to create entry';
      }
    },
    async renameEntry(oldPath: string, newName: string) {
      const parentPath = oldPath.includes('/') ? oldPath.substring(0, oldPath.lastIndexOf('/')) : '';
      const newPath = parentPath ? `${parentPath}/${newName}` : newName;
      try {
        await filesApi.rename(oldPath, newPath);
        await this.fetchFiles(this.currentPath);
      } catch (err: any) {
        this.error = err.message || 'Failed to rename entry';
      }
    },
    async deleteEntry(path: string) {
      try {
        await filesApi.delete(path);
        await this.fetchFiles(this.currentPath);
      } catch (err: any) {
        this.error = err.message || 'Failed to delete entry';
      }
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
