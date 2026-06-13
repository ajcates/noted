import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FileBrowser from './FileBrowser.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useFileStore } from '@/stores/fileStore';

// Mock the API and DB to prevent real network/DB calls
vi.mock('@/api', () => ({
  filesApi: {
    list: vi.fn(() => Promise.resolve([])),
    read: vi.fn(),
    search: vi.fn(() => Promise.resolve([])),
    status: vi.fn(() => Promise.resolve({ config: { readonly: false, authEnabled: false } })),
  },
}));

vi.mock('@/utils/db', () => ({
  db: {
    files: { 
      toArray: vi.fn(() => Promise.resolve([])),
      put: vi.fn(() => Promise.resolve()),
    },
    pendingChanges: { toArray: vi.fn(() => Promise.resolve([])) }
  }
}));

describe('FileBrowser.vue', () => {
  let teleportTarget: HTMLDivElement;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

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

    // Default navigator.onLine mock
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    document.body.removeChild(teleportTarget);
  });

  it('renders files from the store', async () => {
    const mockFiles = [
      { name: 'test.md', path: 'test.md', type: 'file' as const, size: 1024, mtime: new Date().toISOString() }
    ];
    const { filesApi } = await import('@/api');
    (filesApi.list as any).mockResolvedValue(mockFiles);

    const store = useFileStore();
    await store.fetchFiles(); // Explicitly trigger fetch for the test

    const wrapper = mount(FileBrowser);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('test.md');
    expect(wrapper.text()).toContain('1.00 KB');
  });

  it('calls openFile when a file is clicked', async () => {
    const store = useFileStore();
    store.files = [
      { name: 'test.md', path: 'test.md', type: 'file', size: 1024, mtime: new Date().toISOString() }
    ] as any;
    
    const openFileSpy = vi.spyOn(store, 'openFile').mockImplementation(() => Promise.resolve());
    
    const wrapper = mount(FileBrowser);
    const fileItem = wrapper.find('mdui-list-item');
    await fileItem.trigger('click');
    
    expect(openFileSpy).toHaveBeenCalled();
  });

  it('shows empty state when no files', () => {
    const wrapper = mount(FileBrowser);
    expect(wrapper.text()).toContain('No files found');
  });

  it('performs global search and displays results', async () => {
    const { filesApi } = await import('@/api');
    const mockResults = [
      { path: 'search-result.md', name: 'search-result.md', snippet: 'Matched snippet' }
    ];
    (filesApi.search as any).mockResolvedValue(mockResults);

    const wrapper = mount(FileBrowser);
    
    // Click find button to reveal search input
    const findBtn = document.body.querySelector('mdui-button-icon[tooltip="Find"]');
    (findBtn as any)?.click();
    await wrapper.vm.$nextTick();
    
    const searchInput = wrapper.find('.search-input');
    
    (searchInput.element as any).value = 'query';
    searchInput.element.dispatchEvent(new Event('input'));

    // Wait for debounce (300ms + buffer)
    await new Promise(resolve => setTimeout(resolve, 400));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(filesApi.search).toHaveBeenCalledWith('query');
    expect(wrapper.text()).toContain('search-result.md');
    expect(wrapper.text()).toContain('Matched snippet');
  });
});
