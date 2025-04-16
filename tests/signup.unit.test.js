import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signup } from '../controllers/authcontroller.js';
import User from '../models/AuthUser.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

vi.mock('../models/AuthUser.js');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

describe('signup controller', () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a new user and return a token', async () => {
    const req = {
      body: {
        name: 'Unit User',
        emailid: 'unit@example.com',
        password: 'pass123',
        dateofbirth: '1990-01-01',
        dateofjoining: '2020-01-01',
      }
    };

    User.findOne.mockResolvedValue(null); // no existing user
    bcrypt.hash.mockResolvedValue('hashedpass');
    jwt.sign.mockReturnValue('mocked-jwt');

    const saveMock = vi.fn().mockResolvedValue({});
    User.mockImplementation(() => ({ save: saveMock }));

    await signup(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ emailid: 'unit@example.com' });
    expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 10);
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User registered successfully',
      token: 'mocked-jwt',
    });
  });

  it('should return 400 if user already exists', async () => {
    const req = {
      body: { emailid: 'unit@example.com' }
    };
    User.findOne.mockResolvedValue({ _id: '123' });

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
  });
});
