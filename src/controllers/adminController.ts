// src/controllers/admin.controller.ts
import { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import { getDB } from '../db';
import { not, eq } from 'drizzle-orm';
import { users } from '../models/schema';

// ─────────────────────────────────────────────
// Fare Management
// ─────────────────────────────────────────────
export const getFares = async (_req: Request, res: Response) => {
  try {
    const result = await adminService.getFares();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createOrUpdateFare = async (req: Request, res: Response) => {
  try {
    const { service, price } = req.body;
    if (!service || !price) {
      return res.status(400).json({ message: 'Service and price are required' });
    }

    const result = await adminService.createOrUpdateFare({ service, price });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteFare = async (req: Request, res: Response) => {
  try {
    const { service } = req.params;
    if (!service) {
      return res.status(400).json({ message: 'Service is required' });
    }

    const result = await adminService.deleteFare(service as 'Orange' | 'Speedo' | 'Metro');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// Route Management
// ─────────────────────────────────────────────
export const getRoutes = async (_req: Request, res: Response) => {
  try {
    const result = await adminService.getRoutes();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createRoute = async (req: Request, res: Response) => {
  try {
    const { name, service, start, end, startCity, endCity } = req.body;
    if (!name || !service || !start || !end || !startCity || !endCity) {
      return res.status(400).json({ message: 'All route fields are required' });
    }

    const result = await adminService.createRoute({ name, service, start, end, startCity, endCity });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Route ID is required' });
    }

    const result = await adminService.deleteRoute(Number(id));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
export const getUsers = async (_req: Request, res: Response) => {
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
    const id = parseInt(req.params.id, 10);
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
