import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Editor from './Editor.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useFileStore } from '@/stores/fileStore';

// Mock the API
vi.mock('@/api', () => ({
  aiApi: { process: vi.fn() },
  filesApi: { read: vi.fn(), write: vi.fn() }
}));

describe('Editor.vue', () => {
  let teleportTarget: HTMLDivElement;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();

    // Create Teleport target
    teleportTarget = document.createElement('div');
    teleportTarget.id = 'top-bar-actions';
    document.body.appendChild(teleportTarget);

    // Mock localStorage
    const storage: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => storage[key] || null),
      setItem: vi.fn((key, value) => { storage[key] = value; }),
      removeItem: vi.fn((key) => { delete storage[key]; }),
    });
  });

  afterEach(() => {
    document.body.removeChild(teleportTarget);
    vi.useRealTimers();
  });

  it('renders initial content in textarea', () => {
    const store = useFileStore();
    store.currentContent = 'Initial content';
    store.currentFile = { name: 'test.md', path: 'test.md' } as any;

    const wrapper = mount(Editor);
    const textarea = wrapper.find('textarea');
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Initial content');
  });

  it('debounces saveFile when content changes', async () => {
    const store = useFileStore();
    store.currentContent = 'Initial content';
    store.currentFile = { name: 'test.md', path: 'test.md' } as any;
    
    const saveFileSpy = vi.spyOn(store, 'saveFile').mockImplementation(() => Promise.resolve());
    
    const wrapper = mount(Editor);
    const textarea = wrapper.find('textarea');
    
    await textarea.setValue('New content');
    
    // Should not be called immediately
    expect(saveFileSpy).not.toHaveBeenCalled();
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    expect(saveFileSpy).toHaveBeenCalledWith('New content');
  });

  it('calls AI API when run prompt is clicked', async () => {
    vi.useRealTimers();
    const { aiApi } = await import('@/api');
    (aiApi.process as any).mockResolvedValue({ result: 'AI Result' });

    const store = useFileStore();
    store.currentContent = 'Some text';
    store.currentFile = { name: 'test.md', path: 'test.md' } as any;

    const wrapper = mount(Editor);
    
    // Find the AI run button (it's in the Teleport, so we need to find it in document.body or mock Teleport)
    // Actually, Vue Test Utils can handle Teleport if we don't mock it and the target exists.
    const aiBtn = document.body.querySelector('mdui-button-icon[tooltip="Run AI Prompt"]');
    (aiBtn as any)?.click();

    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(aiApi.process).toHaveBeenCalled();
  });
});
