import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FirebaseConfig } from '../config/firebase.config';

@Module({
  controllers: [UsersController],
  providers: [UsersService, FirebaseConfig],
})
export class UsersModule {}