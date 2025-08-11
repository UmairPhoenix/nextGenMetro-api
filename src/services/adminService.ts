import bcrypt from 'bcrypt';
import { getDB } from '../db';
import { users } from '../models/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '../middleware/auth';

// ----------------- Input Types -------------------
type SignupInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'user' | 'admin';
};

type LoginInput = {
  email: string;
  password: string;
};

// ----------------- Signup ------------------------
export const signup = async ({
  name,
  email,
  phone,
  password,
  role = 'user',
}: SignupInput) => {
  if (!name || !email || !phone || !password) {
    throw new Error('Missing required fields');
  }

  const db = getDB();
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length) throw new Error('Email already in use');

  const passwordHash = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email,
      phone,
      passwordHash,
      role,
    })
    .returning();

  const token = generateToken({ id: newUser.id, role: newUser.role });
  return { token, user: newUser };
};

// ----------------- User Login --------------------
export const login = async ({ email, password }: LoginInput) => {
  if (!email || !password) throw new Error('Missing email or password');

  const db = getDB();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = generateToken({ id: user.id, role: user.role });
  return { token, user };
};

// ----------------- Admin Login -------------------
export const adminLogin = async ({ email, password }: LoginInput) => {
  if (!email || !password) throw new Error('Missing email or password');

  const db = getDB();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || user.role !== 'admin') {
    throw new Error('Access denied: Admin credentials required');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = generateToken({ id: user.id, role: user.role });
  return { token, user };
};

// ----------------- Forgot Password (Mock) -------------------
export const forgotPassword = async (email: string) => {
  const db = getDB();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new Error('Email not found');

  // In production: send email / OTP / reset token
  return { message: 'Reset instructions sent to your email (mock)' };
};
