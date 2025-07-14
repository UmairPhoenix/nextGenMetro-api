import { Router } from 'express';
import { login, signup, forgotPassword } from '../controllers/adminController';

const router = Router();

router.post('/signup', signup);            // Only used to create regular users
router.post('/login', login);              // Admins and users both
router.post('/forgot-password', forgotPassword);  // Optional recovery

export default router;
