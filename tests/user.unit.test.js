import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser } from './controllers/userController.js'; 
import User from '../models/Employee.js';

vi.mock('../models/Employee.js');

describe('createUser (employee controller)', () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validUser = {
    name: 'Test Employee',
    emailid: 'test@employee.com',
    cellphone1: '1234567890',
    cellphone2: '',
    homenumber: '',
    address: '123 Street',
    city: 'Testville',
    state: 'TS',
    jobTitle: 'Developer',
    paymentMethod: 'Cash',
    dateOfBirth: '1990-01-01',
    dateOfJoining: '2022-01-01',
    languages: ['English'],
    ofPaidVacationDaysAllowed: 10,
    ofPaidSickVacationAllowed: 5,
    employeeStatus: 'Active'
  };

  it('should create a new employee and return success', async () => {
    const req = { body: validUser };

    const saveMock = vi.fn().mockResolvedValue(validUser);
    User.mockImplementation(() => ({ save: saveMock }));

    await createUser(req, res);

    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User added successfully!',
      user: validUser,
    });
  });

  it('should return 400 on Joi validation failure', async () => {
    const invalidReq = {
      body: {
        name: '', // invalid - name is required
        emailid: 'not-an-email',
      },
    };

    await createUser(invalidReq, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Validation failed',
      error: expect.any(String)
    }));
  });

  it('should return 500 if saving fails', async () => {
    const req = { body: validUser };

    User.mockImplementation(() => ({
      save: vi.fn().mockRejectedValue(new Error('Save failed')),
    }));

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Error saving user data',
      error: expect.any(Error),
    }));
  });
});
