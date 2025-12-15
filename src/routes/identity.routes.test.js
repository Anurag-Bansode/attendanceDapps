import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import identityRoutes from './identity.routes.js';
import identityStore from '../stores/identity.store.js';
import * as loggerUtil from '../utils/logger.js';
import * as csvLoggerUtil from '../utils/csvlogger.util.js';

// Mock dependencies to prevent side effects like logging to files/console during tests.
jest.mock('../utils/logger.js');
jest.mock('../utils/csvlogger.util.js');

// By importing the modules after mocking them, the functions within
// are automatically replaced with Jest mocks.
const { logger } = loggerUtil;
const { logAudit } = csvLoggerUtil;


// Setup the express app for testing
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/identity', identityRoutes);

// Global error handler for the test app
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});

describe('POST /identity/register', () => {
  // Clear the store before each test to ensure isolation
  beforeEach(() => {
    identityStore.clear();
    jest.clearAllMocks();
  });

  it('should register a new device successfully', async () => {
    const res = await request(app)
      .post('/identity/register')
      .send({ name: 'Test User', email: 'test@example.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, status: 'newly_registered' });
    expect(res.headers['set-cookie']).toBeDefined(); // Check that a device_id cookie was set
    expect(identityStore.size).toBe(1);
    expect(logAudit).toHaveBeenCalledWith("INFO", "IDENTITY_REGISTERED", null, expect.any(String), "New device identity created");
  });

  it('should allow an already registered device to proceed', async () => {
    // Step 1: Register a device first
    const firstRes = await request(app)
      .post('/identity/register')
      .send({ name: 'Test User', email: 'test@example.com' });

    const cookie = firstRes.headers['set-cookie'];

    // Step 2: Attempt to register the same device again
    const secondRes = await request(app)
      .post('/identity/register')
      .set('Cookie', cookie) // Send the same cookie back
      .send({ name: 'Another Name', email: 'another@example.com' });

    expect(secondRes.statusCode).toBe(200);
    expect(secondRes.body).toEqual({ success: true, status: 'already_registered' });
    expect(identityStore.size).toBe(1); // The store size should not increase
  });

  it('should return 400 if name or email is missing', async () => {
    const res = await request(app)
      .post('/identity/register')
      .send({ name: 'Test User' }); // Missing email

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Name and email required');
    expect(identityStore.size).toBe(0);
  });

  it('should handle 100+ concurrent registration requests from different devices', async () => {
    const registrationPromises = [];
    const userCount = 105;

    for (let i = 0; i < userCount; i++) {
      const user = {
        name: `User ${i}`,
        email: `user${i}@example.com`,
      };
      // Each request is sent without a cookie, simulating a new device
      const promise = request(app)
        .post('/identity/register')
        .send(user);
      
      registrationPromises.push(promise);
    }

    // Wait for all registration requests to complete
    const responses = await Promise.all(registrationPromises);

    // Verify that all requests were successful
    responses.forEach(res => {
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('newly_registered');
    });

    // Verify that the identity store contains all the new users
    expect(identityStore.size).toBe(userCount);
    expect(logger.info).toHaveBeenCalledWith('Identity registered successfully', expect.any(Object));
  }, 15000); // Increase timeout for this long-running test
});