import type { ApiResponse, FolderTree, Folder, FolderDetailsResponse } from '@/types';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getFolderTree(): Promise<ApiResponse<FolderTree[]>> {
    return this.fetch<FolderTree[]>('/api/v1/folders/tree');
  }

  async getChildren(parentId: string | null): Promise<ApiResponse<Folder[]>> {
    const query = parentId ? `?parentId=${parentId}` : '';
    return this.fetch<Folder[]>(`/api/v1/folders/children${query}`);
  }

  async getFolderDetails(folderId: string): Promise<ApiResponse<FolderDetailsResponse>> {
    return this.fetch<FolderDetailsResponse>(`/api/v1/folders/${folderId}/details`);
  }

  async createFolder(name: string, parentId?: string): Promise<ApiResponse<Folder>> {
    return this.fetch<Folder>('/api/v1/folders', {
      method: 'POST',
      body: JSON.stringify({ name, parentId }),
    });
  }

  async searchFolders(query: string): Promise<ApiResponse<Folder[]>> {
    return this.fetch<Folder[]>(`/api/v1/folders/search?q=${encodeURIComponent(query)}`);
  }
}

export const apiService = new ApiService();