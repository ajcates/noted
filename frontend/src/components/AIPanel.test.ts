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
    }),
    streamProcess: vi.fn().mockResolvedValue({
      comment: 'Mocked AI response',
      content: 'Updated content',
      questions: [{ question: 'Continue?', options: ['Yes', 'No'] }]
    })
  },
  filesApi: { read: vi.fn() }
}));

vi.mock('@/utils/db', () => ({
  db: {
    files: { get: vi.fn() }
  }
}));

import { db } from '@/utils/db';

describe('AIPanel.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

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
    
    expect(aiApi.streamProcess).toHaveBeenCalledWith(
      'restructure',
      'Full content of the note',
      'Selected text',
      expect.any(Array),
      expect.any(Array), // fileList
      expect.any(String), // customInstructions
      expect.any(Function) // onChunk
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

  it('injects context from @filename references', async () => {
    (db.files.get as any).mockResolvedValue({ content: 'Referenced file content' });
    
    const wrapper = mount(AIPanel, { props: defaultProps });
    const input = wrapper.find('mdui-text-field');
    
    (input.element as any).value = 'Tell me about @test.md';
    input.element.dispatchEvent(new Event('input'));
    
    await wrapper.find('mdui-button-icon[slot="end-icon"]').trigger('click');
    
    expect(db.files.get).toHaveBeenCalledWith('test.md');
    expect(aiApi.streamProcess).toHaveBeenCalledWith(
      'chat',
      expect.any(String),
      'Tell me about @test.md',
      expect.arrayContaining([
        expect.objectContaining({
          parts: [expect.objectContaining({
            text: expect.stringContaining('Referenced file content')
          })]
        })
      ]),
      expect.any(Array),
      expect.any(String),
      expect.any(Function)
    );
  });
});
