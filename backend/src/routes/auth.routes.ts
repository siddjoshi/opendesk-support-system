import { Router } from 'express';
import { login, register, refreshToken } from '../controllers/auth.controller';
import { validateLogin, validateRegistration } from '../middleware/validators';

const router = Router();

// Authentication routes
router.post('/login', validateLogin, login);
router.post('/register', validateRegistration, register);
router.post('/refresh-token', refreshToken);

export default router;
