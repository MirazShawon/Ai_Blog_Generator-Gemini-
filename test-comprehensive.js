/**
 * Simple API Testing Script for BlogAI
 * Tests all major API endpoints and functionality
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002';
const API_BASE = `${BASE_URL}/api`;

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    log(`✅ ${testName}`, colors.green);
  } else {
    failedTests++;
    log(`❌ ${testName}`, colors.red);
  }
  if (details) {
    log(`   ${details}`, colors.yellow);
  }
}

// Wait for server to be ready
async function waitForServer() {
  log('🔄 Waiting for server to be ready...', colors.blue);
  for (let i = 0; i < 10; i++) {
    try {
      const response = await fetch(BASE_URL, { timeout: 5000 });
      if (response.status < 500) {
        log('✅ Server is ready!', colors.green);
        return true;
      }
    } catch (error) {
      // Server not ready, wait and retry
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  log('❌ Server is not responding', colors.red);
  return false;
}

// Test authentication
async function testAuthentication() {
  log('\n🔐 Testing Authentication...', colors.bright);

  // Test login with admin credentials
  try {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    const loginSuccess = loginResponse.status === 200 && loginData.success;

    logTest(
      'Admin Login',
      loginSuccess,
      loginSuccess ? `Logged in as: ${loginData.user?.email}` : `Status: ${loginResponse.status}`
    );

    // Extract auth cookie
    let authCookie = '';
    if (loginSuccess) {
      const cookies = loginResponse.headers.raw()['set-cookie'];
      if (cookies) {
        authCookie = cookies.find(cookie => cookie.startsWith('auth-token='));
      }
    }

    return authCookie;
  } catch (error) {
    logTest('Admin Login', false, error.message);
    return '';
  }
}

// Test user profile
async function testUserProfile(authCookie) {
  log('\n👤 Testing User Profile...', colors.bright);

  try {
    const profileResponse = await fetch(`${API_BASE}/user/profile`, {
      method: 'GET',
      headers: {
        'Cookie': authCookie
      }
    });

    const profileData = await profileResponse.json();
    const profileSuccess = profileResponse.status === 200 && profileData.id;

    logTest(
      'Get User Profile',
      profileSuccess,
      profileSuccess ? `User: ${profileData.name} (${profileData.role})` : `Status: ${profileResponse.status}`
    );

  } catch (error) {
    logTest('Get User Profile', false, error.message);
  }
}

// Test dashboard
async function testDashboard(authCookie) {
  log('\n📊 Testing Dashboard...', colors.bright);

  try {
    const dashboardResponse = await fetch(`${API_BASE}/dashboard`, {
      method: 'GET',
      headers: {
        'Cookie': authCookie
      }
    });

    const dashboardSuccess = dashboardResponse.status === 200;
    let details = `Status: ${dashboardResponse.status}`;

    if (dashboardSuccess) {
      const dashboardData = await dashboardResponse.json();
      details = `Posts: ${dashboardData.totalPosts || 0}, Generations: ${dashboardData.generationsLeft || 0}`;
    }

    logTest('Get Dashboard Data', dashboardSuccess, details);

  } catch (error) {
    logTest('Get Dashboard Data', false, error.message);
  }
}

// Test admin features
async function testAdminFeatures(authCookie) {
  log('\n👨‍💼 Testing Admin Features...', colors.bright);

  // Test admin stats
  try {
    const statsResponse = await fetch(`${API_BASE}/admin/stats`, {
      method: 'GET',
      headers: {
        'Cookie': authCookie
      }
    });

    const statsSuccess = statsResponse.status === 200;
    let details = `Status: ${statsResponse.status}`;

    if (statsSuccess) {
      const statsData = await statsResponse.json();
      details = `Users: ${statsData.totalUsers || 0}, Posts: ${statsData.totalPosts || 0}`;
    }

    logTest('Get Admin Statistics', statsSuccess, details);

  } catch (error) {
    logTest('Get Admin Statistics', false, error.message);
  }

  // Test user management
  try {
    const usersResponse = await fetch(`${API_BASE}/admin/users`, {
      method: 'GET',
      headers: {
        'Cookie': authCookie
      }
    });

    const usersSuccess = usersResponse.status === 200;
    let details = `Status: ${usersResponse.status}`;

    if (usersSuccess) {
      const usersData = await usersResponse.json();
      details = `Found ${usersData.users?.length || 0} users`;
    }

    logTest('Get All Users', usersSuccess, details);

  } catch (error) {
    logTest('Get All Users', false, error.message);
  }
}

// Test AI generation
async function testAIGeneration(authCookie) {
  log('\n🤖 Testing AI Generation...', colors.bright);

  // Test topic generation
  try {
    const topicsResponse = await fetch(`${API_BASE}/gemini-topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        keyword: 'technology',
        tone: 'professional',
        style: 'informative'
      }),
      timeout: 15000
    });

    const topicsSuccess = topicsResponse.status === 200;
    let details = `Status: ${topicsResponse.status}`;

    if (topicsSuccess) {
      const topicsData = await topicsResponse.json();
      details = `Generated ${topicsData.topics?.length || 0} topics`;
    }

    logTest('AI Topic Generation', topicsSuccess, details);

  } catch (error) {
    logTest('AI Topic Generation', false, error.message);
  }

  // Test content generation
  try {
    const contentResponse = await fetch(`${API_BASE}/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        topic: 'JavaScript Testing Best Practices',
        tone: 'professional',
        style: 'informative'
      }),
      timeout: 20000
    });

    const contentSuccess = contentResponse.status === 200;
    let details = `Status: ${contentResponse.status}`;

    if (contentSuccess) {
      const contentData = await contentResponse.json();
      details = `Generated ${contentData.content?.length || 0} characters`;
    }

    logTest('AI Content Generation', contentSuccess, details);

  } catch (error) {
    logTest('AI Content Generation', false, error.message);
  }
}

// Test posts API
async function testPostsAPI(authCookie) {
  log('\n📝 Testing Posts API...', colors.bright);

  try {
    const postsResponse = await fetch(`${API_BASE}/posts`, {
      method: 'GET',
      headers: {
        'Cookie': authCookie
      }
    });

    const postsSuccess = postsResponse.status === 200;
    let details = `Status: ${postsResponse.status}`;

    if (postsSuccess) {
      const postsData = await postsResponse.json();
      details = `Found ${postsData.posts?.length || 0} posts`;
    }

    logTest('Get All Posts', postsSuccess, details);

  } catch (error) {
    logTest('Get All Posts', false, error.message);
  }
}

// Main test runner
async function runAllTests() {
  log(`${colors.bright}${colors.blue}🧪 BlogAI Comprehensive API Testing${colors.reset}`);
  log(`${colors.blue}Testing against: ${BASE_URL}${colors.reset}\n`);

  const startTime = Date.now();

  // Check if server is running
  const serverReady = await waitForServer();
  if (!serverReady) {
    log('\n❌ Cannot run tests - server is not responding', colors.red);
    log('Make sure the development server is running on http://localhost:3002', colors.yellow);
    process.exit(1);
  }

  // Run authentication tests
  const authCookie = await testAuthentication();

  if (authCookie) {
    // Run other tests with authentication
    await testUserProfile(authCookie);
    await testDashboard(authCookie);
    await testAdminFeatures(authCookie);
    await testAIGeneration(authCookie);
    await testPostsAPI(authCookie);
  } else {
    log('\n⚠️  Skipping authenticated tests due to login failure', colors.yellow);
  }

  // Print final results
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log(`\n${colors.bright}📊 Test Results Summary:${colors.reset}`);
  log(`${colors.green}✅ Passed: ${passedTests}${colors.reset}`);
  log(`${colors.red}❌ Failed: ${failedTests}${colors.reset}`);
  log(`📈 Total: ${totalTests}`);
  log(`⏱️  Duration: ${duration}s`);

  if (failedTests === 0) {
    log(`\n${colors.bright}${colors.green}🎉 All tests passed! Your BlogAI application is working perfectly!${colors.reset}`);
  } else {
    log(`\n${colors.bright}${colors.yellow}⚠️  Some tests failed. Check the details above.${colors.reset}`);
  }

  return { passed: passedTests, failed: failedTests, total: totalTests };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log(`\n❌ Test runner error: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = { runAllTests };
