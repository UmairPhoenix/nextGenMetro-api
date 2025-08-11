import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllUsers, updateUserBalance, getRoutes, createRoute
} from '../controllers/userController';
import { getDB } from '../db';
import { eq } from 'drizzle-orm';
import { users } from '../models/schema';

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
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  const db = getDB();
  const [user] = await db.select().from(users).where(eq(users.id, Number(id)));
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });

  await db.delete(users).where(eq(users.id, Number(id)));
  res.json({ message: 'User deleted' });
});

export default router;
