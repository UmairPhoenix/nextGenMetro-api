import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseConfig } from '../config/firebase.config';

@Injectable()
export class UsersService {
  constructor(private readonly firebase: FirebaseConfig) {}

  private usersCollection = this.firebase.getFirestore().collection('users');

  async getUser(uid: string) {
    const doc = await this.usersCollection.doc(uid).get();
    if (!doc.exists) {
      throw new NotFoundException('User not found');
    }
    return doc.data();
  }

  async updateServiceType(uid: string, serviceType: 'metro' | 'orange' | 'speedo') {
    await this.usersCollection.doc(uid).update({ serviceType });
    return { message: `Service updated to ${serviceType}` };
  }

  async updateProfile(uid: string, updateData: any) {
    await this.usersCollection.doc(uid).update(updateData);
    return { message: 'Profile updated successfully' };
  }
}
