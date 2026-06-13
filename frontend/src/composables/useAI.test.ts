import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAI } from './useAI';
import { db } from '@/utils/db';

// Mock IndexedDB (Dexie)
vi.mock('@/utils/db', () => {
  let mockHistory: any[] = [];
  return {
    db: {
      aiHistory: {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            sortBy: vi.fn(() => Promise.resolve([...mockHistory])),
            delete: vi.fn(() => { mockHistory = []; return Promise.resolve(); })
          }))
        })),
        add: vi.fn((entry) => { mockHistory.push(entry); return Promise.resolve(mockHistory.length); }),
        toArray: vi.fn(() => Promise.resolve([...mockHistory])),
        clear: vi.fn(() => { mockHistory = []; return Promise.resolve(); })
      }
    }
  };
});

// Mock stores
vi.mock('@/stores/fileStore', () => ({
  useFileStore: () => ({
    fileList: [],
    files: [],
    isOnline: true
  })
}));

vi.mock('@/stores/settingsStore', () => ({
  useSettingsStore: () => ({
    aiInstructions: ''
  })
}));

// Mock API
vi.mock('@/api', () => ({
  aiApi: {
    streamProcess: vi.fn(() => Promise.resolve({ comment: 'Done', content: 'Updated' })),
  },
  filesApi: {
    read: vi.fn(),
  }
}));

describe('useAI history', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await db.aiHistory.clear();
  });

  it('saves and loads history for a specific file', async () => {
    const props = { selectedText: '', fullContent: 'Hello', filePath: 'test.md' };
    const ai = useAI(props);

    await ai.handleAIAction('clarify', 'Help me');
    
    // Check if it's in the log (User + Model)
    expect(ai.chatLog.value.length).toBe(2);
    
    // Clear local log and load back from DB
    ai.chatLog.value = [];
    // Manually trigger loadHistory since we aren't using onMounted
    const history = await db.aiHistory.where('filePath').equals('test.md').sortBy('timestamp');
    ai.chatLog.value = history;
    expect(ai.chatLog.value.length).toBe(2);
  });

  it('gets global history unique by file', async () => {
    await db.aiHistory.add({ filePath: 'a.md', role: 'user', content: 'hello', timestamp: 100 });
    await db.aiHistory.add({ filePath: 'b.md', role: 'user', content: 'foo', timestamp: 200 });

    const props = { selectedText: '', fullContent: '', filePath: 'a.md' };
    const ai = useAI(props);

    const global = await ai.getGlobalHistory() as any[];
    expect(global.length).toBe(2);
    // Sort by timestamp desc
    expect(global[0].filePath).toBe('b.md');
  });
});
