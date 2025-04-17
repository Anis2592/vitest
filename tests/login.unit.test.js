import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from '../controllers/authcontroller.js';
import User from '../models/AuthUser.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

vi.mock('../models/AuthUser.js');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

describe('login controller', () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login the user and return a token', async () => {
    const req = {
      body: {
        emailid: 'unit@example.com',
        password: 'pass123',
      }
    };

    const userMock = {
      _id: '123',
      emailid: 'unit@example.com',
      password: 'hashedpass',
      comparePassword: vi.fn().mockResolvedValue(true),  
    };

    User.findOne.mockResolvedValue(userMock);  
    bcrypt.compare.mockResolvedValue(true);  
    jwt.sign.mockReturnValue('mocked-jwt');

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ emailid: 'unit@example.com' });
    expect(userMock.comparePassword).toHaveBeenCalledWith('pass123');
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Login successful',
      token: 'mocked-jwt',
    });
  });

  it('should return 400 if user does not exist', async () => {
    const req = {
      body: { emailid: 'unit@example.com' }
    };
    User.findOne.mockResolvedValue(null);  

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
  });

  it('should return 400 if password is incorrect', async () => {
    const req = {
      body: { emailid: 'unit@example.com', password: 'wrongpass' }
    };

    const userMock = {
      _id: '123',
      emailid: 'unit@example.com',
      password: 'hashedpass',
      comparePassword: vi.fn().mockResolvedValue(false),  
    };

    User.findOne.mockResolvedValue(userMock);  

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
  });
});
