import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserById } from '../controllers/userController.js';
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
    const req = { params: { id: '123' } };
    const mockUser = { name: 'John Doe' };

    User.findById.mockResolvedValue(mockUser);

    await getUserById(req, res);

    expect(User.findById).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  it('should return 404 if user not found', async () => {
    const req = { params: { id: '123' } };
    User.findById.mockResolvedValue(null);

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 500 on error', async () => {
    const req = { params: { id: '123' } };
    User.findById.mockRejectedValue(new Error('DB error'));

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error retrieving user data',
      error: expect.anything()
    });
  });
});