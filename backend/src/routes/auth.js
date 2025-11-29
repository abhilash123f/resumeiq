import express from 'express';
import { signup, login, deleteAccount, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.delete('/delete-account', authenticate, deleteAccount);

export default router;
