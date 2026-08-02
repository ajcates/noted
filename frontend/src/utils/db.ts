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
  newPath?: string; // Full destination path for moves
  entryType?: 'file' | 'directory'; // For create
  timestamp: number;
}

export interface FileVersion {
  id?: number;
  path: string;
  content: string;
  timestamp: number;
}

export interface AIChatMessage {
  id?: number;
  filePath: string;
  role: 'user' | 'model';
  content: string;
  promptId?: string;
  updatedContent?: string | null;
  questions?: { question: string, options: string[] }[];
  timestamp: number;
}

export class NotedDatabase extends Dexie {
  files!: Table<CachedFile>;
  pendingChanges!: Table<PendingChange>;
  versions!: Table<FileVersion>;
  aiHistory!: Table<AIChatMessage>;

  constructor() {
    super('NotedDatabase');
    this.version(3).stores({
      files: 'path',
      pendingChanges: '++id, path, type',
      versions: '++id, path, timestamp',
      aiHistory: '++id, filePath, timestamp'
    });
  }
}

export const db = new NotedDatabase();
