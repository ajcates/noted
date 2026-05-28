import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AIPanel from './AIPanel.vue';
import { aiApi } from '@/api';
import { createPinia, setActivePinia } from 'pinia';

// Mock the API
vi.mock('@/api', () => ({
  aiApi: { 
    process: vi.fn().mockResolvedValue({
      comment: 'Mocked AI response',
      content: 'Updated content',
      questions: [{ question: 'Continue?', options: ['Yes', 'No'] }]
    }) 
  }
}));

describe('AIPanel.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    // Mock localStorage
    const storage: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => storage[key] || null),
      setItem: vi.fn((key, value) => { storage[key] = value; }),
      removeItem: vi.fn((key) => { delete storage[key]; }),
    });
  });

  const defaultProps = {
    open: true,
    selectedText: 'Selected text',
    fullContent: 'Full content of the note'
  };

  it('renders correctly when open', () => {
    const wrapper = mount(AIPanel, { props: defaultProps });
    expect(wrapper.find('.ai-panel').classes()).toContain('open');
    expect(wrapper.text()).toContain('AI Assistant');
  });

  it('calls AI API when a preset is clicked', async () => {
    const wrapper = mount(AIPanel, { props: defaultProps });
    const restructureBtn = wrapper.findAll('mdui-button').find(b => b.text() === 'Restructure');
    
    await restructureBtn?.trigger('click');
    
    expect(aiApi.process).toHaveBeenCalledWith(
      'restructure',
      'Full content of the note',
      'Selected text',
      expect.any(Array),
      expect.any(Array), // fileList
      expect.any(String) // customInstructions
    );
  });

  it('displays AI response and interactive questions', async () => {
    const wrapper = mount(AIPanel, { props: defaultProps });
    const restructureBtn = wrapper.findAll('mdui-button').find(b => b.text() === 'Restructure');
    
    await restructureBtn?.trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick(); // Wait for promise and state update

    expect(wrapper.text()).toContain('Mocked AI response');
    expect(wrapper.text()).toContain('Continue?');
    expect(wrapper.text()).toContain('Yes');
    expect(wrapper.text()).toContain('No');
  });

  it('emits apply event when Apply Changes is clicked', async () => {
    const wrapper = mount(AIPanel, { props: defaultProps });
    const restructureBtn = wrapper.findAll('mdui-button').find(b => b.text() === 'Restructure');
    
    await restructureBtn?.trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const applyBtn = wrapper.find('mdui-button[variant="filled"]');
    await applyBtn.trigger('click');

    expect(wrapper.emitted('apply')).toBeTruthy();
    expect(wrapper.emitted('apply')?.[0]).toEqual([{ content: 'Updated content', promptId: 'restructure' }]);
  });
});
