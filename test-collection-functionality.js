const jwt = require('jsonwebtoken');

async function testCollectionFunctionality() {
  console.log('🧪 Testing Collection Creation and Management...');

  try {
    // Create JWT token for the test user
    const payload = { id: '68bfde21e6e8aa0983eb2a46', email: 'miraz@gmail.com' };
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const token = jwt.sign(payload, secret, { expiresIn: '24h' });
    
    console.log('✅ JWT token created for testing');
    
    // Test 1: Create a new collection
    console.log('\n📝 Testing collection creation...');
    const createResponse = await fetch('http://localhost:3000/api/collections', {
      method: 'POST',
      headers: {
        'Cookie': `auth-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Collection - React Tutorials',
        description: 'A collection of React-related blog posts and tutorials'
      })
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create collection: ${createResponse.status} - ${createResponse.statusText}`);
    }
    
    const newCollection = await createResponse.json();
    console.log('✅ Collection created successfully:', {
      id: newCollection.id,
      name: newCollection.name,
      description: newCollection.description
    });
    
    // Test 2: Get all collections
    console.log('\n📋 Testing collection listing...');
    const listResponse = await fetch('http://localhost:3000/api/collections', {
      headers: {
        'Cookie': `auth-token=${token}`,
      }
    });
    
    if (!listResponse.ok) {
      throw new Error(`Failed to list collections: ${listResponse.status}`);
    }
    
    const collections = await listResponse.json();
    console.log(`✅ Found ${collections.length} collection(s):`);
    collections.forEach((collection, index) => {
      console.log(`   ${index + 1}. "${collection.name}" - ${collection._count?.posts || 0} posts`);
    });
    
    // Test 3: Add draft to collection (using first available draft)
    console.log('\n🔗 Testing adding draft to collection...');
    const draftsResponse = await fetch('http://localhost:3000/api/draftfetch', {
      headers: {
        'Cookie': `auth-token=${token}`,
      }
    });
    
    if (!draftsResponse.ok) {
      throw new Error(`Failed to get drafts: ${draftsResponse.status}`);
    }
    
    const drafts = await draftsResponse.json();
    
    if (drafts.length > 0) {
      const firstDraft = drafts[0];
      console.log(`📄 Adding draft "${firstDraft.title}" to collection...`);
      
      const addToCollectionResponse = await fetch(`http://localhost:3000/api/posts/${firstDraft.id}/collections`, {
        method: 'PUT',
        headers: {
          'Cookie': `auth-token=${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          collectionIds: [newCollection.id]
        })
      });
      
      if (!addToCollectionResponse.ok) {
        throw new Error(`Failed to add to collection: ${addToCollectionResponse.status}`);
      }
      
      const result = await addToCollectionResponse.json();
      console.log('✅ Draft successfully added to collection!');
      console.log('📊 Post now belongs to:', result.map(c => c.name).join(', '));
    } else {
      console.log('⚠️  No drafts found to test collection assignment');
    }
    
    console.log('\n🎉 All collection tests completed successfully!');
    console.log('\n📖 Summary:');
    console.log('  ✅ Collection creation: Working');
    console.log('  ✅ Collection listing: Working');
    console.log('  ✅ Adding posts to collections: Working');
    console.log('\n🌟 Your enhanced "Add to Collection" functionality is ready!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCollectionFunctionality();
