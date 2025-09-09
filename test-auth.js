// test-auth.js
// Test script to verify authentication endpoints

const BASE_URL = 'http://localhost:3000';

async function testSignup() {
  console.log('🧪 Testing Signup...');
  
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpassword123'
  };

  try {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    console.log('Signup Response:', response.status, data);
    
    return response.ok ? data : null;
  } catch (error) {
    console.error('Signup Error:', error);
    return null;
  }
}

async function testLogin() {
  console.log('🧪 Testing Login...');
  
  const credentials = {
    email: 'test@example.com',
    password: 'testpassword123'
  };

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    console.log('Login Response:', response.status, data);
    
    return response.ok ? data : null;
  } catch (error) {
    console.error('Login Error:', error);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication Tests...\n');
  
  // Test signup
  const signupResult = await testSignup();
  
  if (signupResult) {
    console.log('✅ Signup successful');
    
    // Test login
    const loginResult = await testLogin();
    
    if (loginResult) {
      console.log('✅ Login successful');
      console.log('🎉 All tests passed!');
    } else {
      console.log('❌ Login failed');
    }
  } else {
    console.log('❌ Signup failed');
    
    // Try login anyway in case user already exists
    console.log('🔄 Trying login anyway...');
    const loginResult = await testLogin();
    
    if (loginResult) {
      console.log('✅ Login successful (user already existed)');
    } else {
      console.log('❌ Login also failed');
    }
  }
}

runTests();
