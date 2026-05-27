import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Login from './Login.vue';
import { createPinia, setActivePinia } from 'pinia';

const mockAuthStore = {
  login: vi.fn(),
  loading: false,
  error: null,
};

// Mock the authStore
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => mockAuthStore),
}));

describe('Login.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    const wrapper = mount(Login);
    expect(wrapper.find('h2').text()).toBe('noted');
    expect(wrapper.find('mdui-text-field').exists()).toBe(true);
    expect(wrapper.find('mdui-button').text()).toBe('Login');
  });

  it('calls login on button click', async () => {
    const wrapper = mount(Login);
    
    // Set password directly since it's exposed
    (wrapper.vm as any).password = 'test-password';
    
    // Call handleLogin directly
    await (wrapper.vm as any).handleLogin();
    
    expect(mockAuthStore.login).toHaveBeenCalledWith('test-password');
  });

  it('shows error helper when authStore has error', async () => {
    const { useAuthStore } = await import('@/stores/authStore');
    (useAuthStore as any).mockReturnValue({
      login: vi.fn(),
      loading: false,
      error: 'Invalid password',
    });

    const wrapper = mount(Login);
    const textField = wrapper.find('mdui-text-field');
    
    expect(textField.attributes('error')).toBe('true');
    expect(textField.attributes('helper')).toBe('Invalid password');
  });
});
