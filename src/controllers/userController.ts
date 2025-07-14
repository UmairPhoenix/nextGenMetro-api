import { Request, Response } from 'express';
import * as userService from '../services/userService';

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.json(users);
};

export const updateUserBalance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { balance } = req.body;
  await userService.updateBalance(Number(id), balance);
  res.json({ message: 'Balance updated' });
};

export const getRoutes = async (_req: Request, res: Response) => {
  const routes = await userService.getRoutes();
  res.json(routes);
};

export const createRoute = async (req: Request, res: Response) => {
  const newRoute = await userService.createRoute(req.body);
  res.json(newRoute);
};
