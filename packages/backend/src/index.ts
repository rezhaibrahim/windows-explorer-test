import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { getPrismaClient } from './infrastructure/database/prisma';
import { PrismaFolderRepository } from './infrastructure/repositories/PrismaFolderRepository';
import { FolderService } from './application/services/FolderService';
import { createFolderController } from './presentation/controllers/FolderController';

const PORT = process.env.PORT || 3000;

// Dependency Injection
const prisma = getPrismaClient();
const folderRepository = new PrismaFolderRepository(prisma);
const folderService = new FolderService(folderRepository);

// Create App
const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))

  .get('/api', () => ({
    name: 'Windows Explorer API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      folderTree: 'GET /api/v1/folders/tree',
      folderChildren: 'GET /api/v1/folders/children?parentId=:id',
      folderDetails: 'GET /api/v1/folders/:id/details',
      createFolder: 'POST /api/v1/folders',
      searchFolders: 'GET /api/v1/folders/search?q=:query',
    },
  }))

  .use(createFolderController(folderService))

  .onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: 'Validation error',
        details: error.message,
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: 'Resource not found',
      };
    }

    set.status = 500;
    return {
      success: false,
      error: 'Internal server error',
    };
  })

  .listen(PORT);

console.log(`
🚀 Server is running!

📍 URL: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
📚 API Info: http://localhost:${PORT}/api

Environment: ${process.env.NODE_ENV || 'development'}
Database: Connected via Prisma
`);

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});