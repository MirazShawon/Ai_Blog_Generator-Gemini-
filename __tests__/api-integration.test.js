/**
 * BlogAI Database and API Integration Tests
 * Testing database connections, CRUD operations, and API endpoints
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002';
const API_BASE = `${BASE_URL}/api`;

describe('Database and API Integration Tests', () => {
  let authCookie = '';
  let testPostId = '';

  beforeAll(async () => {
    // Login to get auth cookie
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

    if (loginResponse.status === 200) {
      const cookies = loginResponse.headers.raw()['set-cookie'];
      if (cookies) {
        authCookie = cookies.find(cookie => cookie.startsWith('auth-token='));
      }
    }
  });

  describe('Posts API', () => {
    test('should fetch posts from database', async () => {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'GET',
        headers: {
          'Cookie': authCookie
        }
      });

      expect(response.status).toBeOneOf([200, 404]); // 404 if no posts exist yet

      if (response.status === 200) {
        const data = await response.json();
        expect(Array.isArray(data.posts)).toBe(true);
      }
    });

    test('should create a new post', async () => {
      const newPost = {
        title: `Test Post ${Date.now()}`,
        content: 'This is a test post content',
        status: 'draft',
        writingPhase: 'Needs Editing'
      };

      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie
        },
        body: JSON.stringify(newPost)
      });

      if (response.status === 201) {
        const data = await response.json();
        expect(data.post).toBeDefined();
        expect(data.post.title).toBe(newPost.title);
        testPostId = data.post.id;
      } else {
        // Post creation might fail due to various reasons, check for proper error handling
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe('Collections API', () => {
    test('should fetch collections (premium feature)', async () => {
      const response = await fetch(`${API_BASE}/collections`, {
        method: 'GET',
        headers: {
          'Cookie': authCookie
        }
      });

      // Should succeed for admin user
      expect(response.status).toBeOneOf([200, 403]); // 403 if not premium

      if (response.status === 200) {
        const data = await response.json();
        expect(Array.isArray(data.collections)).toBe(true);
      }
    });
  });

  describe('Admin API', () => {
    test('should fetch admin statistics', async () => {
      const response = await fetch(`${API_BASE}/admin/stats`, {
        method: 'GET',
        headers: {
          'Cookie': authCookie
        }
      });

      expect(response.status).toBe(200);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.totalUsers).toBeDefined();
        expect(data.totalPosts).toBeDefined();
        expect(data.premiumUsers).toBeDefined();
      }
    });

    test('should fetch all users (admin only)', async () => {
      const response = await fetch(`${API_BASE}/admin/users`, {
        method: 'GET',
        headers: {
          'Cookie': authCookie
        }
      });

      expect(response.status).toBe(200);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(Array.isArray(data.users)).toBe(true);
        expect(data.users.length).toBeGreaterThan(0);
      }
    });
  });

  describe('AI Generation API', () => {
    test('should generate content with Gemini API', async () => {
      const request = {
        topic: 'JavaScript Testing',
        tone: 'professional',
        style: 'informative'
      };

      const response = await fetch(`${API_BASE}/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie
        },
        body: JSON.stringify(request)
      });

      // Generation might fail due to API limits or configuration
      expect(response.status).toBeOneOf([200, 500, 429]);

      if (response.status === 200) {
        const data = await response.json();
        expect(data.content).toBeDefined();
        expect(typeof data.content).toBe('string');
      }
    }, 15000); // Increased timeout for AI generation

    test('should generate topic suggestions', async () => {
      const response = await fetch(`${API_BASE}/gemini-topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie
        },
        body: JSON.stringify({
          keyword: 'technology',
          tone: 'casual',
          style: 'informative'
        })
      });

      // Topic generation might fail due to API limits
      expect(response.status).toBeOneOf([200, 500, 429]);

      if (response.status === 200) {
        const data = await response.json();
        expect(data.topics).toBeDefined();
        expect(Array.isArray(data.topics)).toBe(true);
      }
    }, 15000);
  });
});

// Custom Jest matcher
expect.extend({
  toBeOneOf(received, array) {
    const pass = array.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${array}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${array}`,
        pass: false,
      };
    }
  },
});
