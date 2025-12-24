import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  await prisma.file.deleteMany();
  await prisma.folder.deleteMany();

  const documents = await prisma.folder.create({
    data: { name: 'Documents' },
  });

  const pictures = await prisma.folder.create({
    data: { name: 'Pictures' },
  });

  const downloads = await prisma.folder.create({
    data: { name: 'Downloads' },
  });

  const videos = await prisma.folder.create({
    data: { name: 'Videos' },
  });

  const work = await prisma.folder.create({
    data: { name: 'Work', parentId: documents.id },
  });

  const personal = await prisma.folder.create({
    data: { name: 'Personal', parentId: documents.id },
  });

  const projects = await prisma.folder.create({
    data: { name: 'Projects', parentId: work.id },
  });

  const reports = await prisma.folder.create({
    data: { name: 'Reports', parentId: work.id },
  });

  const project2024 = await prisma.folder.create({
    data: { name: '2024', parentId: projects.id },
  });

  const q1 = await prisma.folder.create({
    data: { name: 'Q1', parentId: project2024.id },
  });

  const q2 = await prisma.folder.create({
    data: { name: 'Q2', parentId: project2024.id },
  });

  const vacation = await prisma.folder.create({
    data: { name: 'Vacation', parentId: pictures.id },
  });

  const family = await prisma.folder.create({
    data: { name: 'Family', parentId: pictures.id },
  });

  const bali = await prisma.folder.create({
    data: { name: 'Bali Trip', parentId: vacation.id },
  });

  await prisma.file.createMany({
    data: [
      { name: 'Project Proposal.docx', folderId: q1.id, size: BigInt(1024000) },
      { name: 'Budget 2024.xlsx', folderId: q1.id, size: BigInt(512000) },
      { name: 'Meeting Notes.txt', folderId: work.id, size: BigInt(8192) },
      { name: 'Annual Report.pdf', folderId: reports.id, size: BigInt(2048000) },
      { name: 'beach.jpg', folderId: bali.id, size: BigInt(3145728) },
      { name: 'sunset.jpg', folderId: bali.id, size: BigInt(2621440) },
      { name: 'family-reunion.jpg', folderId: family.id, size: BigInt(2097152) },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });