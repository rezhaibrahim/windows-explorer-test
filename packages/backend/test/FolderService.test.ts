import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { FolderService } from '../src/application/services/FolderService';
import type { IFolderRepository } from '../src/domain/repositories/IFolderRepository';
import type { FolderEntity, FolderTreeEntity, CreateFolderDTO } from '../src/domain/entities/Folder';

describe('FolderService', () => {
  let mockRepository: IFolderRepository;
  let folderService: FolderService;

  beforeEach(() => {
    // Mock repository
    mockRepository = {
      getAllFoldersTree: mock(() => Promise.resolve([])),
      getChildrenByParentId: mock(() => Promise.resolve([])),
      getFolderById: mock(() => Promise.resolve(null)),
      createFolder: mock(() => Promise.resolve({} as FolderEntity)),
      searchFolders: mock(() => Promise.resolve([])),
      getFilesByFolderId: mock(() => Promise.resolve([])),
      getAllFolders: mock(() => Promise.resolve([])),
    };

    folderService = new FolderService(mockRepository);
  });

  describe('createFolder', () => {
    it('should create folder with valid data', async () => {
      const mockFolder: FolderEntity = {
        id: '1',
        name: 'Test Folder',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.createFolder = mock(() => Promise.resolve(mockFolder));

      const result = await folderService.createFolder({ name: 'Test Folder' });

      expect(result.name).toBe('Test Folder');
      expect(result.id).toBe('1');
      expect(mockRepository.createFolder).toHaveBeenCalledTimes(1);
    });

    it('should throw error for empty name', async () => {
      expect(async () => {
        await folderService.createFolder({ name: '' });
      }).toThrow('Folder name cannot be empty');
    });

    it('should throw error for name too long', async () => {
      const longName = 'a'.repeat(300);
      
      expect(async () => {
        await folderService.createFolder({ name: longName });
      }).toThrow('Folder name too long');
    });

    it('should create folder with parent', async () => {
      const mockFolder: FolderEntity = {
        id: '2',
        name: 'Subfolder',
        parentId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.createFolder = mock(() => Promise.resolve(mockFolder));

      const result = await folderService.createFolder({ 
        name: 'Subfolder',
        parentId: '1' 
      });

      expect(result.parentId).toBe('1');
    });
  });

  describe('getFolderTree', () => {
    it('should return folder tree', async () => {
      const mockTree: FolderTreeEntity[] = [
        {
          id: '1',
          name: 'Documents',
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: [],
        },
      ];

      mockRepository.getAllFoldersTree = mock(() => Promise.resolve(mockTree));

      const result = await folderService.getFolderTree();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Documents');
      expect(mockRepository.getAllFoldersTree).toHaveBeenCalledTimes(1);
    });

    it('should map tree to DTO correctly', async () => {
      const mockTree: FolderTreeEntity[] = [
        {
          id: '1',
          name: 'Test',
          parentId: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          children: [],
        },
      ];

      mockRepository.getAllFoldersTree = mock(() => Promise.resolve(mockTree));

      const result = await folderService.getFolderTree();

      expect(result[0].createdAt).toBeTypeOf('string');
      expect(result[0].updatedAt).toBeTypeOf('string');
    });
  });

  describe('searchFolders', () => {
    it('should return empty array for empty query', async () => {
      const result = await folderService.searchFolders('');

      expect(result).toEqual([]);
      expect(mockRepository.searchFolders).not.toHaveBeenCalled();
    });

    it('should search folders with valid query', async () => {
      const mockFolders: FolderEntity[] = [
        {
          id: '1',
          name: 'Work',
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.searchFolders = mock(() => Promise.resolve(mockFolders));

      const result = await folderService.searchFolders('Work');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Work');
      expect(mockRepository.searchFolders).toHaveBeenCalledWith('Work');
    });

    it('should trim search query', async () => {
      mockRepository.searchFolders = mock(() => Promise.resolve([]));

      await folderService.searchFolders('  Work  ');

      expect(mockRepository.searchFolders).toHaveBeenCalledWith('Work');
    });
  });

  describe('getDirectChildren', () => {
    it('should get children of parent folder', async () => {
      const mockChildren: FolderEntity[] = [
        {
          id: '2',
          name: 'Subfolder',
          parentId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.getChildrenByParentId = mock(() => Promise.resolve(mockChildren));

      const result = await folderService.getDirectChildren('1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Subfolder');
      expect(mockRepository.getChildrenByParentId).toHaveBeenCalledWith('1');
    });

    it('should get root folders when parentId is null', async () => {
      mockRepository.getChildrenByParentId = mock(() => Promise.resolve([]));

      await folderService.getDirectChildren(null);

      expect(mockRepository.getChildrenByParentId).toHaveBeenCalledWith(null);
    });
  });

  describe('getFolderDetails', () => {
    it('should get folder with children and files', async () => {
      const mockFolders: FolderEntity[] = [
        {
          id: '2',
          name: 'Subfolder',
          parentId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockFiles = [
        {
          id: 'f1',
          name: 'test.txt',
          folderId: '1',
          size: BigInt(1024),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.getChildrenByParentId = mock(() => Promise.resolve(mockFolders));
      mockRepository.getFilesByFolderId = mock(() => Promise.resolve(mockFiles));

      const result = await folderService.getFolderDetails('1');

      expect(result.folders).toHaveLength(1);
      expect(result.files).toHaveLength(1);
      expect(result.files[0].name).toBe('test.txt');
    });
  });
});