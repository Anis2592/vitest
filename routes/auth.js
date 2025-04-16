import express from 'express';
import { signup, login, profile } from '../controllers/authcontroller.js';
import { authenticateToken } from '../middelware/authmiddleware.js';

const router = express.Router();


router.post('/signup', signup);


router.post('/login', login);


router.get('/profile', authenticateToken, profile);

export default router;
