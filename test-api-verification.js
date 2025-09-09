const testApiEndpoints = async () => {
  const baseUrl = 'http://localhost:3002';
  
  console.log('🧪 Testing BlogAI API Endpoints...\n');
  
  try {
    // Test 1: Login with admin credentials
    console.log('1. Testing Admin Login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('   Login Status:', loginResponse.status);
    console.log('   Login Response:', loginResult);
    
    if (loginResponse.status === 200) {
      console.log('   ✅ Admin Login: SUCCESS\n');
      
      // Extract cookies for subsequent requests
      const cookies = loginResponse.headers.get('set-cookie');
      
      // Test 2: Get user profile
      console.log('2. Testing Profile Fetch...');
      const profileResponse = await fetch(`${baseUrl}/api/user/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cookie': cookies || ''
        }
      });
      
      const profileResult = await profileResponse.json();
      console.log('   Profile Status:', profileResponse.status);
      console.log('   Profile Data:', profileResult);
      console.log('   ✅ Profile Fetch:', profileResponse.status === 200 ? 'SUCCESS' : 'FAILED');
      
      // Test 3: Get dashboard data
      console.log('\n3. Testing Dashboard API...');
      const dashboardResponse = await fetch(`${baseUrl}/api/dashboard`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cookie': cookies || ''
        }
      });
      
      const dashboardResult = await dashboardResponse.json();
      console.log('   Dashboard Status:', dashboardResponse.status);
      console.log('   Dashboard Data:', dashboardResult);
      console.log('   ✅ Dashboard API:', dashboardResponse.status === 200 ? 'SUCCESS' : 'FAILED');
      
    } else {
      console.log('   ❌ Admin Login: FAILED');
    }
    
  } catch (error) {
    console.error('❌ API Testing Error:', error);
  }
  
  console.log('\n🎯 Testing Complete!');
};

// Run the test
testApiEndpoints();
