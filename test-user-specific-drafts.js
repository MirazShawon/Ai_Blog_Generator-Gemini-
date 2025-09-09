const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSpecificUserDrafts() {
  console.log('🔍 Checking drafts for specific user...\n');

  const userId = '68bfde21e6e8aa0983eb2a46'; // The user ID from the logs
  
  try {
    // Get user info
    console.log('1. Getting user information...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log(`✅ User found: ${user.email || user.name} (ID: ${user.id})`);

    // Get ALL posts by this user
    console.log('\n2. Getting ALL posts by this user...');
    const allUserPosts = await prisma.post.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        status: true,
        writingPhase: true,
        createdAt: true,
        updatedAt: true,
        wordCount: true,
        excerpt: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log(`✅ Found ${allUserPosts.length} total posts for this user:`);
    
    allUserPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}"`);
      console.log(`      - Status: ${post.status}`);
      console.log(`      - Phase: ${post.writingPhase || 'Not set'}`);
      console.log(`      - Created: ${post.createdAt.toLocaleDateString()}`);
      console.log(`      - Updated: ${post.updatedAt.toLocaleDateString()}`);
      console.log(`      - Words: ${post.wordCount || 0}`);
      console.log();
    });

    // Get only DRAFT posts by this user
    console.log('3. Getting DRAFT posts specifically...');
    const draftPosts = await prisma.post.findMany({
      where: { 
        authorId: userId,
        status: "draft" 
      },
      select: {
        id: true,
        title: true,
        status: true,
        writingPhase: true,
        createdAt: true,
        updatedAt: true,
        wordCount: true,
        excerpt: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log(`✅ Found ${draftPosts.length} draft posts for this user:`);
    
    draftPosts.forEach((draft, index) => {
      console.log(`   ${index + 1}. "${draft.title}"`);
      console.log(`      - Phase: ${draft.writingPhase || 'Not set'}`);
      console.log(`      - Created: ${draft.createdAt.toLocaleDateString()}`);
      console.log(`      - Updated: ${draft.updatedAt.toLocaleDateString()}`);
      console.log(`      - Words: ${draft.wordCount || 0}`);
      console.log(`      - Excerpt: ${draft.excerpt?.substring(0, 50) || 'No excerpt'}...`);
      console.log();
    });

    // Test the exact query the API would run
    console.log('4. Testing the exact API query...');
    const apiQuery = await prisma.post.findMany({
      where: {
        authorId: userId,
        status: "draft",
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        writingPhase: true,
        createdAt: true,
        wordCount: true,
        updatedAt: true,
        content: true,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    console.log(`✅ API query would return ${apiQuery.length} results:`);
    
    apiQuery.forEach((draft, index) => {
      console.log(`   ${index + 1}. "${draft.title}"`);
      console.log(`      - ID: ${draft.id}`);
      console.log(`      - Phase: ${draft.writingPhase || 'Not set'}`);
      console.log(`      - Updated: ${draft.updatedAt.toISOString()}`);
      console.log(`      - Content length: ${draft.content?.length || 0} chars`);
      console.log();
    });

    if (draftPosts.length === 1 && allUserPosts.length > 1) {
      console.log('🤔 Analysis:');
      console.log('   - User has multiple posts but only 1 is a draft');
      console.log('   - Other posts might be published or have different status');
      console.log('   - The draft API is working correctly by showing only draft posts');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificUserDrafts();
