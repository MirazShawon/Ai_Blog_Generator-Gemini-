// test-api-direct.js
// Direct API test without fetch
const http = require('http');

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function testAuth() {
  try {
    console.log('🧪 Testing Signup API...');
    
    // Test signup
    const signupData = {
      name: 'Direct Test User',
      email: `directtest${Date.now()}@example.com`,
      password: 'testpassword123'
    };
    
    const signupResult = await makeRequest('/api/auth/signup', 'POST', signupData);
    console.log('Signup Result:', signupResult.status, signupResult.data);
    
    if (signupResult.status === 201) {
      console.log('✅ Signup successful');
      
      // Test login with the same credentials
      console.log('🧪 Testing Login API...');
      const loginResult = await makeRequest('/api/auth/login', 'POST', {
        email: signupData.email,
        password: signupData.password
      });
      
      console.log('Login Result:', loginResult.status, loginResult.data);
      
      if (loginResult.status === 200) {
        console.log('✅ Login successful');
        console.log('🎉 Authentication is working!');
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ Signup failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuth();
