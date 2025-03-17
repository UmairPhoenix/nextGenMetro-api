import * as admin from 'firebase-admin';
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';

@Injectable()
export class FirebaseConfig implements OnModuleDestroy {
  private static firebaseApp: admin.app.App;
  private readonly logger = new Logger(FirebaseConfig.name);

  constructor() {
    if (!FirebaseConfig.firebaseApp) {
      try {
        FirebaseConfig.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            type: process.env.TYPE,
            project_id: process.env.PROJECT_ID,
            private_key_id: process.env.PRIVATE_KEY_ID,
            private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.CLIENT_EMAIL,
            client_id: process.env.CLIENT_ID,
            auth_uri: process.env.AUTH_URI,
            token_uri: process.env.TOKEN_URI,
            auth_provider_x509_cert_url: process.env.AUTH_CERT_URL,
            client_x509_cert_url: process.env.CLIENT_CERT_URL,
            universe_domain: process.env.UNIVERSAL_DOMAIN,
          } as admin.ServiceAccount),
        });
      } catch (error) {
        throw new Error(
          'Firebase initialization failed. Check your environment variables.',
        );
      }
    }
  }

  getAuth() {
    return FirebaseConfig.firebaseApp.auth();
  }

  getFirestore() {
    return FirebaseConfig.firebaseApp.firestore();
  }

  onModuleDestroy() {
    if (FirebaseConfig.firebaseApp) {
      FirebaseConfig.firebaseApp.delete();
    }
  }
}
