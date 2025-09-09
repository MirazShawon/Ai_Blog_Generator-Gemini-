const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDraftFetching() {
  console.log('🧪 Testing draft fetching functionality...\n');

  try {
    // Test 1: Check all draft posts
    console.log('1. Checking all draft posts in database...');
    const allDrafts = await prisma.post.findMany({
      where: {
        status: "draft"
      },
      include: {
        author: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`✅ Found ${allDrafts.length} total drafts`);
    allDrafts.forEach((draft, index) => {
      console.log(`   ${index + 1}. "${draft.title}" by ${draft.author.email || draft.author.name}`);
      console.log(`      - Phase: ${draft.writingPhase || 'Not set'}`);
      console.log(`      - Word Count: ${draft.wordCount || 0}`);
      console.log(`      - Created: ${draft.createdAt.toLocaleDateString()}`);
      console.log(`      - Updated: ${draft.updatedAt.toLocaleDateString()}`);
      console.log(`      - Excerpt: ${draft.excerpt?.substring(0, 50) || 'No excerpt'}...`);
      console.log();
    });

    // Test 2: Check drafts by writing phase
    console.log('2. Checking drafts by writing phase...');
    const phases = ['Needs Editing', 'Ready to Publish', 'Incomplete'];
    
    for (const phase of phases) {
      const phaseDrafts = await prisma.post.count({
        where: {
          status: "draft",
          writingPhase: phase
        }
      });
      console.log(`   - ${phase}: ${phaseDrafts} drafts`);
    }
    console.log();

    // Test 3: Check drafts by user
    console.log('3. Checking drafts by user...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    for (const user of users) {
      const userDrafts = await prisma.post.count({
        where: {
          authorId: user.id,
          status: "draft"
        }
      });
      console.log(`   - ${user.email || user.name}: ${userDrafts} drafts`);
    }
    console.log();

    // Test 4: Test search functionality
    console.log('4. Testing search functionality...');
    const searchTerms = ['Next.js', 'Blog', 'Test'];
    
    for (const term of searchTerms) {
      const searchResults = await prisma.post.findMany({
        where: {
          status: "draft",
          OR: [
            {
              title: {
                contains: term,
                mode: 'insensitive'
              }
            },
            {
              content: {
                contains: term,
                mode: 'insensitive'
              }
            },
            {
              excerpt: {
                contains: term,
                mode: 'insensitive'
              }
            }
          ]
        },
        select: {
          id: true,
          title: true
        }
      });
      
      console.log(`   - Search for "${term}": ${searchResults.length} results`);
      searchResults.forEach(result => {
        console.log(`     • ${result.title}`);
      });
    }
    console.log();

    console.log('🎉 Draft fetching test completed successfully!');

    if (allDrafts.length === 0) {
      console.log('\n⚠️  No drafts found in database. Try creating some drafts first.');
    } else {
      console.log('\n✨ Your draft system is working properly!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDraftFetching()
  .then(() => {
    console.log('\n🏁 Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed with error:', error);
    process.exit(1);
  });
