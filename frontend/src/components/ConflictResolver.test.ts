import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ConflictResolver from './ConflictResolver.vue';

describe('ConflictResolver.vue', () => {
  const props = {
    localContent: 'line 1\nline 2 modified',
    serverContent: 'line 1\nline 2',
    fileName: 'test.md',
  };

  it('renders conflict information and diff', () => {
    const wrapper = mount(ConflictResolver, { props });
    
    expect(wrapper.text()).toContain('test.md');
    expect(wrapper.find('mdui-dialog').attributes('headline')).toBe('Conflict Detected');
    
    const addedParts = wrapper.findAll('.diff-part.added');
    expect(addedParts.length).toBeGreaterThan(0);
    expect(addedParts[0].text()).toContain('line 2 modified');
  });

  it('emits resolve event with local content when clicking Keep My Changes', async () => {
    const wrapper = mount(ConflictResolver, { props });
    const localBtn = wrapper.findAll('mdui-button').find(b => b.text() === 'Keep My Changes');
    
    await localBtn?.trigger('click');
    
    expect(wrapper.emitted('resolve')).toBeTruthy();
    expect(wrapper.emitted('resolve')![0]).toEqual([props.localContent]);
  });

  it('emits resolve event with server content when clicking Use Server Version', async () => {
    const wrapper = mount(ConflictResolver, { props });
    const serverBtn = wrapper.findAll('mdui-button').find(b => b.text() === 'Use Server Version');
    
    await serverBtn?.trigger('click');
    
    expect(wrapper.emitted('resolve')).toBeTruthy();
    expect(wrapper.emitted('resolve')![0]).toEqual([props.serverContent]);
  });
});
