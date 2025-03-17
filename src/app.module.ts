import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseConfig } from './config/firebase.config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [AppService, FirebaseConfig],
  exports: [FirebaseConfig],
})
export class AppModule {}
