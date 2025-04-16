import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import authRoutes from '../routes/auth.js';
import userRoutes from '../routes/userRoutes.js';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();

// Create Express app instance for testing
const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

let token;
let userId;
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

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should log in the user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      emailid: 'test@example.com',
      password: 'Test1234!',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should get the user profile', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('name', 'Test User');
  });

  it('should add an employee', async () => {
    const res = await request(app).post('/api/user/addUser').send({
      name: 'Emp One',
      cellphone1: '1234567890',
      cellphone2: '0987654321',
      homenumber: '1122334455',
      address: '123 Street',
      city: 'Test City',
      state: 'Test State',
      emailid: 'emp1@example.com',
      jobTitle: 'Developer',
      paymentMethod: 'Bank Transfer',
      dateOfBirth: '1992-03-05',
      dateOfJoining: '2024-01-10',
      languages: ['English'],
      ofPaidVacationDaysAllowed: 10,
      ofPaidSickVacationAllowed: 5,
      employeeStatus: 'Active',
    });

    expect(res.status).toBe(201);
    userId = res.body.user._id;
  });

  it('should fetch all users', async () => {
    const res = await request(app).get('/api/user/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should fetch a user by ID', async () => {
    const res = await request(app).get(`/api/user/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Emp One');
  });
});
