import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { FirebaseConfig } from '../config/firebase.config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly firebase: FirebaseConfig) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      throw new ForbiddenException('Missing Firebase Auth token');
    }

    try {
      const decodedToken = await this.firebase.getAuth().verifyIdToken(token);
      const userRef = this.firebase
        .getFirestore()
        .collection('users')
        .doc(decodedToken.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists || !userDoc.data()?.isAdmin) {
        throw new ForbiddenException('Access denied. Admins only.');
      }

      request.user = decodedToken;
      return true;
    } catch (error) {
      throw new ForbiddenException('Invalid Firebase Token or not an admin');
    }
  }
}
