import { Elysia, t } from 'elysia';
import type { FolderService } from '../../application/services/FolderService';

export const createFolderController = (folderService: FolderService) => {
  return new Elysia({ prefix: '/api/v1/folders' })
    .get('/tree', async () => {
      try {
        const tree = await folderService.getFolderTree();
        return {
          success: true,
          data: tree,
        };
      } catch (error) {
        console.error('Error fetching folder tree:', error);
        return {
          success: false,
          error: 'Failed to fetch folder tree',
        };
      }
    })

    .get('/children', async ({ query }) => {
      try {
        const parentId = query.parentId || null;
        const children = await folderService.getDirectChildren(parentId);
        return {
          success: true,
          data: children,
        };
      } catch (error) {
        console.error('Error fetching children:', error);
        return {
          success: false,
          error: 'Failed to fetch folder children',
        };
      }
    }, {
      query: t.Object({
        parentId: t.Optional(t.String()),
      }),
    })

    .get('/:id/details', async ({ params }) => {
      try {
        const details = await folderService.getFolderDetails(params.id);
        return {
          success: true,
          data: details,
        };
      } catch (error) {
        console.error('Error fetching folder details:', error);
        return {
          success: false,
          error: 'Failed to fetch folder details',
        };
      }
    }, {
      params: t.Object({
        id: t.String(),
      }),
    })

    .post('/', async ({ body }) => {
      try {
        const folder = await folderService.createFolder(body);
        return {
          success: true,
          data: folder,
        };
      } catch (error: any) {
        console.error('Error creating folder:', error);
        return {
          success: false,
          error: error.message || 'Failed to create folder',
        };
      }
    }, {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        parentId: t.Optional(t.String()),
      }),
    })

    .get('/search', async ({ query }) => {
      try {
        const folders = await folderService.searchFolders(query.q);
        return {
          success: true,
          data: folders,
        };
      } catch (error) {
        console.error('Error searching folders:', error);
        return {
          success: false,
          error: 'Failed to search folders',
        };
      }
    }, {
      query: t.Object({
        q: t.String({ minLength: 1 }),
      }),
    });
};