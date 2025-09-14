// src/services/userService.ts
import { getDB } from '../db';
import { eq } from 'drizzle-orm';
import { users, routes } from '../models/schema';

// ───────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────
type CreateRouteInput = {
  name: string;
  service: 'Orange' | 'Speedo' | 'Metro';
  start: string;
  end: string;
  startCity: string;
  endCity: string;
};

// ───────────────────────────────────────────────────────────────
// User functions
// ───────────────────────────────────────────────────────────────
export const getAllUsers = async () => {
  const db = getDB();
  return db.select().from(users);
};

export const updateBalance = async (id: number, balance: number) => {
  const db = getDB();
  await db.update(users).set({ balance }).where(eq(users.id, id));
};

// ───────────────────────────────────────────────────────────────
// Route functions
// ───────────────────────────────────────────────────────────────
export const getRoutes = async () => {
  const db = getDB();
  return db.select().from(routes);
};

export const createRoute = async ({
  name,
  service,
  start,
  end,
  startCity,
  endCity,
}: CreateRouteInput) => {
  const db = getDB();

  // 🔹 Validation rules
  if (start === end) {
    throw new Error('Route start and end cannot be the same');
  }

  if (startCity === endCity) {
    throw new Error('Start city and end city must be different');
  }

  const allowedServices = ['Orange', 'Speedo', 'Metro'] as const;
  if (!allowedServices.includes(service)) {
    throw new Error('Invalid service type');
  }

  // 🔹 Insert new route
  const [newRoute] = await db
    .insert(routes)
    .values({ name, service, start, end, startCity, endCity })
    .returning();

  return newRoute;
};
