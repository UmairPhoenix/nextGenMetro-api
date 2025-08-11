import { Router } from 'express';
import { login, signup, forgotPassword, adminLogin, createRoute, deleteUser, getAllRoutes, getAllUsers } from '../controllers/adminController';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/admin-login', adminLogin); // ✅ This line added

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

router.get('/routes', getAllRoutes);
router.post('/routes', createRoute);
export default router;
