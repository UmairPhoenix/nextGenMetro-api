import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseConfig } from '../config/firebase.config';

@Injectable()
export class RoutesService {
  constructor(private readonly firebase: FirebaseConfig) {}

  private collection = this.firebase.getFirestore().collection('routes');

  async createRoute(data: any) {
    const doc = await this.collection.add(data);
    return { id: doc.id, message: 'Route created' };
  }

  async getAllRoutes() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateRoute(id: string, data: any) {
    await this.collection.doc(id).update(data);
    return { message: 'Route updated' };
  }

  async deleteRoute(id: string) {
    await this.collection.doc(id).delete();
    return { message: 'Route deleted' };
  }
}
