const jwt = require('jsonwebtoken');

async function testDraftAPI() {
  console.log('🧪 Testing Draft API endpoint...\n');

  try {
    // Test 1: Create a JWT token for testing
    console.log('1. Creating test JWT token...');
    const testUser = {
      id: '68bfde21e6e8aa0983eb2a46', // Use an actual user ID from database
      email: 'miraz@gmail.com'
    };
    
    const token = jwt.sign(testUser, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    console.log('✅ JWT token created');

    // Test 2: Test the draft API with the token
    console.log('\n2. Testing draft API endpoint...');
    const response = await fetch('http://localhost:3002/api/draftfetch', {
      method: 'GET',
      headers: {
        'Cookie': `auth-token=${token}`,
        'Accept': 'application/json',
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API Response:', data);
    console.log(`   - Found ${data.length} drafts for user`);

    data.forEach((draft, index) => {
      console.log(`   ${index + 1}. "${draft.title}"`);
      console.log(`      - Phase: ${draft.writingPhase}`);
      console.log(`      - Words: ${draft.wordCount}`);
      console.log(`      - Date: ${new Date(draft.date).toLocaleDateString()}`);
    });

    console.log('\n🎉 Draft API test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDraftAPI();
