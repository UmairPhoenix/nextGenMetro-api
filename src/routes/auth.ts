import { Router } from 'express';
import bcrypt from 'bcrypt';
import { getDB } from '../db';
import { users } from '../models/schema';
import { generateToken } from '../middleware/auth';
import { eq } from "drizzle-orm";

const router = Router();

router.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  const db = getDB();
  const exists = await db.select().from(users).where(eq(users.email, email))
;
  if (exists.length) {
    return res.status(400).json({ message: 'Email already in use' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [newUser] = await db.insert(users).values({
    name,
    email,
    phone,
    passwordHash,
    role: 'user',
  }).returning();
  const token = generateToken({ id: newUser.id, role: newUser.role });
  res.json({ token, user: newUser });
});

router.post('/login', async (req, res) => {
  console.log("Login Service Called with body:", req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  const db = getDB();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const token = generateToken({ id: user.id, role: user.role });
  res.json({ token, user });
});

export default router;
