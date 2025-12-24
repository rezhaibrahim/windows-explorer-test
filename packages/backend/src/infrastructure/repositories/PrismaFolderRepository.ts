import { PrismaClient } from '@prisma/client';
import type { IFolderRepository } from '../../domain/repositories/IFolderRepository';
import type {
  FolderEntity,
  FolderTreeEntity,
  CreateFolderDTO,
  FileEntity,
} from '../../domain/entities/Folder';

export class PrismaFolderRepository implements IFolderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getAllFoldersTree(): Promise<FolderTreeEntity[]> {
    const allFolders = await this.prisma.folder.findMany({
      include: {
        files: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const folderMap = new Map<string, FolderTreeEntity>();
    const rootFolders: FolderTreeEntity[] = [];

    allFolders.forEach((folder) => {
      folderMap.set(folder.id, {
        ...folder,
        children: [],
        files: folder.files,
      });
    });

    allFolders.forEach((folder) => {
      const node = folderMap.get(folder.id)!;
      if (folder.parentId === null) {
        rootFolders.push(node);
      } else {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return rootFolders;
  }

  async getChildrenByParentId(parentId: string | null): Promise<FolderEntity[]> {
    return await this.prisma.folder.findMany({
      where: {
        parentId: parentId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getFolderById(id: string): Promise<FolderEntity | null> {
    return await this.prisma.folder.findUnique({
      where: { id },
    });
  }

  async createFolder(data: CreateFolderDTO): Promise<FolderEntity> {
    return await this.prisma.folder.create({
      data: {
        name: data.name,
        parentId: data.parentId || null,
      },
    });
  }

  async searchFolders(query: string): Promise<FolderEntity[]> {
  try {
    const folders = await this.prisma.folder.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: 100,
    });
    return folders;
  } catch (error) {
    throw error;
  }
}

  async getFilesByFolderId(folderId: string): Promise<FileEntity[]> {
    return await this.prisma.file.findMany({
      where: {
        folderId: folderId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getAllFolders(): Promise<FolderEntity[]> {
    return await this.prisma.folder.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}