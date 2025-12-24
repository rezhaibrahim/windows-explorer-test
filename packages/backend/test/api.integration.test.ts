import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { getPrismaClient } from '../src/infrastructure/database/prisma';
import { PrismaFolderRepository } from '../src/infrastructure/repositories/PrismaFolderRepository';
import { FolderService } from '../src/application/services/FolderService';
import { createFolderController } from '../src/presentation/controllers/FolderController';

describe('Folder API Integration Tests', () => {
  let app: Elysia;
  let testFolderId: string;

  beforeAll(async () => {
    // Setup test app
    const prisma = getPrismaClient();
    const folderRepository = new PrismaFolderRepository(prisma);
    const folderService = new FolderService(folderRepository);

    app = new Elysia()
      .use(cors({ origin: true }))
      .use(createFolderController(folderService));

    // Create test folder
    const response = await app.handle(
      new Request('http://localhost/api/v1/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Integration Folder' }),
      })
    );

    const data = await response.json();
    if (data.success && data.data) {
      testFolderId = data.data.id;
    }
  });

  afterAll(async () => {
    // Cleanup test data
    const prisma = getPrismaClient();
    await prisma.folder.deleteMany({
      where: { name: 'Test Integration Folder' },
    });
    await prisma.$disconnect();
  });

  describe('GET /api/v1/folders/tree', () => {
    it('should return folder tree', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/folders/tree')
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/folders/children', () => {
    it('should return root folders when no parentId', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/folders/children')
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return children of specific folder', async () => {
      const response = await app.handle(
        new Request(`http://localhost/api/v1/folders/children?parentId=${testFolderId}`)
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('POST /api/v1/folders', () => {
    it('should create new folder', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'New Test Folder' }),
        })
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('New Test Folder');

      // Cleanup
      const prisma = getPrismaClient();
      await prisma.folder.delete({ where: { id: data.data.id } });
    });

    it('should fail with empty name', async () => {
  const response = await app.handle(
    new Request('http://localhost/api/v1/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    })
  );

  // Elysia validation error returns 400 or 422
  expect(response.status).toBeGreaterThanOrEqual(400);
  
  const data = await response.json();
  
  // Either success: false or validation error format
  const isFailed = data.success === false || response.status >= 400;
  expect(isFailed).toBe(true);
});

  });

  describe('GET /api/v1/folders/search', () => {
    it('should search folders', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/folders/search?q=Test')
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return empty for non-existent folder', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/folders/search?q=NonExistentXYZ123')
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBe(0);
    });
  });

  describe('GET /api/v1/folders/:id/details', () => {
    it('should get folder details', async () => {
      const response = await app.handle(
        new Request(`http://localhost/api/v1/folders/${testFolderId}/details`)
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('folders');
      expect(data.data).toHaveProperty('files');
    });
  });
});