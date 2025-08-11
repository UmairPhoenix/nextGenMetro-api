import { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import { getDB } from '../db';
import { routes, users } from '../models/schema';
import { eq, not } from 'drizzle-orm';

export const signup = async (req: Request, res: Response) => {
  try {
    const result = await adminService.signup(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await adminService.login(req.body);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const result = await adminService.forgotPassword(email);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const result = await adminService.adminLogin(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(403).json({ message: err.message });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const db = getDB();
const result = await db.select().from(users).where(not(eq(users.role, 'admin')));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const id = parseInt(req.params.id);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user || user.role === 'admin') {
      return res.status(400).json({ message: 'User not found or is an admin' });
    }
    await db.delete(users).where(eq(users.id, id));
    res.json({ message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllRoutes = async (_req: Request, res: Response) => {
  try {
    const db = getDB();
    const result = await db.select().from(routes);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createRoute = async (req: Request, res: Response) => {
  try {
    const { name, category, start, end } = req.body;
    if (!name || !category || !start || !end) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const db = getDB();
    const [newRoute] = await db
      .insert(routes)
      .values({ name, category, start, end })
      .returning();

    res.status(200).json(newRoute);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
