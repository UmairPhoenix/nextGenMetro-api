// src/controllers/authController.ts
import { Request, Response } from 'express';
import * as authService from '../services/authService';

// ─────────────────────────────────────────────
// Signup
// ─────────────────────────────────────────────
export const signup = async (req: Request, res: Response) => {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// User/Admin Login
// ─────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// Admin-only Login
// ─────────────────────────────────────────────
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const result = await authService.adminLogin(req.body);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(403).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const result = await authService.forgotPassword(email);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
