import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getDB } from '../db';
import { users, routes } from '../models/schema';

const router = Router();
router.use(authenticateToken);
router.use((req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
});

router.get('/users', async (req, res) => {
  const db = getDB();
  const allUsers = await db.select().from(users);
  res.json(allUsers);
});

router.post('/users/:id/balance', async (req, res) => {
  const { id } = req.params;
  const { balance } = req.body;
  const db = getDB();
  await db.update(users).set({ balance }).where(users.id.eq(Number(id)));
  res.json({ message: 'Balance updated' });
});

router.get('/routes', async (req, res) => {
  const db = getDB();
  const allRoutes = await db.select().from(routes);
  res.json(allRoutes);
});

router.post('/routes', async (req, res) => {
  const { name, category, start, end } = req.body;
  const db = getDB();
  const [newRoute] = await db.insert(routes).values({ name, category, start, end }).returning();
  res.json(newRoute);
});

export default router;
