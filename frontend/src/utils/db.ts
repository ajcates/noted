import Dexie, { Table } from 'dexie';

export interface CachedFile {
  path: string;
  name: string;
  content: string;
  type: 'file' | 'directory';
  mtime: string;
  size: number;
}

export interface PendingChange {
  id?: number;
  path: string;
  type: 'write' | 'create' | 'rename' | 'delete';
  content?: string;
  newName?: string; // For rename
  entryType?: 'file' | 'directory'; // For create
  timestamp: number;
}

export class NotedDatabase extends Dexie {
  files!: Table<CachedFile>;
  pendingChanges!: Table<PendingChange>;

  constructor() {
    super('NotedDatabase');
    this.version(1).stores({
      files: 'path', // Primary key is path
      pendingChanges: '++id, path, type' // Primary key is auto-increment id
    });
  }
}

export const db = new NotedDatabase();
