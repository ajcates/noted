import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Editor from './Editor.vue';
import { createPinia, setActivePinia } from 'pinia';
import { db } from '@/utils/db';
import { useFileStore } from '@/stores/fileStore';
import { useSettingsStore } from '@/stores/settingsStore';

// Mock the API
vi.mock('@/api', () => ({
  aiApi: { process: vi.fn(), streamProcess: vi.fn() },
  filesApi: { read: vi.fn(), write: vi.fn() }
}));

vi.mock('@/utils/db', () => ({
  db: {
    files: { 
      get: vi.fn().mockResolvedValue(null),
      toArray: vi.fn().mockResolvedValue([])
    },
    versions: { 
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          sortBy: vi.fn().mockResolvedValue([])
        })
      }),
      add: vi.fn().mockResolvedValue(1)
    },
    aiHistory: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          sortBy: vi.fn().mockResolvedValue([])
        })
      }),
      add: vi.fn().mockResolvedValue(1)
    }
  }
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

  it('renders the sidebar above the editor and requests closing from its backdrop', async () => {
    const wrapper = mount(Editor, {
      props: { sidebarOpen: true }
    });

    expect(document.body.querySelector('.editor-sidebar.is-open')).not.toBeNull();
    expect(document.body.querySelector('.sidebar-backdrop')).not.toBeNull();
    expect(document.body.querySelector('[aria-label="Toggle file sidebar"]')).toBeNull();

    (document.body.querySelector('.sidebar-backdrop') as HTMLElement).click();
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:sidebarOpen')).toEqual([[false]]);
  });

  it('exposes settings from the editor sidebar', async () => {
    const wrapper = mount(Editor, {
      props: { sidebarOpen: true }
    });
    const settingsItems = Array.from(
      document.body.querySelectorAll('.sidebar-settings mdui-list-item')
    ) as HTMLElement[];
    const settingsItem = settingsItems[settingsItems.length - 1];

    expect(settingsItem).toBeDefined();
    settingsItem.click();
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('openSettings')).toEqual([[]]);
  });

  it('applies the editor font size and word-wrap settings to the textarea', () => {
    const settingsStore = useSettingsStore();
    settingsStore.editorFontSize = 19;
    settingsStore.wordWrap = false;

    const wrapper = mount(Editor);
    const textarea = wrapper.find('textarea');

    expect(textarea.attributes('wrap')).toBe('off');
    expect(textarea.classes()).toContain('word-wrap-off');
    expect((textarea.element as HTMLTextAreaElement).style.fontSize).toBe('19px');
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

  it('toggles AI Assistant panel when button is clicked', async () => {
    const store = useFileStore();
    store.currentContent = 'Some text';
    store.currentFile = { name: 'test.md', path: 'test.md' } as any;

    const wrapper = mount(Editor);
    
    // Check if panel is closed initially
    expect(wrapper.findComponent({ name: 'AIPanel' }).props('open')).toBe(false);

    // Find the AI assistant button
    const aiBtn = document.body.querySelector('mdui-button-icon[tooltip="AI Assistant"]');
    (aiBtn as any)?.click();

    await wrapper.vm.$nextTick();
    
    // Check if panel is open
    expect(wrapper.findComponent({ name: 'AIPanel' }).props('open')).toBe(true);
  });

  it('puts preview, find and replace, history, and save as in the final overflow menu', () => {
    const store = useFileStore();
    store.currentFile = { name: 'test.md', path: 'test.md' } as any;

    mount(Editor);

    const overflowButton = teleportTarget.querySelector('[aria-label="More editor actions"]');
    const toolbar = teleportTarget.querySelector('.editor-top-actions');

    expect(overflowButton).not.toBeNull();
    expect(toolbar?.lastElementChild?.contains(overflowButton)).toBe(true);
    expect(teleportTarget.querySelector('[aria-label="Search and replace"]')).toBeNull();
    expect(teleportTarget.querySelector('[aria-label="Preview note"]')).toBeNull();
    expect(teleportTarget.querySelector('[aria-label="Version history"]')).toBeNull();
    expect(teleportTarget.textContent).toContain('Preview');
    expect(teleportTarget.textContent).toContain('Find & replace');
    expect(teleportTarget.textContent).toContain('Version history');
    expect(teleportTarget.textContent).toContain('Save as');
  });

  it('shows autocomplete when typing @ character', async () => {
    const store = useFileStore();
    store.currentContent = 'Link to ';
    store.currentFile = { name: 'test.md', path: 'test.md' } as any;

    const dbMock = vi.mocked(db.files.toArray);
    dbMock.mockResolvedValue([
      { name: 'target.md', path: 'target.md', type: 'file' },
      { name: 'other.md', path: 'folder/other.md', type: 'file' }
    ]);

    const wrapper = mount(Editor);
    
    // Trigger onMounted loadAllFiles
    await flushPromises();

    const textarea = wrapper.find('textarea');
    await textarea.setValue('Link to @');
    
    // Set cursor position right after @
    const el = textarea.element as HTMLTextAreaElement;
    el.selectionStart = 9;
    el.selectionEnd = 9;
    
    // Trigger keyup to invoke checkAutocomplete
    await textarea.trigger('keyup');

    // Autocomplete popup should be open and display the suggestions
    expect(wrapper.find('.autocomplete-popup').exists()).toBe(true);
    const items = wrapper.findAll('.autocomplete-item');
    expect(items.length).toBe(2);
    expect(items[0].text()).toContain('target.md');

    // Click the first suggestion to select it
    await items[0].trigger('click');
    await flushPromises();

    // Verify it replaced `@` with the local link syntax
    expect(el.value).toBe('Link to [#target.md](@target.md)');
    expect(wrapper.find('.autocomplete-popup').exists()).toBe(false);
  });
});
