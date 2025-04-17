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
  const mockResponse = () => {
    const res = {};
    res.status = vi.fn().mockReturnThis();
    res.json = vi.fn();
    return res;
  };

  it('should successfully register a user', async () => {
    const req = {
      body: {
        name: 'Integration User',
        emailid: 'int@example.com',
        password: 'Test1234!',
        dateofbirth: '1995-01-01',
        dateofjoining: '2023-01-01',
      }
    };

    const res = mockResponse();

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'User registered successfully',
      token: expect.any(String),
    }));
  });

  it('should actually create the user in DB', async () => {
    const user = await User.findOne({ emailid: 'int@example.com' });
    expect(user).not.toBeNull();
    expect(user.name).toBe('Integration User');
  });

  it('should fail to register with missing fields (validation)', async () => {
    const req = {
      body: {
        emailid: 'missingfields@example.com',
        password: 'password123'
        // Missing 'name', 'dateofbirth', etc.
      }
    };

    const res = mockResponse();

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400); // Expecting 400 for validation failure
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('"name" is required') // Validation error message
    }));
  });

  it('should successfully login with correct credentials', async () => {
    const req = {
      body: {
        emailid: 'int@example.com',
        password: 'Test1234!'
      }
    };

    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Login successful',
      token: expect.any(String),
    }));
  });

  it('should fail login with wrong password', async () => {
    const req = {
      body: {
        emailid: 'int@example.com',
        password: 'WrongPassword'
      }
    };

    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid email or password'
    }));
  });

  it('should fail login with invalid email format (validation)', async () => {
    const req = {
      body: {
        emailid: 'invalid-email-format',
        password: '12345678'
      }
    };

    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('"emailid" must be a valid email')
    }));
  });
});
