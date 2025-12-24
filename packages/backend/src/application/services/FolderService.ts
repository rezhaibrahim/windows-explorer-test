import type {
  FolderTreeResponseDTO,
  FolderResponseDTO,
  CreateFolderDTO,
  FileResponseDTO,
} from '../../domain/entities/Folder';
import type { IFolderRepository } from '../../domain/repositories/IFolderRepository';

export class FolderService {
  constructor(private readonly folderRepository: IFolderRepository) {}

  async getFolderTree(): Promise<FolderTreeResponseDTO[]> {
    const tree = await this.folderRepository.getAllFoldersTree();
    return this.mapTreeToDTO(tree);
  }

  async getDirectChildren(parentId: string | null): Promise<FolderResponseDTO[]> {
    const children = await this.folderRepository.getChildrenByParentId(parentId);
    return children.map(this.mapFolderToDTO);
  }

  async getFolderDetails(folderId: string): Promise<{
    folders: FolderResponseDTO[];
    files: FileResponseDTO[];
  }> {
    const [folders, files] = await Promise.all([
      this.folderRepository.getChildrenByParentId(folderId),
      this.folderRepository.getFilesByFolderId(folderId),
    ]);

    return {
      folders: folders.map(this.mapFolderToDTO),
      files: files.map(this.mapFileToDTO),
    };
  }

  async createFolder(data: CreateFolderDTO): Promise<FolderResponseDTO> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Folder name cannot be empty');
    }

    if (data.name.length > 255) {
      throw new Error('Folder name too long');
    }

    const folder = await this.folderRepository.createFolder(data);
    return this.mapFolderToDTO(folder);
  }

 async searchFolders(query: string): Promise<FolderResponseDTO[]> {
  // Validasi input
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const folders = await this.folderRepository.searchFolders(query.trim());
    return folders.map(this.mapFolderToDTO);
  } catch (error) {
    console.error('Search error in service:', error);
    throw new Error('Failed to search folders');
  }
}

private mapFolderToDTO(folder: any): FolderResponseDTO {
  return {
    id: folder.id,
    name: folder.name,
    parentId: folder.parentId,
    createdAt: folder.createdAt.toISOString(),
    updatedAt: folder.updatedAt.toISOString(),
  };
}

  private mapFileToDTO(file: any): FileResponseDTO {
    return {
      id: file.id,
      name: file.name,
      folderId: file.folderId,
      size: file.size.toString(),
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
    };
  }

  private mapTreeToDTO(tree: any[]): FolderTreeResponseDTO[] {
    return tree.map((node) => ({
      id: node.id,
      name: node.name,
      parentId: node.parentId,
      createdAt: node.createdAt.toISOString(),
      updatedAt: node.updatedAt.toISOString(),
      children: node.children ? this.mapTreeToDTO(node.children) : [],
      files: node.files ? node.files.map(this.mapFileToDTO) : undefined,
    }));
  }
}