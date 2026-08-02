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

  it('selects multiple entries and replaces the file toolbar actions', async () => {
    const store = useFileStore();
    store.files = [
      { name: 'one.md', path: 'one.md', type: 'file', size: 100, mtime: '2023-01-01' },
      { name: 'two.md', path: 'two.md', type: 'file', size: 200, mtime: '2023-01-02' }
    ] as any;

    const wrapper = mount(FileBrowser);
    const firstSelectAction = wrapper.findAll('mdui-menu-item')
      .find(item => item.text().trim() === 'Select');
    await firstSelectAction!.trigger('click');

    const fileItems = wrapper.findAll('.list-surface mdui-list-item');
    await fileItems[1].trigger('click');

    expect(wrapper.emitted('selectionChange')?.at(-1)).toEqual([2]);
    expect(teleportTarget.querySelector('[aria-label="Selected file actions"]')).not.toBeNull();
    expect(teleportTarget.textContent).toContain('Move to...');
    expect(teleportTarget.textContent).toContain('Delete');
  });

  it('moves all selected entries through the shared destination snackbar', async () => {
    const store = useFileStore();
    const entries = [
      { name: 'one.md', path: 'one.md', type: 'file' as const, size: 100, mtime: '2023-01-01' },
      { name: 'two.md', path: 'two.md', type: 'file' as const, size: 200, mtime: '2023-01-02' }
    ];
    store.files = entries;
    const moveEntry = vi.spyOn(store, 'moveEntry').mockResolvedValue('moved');

    const wrapper = mount(FileBrowser);
    await wrapper.findAll('mdui-menu-item')
      .find(item => item.text().trim() === 'Select')!
      .trigger('click');
    await wrapper.findAll('.list-surface mdui-list-item')[1].trigger('click');

    const bulkMove = Array.from(teleportTarget.querySelectorAll('mdui-menu-item'))
      .find(item => item.textContent?.trim() === 'Move to...') as HTMLElement;
    bulkMove.click();
    await wrapper.vm.$nextTick();

    const snackbar = wrapper.findAll('mdui-snackbar')
      .find(item => item.text().includes('Move 2 selected to'));
    expect(snackbar).toBeDefined();

    store.currentPath = 'archive';
    store.files = [];
    await snackbar!.find('mdui-button').trigger('click');
    await wrapper.vm.$nextTick();

    expect(moveEntry).toHaveBeenNthCalledWith(1, entries[0], 'archive');
    expect(moveEntry).toHaveBeenNthCalledWith(2, entries[1], 'archive');
    expect(wrapper.emitted('selectionChange')?.at(-1)).toEqual([0]);
  });

  it('bulk deletes selected entries with undo support', async () => {
    const store = useFileStore();
    const entries = [
      { name: 'one.md', path: 'one.md', type: 'file' as const, size: 100, mtime: '2023-01-01' },
      { name: 'two.md', path: 'two.md', type: 'file' as const, size: 200, mtime: '2023-01-02' }
    ];
    store.files = entries;
    const deleteEntries = vi.spyOn(store, 'deleteEntriesWithUndo').mockResolvedValue(false);

    const wrapper = mount(FileBrowser);
    await wrapper.findAll('mdui-menu-item')
      .find(item => item.text().trim() === 'Select')!
      .trigger('click');
    await wrapper.findAll('.list-surface mdui-list-item')[1].trigger('click');

    const bulkDelete = Array.from(teleportTarget.querySelectorAll('mdui-menu-item'))
      .find(item => item.textContent?.trim() === 'Delete') as HTMLElement;
    bulkDelete.click();
    await wrapper.vm.$nextTick();

    expect(deleteEntries).toHaveBeenCalledWith(entries);
    expect(wrapper.text()).toContain('Deleted 2 items');
    expect(wrapper.emitted('selectionChange')?.at(-1)).toEqual([0]);
  });

  it('offers moving an entry to the directory shown in the snackbar', async () => {
    const store = useFileStore();
    const file = {
      name: 'test.md',
      path: 'test.md',
      type: 'file' as const,
      size: 1024,
      mtime: new Date().toISOString()
    };
    store.files = [file];
    const moveEntry = vi.spyOn(store, 'moveEntry').mockResolvedValue('moved');

    const wrapper = mount(FileBrowser);
    const moveMenuItem = wrapper.findAll('mdui-menu-item')
      .find(item => item.text().trim() === 'Move');
    expect(moveMenuItem).toBeDefined();

    await moveMenuItem!.trigger('click');

    const moveSnackbar = wrapper.findAll('mdui-snackbar')
      .find(snackbar => snackbar.text().includes('Move test.md to'));
    expect(moveSnackbar).toBeDefined();
    expect(moveSnackbar!.text()).toContain('Workspace');

    store.currentPath = 'notes/archive';
    await wrapper.vm.$nextTick();
    expect(moveSnackbar!.text()).toContain('archive');

    await moveSnackbar!.find('mdui-button').trigger('click');

    expect(moveEntry).toHaveBeenCalledWith(file, 'notes/archive');
  });

  it('opens a rename dialog with a copy name when the destination already contains the file', async () => {
    const store = useFileStore();
    const source = {
      name: 'report.md',
      path: 'report.md',
      type: 'file' as const,
      size: 1024,
      mtime: new Date().toISOString()
    };
    store.files = [source];
    const moveEntry = vi.spyOn(store, 'moveEntry').mockResolvedValue('moved');

    const wrapper = mount(FileBrowser);
    const moveMenuItem = wrapper.findAll('mdui-menu-item')
      .find(item => item.text().trim() === 'Move');
    await moveMenuItem!.trigger('click');

    store.currentPath = 'archive';
    store.files = [{
      ...source,
      path: 'archive/report.md'
    }];
    await wrapper.vm.$nextTick();

    const moveSnackbar = wrapper.findAll('mdui-snackbar')
      .find(snackbar => snackbar.text().includes('Move report.md to'));
    await moveSnackbar!.find('mdui-button').trigger('click');

    const renameDialog = wrapper.find('mdui-dialog[headline="Rename moved item"]');
    const renameField = renameDialog.find('mdui-text-field');
    expect(renameDialog.attributes('open')).toBe('true');
    expect((renameField.element as any).value).toBe('report copy.md');
    expect(moveEntry).not.toHaveBeenCalled();

    await renameDialog.findAll('mdui-button')
      .find(button => button.text().trim() === 'Move')!
      .trigger('click');

    expect(moveEntry).toHaveBeenCalledWith(source, 'archive', 'report copy.md');
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
