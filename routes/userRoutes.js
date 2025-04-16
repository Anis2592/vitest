import express from 'express';
import { createUser, getUserById, getAllUsers, updateUser, deleteUser } from '../controllers/usercontroller.js';

const router = express.Router();



router.post('/addUser', createUser);
router.get('/users/:id', getUserById);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
