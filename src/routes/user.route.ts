import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllUsers, updateUserBalance, getRoutes, createRoute
} from '../controllers/userController';

const router = Router();
router.use(authenticateToken);
router.use((req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
});
router.get('/users', getAllUsers);
router.post('/users/:id/balance', updateUserBalance);
router.get('/routes', getRoutes);
router.post('/routes', createRoute);
export default router;
