// tests/auth.integration.test.js
import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { signup, login } from '../controllers/authcontroller.js';
import User from '../models/AuthUser.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth Controller Integration Tests', () => {
  it('should successfully register a user', async () => {
    const req = {
      body: {
        name: 'Integration User',
        emailid: 'int@example.com',
        password: 'Test1234!',
        dateofbirth: '1995-01-01',
        dateofjoining: '2023-01-01'
      }
    };

    // Mock res object
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'User registered successfully',
      token: expect.any(String)
    }));
  });

  it('should fail to login with wrong password', async () => {
    const req = {
      body: {
        emailid: 'int@example.com',
        password: 'WrongPassword'
      }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid email or password'
    }));
  });
});
