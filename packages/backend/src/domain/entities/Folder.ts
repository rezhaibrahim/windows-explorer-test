export interface FolderEntity {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderTreeEntity extends FolderEntity {
  children: FolderTreeEntity[];
  files?: FileEntity[];
}

export interface FileEntity {
  id: string;
  name: string;
  folderId: string;
  size: bigint;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFolderDTO {
  name: string;
  parentId?: string | null;
}

export interface FolderResponseDTO {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderTreeResponseDTO extends FolderResponseDTO {
  children: FolderTreeResponseDTO[];
  files?: FileResponseDTO[];
}

export interface FileResponseDTO {
  id: string;
  name: string;
  folderId: string;
  size: string;
  createdAt: string;
  updatedAt: string;
}