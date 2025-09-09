// Comprehensive API Testing Script for BlogAI
import fetch from 'node-fetch';
const BASE_URL = 'http://localhost:3003';

// Test Data
const testUser = {
  name: "Test User",
  email: `test${Date.now()}@example.com`,
  password: "testpass123"
};

const testPost = {
  title: "Test Blog Post",
  content: "This is a test blog post content for API testing.",
  excerpt: "Test excerpt for the blog post",
  published: false
};

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      success: response.ok,
      status: response.status,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message
    };
  }
}

// Test Functions
async function testSignup() {
  console.log('\n🧪 Testing Signup API...');
  console.log('📤 Posting data:', JSON.stringify(testUser, null, 2));
  
  const result = await apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  
  console.log('📥 Response:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('✅ Signup API: PASS');
    return result.data;
  } else {
    console.log('❌ Signup API: FAIL');
    return null;
  }
}

async function testLogin() {
  console.log('\n🧪 Testing Login API...');
  const loginData = {
    email: testUser.email,
    password: testUser.password
  };
  
  console.log('📤 Posting data:', JSON.stringify(loginData, null, 2));
  
  const result = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(loginData)
  });
  
  console.log('📥 Response:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('✅ Login API: PASS');
    return result.data;
  } else {
    console.log('❌ Login API: FAIL');
    return null;
  }
}

async function testCreatePost(authToken) {
  console.log('\n🧪 Testing Create Post API...');
  console.log('📤 Posting data:', JSON.stringify(testPost, null, 2));
  
  const result = await apiRequest('/api/posts', {
    method: 'POST',
    body: JSON.stringify(testPost),
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  console.log('📥 Response:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('✅ Create Post API: PASS');
    return result.data;
  } else {
    console.log('❌ Create Post API: FAIL');
    return null;
  }
}

async function testGetPosts() {
  console.log('\n🧪 Testing Get Posts API...');
  
  const result = await apiRequest('/api/posts', {
    method: 'GET'
  });
  
  console.log('📥 Response:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('✅ Get Posts API: PASS');
    return result.data;
  } else {
    console.log('❌ Get Posts API: FAIL');
    return null;
  }
}

async function testGeminiAPI() {
  console.log('\n🧪 Testing Gemini AI API...');
  const geminiData = {
    prompt: "Write a short paragraph about the benefits of AI in content creation."
  };
  
  console.log('📤 Posting data:', JSON.stringify(geminiData, null, 2));
  
  const result = await apiRequest('/api/gemini', {
    method: 'POST',
    body: JSON.stringify(geminiData)
  });
  
  console.log('📥 Response:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('✅ Gemini API: PASS');
    return result.data;
  } else {
    console.log('❌ Gemini API: FAIL');
    return null;
  }
}

async function testDashboardAPI() {
  console.log('\n🧪 Testing Dashboard API...');
  
  const result = await apiRequest('/api/dashboard', {
    method: 'GET'
  });
  
  console.log('📥 Response:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('✅ Dashboard API: PASS');
    return result.data;
  } else {
    console.log('❌ Dashboard API: FAIL');
    return null;
  }
}

// Main Test Runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Tests for BlogAI');
  console.log('=' .repeat(50));
  
  let authToken = null;
  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  // Test 1: Signup
  testResults.total++;
  const signupResult = await testSignup();
  if (signupResult) {
    testResults.passed++;
    authToken = signupResult.token;
  } else {
    testResults.failed++;
  }
  
  // Test 2: Login
  testResults.total++;
  const loginResult = await testLogin();
  if (loginResult) {
    testResults.passed++;
    if (!authToken) authToken = loginResult.token;
  } else {
    testResults.failed++;
  }
  
  // Test 3: Get Posts (should work without auth)
  testResults.total++;
  const getPostsResult = await testGetPosts();
  if (getPostsResult) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  
  // Test 4: Create Post (requires auth)
  if (authToken) {
    testResults.total++;
    const createPostResult = await testCreatePost(authToken);
    if (createPostResult) {
      testResults.passed++;
    } else {
      testResults.failed++;
    }
  }
  
  // Test 5: Dashboard API
  testResults.total++;
  const dashboardResult = await testDashboardAPI();
  if (dashboardResult) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  
  // Test 6: Gemini AI API
  testResults.total++;
  const geminiResult = await testGeminiAPI();
  if (geminiResult) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  
  // Final Results
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.passed === testResults.total) {
    console.log('\n🎉 ALL TESTS PASSED! Your API is working perfectly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test runner failed:', error);
});
