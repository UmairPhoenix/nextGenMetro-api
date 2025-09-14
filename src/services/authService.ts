// src/services/authService.ts
import bcrypt from 'bcryptjs'; // ✅ use bcryptjs to avoid native binding issues
import { getDB } from '../db';
import { eq } from 'drizzle-orm';
import { generateToken } from '../middleware/auth';
import { users } from '../models/schema';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Signup
// ─────────────────────────────────────────────
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

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const db = getDB();

  // Ensure unique email
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length) throw new Error('Email already in use');

  // Ensure unique phone
  const existingPhone = await db.select().from(users).where(eq(users.phone, phone));
  if (existingPhone.length) throw new Error('Phone already in use');

  const passwordHash = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(users)
    .values({ name, email, phone, passwordHash, role })
    .returning();

  const token = generateToken({ id: newUser.id, role: newUser.role });

  return {
    message: 'Signup successful',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      balance: newUser.balance,
    },
  };
};

// ─────────────────────────────────────────────
// Login (User/Admin)
// ─────────────────────────────────────────────
export const login = async ({ email, password }: LoginInput) => {
  if (!email || !password) throw new Error('Missing email or password');

  const db = getDB();
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = generateToken({ id: user.id, role: user.role });

  return {
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      balance: user.balance,
    },
  };
};

// ─────────────────────────────────────────────
// Admin Login (role-restricted)
// ─────────────────────────────────────────────
export const adminLogin = async ({ email, password }: LoginInput) => {
  if (!email || !password) throw new Error('Missing email or password');

  const db = getDB();
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user || user.role !== 'admin') {
    throw new Error('Access denied: admin credentials required');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = generateToken({ id: user.id, role: user.role });

  return {
    message: 'Admin login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      balance: user.balance,
    },
  };
};

// ─────────────────────────────────────────────
// Forgot Password (Mock)
// ─────────────────────────────────────────────
export const forgotPassword = async (email: string) => {
  const db = getDB();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new Error('Email not found');

  // In production: send email / OTP / reset token
  return { message: `Password reset instructions sent to ${email} (mock)` };
};
