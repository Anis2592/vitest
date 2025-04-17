import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserById } from './controllers/userController.js';
import User from '../models/Employee.js';

vi.mock('../models/Employee.js');

describe('getUserById', () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a user if found', async () => {
    const req = { params: { id: '507f1f77bcf86cd799439011' } }; // valid ObjectId
    const mockUser = { name: 'John Doe' };

    User.findById.mockResolvedValue(mockUser);

    await getUserById(req, res);

    expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  it('should return 404 if user not found', async () => {
    const req = { params: { id: '507f1f77bcf86cd799439011' } }; // valid ObjectId
    User.findById.mockResolvedValue(null);

    await getUserById(req, res);

    expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 500 on error', async () => {
    const req = { params: { id: '507f1f77bcf86cd799439011' } }; // valid ObjectId
    User.findById.mockRejectedValue(new Error('DB error'));

    await getUserById(req, res);

    expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error retrieving user data',
      error: expect.anything()
    });
  });

  it('should return 400 for invalid ObjectId', async () => {
    const req = { params: { id: '123' } }; // invalid ID

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID' });
  });
});
