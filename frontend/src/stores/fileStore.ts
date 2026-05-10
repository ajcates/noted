import { defineStore } from 'pinia';
import { filesApi, FileMetadata } from '@/api';

export const useFileStore = defineStore('file', {
  state: () => ({
    currentPath: '.' as string,
    files: [] as FileMetadata[],
    recentFiles: [] as FileMetadata[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchFiles(path: string = '.') {
      this.loading = true;
      this.error = null;
      try {
        const files = await filesApi.list(path);
        this.files = files;
        this.currentPath = path;
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch files';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async navigate(path: string) {
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
