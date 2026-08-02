import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { settingsApi } from '@/api';
import { useSettingsStore } from './settingsStore';

vi.mock('@/api', () => ({
  settingsApi: {
    get: vi.fn(),
    save: vi.fn(),
  },
}));

describe('settingsStore', () => {
  beforeEach(() => {
    const storage: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => storage[key] || null),
      setItem: vi.fn((key, value) => { storage[key] = String(value); }),
      removeItem: vi.fn((key) => { delete storage[key]; }),
    });
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('loads persisted editor settings from the server', async () => {
    vi.mocked(settingsApi.get).mockResolvedValue({
      editorFontSize: 18,
      wordWrap: false,
    });
    const store = useSettingsStore();

    await store.loadSettings();

    expect(store.editorFontSize).toBe(18);
    expect(store.wordWrap).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('editor_font_size', '18');
    expect(localStorage.setItem).toHaveBeenCalledWith('editor_word_wrap', 'false');
  });

  it('uses editor-friendly defaults when no settings have been saved', () => {
    const store = useSettingsStore();

    expect(store.editorFontSize).toBe(15);
    expect(store.wordWrap).toBe(true);
  });

  it('clamps font size and persists both editor settings', async () => {
    vi.mocked(settingsApi.save).mockResolvedValue({});
    const store = useSettingsStore();

    await store.setEditorFontSize(99);
    await store.setWordWrap(false);

    expect(store.editorFontSize).toBe(24);
    expect(store.wordWrap).toBe(false);
    expect(settingsApi.save).toHaveBeenLastCalledWith(expect.objectContaining({
      editorFontSize: 24,
      wordWrap: false,
    }));
  });
});
