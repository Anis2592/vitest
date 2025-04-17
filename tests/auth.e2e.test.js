// tests/user.e2e.test.js
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

  it('should return 401 for unauthenticated user', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No token, authorization denied');
  });

  it('should add an employee', async () => {
    const res = await request(app)
      .post('/api/user/addUser')
      .set('Authorization', `Bearer ${token}`)
      .send({
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

  it('should return 404 when fetching a non-existent user', async () => {
    const res = await request(app).get('/api/user/users/654321234567654321234567');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('should return 400 for invalid Mongo ID format', async () => {
    const res = await request(app).get('/api/user/users/invalid-id');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid user ID');
  });

  it('should delete the employee', async () => {
    const res = await request(app).delete(`/api/user/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User deleted!');
  });

  it('should return 404 for deleting a non-existent user', async () => {
    const res = await request(app).delete('/api/user/users/654321234567654321234567');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });
});

describe('User Validation Tests', () => {
  const validEmployee = {
    name: 'Valid Employee',
    cellphone1: '1234567890',
    address: 'Test Street',
    city: 'Cityville',
    state: 'Stateville',
    emailid: 'valid@example.com',
    jobTitle: 'Engineer',
    paymentMethod: 'Bank Transfer',
    dateOfBirth: '1995-05-15',
    dateOfJoining: '2023-03-01',
    languages: ['English'],
    ofPaidVacationDaysAllowed: 10,
    ofPaidSickVacationAllowed: 5,
    employeeStatus: 'Active',
  };

  it('should add a valid employee', async () => {
    const res = await request(app)
      .post('/api/user/addUser')
      .set('Authorization', `Bearer ${token}`)
      .send(validEmployee);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    userId = res.body.user._id;
  });

  it('should fail with missing name', async () => {
    const { name, ...payload } = validEmployee;
    const res = await request(app)
      .post('/api/user/addUser')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Name is required');
  });

  it('should fail with invalid email', async () => {
    const res = await request(app)
      .post('/api/user/addUser')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validEmployee, emailid: 'invalid-email' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Email must be valid');
  });

  it('should fail with short cellphone1', async () => {
    const res = await request(app)
      .post('/api/user/addUser')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validEmployee, cellphone1: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Cellphone1 must be a valid number');
  });

  it('should fail with invalid payment method', async () => {
    const res = await request(app)
      .post('/api/user/addUser')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validEmployee, paymentMethod: 'Crypto' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Payment method must be one of Cash, Bank Transfer, Cheque, or UPI');

  });

  it('should fail with languages not as array', async () => {
    const res = await request(app)
      .post('/api/user/addUser')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validEmployee, languages: 'English' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Languages must be an array of strings');
  });

  it('should fail with invalid date format', async () => {
    const res = await request(app)
      .post('/api/user/addUser')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validEmployee, dateOfBirth: '15-05-1995' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('dateOfBirth');
  });

  it('should fail with negative vacation days', async () => {
    const res = await request(app)
      .post('/api/user/addUser')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validEmployee, ofPaidVacationDaysAllowed: -5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Paid vacation days cannot be negative');
  });

  it('should fail with invalid employeeStatus', async () => {
    const res = await request(app)
      .post('/api/user/addUser')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validEmployee, employeeStatus: 'Unknown' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Employee status must be Active, Inactive, or Terminated');
  });
 
  const requiredFields = ['city', 'state', 'address', 'jobTitle', 'paymentMethod'];
  requiredFields.forEach(field => {
    it(`should fail with missing ${field}`, async () => {
      const { [field]: _, ...payload } = validEmployee;
      const res = await request(app)
        .post('/api/user/addUser')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
      expect(res.status).toBe(400);
      expect(res.body.error.toLowerCase()).toContain(field.toLowerCase());
    });
  });

  it('should delete the employee after tests', async () => {
    const res = await request(app).delete(`/api/user/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User deleted!');
  });
});
