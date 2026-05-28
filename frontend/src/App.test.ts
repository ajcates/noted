import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from './App.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useFileStore } from '@/stores/fileStore';

// Mock child components
vi.mock('@/components/Breadcrumbs.vue', () => ({ default: { name: 'Breadcrumbs', template: '<div></div>' } }));
vi.mock('@/components/FileBrowser.vue', () => ({ default: { name: 'FileBrowser', template: '<div></div>' } }));
vi.mock('@/components/Editor.vue', () => ({ default: { name: 'Editor', template: '<div id="editor"><div id="top-bar-actions"></div></div>' } }));
vi.mock('@/components/Login.vue', () => ({ default: { name: 'Login', template: '<div></div>' } }));
vi.mock('@/components/ConflictResolver.vue', () => ({ default: { name: 'ConflictResolver', template: '<div></div>' } }));

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

  it('shows sort button when not editing', async () => {
    const fileStore = useFileStore();
    fileStore.isEditing = false;
    
    const wrapper = mount(App);
    
    const sortBtn = wrapper.find('mdui-button-icon[mdui-tooltip="Sort"]');
    expect(sortBtn.exists()).toBe(true);
  });

  it('hides sort button when editing', async () => {
    const fileStore = useFileStore();
    fileStore.isEditing = true;
    
    const wrapper = mount(App);
    
    const sortBtn = wrapper.find('mdui-button-icon[mdui-tooltip="Sort"]');
    expect(sortBtn.exists()).toBe(false);
  });

  it('has top-bar-actions ID for Teleport target', () => {
    const wrapper = mount(App);
    const target = wrapper.find('#top-bar-actions');
    expect(target.exists()).toBe(true);
  });
});
