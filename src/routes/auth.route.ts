import { Router } from 'express';
import { login, signup, forgotPassword } from '../controllers/authController';

const router = Router();

// User signup (Admin signup not allowed via public route)
router.post('/signup', signup);

// Login (User or Admin)
router.post('/login', login);

// Forgot password (Mock handler)
router.post('/forgot-password', forgotPassword);

export default router;
