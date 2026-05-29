import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BottomBar from './BottomBar.vue';

describe('BottomBar.vue', () => {
  it('emits highlight event when highlight item is clicked', async () => {
    const wrapper = mount(BottomBar, {
      props: {
        isHighlighted: false,
        canUndo: true,
        isProcessing: false,
        wordCount: 0,
        readingTime: 0
      }
    });

    const menuItems = wrapper.findAll('mdui-menu-item');
    const highlightItem = menuItems.find(i => i.text().includes('Highlight'));
    
    await highlightItem?.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('highlight');
  });

  it('emits run-prompt event when FAB is clicked', async () => {
    const wrapper = mount(BottomBar, {
      props: {
        isHighlighted: false,
        canUndo: true,
        isProcessing: false,
        wordCount: 0,
        readingTime: 0
      }
    });

    const fab = wrapper.find('mdui-fab');
    await fab.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('run-prompt');
  });

  it('disables undo item when canUndo is false', () => {
    const wrapper = mount(BottomBar, {
      props: {
        isHighlighted: false,
        canUndo: false,
        isProcessing: false,
        wordCount: 0,
        readingTime: 0
      }
    });

    const undoItem = wrapper.findAll('mdui-menu-item').find(i => i.text().includes('Undo'));
    expect(undoItem?.attributes('disabled')).toBe('true');
  });
});
