import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseConfig } from './config/firebase.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RoutesModule } from './routes/routes.module';

@Module({
  imports: [AuthModule, UsersModule, RoutesModule],
  controllers: [AppController],
  providers: [AppService, FirebaseConfig],
  exports: [FirebaseConfig],
})
export class AppModule {}
