import { Router } from 'express';
import { handleScan } from '../controllers/scan.controller';

const router = Router();
router.post('/', handleScan);

export default router;
