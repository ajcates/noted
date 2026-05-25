import Dexie from 'dexie';
export class NotedDatabase extends Dexie {
    files;
    pendingChanges;
    constructor() {
        super('NotedDatabase');
        this.version(1).stores({
            files: 'path', // Primary key is path
            pendingChanges: '++id, path, type' // Primary key is auto-increment id
        });
    }
}
export const db = new NotedDatabase();
