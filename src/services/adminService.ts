import bcrypt from 'bcrypt';
import { getDB } from '../db';
import { users } from '../models/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '../middleware/auth';

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
      nfc_uid: '', // Required field — default blank, to be set later via admin/NFC assignment
    })
    .returning();

  const token = generateToken({ id: newUser.id, role: newUser.role });
  return { token, user: newUser };
};

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

export const forgotPassword = async (email: string) => {
  const db = getDB();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new Error('Email not found');

  // Placeholder: add real email logic or OTP system here
  return { message: 'Reset instructions sent to your email (mock)' };
};
