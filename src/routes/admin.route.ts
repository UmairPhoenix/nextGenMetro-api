// src/routes/admin.routes.ts
import { Router } from 'express';
import * as adminController from '../controllers/adminController'; // ✅ correct path

const router = Router();

// ─────────────────────────────────────────────
// Fare Management
// ─────────────────────────────────────────────
router.get('/fares', adminController.getFares);
router.post('/fares', adminController.createOrUpdateFare);
router.delete('/fares/:service', adminController.deleteFare);

// ─────────────────────────────────────────────
// Route Management
// ─────────────────────────────────────────────
router.get('/routes', adminController.getRoutes);
router.post('/routes', adminController.createRoute);
router.delete('/routes/:id', adminController.deleteRoute);

// ─────────────────────────────────────────────
// User Management
// ─────────────────────────────────────────────
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);

export default router;
