// src/services/adminService.ts
import { getDB } from '../db';
import { eq } from 'drizzle-orm';
import { fares, routes, users } from '../models/schema';
import { generateToken } from '../middleware/auth';
import bcrypt from 'bcryptjs';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type FareInput = {
  service: 'Orange' | 'Speedo' | 'Metro';
  price: number;
};

type RouteInput = {
  name: string;
  service: 'Orange' | 'Speedo' | 'Metro';
  start: string;
  end: string;
  startCity: string;
  endCity: string;
};

// ─────────────────────────────────────────────
// Fare Management
// ─────────────────────────────────────────────
export const getFares = async () => {
  const db = getDB();
  return db.select().from(fares);
};

export const createOrUpdateFare = async ({ service, price }: FareInput) => {
  if (price <= 0) throw new Error('Fare price must be greater than 0');

  const db = getDB();

  // Upsert logic
  const existing = await db.select().from(fares).where(eq(fares.service, service));

  if (existing.length > 0) {
    const [updated] = await db
      .update(fares)
      .set({ price }) // ✅ only update price (no updatedAt unless your schema has it)
      .where(eq(fares.service, service))
      .returning();
    return updated;
  } else {
    const [created] = await db.insert(fares).values({ service, price }).returning();
    return created;
  }
};

export const deleteFare = async (service: 'Orange' | 'Speedo' | 'Metro') => {
  const db = getDB();
  await db.delete(fares).where(eq(fares.service, service));
  return { message: `Fare for ${service} deleted` };
};

// ─────────────────────────────────────────────
// Route Management
// ─────────────────────────────────────────────
export const getRoutes = async () => {
  const db = getDB();
  return db.select().from(routes);
};

export const createRoute = async ({ name, service, start, end, startCity, endCity }: RouteInput) => {
  const db = getDB();

  if (start === end) throw new Error('Route start and end cannot be the same');
  if (startCity === endCity) throw new Error('Start city and end city must be different');

  const allowedServices = ['Orange', 'Speedo', 'Metro'] as const;
  if (!allowedServices.includes(service)) throw new Error('Invalid service type');

  const [newRoute] = await db
    .insert(routes)
    .values({ name, service, start, end, startCity, endCity })
    .returning();

  return newRoute;
};

export const deleteRoute = async (id: number) => {
  const db = getDB();
  await db.delete(routes).where(eq(routes.id, id));
  return { message: `Route ${id} deleted` };
};
export const adminLogin = async ({ email, password }: { email: string; password: string }) => {
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