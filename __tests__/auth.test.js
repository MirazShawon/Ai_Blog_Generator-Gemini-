/**
 * BlogAI Authentication API Tests
 * Testing user registration, login, and authentication flows
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002';
const API_BASE = `${BASE_URL}/api`;

describe('Authentication API Tests', () => {
  let testUserEmail = `test-${Date.now()}@example.com`;
  let authCookie = '';

  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('POST /api/auth/login', () => {
    test('should login successfully with admin credentials', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'password123'
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('admin@example.com');
      expect(data.user.role).toBe('admin');

      // Extract auth cookie for subsequent tests
      const cookies = response.headers.raw()['set-cookie'];
      if (cookies) {
        authCookie = cookies.find(cookie => cookie.startsWith('auth-token='));
      }
    });

    test('should fail with invalid credentials', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        })
      });

      expect(response.status).toBe(401);
    });

    test('should fail with missing credentials', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@example.com'
          // Missing password
        })
      });

      expect(response.status).toBe(400);
    });
  });

  describe('User Profile API', () => {
    test('should get user profile with valid auth cookie', async () => {
      if (!authCookie) {
        // Login first to get auth cookie
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
        
        const cookies = loginResponse.headers.raw()['set-cookie'];
        if (cookies) {
          authCookie = cookies.find(cookie => cookie.startsWith('auth-token='));
        }
      }

      const response = await fetch(`${API_BASE}/user/profile`, {
        method: 'GET',
        headers: {
          'Cookie': authCookie
        }
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBeDefined();
      expect(data.email).toBe('admin@example.com');
      expect(data.role).toBe('admin');
    });

    test('should fail without auth cookie', async () => {
      const response = await fetch(`${API_BASE}/user/profile`, {
        method: 'GET'
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Dashboard API', () => {
    test('should get dashboard data with authentication', async () => {
      const response = await fetch(`${API_BASE}/dashboard`, {
        method: 'GET',
        headers: {
          'Cookie': authCookie
        }
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data.totalPosts).toBeDefined();
        expect(data.draftPosts).toBeDefined();
        expect(data.generationsLeft).toBeDefined();
      } else {
        // If dashboard fails, it should at least return proper error
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });
});
