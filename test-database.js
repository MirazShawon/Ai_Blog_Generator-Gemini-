// Test database connection and draft saving
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('🔄 Testing database connection...');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test user query
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
      },
      take: 3
    });
    
    console.log('✅ Found users:', users);
    
    // Test post query
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        writingPhase: true,
      },
      take: 5
    });
    
    console.log('✅ Found posts:', posts);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Test creating a draft post
async function testDraftCreation() {
  console.log('\n🔄 Testing draft creation...');
  
  try {
    await prisma.$connect();
    
    // Get the first user
    const user = await prisma.user.findFirst({
      select: { id: true, email: true }
    });
    
    if (!user) {
      console.log('❌ No users found in database');
      return false;
    }
    
    console.log('✅ Using user:', user.email);
    
    // Create a test post
    const testPost = await prisma.post.create({
      data: {
        title: 'Database Connection Test Post',
        content: 'This is a test post to verify database connectivity and draft creation functionality.',
        status: 'draft',
        writingPhase: 'Needs Editing',
        excerpt: 'This is a test post to verify database connectivity...',
        authorId: user.id,
        wordCount: 15,
      },
    });
    
    console.log('✅ Created test post:', testPost.id);
    
    // Clean up - delete the test post
    await prisma.post.delete({
      where: { id: testPost.id }
    });
    
    console.log('✅ Cleaned up test post');
    
    return true;
  } catch (error) {
    console.error('❌ Draft creation failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🧪 BlogAI Database Connection Test\n');
  
  const connectionTest = await testDatabaseConnection();
  const draftTest = await testDraftCreation();
  
  console.log('\n📊 Test Results:');
  console.log(`Database Connection: ${connectionTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Draft Creation: ${draftTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (connectionTest && draftTest) {
    console.log('\n🎉 All tests passed! Database is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
