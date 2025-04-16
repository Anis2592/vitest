// tests/createUser.unit.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser } from '../controllers/userController.js'; // Adjust path as needed
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

  it('should create a new employee and return success', async () => {
    const req = {
      body: {
        name: 'Test Employee',
        emailid: 'test@employee.com',
        cellphone1: '1234567890',
        address: '123 Street',
        city: 'Testville',
        state: 'TS',
        jobTitle: 'Developer',
        paymentMethod: 'Bank',
        dateOfBirth: '1990-01-01',
        dateOfJoining: '2022-01-01',
        ofPaidVacationDaysAllowed: 10,
        ofPaidSickVacationAllowed: 5,
        employeeStatus: 'Active',
      }
    };

    const saveMock = vi.fn().mockResolvedValue(req.body);
    User.mockImplementation(() => ({ save: saveMock }));

    await createUser(req, res);

    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User added successfully!',
      user: req.body
    });
  });

  it('should return 500 on error', async () => {
    const req = { body: {} };
    User.mockImplementation(() => ({
      save: vi.fn().mockRejectedValue(new Error('Save failed'))
    }));

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error saving user data',
      error: expect.anything()
    });
  });
});
