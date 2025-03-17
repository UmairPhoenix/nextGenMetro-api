import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseConfig } from '../config/firebase.config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebase: FirebaseConfig) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      throw new UnauthorizedException('Missing Firebase Auth token');
    }

    try {
      request.user = await this.firebase.getAuth().verifyIdToken(token);
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase Token');
    }
  }
}
