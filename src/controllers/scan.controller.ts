import { Request, Response } from 'express';
import { processScan } from '../services/scanService';

export const handleScan = async (req: Request, res: Response) => {
  try {
    const result = await processScan(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
