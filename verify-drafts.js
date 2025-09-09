const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyUserDrafts() {
  console.log('✅ Verifying user drafts after updates...\n');

  const userId = '68bfde21e6e8aa0983eb2a46'; // Current logged-in user

  try {
    const userDrafts = await prisma.post.findMany({
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
    
    console.log(`📊 User ${userId} now has ${userDrafts.length} drafts:`);
    console.log('='.repeat(80));
    
    userDrafts.forEach((draft, index) => {
      console.log(`${index + 1}. "${draft.title}"`);
      console.log(`   📝 Phase: ${draft.writingPhase || 'Not set'}`);
      console.log(`   📅 Created: ${draft.createdAt.toLocaleDateString()}`);
      console.log(`   🔄 Updated: ${draft.updatedAt.toLocaleDateString()}`);
      console.log(`   📖 Words: ${draft.wordCount || 0}`);
      console.log(`   📄 Excerpt: ${draft.excerpt?.substring(0, 80) || 'No excerpt'}...`);
      console.log(`   🆔 ID: ${draft.id}`);
      console.log('   ' + '-'.repeat(60));
    });

    console.log('\n🎯 Expected behavior:');
    console.log('   ✅ Draft API should return 4 results');
    console.log('   ✅ UI should display all 4 drafts');
    console.log('   ✅ Filtering by phase should work');
    console.log('   ✅ Refresh button should reload data');

    // Test API query format
    const formattedForAPI = userDrafts.map(draft => ({
      id: draft.id,
      title: draft.title,
      excerpt: draft.excerpt || (draft.content ? draft.content.slice(0, 150) + '...' : 'No content available'),
      writingPhase: draft.writingPhase || 'Needs Editing',
      date: draft.updatedAt.toISOString(),
      wordCount: draft.wordCount || 0
    }));

    console.log('\n📡 API Response Preview:');
    console.log(JSON.stringify(formattedForAPI, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUserDrafts();
