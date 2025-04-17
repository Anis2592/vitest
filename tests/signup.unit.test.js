import { describe, it, expect, vi } from 'vitest';
import { signup } from '../controllers/authcontroller.js';
import User from '../models/AuthUser.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

vi.mock('../models/AuthUser.js');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

// Mock bcrypt.hash to simulate hashing the password
vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

// Mock jwt.sign to simulate token creation
vi.spyOn(jwt, 'sign').mockReturnValue('mockedJWTToken');

describe('signup controller', () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };

  it('should return 400 if validation fails', async () => {
    const req = {
      body: {
        emailid: 'validemail@example.com',
        password: 'short',  // This will fail validation (password < 6 characters)
      },
    };

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: '"password" length must be at least 6 characters long',
    });
  });

  it('should return 400 if user already exists', async () => {
    const req = {
      body: {
        name: 'John Doe',
        emailid: 'existing@example.com',
        password: 'validpassword',
        dateofbirth: '1990-01-01',
        dateofjoining: '2020-01-01',
      },
    };

    // Mock that the user already exists in the database
    User.findOne.mockResolvedValue({ emailid: 'existing@example.com' });

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
  });

  it('should register a new user and return a token', async () => {
    const req = {
      body: {
        name: 'John Doe',
        emailid: 'newuser@example.com',
        password: 'validpassword',
        dateofbirth: '1990-01-01',
        dateofjoining: '2020-01-01',
      },
    };

    // Mock that the user does not exist in the database
    User.findOne.mockResolvedValue(null); // No user found

    // Mock saving a new user to the database
    const mockSave = vi.fn().mockResolvedValue({
      _id: 'user-id-mock',
    });
    User.mockImplementation(() => ({
      save: mockSave,
    }));

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User registered successfully',
      token: 'mockedJWTToken',
    });
  });
});
