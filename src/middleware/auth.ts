import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from './logging';

const secret = process.env.JWT_SECRET || 'your_jwt_secret';

export interface JwtPayload {
  id: number;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      logger.error('JWT error', err);
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user as JwtPayload;
    next();
  });
}

export function generateToken(user: JwtPayload) {
  return jwt.sign(user, secret, { expiresIn: '12h' });
}
