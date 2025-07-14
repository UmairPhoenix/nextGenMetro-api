import { Request, Response } from 'express';
import { processTopUp } from '../services/jazzcashService';

export const handleTopUp = async (req: Request, res: Response) => {
  try {
    const { uid, amount } = req.body;
    if (!uid || !amount) {
      return res.status(400).json({ message: 'UID and amount are required' });
    }

    const result = await processTopUp(uid, amount);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
