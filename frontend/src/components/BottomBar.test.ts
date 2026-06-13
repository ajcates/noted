import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BottomBar from './BottomBar.vue';

describe('BottomBar.vue', () => {
  const defaultProps = {
    isHighlighted: false,
    canUndo: true,
    wordCount: 120,
    readingTime: 1
  };

  it('emits highlight event when highlight item is clicked', async () => {
    const wrapper = mount(BottomBar, { props: defaultProps });

    const menuItems = wrapper.findAll('mdui-menu-item');
    const highlightItem = menuItems.find(i => i.text().includes('Highlight'));
    
    await highlightItem?.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('highlight');
  });

  it('emits undo event when standalone Undo button is clicked', async () => {
    const wrapper = mount(BottomBar, { props: defaultProps });

    const undoBtn = wrapper.find('mdui-button-icon[tooltip="Undo"]');
    await undoBtn.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('undo');
  });

  it('disables standalone Undo button when canUndo is false', () => {
    const wrapper = mount(BottomBar, {
      props: {
        ...defaultProps,
        canUndo: false
      }
    });

    const undoBtn = wrapper.find('mdui-button-icon[tooltip="Undo"]');
    expect(undoBtn.attributes('disabled')).toBe('true');
  });

  it('emits preview event when Preview button is clicked', async () => {
    const wrapper = mount(BottomBar, { props: defaultProps });

    const previewBtn = wrapper.find('mdui-button-icon[tooltip="Preview"]');
    await previewBtn.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('preview');
  });

  it('emits history event when History button is clicked', async () => {
    const wrapper = mount(BottomBar, { props: defaultProps });

    const historyBtn = wrapper.find('mdui-button-icon[tooltip="History"]');
    await historyBtn.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('history');
  });
});

