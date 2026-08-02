import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from './App.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useFileStore } from '@/stores/fileStore';
import { useSettingsStore } from '@/stores/settingsStore';

describe('App.vue Toolbar Regression', () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock localStorage
    const storage: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => storage[key] || null),
      setItem: vi.fn((key, value) => { storage[key] = value; }),
      removeItem: vi.fn((key) => { delete storage[key]; }),
    });
    // Define __BUILD_NUMBER__
    vi.stubGlobal('__BUILD_NUMBER__', 123);
  });

  const getMountOptions = () => ({
    global: {
      stubs: {
        Breadcrumbs: true,
        FileBrowser: {
          emits: ['selectionChange'],
          template: '<div id="file-browser"><button id="select-two" @click="$emit(\'selectionChange\', 2)">Select two</button></div>'
        },
        Editor: {
          props: ['sidebarOpen'],
          emits: ['update:sidebarOpen', 'openSettings'],
          template: '<div id="editor" :data-sidebar-open="sidebarOpen"><button id="editor-settings" @click="$emit(\'openSettings\')">Settings</button><div id="top-bar-actions"></div></div>'
        },
        Login: true,
        ConflictResolver: true,
        'mdui-layout': { template: '<div><slot></slot></div>' },
        'mdui-top-app-bar': { template: '<div><slot></slot></div>' },
        'mdui-button-icon': { template: '<button><slot></slot></button>' },
        'mdui-icon-menu': true,
        'mdui-icon-arrow-back': true,
        'mdui-icon-add': true,
        'mdui-icon-remove': true,
        'mdui-dropdown': { template: '<div><slot name="trigger"></slot><slot></slot></div>' },
        'mdui-icon-sort': true,
        'mdui-menu': { template: '<div><slot></slot></div>' },
        'mdui-menu-item': { template: '<div><slot></slot><slot name="end-icon"></slot></div>' },
        'mdui-icon-arrow-upward': true,
        'mdui-icon-arrow-downward': true,
        'mdui-icon-cloud-off': true,
        'mdui-navigation-drawer': { template: '<div><slot></slot></div>' },
        'mdui-list': { template: '<div><slot></slot></div>' },
        'mdui-list-subheader': { template: '<div><slot></slot></div>' },
        'mdui-icon-history': true,
        'mdui-list-item': { template: '<div><slot name="icon"></slot><slot></slot></div>' },
        'mdui-icon-insert-drive-file': true,
        'mdui-divider': true,
        'mdui-icon-settings': true,
        'mdui-icon-logout': true,
        'mdui-text-field': true,
        'mdui-segmented-button-group': { template: '<div><slot></slot></div>' },
        'mdui-segmented-button': true,
        'mdui-layout-main': { template: '<div><slot></slot></div>' }
      }
    }
  });

  it('shows sort button when not editing', async () => {
    const fileStore = useFileStore();
    fileStore.isEditing = false;
    
    const wrapper = mount(App, getMountOptions());
    
    // We mocked mdui-button-icon as a button. So let's find the sort button by its tooltip.
    // The original test looked for mdui-button-icon[mdui-tooltip="Sort"]
    // Because we stubbed it, the custom attributes might not be directly on the button tag depending on how VTU handles it, 
    // but typically attributes are passed down. Let's find it.
    const sortBtn = wrapper.find('[mdui-tooltip="Sort"]');
    expect(sortBtn.exists()).toBe(true);
  });

  it('hides sort button when editing', async () => {
    const fileStore = useFileStore();
    fileStore.isEditing = true;
    
    const wrapper = mount(App, getMountOptions());
    
    const sortBtn = wrapper.find('[mdui-tooltip="Sort"]');
    expect(sortBtn.exists()).toBe(false);
  });

  it('has top-bar-actions ID for Teleport target', () => {
    const wrapper = mount(App, getMountOptions());
    const target = wrapper.find('#top-bar-actions');
    expect(target.exists()).toBe(true);
  });

  it('replaces the directory title and sort control when files are selected', async () => {
    const fileStore = useFileStore();
    fileStore.isEditing = false;
    const wrapper = mount(App, getMountOptions());

    await wrapper.find('#select-two').trigger('click');

    expect(wrapper.find('.selection-title').text()).toBe('2 Selected');
    expect(wrapper.find('[mdui-tooltip="Sort"]').exists()).toBe(false);
  });

  it('uses the leading editor button to open the sidebar and return to the file list', async () => {
    const fileStore = useFileStore();
    fileStore.isEditing = true;
    const closeEditorSpy = vi.spyOn(fileStore, 'closeEditor');

    const wrapper = mount(App, getMountOptions());
    const leadingButton = wrapper.find('[aria-label="Open file sidebar"]');

    expect(leadingButton.exists()).toBe(true);
    expect(wrapper.find('#editor').attributes('data-sidebar-open')).toBe('false');

    await leadingButton.trigger('click');

    expect(wrapper.find('[aria-label="Back to file list"]').exists()).toBe(true);
    expect(wrapper.find('#editor').attributes('data-sidebar-open')).toBe('true');
    expect(wrapper.find('.app-top-bar').classes()).toContain('editor-sidebar-open');
    expect(wrapper.find('.editor-title').exists()).toBe(true);

    await wrapper.find('[aria-label="Back to file list"]').trigger('click');

    expect(closeEditorSpy).toHaveBeenCalledOnce();
    expect(fileStore.isEditing).toBe(false);
    expect(wrapper.find('[aria-label="Open menu"]').exists()).toBe(true);
    expect(wrapper.find('#editor').exists()).toBe(false);
  });

  it('opens settings from the editor sidebar action', async () => {
    const fileStore = useFileStore();
    fileStore.isEditing = true;

    const wrapper = mount(App, getMountOptions());
    await wrapper.find('#editor-settings').trigger('click');

    const dialog = wrapper.find('mdui-dialog[headline="Settings"]');
    expect(dialog.attributes('open')).toBe('true');
  });

  it('uses a compact font-size stepper in editor settings', async () => {
    const settingsStore = useSettingsStore();
    settingsStore.editorFontSize = 15;
    const setFontSize = vi.spyOn(settingsStore, 'setEditorFontSize').mockResolvedValue();
    const wrapper = mount(App, getMountOptions());

    const input = wrapper.find('.font-size-input');
    expect((input.element as HTMLInputElement).value).toBe('15');

    await wrapper.find('[aria-label="Increase editor font size"]').trigger('click');
    expect(setFontSize).toHaveBeenCalledWith(16);

    await input.setValue(20);
    await input.trigger('change');
    expect(setFontSize).toHaveBeenCalledWith(20);
  });

  it('intercepts click on local note links and calls openFile', async () => {
    const fileStore = useFileStore();
    const openFileSpy = vi.spyOn(fileStore, 'openFile').mockImplementation(() => Promise.resolve());
    
    const wrapper = mount(App, getMountOptions());
    
    const link = document.createElement('a');
    link.setAttribute('href', '@folder/note.md');
    link.innerText = 'Test Note';
    document.body.appendChild(link);
    
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(clickEvent);
    
    expect(clickEvent.defaultPrevented).toBe(true);
    expect(openFileSpy).toHaveBeenCalledWith(expect.objectContaining({
      name: 'note.md',
      path: 'folder/note.md',
      type: 'file'
    }));
    
    document.body.removeChild(link);
  });
});
