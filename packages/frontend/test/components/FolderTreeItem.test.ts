import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FolderTreeItem from '../../src/components/FolderTreeItem.vue';
import type { FolderTree } from '../../src/types';

describe('FolderTreeItem', () => {
  const mockFolder: FolderTree = {
    id: '1',
    name: 'Test Folder',
    parentId: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    children: [],
  };

  const mockFolderWithChildren: FolderTree = {
    id: '2',
    name: 'Parent Folder',
    parentId: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    children: [
      {
        id: '3',
        name: 'Child Folder',
        parentId: '2',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        children: [],
      },
    ],
  };

  it('renders folder name', () => {
    const wrapper = mount(FolderTreeItem, {
      props: {
        folder: mockFolder,
        selectedId: null,
        level: 0,
      },
      global: {
        stubs: {
          FolderTreeItem: true, // Stub recursive component
        },
      },
    });

    expect(wrapper.text()).toContain('Test Folder');
  });

  it('displays folder icon', () => {
    const wrapper = mount(FolderTreeItem, {
      props: {
        folder: mockFolder,
        selectedId: null,
        level: 0,
      },
      global: {
        stubs: {
          FolderTreeItem: true,
        },
      },
    });

    expect(wrapper.html()).toContain('📁');
  });

  it('emits select event when clicked', async () => {
    const wrapper = mount(FolderTreeItem, {
      props: {
        folder: mockFolder,
        selectedId: null,
        level: 0,
      },
      global: {
        stubs: {
          FolderTreeItem: true,
        },
      },
    });

    await wrapper.find('.folder-row').trigger('click');

    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')?.[0]).toEqual([mockFolder]);
  });

  it('applies selected class when folder is selected', () => {
    const wrapper = mount(FolderTreeItem, {
      props: {
        folder: mockFolder,
        selectedId: '1',
        level: 0,
      },
      global: {
        stubs: {
          FolderTreeItem: true,
        },
      },
    });

    expect(wrapper.find('.folder-row').classes()).toContain('selected');
  });

  it('shows expand icon when folder has children', () => {
    const wrapper = mount(FolderTreeItem, {
      props: {
        folder: mockFolderWithChildren,
        selectedId: null,
        level: 0,
      },
      global: {
        stubs: {
          FolderTreeItem: true,
        },
      },
    });

    const expandIcon = wrapper.find('.expand-icon');
    expect(expandIcon.exists()).toBe(true);
  });
});