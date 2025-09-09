const jwt = require('jsonwebtoken');

async function testLiveDraftAPI() {
  console.log('🧪 Testing Live Draft API endpoint...');

  try {
    // Create JWT token for the test user
    const payload = { id: '68bfde21e6e8aa0983eb2a46', email: 'miraz@gmail.com' };
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const token = jwt.sign(payload, secret, { expiresIn: '24h' });
    
    console.log('✅ JWT token created');
    
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/draftfetch?query=&writingPhase=all', {
      method: 'GET',
      headers: {
        'Cookie': `auth-token=${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ API returned ${data.length} drafts:`);
    data.forEach((draft, index) => {
      console.log(`   ${index + 1}. "${draft.title}"`);
      console.log(`      - Phase: ${draft.writingPhase}`);
      console.log(`      - Words: ${draft.wordCount}`);
      console.log(`      - Date: ${new Date(draft.date).toLocaleDateString()}`);
      console.log('');
    });
    
    if (data.length >= 7) {
      console.log('🎉 SUCCESS: API is returning all drafts!');
    } else {
      console.log(`⚠️  WARNING: Expected 7 drafts, got ${data.length}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLiveDraftAPI();
