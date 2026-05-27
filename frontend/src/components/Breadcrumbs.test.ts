import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Breadcrumbs from './Breadcrumbs.vue';
import { createPinia, setActivePinia } from 'pinia';

// Mock the fileStore
vi.mock('@/stores/fileStore', () => ({
  useFileStore: vi.fn(() => ({
    currentPath: 'folder1/folder2',
    navigate: vi.fn(),
  })),
}));

describe('Breadcrumbs.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders breadcrumbs correctly for a given path', () => {
    const wrapper = mount(Breadcrumbs);
    const crumbs = wrapper.findAll('.crumb');
    
    expect(crumbs).toHaveLength(3); // Root, folder1, folder2
    expect(crumbs[0].text()).toBe('Root');
    expect(crumbs[1].text()).toBe('folder1');
    expect(crumbs[2].text()).toBe('folder2');
  });

  it('marks the last crumb as bold', () => {
    const wrapper = mount(Breadcrumbs);
    const crumbs = wrapper.findAll('.crumb');
    
    expect(crumbs[2].classes()).toContain('last');
    expect(crumbs[0].classes()).not.toContain('last');
  });
});
