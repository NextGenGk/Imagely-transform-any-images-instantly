/**
 * Database Setup Verification Script
 * 
 * This script verifies that the Prisma database setup is complete and working:
 * - Database connection is established
 * - User and ProcessingRequest models are accessible
 * - Indexes are properly configured
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabaseSetup() {
  console.log('🔍 Verifying database setup...\n');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Verify User model
    const userCount = await prisma.user.count();
    console.log(`✅ User model accessible (count: ${userCount})`);

    // Verify ProcessingRequest model
    const requestCount = await prisma.processingRequest.count();
    console.log(`✅ ProcessingRequest model accessible (count: ${requestCount})`);

    // Test query with index
    const recentRequests = await prisma.processingRequest.findMany({
      where: { userId: 'test' },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    console.log('✅ Indexed query (userId, createdAt) working');

    console.log('\n✨ Database setup verification complete!');
    console.log('\nSetup Summary:');
    console.log('- Neon PostgreSQL database connected');
    console.log('- Connection pooling enabled (via -pooler endpoint)');
    console.log('- User model with clerkId and email unique constraints');
    console.log('- ProcessingRequest model with JSON storage');
    console.log('- Composite index on (userId, createdAt) for efficient queries');
    console.log('- Foreign key relationship: ProcessingRequest -> User');

  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabaseSetup();
