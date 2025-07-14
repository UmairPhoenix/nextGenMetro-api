import { getDB } from '../db';
import { users, routes } from '../models/schema';
import { eq } from 'drizzle-orm';

type CreateRouteInput = {
  name: string;
  category: string;
  start: string;
  end: string;
};

export const getAllUsers = async () => {
  const db = getDB();
  return db.select().from(users);
};

export const updateBalance = async (id: number, balance: number) => {
  const db = getDB();
  await db.update(users).set({ balance }).where(eq(users.id, id));
};

export const getRoutes = async () => {
  const db = getDB();
  return db.select().from(routes);
};

export const createRoute = async ({ name, category, start, end }: CreateRouteInput) => {
  const db = getDB();
  const [newRoute] = await db.insert(routes).values({ name, category, start, end }).returning();
  return newRoute;
};
