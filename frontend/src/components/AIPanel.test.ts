import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
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
    files: { get: vi.fn() },
    aiHistory: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          sortBy: vi.fn().mockResolvedValue([]),
          delete: vi.fn().mockResolvedValue(1)
        })
      }),
      add: vi.fn().mockResolvedValue(1)
    }
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
    fullContent: 'Full content of the note',
    filePath: 'test-file.md'
  };

  it('renders correctly when open', () => {
    const wrapper = mount(AIPanel, { props: defaultProps });
    expect(wrapper.find('.ai-panel').classes()).toContain('open');
    expect(wrapper.text()).toContain('AI Assistant');
  });

  it('calls AI API when a preset is clicked and submitted', async () => {
    const wrapper = mount(AIPanel, { props: defaultProps });
    const restructureBtn = wrapper.findAll('mdui-button').find(b => b.text() === 'Restructure');
    
    await restructureBtn?.trigger('click');
    
    // Verify it filled the prompt box
    expect(wrapper.vm.userInput).toBe('Restructure');
    
    // Trigger chat submit
    await wrapper.find('mdui-button-icon[slot="end-icon"]').trigger('click');
    
    expect(aiApi.streamProcess).toHaveBeenCalledWith(
      'chat',
      'Full content of the note',
      'Restructure',
      expect.any(Array),
      expect.any(Function), // onChunk
      expect.any(Array), // fileList
      expect.any(String), // customInstructions
      expect.any(Object) // signal
    );
  });

  it('displays AI response and interactive questions', async () => {
    const wrapper = mount(AIPanel, { props: defaultProps });
    const restructureBtn = wrapper.findAll('mdui-button').find(b => b.text() === 'Restructure');
    
    await restructureBtn?.trigger('click');
    await wrapper.find('mdui-button-icon[slot="end-icon"]').trigger('click');
    
    await flushPromises();

    expect(wrapper.text()).toContain('Mocked AI response');
    expect(wrapper.text()).toContain('Continue?');
    expect(wrapper.text()).toContain('Yes');
    expect(wrapper.text()).toContain('No');
  });

  it('emits apply event automatically when suggestion is received', async () => {
    const wrapper = mount(AIPanel, { props: defaultProps });
    const restructureBtn = wrapper.findAll('mdui-button').find(b => b.text() === 'Restructure');
    
    await restructureBtn?.trigger('click');
    await wrapper.find('mdui-button-icon[slot="end-icon"]').trigger('click');
    
    await flushPromises();

    expect(wrapper.emitted('apply')).toBeTruthy();
    expect(wrapper.emitted('apply')?.[0]).toEqual([{ content: 'Updated content', promptId: 'chat' }]);
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
      expect.any(Function),
      expect.any(Array),
      expect.any(String),
      expect.any(Object)
    );
  });
});
