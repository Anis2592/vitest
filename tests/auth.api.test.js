 
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
 
import authRoutes from '../routes/auth.js';  
import { authenticateToken } from '../middelware/authmiddleware.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

let token;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth & User E2E Tests', () => {
  it('should sign up a new user', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      emailid: 'test@example.com',
      password: 'Test1234!',
      dateofbirth: '1990-01-01',
      dateofjoining: '2023-01-01',
    });

    console.log("Signup response:", res.body);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should log in the user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      emailid: 'test@example.com',
      password: 'Test1234!',
    });

    console.log("Login response:", res.body);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should get the user profile', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    console.log("Profile response:", res.body);

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('name', 'Test User');
  });
});
