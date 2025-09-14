// src/routes/auth.route.ts
import { Router } from 'express';
import { login, signup, forgotPassword, adminLogin } from '../controllers/authController';

const router = Router();

// Public user signup
router.post('/signup', signup);

// User login
router.post('/login', login);

// Admin-only login
router.post('/admin/login', adminLogin);

// Forgot password (mock)
router.post('/forgot-password', forgotPassword);

export default router;
