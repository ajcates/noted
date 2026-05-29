import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from './App.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useFileStore } from '@/stores/fileStore';

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
        FileBrowser: true,
        Editor: { template: '<div id="editor"><div id="top-bar-actions"></div></div>' },
        Login: true,
        ConflictResolver: true,
        'mdui-layout': { template: '<div><slot></slot></div>' },
        'mdui-top-app-bar': { template: '<div><slot></slot></div>' },
        'mdui-button-icon': { template: '<button><slot></slot></button>' },
        'mdui-icon-menu': true,
        'mdui-icon-arrow-back': true,
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
});
