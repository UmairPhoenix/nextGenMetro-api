import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseConfig } from '../config/firebase.config';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(private readonly firebase: FirebaseConfig) {}

  async registerUser(email: string, password: string, phoneNumber: string) {
    try {
      const userRecord = await this.firebase.getAuth().createUser({
        email,
        password,
        phoneNumber,
      });

      await this.firebase
        .getFirestore()
        .collection('users')
        .doc(userRecord.uid)
        .set({
          uid: userRecord.uid,
          email: userRecord.email,
          phone: userRecord.phoneNumber,
          isAdmin: false,
          createdAt: new Date(),
          balance: 0,
          routeHistory: [],
        });

      return { message: 'User registered successfully', uid: userRecord.uid };
    } catch (error) {
      throw new ConflictException(
        'Email already in use or invalid credentials',
      );
    }
  }

  async loginUser(email: string, password: string) {
    try {
      const firebaseAuthURL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`;

      const response = await axios.post(firebaseAuthURL, {
        email,
        password,
        returnSecureToken: true,
      });

      if (!response.data.idToken) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const userRef = this.firebase
        .getFirestore()
        .collection('users')
        .doc(response.data.localId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new NotFoundException('User profile not found in Firestore');
      }

      const userData = userDoc.data();

      return {
        uid: userData.uid,
        email: userData.email,
        phone: userData.phoneNumber,
        isAdmin: userData.isAdmin,
        token: response.data.idToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  async getUserProfile(uid: string) {
    const userRef = this.firebase.getFirestore().collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new NotFoundException('User not found');
    }

    return userDoc.data();
  }

  async updateUserProfile(uid: string, updateData: any) {
    const userRef = this.firebase.getFirestore().collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new NotFoundException('User not found');
    }

    await userRef.update(updateData);
    return { message: 'User profile updated successfully' };
  }

  async verifyToken(token: string) {
    try {
      const decodedToken = await this.firebase.getAuth().verifyIdToken(token);
      const userRef = this.firebase
        .getFirestore()
        .collection('users')
        .doc(decodedToken.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        await userRef.set({
          uid: decodedToken.uid,
          email: decodedToken.email,
          isAdmin: false,
          createdAt: new Date(),
          balance: 0,
          routeHistory: [],
        });
      }

      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        isAdmin: userDoc.data()?.isAdmin || false,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase Token');
    }
  }

  async deleteUser(uid: string) {
    try {
      await this.firebase.getAuth().deleteUser(uid);
      await this.firebase.getFirestore().collection('users').doc(uid).delete();
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new NotFoundException('User not found or already deleted');
    }
  }
}
