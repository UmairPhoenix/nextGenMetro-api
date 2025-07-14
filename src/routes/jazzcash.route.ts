import { Router } from 'express';
import { handleTopUp } from '../controllers/jazzcash.controller';

const router = Router();

router.post('/topup', handleTopUp);

export default router;
