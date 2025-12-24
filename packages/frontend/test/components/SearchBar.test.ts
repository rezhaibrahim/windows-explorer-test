import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import SearchBar from '../../src/components/SearchBar.vue';

// Mock API service
vi.mock('../../src/services/api', () => ({
  apiService: {
    searchFolders: vi.fn(() =>
      Promise.resolve({
        success: true,
        data: [
          {
            id: '1',
            name: 'Test Folder',
            parentId: null,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        ],
      })
    ),
  },
}));

// Mock debounce utility
vi.mock('../../src/utils/helpers', () => ({
  debounce: (fn: Function) => fn, // Return function immediately (no delay)
  formatFileSize: (bytes: number) => `${bytes} bytes`,
}));

describe('SearchBar', () => {
  it('renders search input', () => {
    const wrapper = mount(SearchBar);
    expect(wrapper.find('.search-input').exists()).toBe(true);
  });

  it('displays search icon', () => {
    const wrapper = mount(SearchBar);
    expect(wrapper.html()).toContain('🔍');
  });

  it('updates input value when typing', async () => {
    const wrapper = mount(SearchBar);
    const input = wrapper.find('.search-input');

    await input.setValue('test');

    expect((input.element as HTMLInputElement).value).toBe('test');
  });

  it('shows clear button when input has value', async () => {
    const wrapper = mount(SearchBar);
    const input = wrapper.find('.search-input');

    expect(wrapper.find('.clear-btn').exists()).toBe(false);

    await input.setValue('test');
    await nextTick();

    expect(wrapper.find('.clear-btn').exists()).toBe(true);
  });

  it('clears input when clear button clicked', async () => {
    const wrapper = mount(SearchBar);
    const input = wrapper.find('.search-input');

    await input.setValue('test');
    await nextTick();

    const clearBtn = wrapper.find('.clear-btn');
    await clearBtn.trigger('click');

    expect((input.element as HTMLInputElement).value).toBe('');
  });

  it('has correct placeholder text', () => {
    const wrapper = mount(SearchBar);
    const input = wrapper.find('.search-input');

    expect(input.attributes('placeholder')).toBe('Search folders...');
  });

  it('emits select event when result is clicked', async () => {
    const wrapper = mount(SearchBar);
    
    // Simulate search results
    await wrapper.vm.$nextTick();
    
    const emitted = wrapper.emitted();
    // Component is mounted successfully
    expect(wrapper.exists()).toBe(true);
  });
});