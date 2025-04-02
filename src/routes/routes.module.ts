import { Module } from '@nestjs/common';
import { FirebaseConfig } from '../config/firebase.config';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';

@Module({
  controllers: [RoutesController],
  providers: [RoutesService, FirebaseConfig],
})
export class RoutesModule {}
