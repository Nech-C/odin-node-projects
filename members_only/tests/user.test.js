const request = require('supertest');
const http = require('http');
const app = require('../app');
const db = require('../db/pool');

let server;
let apiUrl;

jest.setTimeout(60000); // Increase Jest's default timeout to 60 seconds

function startServer() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const { port } = server.address();
      console.log(`Test server running on port ${port}`);
      resolve(port);
    });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log('Test server closed');
        resolve();
      });
    } else {
      resolve();
    }
  });
}

beforeAll(async () => {
  try {
    const port = await startServer();
    apiUrl = `http://localhost:${port}`;
    console.log('Test setup complete');
  } catch (error) {
    console.error('Error in beforeAll:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await stopServer();
    await db.end();
    console.log('Test teardown complete');
  } catch (error) {
    console.error('Error in afterAll:', error);
    throw error;
  }
});

describe('User Registration API', () => {
  beforeEach(async () => {
    try {
      await db.query('DELETE FROM users');
      console.log('Users table cleared');
    } catch (error) {
      console.error('Error in beforeEach:', error);
      throw error;
    }
  });

  it('should register a new user', async () => {
    try {
      const res = await request(apiUrl)
        .post('/api/register')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          password: 'securepassword123'
        });

      console.log('Response:', res.status, res.body);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
      expect(res.body.user).toHaveProperty('email', 'john.doe@example.com');
      expect(res.body.user).toHaveProperty('first_name', 'John');
      expect(res.body.user).toHaveProperty('last_name', 'Doe');
      expect(res.body.user).toHaveProperty('membership_status', false);
      expect(res.body.user).toHaveProperty('is_admin', false);
    } catch (error) {
      console.error('Error in test:', error);
      throw error;
    }
  }, 30000);

  it('should not register a user with an existing email', async () => {
    try {
      // First, register a user
      await request(apiUrl)
        .post('/api/register')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          password: 'securepassword123'
        });

      // Try to register the same user again
      const res = await request(apiUrl)
        .post('/api/register')
        .send({
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          password: 'anotherpassword123'
        });

      console.log('Response:', res.status, res.body);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'User already exists');
    } catch (error) {
      console.error('Error in test:', error);
      throw error;
    }
  }, 30000);

  it('should not register a user with invalid input', async () => {
    try {
      const res = await request(apiUrl)
        .post('/api/register')
        .send({
          first_name: '',
          last_name: '',
          email: 'invalid-email',
          password: 'short'
        });

      console.log('Response:', res.status, res.body);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.length).toBeGreaterThan(0);
      
      // Check for specific error messages
      const errorMessages = res.body.errors.map(error => error.msg);
      expect(errorMessages).toContain('First name must be specified.');
      expect(errorMessages).toContain('Last name must be specified.');
      expect(errorMessages).toContain('Email must be specified.');
      expect(errorMessages).toContain('Password must be at least 6 characters long.');
    } catch (error) {
      console.error('Error in test:', error);
      throw error;
    }
  }, 30000);
});


describe('User Login API', () => {
  it('should login a user with correct credentials', async () => {
    // First, register a user
    await request(apiUrl)
      .post('/api/register')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'securepassword123'
      });

    // Then, try to login
    const res = await request(apiUrl)
      .post('/api/login')
      .send({
        email: 'john.doe@example.com',
        password: 'securepassword123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'john.doe@example.com');
    expect(res.body.user).toHaveProperty('first_name', 'John');
    expect(res.body.user).toHaveProperty('last_name', 'Doe');
  });

  it('should not login a user with incorrect credentials', async () => {
    const res = await request(apiUrl)
      .post('/api/login')
      .send({
        email: 'john.doe@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Incorrect password');
  });
});