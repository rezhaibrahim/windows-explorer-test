import type { FolderEntity, FolderTreeEntity, CreateFolderDTO, FileEntity } from '../entities/Folder';

export interface IFolderRepository {
  getAllFoldersTree(): Promise<FolderTreeEntity[]>;
  getChildrenByParentId(parentId: string | null): Promise<FolderEntity[]>;
  getFolderById(id: string): Promise<FolderEntity | null>;
  createFolder(data: CreateFolderDTO): Promise<FolderEntity>;
  searchFolders(query: string): Promise<FolderEntity[]>;
  getFilesByFolderId(folderId: string): Promise<FileEntity[]>;
  getAllFolders(): Promise<FolderEntity[]>;
}