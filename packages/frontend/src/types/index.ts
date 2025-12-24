export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderTree extends Folder {
  children: FolderTree[];
  files?: File[];
}

export interface File {
  id: string;
  name: string;
  folderId: string;
  size: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FolderDetailsResponse {
  folders: Folder[];
  files: File[];
}